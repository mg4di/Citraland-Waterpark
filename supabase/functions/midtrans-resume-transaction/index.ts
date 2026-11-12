import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { corsHeaders, getRequiredEnv, jsonResponse } from "../_shared/http.ts";

interface TicketSelection {
  qty?: number;
  price?: number;
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
      return jsonResponse({ error: "Silakan masuk untuk melanjutkan pembayaran." }, 401);
    }
    const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);
    if (authError || !authData.user) {
      return jsonResponse({ error: "Sesi tidak valid. Silakan masuk kembali." }, 401);
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: "Data permintaan tidak valid." }, 400);
    }
    const bookingCode = typeof (payload as { bookingCode?: unknown })?.bookingCode === "string"
      ? (payload as { bookingCode: string }).bookingCode.trim()
      : "";
    if (!/^BH-[A-Z0-9]{6}$/.test(bookingCode)) {
      return jsonResponse({ error: "Kode booking tidak valid." }, 400);
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("booking_id, booking_code, user_name, user_email, user_phone, visit_date, ticket_types, total_amount, payment_status, midtrans_order_id")
      .eq("booking_code", bookingCode)
      .maybeSingle();
    if (bookingError) {
      console.error("Resume booking lookup failed:", bookingError);
      return jsonResponse({ error: "Gagal memeriksa data booking." }, 500);
    }
    if (!booking) return jsonResponse({ error: "Booking tidak ditemukan." }, 404);
    if (booking.user_email?.toLowerCase() !== authData.user.email?.toLowerCase()) {
      return jsonResponse({ error: "Anda hanya dapat melanjutkan pembayaran akun sendiri." }, 403);
    }
    if (booking.payment_status !== "pending") {
      return jsonResponse({ error: "Booking ini tidak sedang menunggu pembayaran." }, 400);
    }

    const today = new Date().toISOString().slice(0, 10);
    if (booking.visit_date < today) {
      return jsonResponse({ error: "Tanggal kunjungan tiket ini sudah lewat. Silakan buat pesanan baru." }, 400);
    }

    const ticketEntries = Object.entries(booking.ticket_types ?? {}) as [string, TicketSelection][];
    if (ticketEntries.length !== 1) {
      return jsonResponse({ error: "Data tiket pada booking tidak valid." }, 400);
    }
    const [ticketType, ticketDetails] = ticketEntries[0];
    if (!["weekday", "weekend"].includes(ticketType) || !Number.isInteger(ticketDetails?.qty) || ticketDetails.qty < 1) {
      return jsonResponse({ error: "Data tiket pada booking tidak valid." }, 400);
    }

    const totalAmount = Math.round(Number(booking.total_amount));
    if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
      return jsonResponse({ error: "Total pembayaran booking tidak valid." }, 400);
    }

    const serverKey = getRequiredEnv("MIDTRANS_SERVER_KEY").trim();
    const isSandbox = Deno.env.get("MIDTRANS_IS_SANDBOX") !== "false";
    const orderId = `ORDER-${booking.booking_code}-${Date.now()}`;
    const previousOrderId = booking.midtrans_order_id ?? null;

    const { error: orderUpdateError } = await supabase
      .from("bookings")
      .update({ midtrans_order_id: orderId })
      .eq("booking_id", booking.booking_id);
    if (orderUpdateError) {
      console.error("Could not update booking order id:", orderUpdateError);
      return jsonResponse({ error: "Gagal menyiapkan pembayaran ulang." }, 500);
    }

    const baseUrl = isSandbox
      ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
      : "https://app.midtrans.com/snap/v1/transactions";
    let midtransResponse: Response;
    try {
      midtransResponse = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${serverKey}:`)}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: orderId,
            gross_amount: totalAmount,
          },
          customer_details: {
            first_name: booking.user_name,
            email: booking.user_email,
            phone: booking.user_phone,
          },
          item_details: [
            {
              id: "ticket",
              name: "Tiket Citraland Waterpark",
              price: totalAmount,
              quantity: 1,
            },
          ],
          custom_field1: booking.booking_code,
          custom_field2: booking.visit_date,
        }),
      });
    } catch (fetchError) {
      console.error("Midtrans resume request failed:", fetchError);
      await supabase
        .from("bookings")
        .update({ midtrans_order_id: previousOrderId })
        .eq("booking_id", booking.booking_id);
      return jsonResponse({ error: "Tidak dapat terhubung ke Midtrans. Silakan coba lagi." }, 502);
    }

    if (!midtransResponse.ok) {
      const errorDetails = await midtransResponse.text();
      console.error("Midtrans resume transaction failed:", midtransResponse.status, errorDetails);
      await supabase
        .from("bookings")
        .update({ midtrans_order_id: previousOrderId })
        .eq("booking_id", booking.booking_id);
      const errorMessage = midtransResponse.status === 401
        ? "Midtrans menolak autentikasi. Pastikan MIDTRANS_SERVER_KEY benar dan MIDTRANS_IS_SANDBOX cocok dengan environment key."
        : "Midtrans gagal membuat transaksi pembayaran ulang. Silakan coba lagi.";
      return jsonResponse({ error: errorMessage }, 502);
    }

    const transaction = await midtransResponse.json();
    if (typeof transaction.token !== "string" || !transaction.token) {
      console.error("Midtrans resume response did not contain a Snap token.");
      await supabase
        .from("bookings")
        .update({ midtrans_order_id: previousOrderId })
        .eq("booking_id", booking.booking_id);
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
    console.error("Resume transaction failed:", error);
    if (error instanceof Error && error.message.startsWith("Missing Edge Function secret:")) {
      const missingSecret = error.message.split(":").at(-1)?.trim();
      return jsonResponse({
        error: `Konfigurasi Edge Function belum lengkap. Atur secret ${missingSecret} di Supabase.`,
      }, 500);
    }
    return jsonResponse({ error: "Terjadi kesalahan. Silakan coba lagi." }, 500);
  }
});
