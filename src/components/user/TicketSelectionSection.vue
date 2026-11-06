<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ticketPricingService } from '../../services/ticketPricingService.js'
import { realtimeManager } from '../../services/realtimeService.js'

const window = globalThis.window

const tickets = ref([
  {
    type: 'weekday',
    name: 'Weekdays',
    days: 'Selasa–Jumat',
    price: 35000,
    featured: false,
  },
  {
    type: 'weekend',
    name: 'Weekend',
    days: 'Sabtu–Minggu',
    price: 50000,
    featured: true,
  },
])

function updatePricing(pricing) {
  for (const ticket of pricing) {
    const current = tickets.value.find((item) => item.type === ticket.ticket_type)
    if (!current) continue
    current.name = ticket.ticket_type === 'weekday' ? 'Weekdays' : 'Weekend'
    current.days = ticket.days_description
    current.price = Number(ticket.price)
    window.setTicketPrice?.(ticket.ticket_type, current.price, `Tiket ${current.name}`)
  }
}

let unsubscribe
onMounted(async () => {
  const result = await ticketPricingService.getActivePricing()
  if (result.success) updatePricing(result.pricing)
  else window.showToast?.(result.error, 'error')
  unsubscribe = realtimeManager.subscribeToTicketPricing(async () => {
    const refreshed = await ticketPricingService.getActivePricing()
    if (refreshed.success) updatePricing(refreshed.pricing)
    else window.showToast?.(refreshed.error, 'error')
  }, 'ticket_selection_pricing')
})

onBeforeUnmount(() => unsubscribe?.())
</script>

<template>
  <div class="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
    <article
      v-for="(ticket, index) in tickets"
      :key="ticket.type"
      class="ticket-card scroll-reveal relative flex flex-col rounded-3xl p-7 shadow-xl"
      :class="ticket.featured
        ? 'bg-ocean text-white shadow-cyan-900/20'
        : 'bg-white text-slate-900 ring-1 ring-slate-100'"
      :style="{ transitionDelay: `${index * 0.1}s` }"
    >
      <span
        v-if="ticket.featured"
        class="absolute right-6 top-6 rounded-full bg-cyan-200 px-3 py-1 text-xs font-bold text-ocean"
      >Akhir pekan</span>
      <span
        class="flex h-14 w-14 items-center justify-center rounded-2xl"
        :class="ticket.featured ? 'bg-white/15 text-cyan-100' : 'bg-lagoon text-ocean'"
      >
        <iconify-icon icon="lucide:calendar-days" class="text-2xl"></iconify-icon>
      </span>
      <h3 class="mt-7 font-display text-2xl font-bold">{{ ticket.name }}</h3>
      <p class="mt-2 text-sm" :class="ticket.featured ? 'text-cyan-100' : 'text-slate-500'">
        {{ ticket.days }}
      </p>
      <p class="mt-6 font-display text-4xl font-extrabold">
        Rp{{ ticket.price.toLocaleString('id-ID') }}<span
          class="text-lg font-semibold"
          :class="ticket.featured ? 'text-cyan-200' : 'text-slate-400'"
        >.000</span>
        <span class="text-sm font-semibold"> / orang</span>
      </p>
      <div class="my-6 h-px" :class="ticket.featured ? 'bg-white/20' : 'bg-slate-100'"></div>
      <p class="flex gap-3 text-sm" :class="ticket.featured ? 'text-white' : 'text-slate-600'">
        <iconify-icon icon="lucide:check" class="mt-0.5 text-aqua"></iconify-icon>
        Anak dengan tinggi di bawah 85 cm gratis
      </p>
      <div class="mt-auto pt-8">
        <label class="text-sm font-bold" :class="ticket.featured ? 'text-cyan-50' : 'text-slate-700'">
          Jumlah tiket berbayar
        </label>
        <div
          class="mt-3 flex h-12 items-center justify-between rounded-xl border px-3"
          :class="ticket.featured ? 'border-white/25' : 'border-slate-200'"
        >
          <button
            type="button"
            :aria-label="`Kurangi tiket ${ticket.name}`"
            class="flex h-9 w-9 items-center justify-center rounded-lg"
            :class="ticket.featured ? 'text-cyan-100 hover:bg-white/10' : 'text-slate-400 hover:bg-lagoon hover:text-ocean'"
            @click.prevent="window.updateQty(ticket.type, -1)"
          ><iconify-icon icon="lucide:minus"></iconify-icon></button>
          <input
            :id="`${ticket.type}-qty`"
            value="0"
            readonly
            :aria-label="`Jumlah tiket ${ticket.name}`"
            class="w-12 border-0 bg-transparent text-center text-lg font-bold outline-none"
            :class="ticket.featured ? 'text-white' : 'text-slate-900'"
          >
          <button
            type="button"
            :aria-label="`Tambah tiket ${ticket.name}`"
            class="flex h-9 w-9 items-center justify-center rounded-lg"
            :class="ticket.featured ? 'bg-white text-ocean hover:bg-cyan-100' : 'bg-lagoon text-ocean hover:bg-aqua hover:text-white'"
            @click.prevent="window.updateQty(ticket.type, 1)"
          ><iconify-icon icon="lucide:plus"></iconify-icon></button>
        </div>
        <a
          href="#"
          class="mt-4 flex min-h-12 items-center justify-center rounded-full font-bold transition-all hover:shadow-lg"
          :class="ticket.featured
            ? 'bg-white text-ocean hover:bg-cyan-100'
            : 'border-2 border-aqua text-ocean hover:bg-aqua hover:text-white'"
          @click.prevent="window.goToBooking(ticket.type)"
        >Lanjutkan <iconify-icon icon="lucide:arrow-right" class="ml-2"></iconify-icon></a>
      </div>
    </article>
  </div>
</template>
