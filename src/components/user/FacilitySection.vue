<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { facilitiesService } from '../../services/facilitiesService.js'
import { realtimeManager } from '../../services/realtimeService.js'

const window = globalThis.window

const facilities = ref([
  {
    icon: 'lucide:waves',
    iconColor: 'text-ocean',
    cardColor: 'bg-slate-50',
    title: 'Kolam Ombak',
    description: 'Rasakan suasana bermain air dengan ombak buatan.',
  },
  {
    icon: 'lucide:ship',
    iconColor: 'text-blue-500',
    cardColor: 'bg-slate-50',
    title: 'Area Bajak Laut',
    description: 'Area bermain air bertema bajak laut untuk serunya liburan keluarga.',
  },
  {
    icon: 'lucide:move-horizontal',
    iconColor: 'text-orange-500',
    cardColor: 'bg-slate-50',
    title: 'Kolam Arus',
    description: 'Santai menyusuri kolam arus dan menikmati suasana waterpark.',
  },
  {
    icon: 'lucide:life-buoy',
    iconColor: 'text-emerald-500',
    cardColor: 'bg-slate-50',
    title: 'Wahana Seluncur',
    description: 'Pilihan seluncuran air untuk menambah keseruan bermain.',
  },
])

function updateFacilities(data) {
  facilities.value = data.map((facility) => ({
    icon: facility.icon,
    iconColor: 'text-ocean',
    cardColor: 'bg-slate-50',
    title: facility.facility_name,
    description: facility.description,
  }))
}

let unsubscribe
onMounted(async () => {
  const result = await facilitiesService.getActiveFacilities()
  if (result.success) updateFacilities(result.facilities)
  else window.showToast?.(result.error, 'error')
  unsubscribe = realtimeManager.subscribeToFacilities(async () => {
    const refreshed = await facilitiesService.getActiveFacilities()
    if (refreshed.success) updateFacilities(refreshed.facilities)
    else window.showToast?.(refreshed.error, 'error')
  })
})

onBeforeUnmount(() => unsubscribe?.())
</script>

<template>
  <section id="fasilitas" class="mx-auto max-w-7xl px-6 py-24 lg:px-10">
    <div class="scroll-reveal flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div><p class="text-sm font-bold uppercase tracking-[.22em] text-ocean">Wahana Citraland Waterpark</p><h2 class="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Serunya bermain air di Bali</h2></div>
      <p class="max-w-md text-slate-500 leading-7">Nikmati wahana air bertema bajak laut dan pilihan kolam untuk bersenang-senang bersama keluarga di Denpasar.</p>
    </div>
    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="(facility, index) in facilities"
        :key="facility.title"
        class="scroll-reveal facility-card cursor-pointer rounded-3xl p-7"
        :class="facility.cardColor"
        :style="{ transitionDelay: `${index * 0.1}s` }"
      >
        <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm" :class="facility.iconColor">
          <iconify-icon :icon="facility.icon" class="text-2xl"></iconify-icon>
        </span>
        <h3 class="mt-7 font-display text-lg font-bold">{{ facility.title }}</h3>
        <p class="mt-3 text-sm leading-6 text-slate-500">{{ facility.description }}</p>
      </article>
    </div>
  </section>
</template>
