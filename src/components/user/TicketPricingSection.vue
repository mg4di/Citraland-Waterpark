<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { ticketPricingService } from '../../services/ticketPricingService.js';
import { realtimeManager } from '../../services/realtimeService.js';

const window = globalThis.window;

const tickets = ref([
  {
    type: 'weekday',
    name: 'Weekdays',
    days: 'Selasa–Jumat',
    price: 35000,
  },
  {
    type: 'weekend',
    name: 'Weekend',
    days: 'Sabtu–Minggu',
    price: 50000,
  },
]);

function updatePricing(pricing) {
  for (const ticket of pricing) {
    const current = tickets.value.find((item) => item.type === ticket.ticket_type);
    if (!current) continue;
    const nextPrice = Number(ticket.price);
    if (Number.isFinite(nextPrice)) current.price = nextPrice;
    if (ticket.days_description) current.days = ticket.days_description;
    window.setTicketPrice?.(ticket.ticket_type, current.price, `Tiket ${current.name}`);
  }
}

let unsubscribe;
onMounted(async () => {
  const result = await ticketPricingService.getActivePricing();
  if (result.success) updatePricing(result.pricing);
  else window.showToast?.(result.error, 'error');
  unsubscribe = realtimeManager.subscribeToTicketPricing(async () => {
    const refreshed = await ticketPricingService.getActivePricing();
    if (refreshed.success) updatePricing(refreshed.pricing);
    else window.showToast?.(refreshed.error, 'error');
  }, 'ticket_pricing_display');
});

onBeforeUnmount(() => unsubscribe?.());
</script>

<template>
  <section id="harga" class="scroll-mt-24 bg-sand px-5 py-20 lg:px-8 lg:py-28">
    <div class="mx-auto grid min-w-0 max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
      <div data-gsap-reveal class="min-w-0 self-start lg:sticky lg:top-28">
        <h2 class="home-display text-4xl font-extrabold leading-[.95] tracking-[-.04em] sm:text-5xl">
          Satu harga,<br />seharian main.
        </h2>
        <p class="mt-5 max-w-md leading-7 text-ink/70">
          Harga per orang, berlaku sesuai hari kunjungan. Pilih tiket dulu—akun baru diminta saat
          checkout.
        </p>

        <ul class="mt-8 space-y-3 text-sm text-ink/75">
          <li class="flex items-start gap-3">
            <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
              <iconify-icon icon="lucide:check" class="text-xs"></iconify-icon>
            </span>
            Berlaku untuk satu hari kunjungan.
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
              <iconify-icon icon="lucide:check" class="text-xs"></iconify-icon>
            </span>
            Anak di bawah 85 cm masuk gratis.
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
              <iconify-icon icon="lucide:check" class="text-xs"></iconify-icon>
            </span>
            E-ticket masuk ke akun setelah pembayaran.
          </li>
        </ul>

        <div class="mt-8 flex items-start gap-3 border-t border-ink/15 pt-5 text-sm leading-6 text-ink/70">
          <iconify-icon icon="lucide:shield-check" class="mt-1 text-lg text-pool"></iconify-icon>
          <p>Pembayaran diproses lewat Midtrans. Harga selalu diambil dari sistem tiket resmi.</p>
        </div>
      </div>

      <div class="min-w-0 scroll-reveal">
        <div class="home-loket relative min-w-0 overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_28px_70px_-35px_rgba(15,23,42,.35)] ring-1 ring-ink/5 sm:p-8">
          <div data-gsap-item class="flex items-start justify-between gap-4 border-b border-ink/10 pb-6">
            <div>
              <p class="text-xs font-bold uppercase tracking-[.22em] text-ink/70">Loket tiket</p>
              <p class="home-display mt-1 text-3xl font-extrabold tracking-[-.04em]">Harga resmi</p>
            </div>
            <span class="hidden rounded-full bg-seafoam px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-pool sm:inline-block">
              Tiket harian
            </span>
          </div>

          <div
            v-for="ticket in tickets"
            :key="ticket.type"
            data-gsap-item
            class="grid gap-5 border-b border-ink/10 py-6 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p class="home-display text-2xl font-extrabold tracking-[-.03em]">{{ ticket.name }}</p>
              <p class="mt-1 text-sm text-ink/70">{{ ticket.days }}</p>
              <p class="mt-3 flex items-center gap-2 text-xs font-semibold text-pool">
                <iconify-icon icon="lucide:calendar-check" class="text-sm"></iconify-icon>
                Berlaku sesuai hari yang dipilih
              </p>
            </div>

            <div class="flex flex-wrap items-end justify-between gap-5 sm:flex-col sm:items-end">
              <div class="text-right">
                <p class="text-xs font-bold uppercase tracking-[.16em] text-ink/70">Per orang</p>
                <p class="home-display mt-1 text-3xl font-extrabold leading-none tracking-[-.04em] sm:text-4xl">
                  Rp{{ ticket.price.toLocaleString('id-ID') }}
                </p>
              </div>
              <button
                type="button"
                :aria-label="`Pilih tiket ${ticket.name}`"
                class="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white transition hover:bg-pool focus-visible:outline-pool"
                @click="window.selectTicketType(ticket.type)"
              >
                Pilih
                <iconify-icon icon="lucide:arrow-up-right" class="text-base"></iconify-icon>
              </button>
            </div>
          </div>

          <div data-gsap-item class="mt-6 flex items-start gap-3 rounded-2xl bg-seafoam p-4 text-sm leading-6 text-ink/75">
            <iconify-icon icon="lucide:baby" class="mt-0.5 text-lg text-pool"></iconify-icon>
            <p>
              <strong class="font-bold text-ink">Anak di bawah 85 cm gratis.</strong>
              Tiket berbayar berlaku per orang. Pilih tiket dulu, lalu masuk saat checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
