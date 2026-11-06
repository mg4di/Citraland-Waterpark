import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { corsHeaders, getRequiredEnv, isValidEmail, jsonResponse } from "../_shared/http.ts";
import { mapMidtransStatus } from "../_shared/midtrans.ts";

interface MidtransStatusResponse {
  order_id?: string;
  transaction_id?: string;
  payment_type?: string;
  transaction_status?: string;
  fraud_status?: string;
  gross_amount?: string;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(
      getRequiredEnv("SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const bearerToken = request.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    if (!bearerToken) {
      return jsonResponse({ error: "Silakan masuk untuk melihat status booking." }, 401);
    }
    const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);
    if (authError || !authData.user) {
      return jsonResponse({ error: "Sesi tidak valid. Silakan masuk kembali." }, 401);
    }

    const payload = await request.json();
    const bookingCode = typeof payload.bookingCode === "string" ? payload.bookingCode.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!/^BH-[A-Z0-9]{6}$/.test(bookingCode) || !isValidEmail(email)) {
      return jsonResponse({ error: "Data booking tidak valid." }, 400);
    }
    if (authData.user.email?.toLowerCase() !== email) {
      return jsonResponse({ error: "Anda hanya dapat melihat status booking akun sendiri." }, 403);
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("payment_status, midtrans_order_id, total_amount")
      .eq("booking_code", bookingCode)
      .eq("user_email", email)
      .maybeSingle();
    if (error) {
      console.error("Booking status lookup failed:", error);
      return jsonResponse({ error: "Gagal memeriksa status pembayaran." }, 500);
    }
    if (!booking) return jsonResponse({ error: "Booking tidak ditemukan." }, 404);

    if (booking.payment_status === "pending" && booking.midtrans_order_id) {
      const serverKey = getRequiredEnv("MIDTRANS_SERVER_KEY").trim();
      const isSandbox = Deno.env.get("MIDTRANS_IS_SANDBOX") !== "false";
      const baseUrl = isSandbox
        ? "https://api.sandbox.midtrans.com"
        : "https://api.midtrans.com";
      const statusResponse = await fetch(
        `${baseUrl}/v2/${encodeURIComponent(booking.midtrans_order_id)}/status`,
        {
          headers: {
            Authorization: `Basic ${btoa(`${serverKey}:`)}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!statusResponse.ok) {
        console.error("Midtrans status lookup failed:", statusResponse.status);
        return jsonResponse({ error: "Gagal mengambil status transaksi dari Midtrans." }, 502);
      }

      const transaction = await statusResponse.json() as MidtransStatusResponse;
      if (
        transaction.order_id !== booking.midtrans_order_id ||
        !transaction.transaction_id ||
        !transaction.payment_type ||
        !transaction.gross_amount ||
        Math.round(Number(transaction.gross_amount)) !== Math.round(Number(booking.total_amount))
      ) {
        console.error("Midtrans status response did not match the booking.");
        return jsonResponse({ error: "Data status transaksi Midtrans tidak cocok dengan booking." }, 502);
      }

      const paymentStatus = mapMidtransStatus(
        transaction.transaction_status,
        transaction.fraud_status,
      );
      if (!paymentStatus) {
        console.error("Unsupported Midtrans transaction status:", transaction.transaction_status);
        return jsonResponse({ error: "Status transaksi Midtrans tidak dikenali." }, 502);
      }

      if (paymentStatus !== "pending") {
        const { error: updateError } = await supabase.rpc("apply_midtrans_notification", {
          p_order_id: booking.midtrans_order_id,
          p_transaction_id: transaction.transaction_id,
          p_payment_type: transaction.payment_type,
          p_payment_status: paymentStatus,
        });
        if (updateError) {
          console.error("Could not apply Midtrans status:", updateError);
          return jsonResponse({ error: "Gagal menyimpan status pembayaran." }, 500);
        }

        const { data: updatedBooking, error: updatedBookingError } = await supabase
          .from("bookings")
          .select("payment_status")
          .eq("booking_code", bookingCode)
          .eq("user_email", email)
          .single();
        if (updatedBookingError) {
          console.error("Could not read updated booking status:", updatedBookingError);
          return jsonResponse({ error: "Gagal membaca status pembayaran terbaru." }, 500);
        }
        return jsonResponse({ payment_status: updatedBooking.payment_status });
      }
    }

    const { data: latestBooking, error: latestBookingError } = await supabase
      .from("bookings")
      .select("payment_status")
      .eq("booking_code", bookingCode)
      .eq("user_email", email)
      .single();
    if (latestBookingError) {
      console.error("Could not read latest booking status:", latestBookingError);
      return jsonResponse({ error: "Gagal membaca status pembayaran terbaru." }, 500);
    }
    return jsonResponse({ payment_status: latestBooking.payment_status });
  } catch (error) {
    console.error("Booking status request failed:", error);
    return jsonResponse({ error: "Terjadi kesalahan. Silakan coba lagi." }, 500);
  }
});
