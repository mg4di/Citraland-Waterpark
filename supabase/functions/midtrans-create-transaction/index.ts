import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { corsHeaders, getRequiredEnv, isValidEmail, jsonResponse } from "../_shared/http.ts";

type TicketType = "weekday" | "weekend";
type TicketSelection = { qty: number; price?: number };

interface TransactionRequest {
  userName: string;
  userEmail: string;
  userPhone: string;
  visitDate: string;
  ticketTypes: Partial<Record<TicketType, TicketSelection>>;
  promoCode?: string;
}

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createBookingCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `BH-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

function validDate(visitDate: string, ticketType: TicketType): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) return false;
  const date = new Date(`${visitDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== visitDate) return false;
  if (visitDate < new Date().toISOString().slice(0, 10)) return false;
  const day = date.getUTCDay();
  return day !== 1 && (ticketType === "weekday" ? day >= 2 && day <= 5 : day === 0 || day === 6);
}

function normalizeRequest(value: unknown): TransactionRequest | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<TransactionRequest>;
  if (
    typeof input.userName !== "string" ||
    input.userName.trim().length < 2 ||
    input.userName.trim().length > 120 ||
    typeof input.userEmail !== "string" ||
    !isValidEmail(input.userEmail) ||
    typeof input.userPhone !== "string" ||
    !/^(\+62|62|0)[0-9]{9,12}$/.test(input.userPhone.replace(/[\s-]/g, "")) ||
    typeof input.visitDate !== "string" ||
    !input.ticketTypes ||
    typeof input.ticketTypes !== "object" ||
    Array.isArray(input.ticketTypes)
  ) return null;

  const selected = Object.entries(input.ticketTypes).filter(([, ticket]) => {
    return ticket !== undefined && ticket !== null;
  });
  if (
    selected.length !== 1 ||
    !["weekday", "weekend"].includes(selected[0][0]) ||
    !selected[0][1] ||
    !Number.isInteger(selected[0][1].qty) ||
    selected[0][1].qty < 1 ||
    selected[0][1].qty > 10
  ) return null;

  if (input.promoCode !== undefined && (
    typeof input.promoCode !== "string" ||
    input.promoCode.trim().length > 64
  )) return null;

  return {
    userName: input.userName.trim(),
    userEmail: input.userEmail.trim().toLowerCase(),
    userPhone: input.userPhone.replace(/[\s-]/g, ""),
    visitDate: input.visitDate,
    ticketTypes: input.ticketTypes as TransactionRequest["ticketTypes"],
    promoCode: input.promoCode?.trim().toUpperCase() || undefined,
  };
}

function createDiscountedItems(
  ticketType: TicketType,
  quantity: number,
  unitPrice: number,
  discount: number,
) {
  const baseDiscount = Math.floor(discount / quantity);
  const remainder = discount % quantity;
  const prices = Array.from({ length: quantity }, (_, index) =>
    unitPrice - baseDiscount - (index < remainder ? 1 : 0)
  );
  const grouped = new Map<number, number>();
  for (const price of prices) grouped.set(price, (grouped.get(price) ?? 0) + 1);
  return Array.from(grouped, ([price, qty]) => ({
    id: `${ticketType}-ticket`,
    name: ticketType === "weekday" ? "Tiket Weekdays" : "Tiket Weekend",
    price,
    quantity: qty,
  }));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let bookingId: string | undefined;
  let supabase: ReturnType<typeof createClient> | undefined;

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authorization = request.headers.get("Authorization");
    const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    if (!bearerToken) {
      return jsonResponse({ error: "Silakan masuk terlebih dahulu untuk memesan tiket." }, 401);
    }
    const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);
    if (authError || !authData.user) {
      return jsonResponse({ error: "Sesi tidak valid. Silakan masuk kembali." }, 401);
    }
    const serverKey = getRequiredEnv("MIDTRANS_SERVER_KEY").trim();
    if (!serverKey) throw new Error("Missing Edge Function secret: MIDTRANS_SERVER_KEY");
    const isSandbox = Deno.env.get("MIDTRANS_IS_SANDBOX") !== "false";

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: "Data permintaan tidak valid." }, 400);
    }
    const input = normalizeRequest(payload);
    if (!input) return jsonResponse({ error: "Periksa kembali data pemesanan Anda." }, 400);

    if (authData.user.email?.toLowerCase() !== input.userEmail) {
      return jsonResponse({ error: "Email pemesanan harus sama dengan email akun Anda." }, 403);
    }

    const selected = Object.entries(input.ticketTypes)[0];
    const ticketType = selected[0] as TicketType;
    const quantity = selected[1]!.qty;
    if (!validDate(input.visitDate, ticketType)) {
      return jsonResponse({ error: "Tanggal kunjungan tidak tersedia." }, 400);
    }

    const { data: pricing, error: pricingError } = await supabase
      .from("ticket_pricing")
      .select("ticket_type, ticket_name, price")
      .eq("ticket_type", ticketType)
      .eq("status", "active")
      .maybeSingle();
    if (pricingError) {
      console.error("Ticket pricing lookup failed:", pricingError);
      return jsonResponse({ error: "Gagal memeriksa harga tiket." }, 500);
    }
    if (!pricing) return jsonResponse({ error: "Jenis tiket tidak tersedia." }, 400);

    const unitPrice = Math.round(Number(pricing.price));
    const subtotal = unitPrice * quantity;
    let discount = 0;
    if (input.promoCode) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: promotion, error: promotionError } = await supabase
        .from("promotions")
        .select("discount_type, discount_amount")
        .eq("promo_code", input.promoCode)
        .eq("status", "active")
        .lte("start_date", today)
        .gte("end_date", today)
        .maybeSingle();
      if (promotionError) {
        console.error("Promotion lookup failed:", promotionError);
        return jsonResponse({ error: "Gagal memeriksa kode promo." }, 500);
      }
      if (!promotion) return jsonResponse({ error: "Kode promo tidak valid atau sudah kedaluwarsa." }, 400);
      discount = promotion.discount_type === "percentage"
        ? Math.round((subtotal * Number(promotion.discount_amount)) / 100)
        : Math.min(subtotal, Math.round(Number(promotion.discount_amount)));
    }
    const totalAmount = subtotal - discount;
    if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
      return jsonResponse({ error: "Total pembayaran tidak valid." }, 400);
    }

    let booking;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const bookingCode = createBookingCode();
      const orderId = `ORDER-${bookingCode}-${Date.now()}`;
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          booking_code: bookingCode,
          user_name: input.userName,
          user_email: input.userEmail,
          user_phone: input.userPhone,
          visit_date: input.visitDate,
          ticket_types: { [ticketType]: { qty: quantity, price: unitPrice } },
          total_amount: totalAmount,
          payment_status: "pending",
          midtrans_order_id: orderId,
        })
        .select("booking_id, booking_code, midtrans_order_id")
        .single();
      if (!error) {
        booking = data;
        break;
      }
      if (error.code !== "23505") {
        console.error("Booking creation failed:", error);
        return jsonResponse({ error: "Gagal membuat booking. Silakan coba lagi." }, 500);
      }
    }
    if (!booking) return jsonResponse({ error: "Tidak dapat membuat kode booking unik." }, 503);
    bookingId = booking.booking_id;

    const discountedItems = createDiscountedItems(ticketType, quantity, unitPrice, discount);
    const baseUrl = isSandbox
      ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
      : "https://app.midtrans.com/snap/v1/transactions";
    const midtransResponse = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${serverKey}:`)}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: booking.midtrans_order_id,
          gross_amount: totalAmount,
        },
        customer_details: {
          first_name: input.userName,
          email: input.userEmail,
          phone: input.userPhone,
        },
        item_details: discountedItems,
        custom_field1: booking.booking_code,
        custom_field2: input.visitDate,
      }),
    });

    if (!midtransResponse.ok) {
      const errorDetails = await midtransResponse.text();
      console.error("Midtrans transaction creation failed:", midtransResponse.status, errorDetails);
      await supabase.from("bookings").update({ payment_status: "failed" }).eq("booking_id", bookingId);
      const errorMessage = midtransResponse.status === 401
        ? "Midtrans menolak autentikasi. Pastikan MIDTRANS_SERVER_KEY benar dan MIDTRANS_IS_SANDBOX cocok dengan environment key (Sandbox atau Production)."
        : "Midtrans gagal membuat transaksi. Silakan periksa log Edge Function.";
      return jsonResponse({ error: errorMessage }, 502);
    }

    const transaction = await midtransResponse.json();
    if (typeof transaction.token !== "string" || !transaction.token) {
      console.error("Midtrans response did not contain a Snap token.");
      await supabase.from("bookings").update({ payment_status: "failed" }).eq("booking_id", bookingId);
      return jsonResponse({ error: "Pembayaran gagal diinisialisasi. Silakan coba lagi." }, 502);
    }

    return jsonResponse({
      success: true,
      snap_token: transaction.token,
      redirect_url: transaction.redirect_url,
      booking_code: booking.booking_code,
      booking_id: booking.booking_id,
      total_amount: totalAmount,
    });
  } catch (error) {
    console.error("Transaction creation failed:", error);
    if (bookingId && supabase) {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ payment_status: "failed" })
        .eq("booking_id", bookingId);
      if (updateError) console.error("Could not mark booking as failed:", updateError);
    }
    if (error instanceof Error && error.message.startsWith("Missing Edge Function secret:")) {
      const missingSecret = error.message.split(":").at(-1)?.trim();
      console.error("Payment function configuration is incomplete:", missingSecret);
      return jsonResponse({
        error: `Konfigurasi Edge Function belum lengkap. Atur secret ${missingSecret} di Supabase.`,
      }, 500);
    }
    return jsonResponse({ error: "Terjadi kesalahan. Silakan coba lagi." }, 500);
  }
});
