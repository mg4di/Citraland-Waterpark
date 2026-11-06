import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { getRequiredEnv, jsonResponse } from "../_shared/http.ts";
import { mapMidtransStatus } from "../_shared/midtrans.ts";

interface MidtransNotification {
  transaction_status?: string;
  order_id?: string;
  transaction_id?: string;
  payment_type?: string;
  gross_amount?: string;
  signature_key?: string;
  status_code?: string;
  fraud_status?: string;
}

function equalConstantTime(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function sha512(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-512", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function isAllowedSource(request: Request): boolean {
  const configured = Deno.env.get("MIDTRANS_ALLOWED_IPS")?.split(",").map((ip) => ip.trim()).filter(Boolean);
  if (!configured?.length) return true;
  const source = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return Boolean(source && configured.includes(source));
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  if (!isAllowedSource(request)) return jsonResponse({ error: "Forbidden" }, 403);

  const supabase = createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const serverKey = getRequiredEnv("MIDTRANS_SERVER_KEY");

  try {
    const notification = await request.json() as MidtransNotification;
    const {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signature,
      transaction_id: transactionId,
      payment_type: paymentType,
    } = notification;
    if (
      !orderId || !statusCode || !grossAmount || !signature ||
      !transactionId || !paymentType || !notification.transaction_status
    ) return jsonResponse({ error: "Invalid notification" }, 400);

    const expectedSignature = await sha512(`${orderId}${statusCode}${grossAmount}${serverKey}`);
    if (!equalConstantTime(expectedSignature, signature.toLowerCase())) {
      console.error("Rejected Midtrans notification with invalid signature.");
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    const status = mapMidtransStatus(notification.transaction_status, notification.fraud_status);
    if (!status) {
      console.warn("Ignoring unsupported Midtrans transaction status:", notification.transaction_status);
      return jsonResponse({ success: true, ignored: true });
    }

    const { data: booking, error: lookupError } = await supabase
      .from("bookings")
      .select("booking_id, total_amount")
      .eq("midtrans_order_id", orderId)
      .maybeSingle();
    if (lookupError) {
      console.error("Could not find booking for Midtrans order:", lookupError);
      return jsonResponse({ error: "Could not process notification" }, 500);
    }
    if (!booking) return jsonResponse({ error: "Unknown order" }, 404);
    if (Math.round(Number(booking.total_amount)) !== Math.round(Number(grossAmount))) {
      console.error("Midtrans notification amount does not match the booking.");
      return jsonResponse({ error: "Amount mismatch" }, 400);
    }

    const { error: updateError } = await supabase.rpc("apply_midtrans_notification", {
      p_order_id: orderId,
      p_transaction_id: transactionId,
      p_payment_type: paymentType,
      p_payment_status: status,
    });
    if (updateError) {
      console.error("Could not apply Midtrans notification:", updateError);
      return jsonResponse({ error: "Could not update booking" }, 500);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Midtrans callback processing failed:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
