<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { facilitiesService } from '../../services/facilitiesService.js';
import { realtimeManager } from '../../services/realtimeService.js';

const window = globalThis.window;
const facilityImage = {
  src: '/images/facility-water-slide.webp',
  alt: 'Seluncuran merah dan area bermain anak di Citraland Waterpark',
  width: 900,
  height: 900,
};

const facilities = ref([
  {
    icon: 'lucide:waves',
    title: 'Kolam Ombak',
    description: 'Rasakan suasana bermain air dengan ombak buatan.',
  },
  {
    icon: 'lucide:ship',
    title: 'Area Bajak Laut',
    description: 'Area bermain air bertema bajak laut untuk serunya liburan keluarga.',
  },
  {
    icon: 'lucide:move-horizontal',
    title: 'Kolam Arus',
    description: 'Santai menyusuri kolam arus dan menikmati suasana waterpark.',
  },
  {
    icon: 'lucide:life-buoy',
    title: 'Wahana Seluncur',
    description: 'Pilihan seluncuran air untuk menambah keseruan bermain.',
  },
]);

function updateFacilities(data) {
  facilities.value = data.map((facility) => ({
    icon: facility.icon || 'lucide:waves',
    title: facility.facility_name,
    description: facility.description,
  }));
}

let unsubscribe;
onMounted(async () => {
  const result = await facilitiesService.getActiveFacilities();
  if (result.success) updateFacilities(result.facilities);
  else window.showToast?.(result.error, 'error');
  unsubscribe = realtimeManager.subscribeToFacilities(async () => {
    const refreshed = await facilitiesService.getActiveFacilities();
    if (refreshed.success) updateFacilities(refreshed.facilities);
    else window.showToast?.(refreshed.error, 'error');
  });
});

onBeforeUnmount(() => unsubscribe?.());
</script>

<template>
  <section id="fasilitas" class="scroll-mt-24 bg-white px-5 py-20 lg:px-8 lg:py-28">
    <div class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-start lg:gap-20">
      <div class="scroll-reveal lg:sticky lg:top-24">
        <figure
          class="relative overflow-hidden rounded-[1.75rem] bg-seafoam"
          :style="{
            backgroundImage: `url('${facilityImage.src}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
        >
          <div class="absolute inset-0 flex items-center justify-center text-ink/60" aria-hidden="true">
            <span class="flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-[.16em]">
              <iconify-icon icon="lucide:image" class="text-2xl"></iconify-icon>
              Foto wahana
            </span>
          </div>
          <img
            :src="facilityImage.src"
            :alt="facilityImage.alt"
            :width="facilityImage.width"
            :height="facilityImage.height"
            loading="eager"
            decoding="async"
            class="relative z-10 aspect-[4/5] w-full object-cover object-center sm:aspect-[4/3] lg:aspect-[4/5]"
          />
          <figcaption class="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent px-6 pb-6 pt-24 text-sm font-semibold text-white">
            Area seluncur dan kolam bermain anak.
          </figcaption>
        </figure>
        <p class="mt-4 text-xs leading-5 text-ink/70">
          Foto suasana Citraland Waterpark. Lihat lebih banyak di
          <a
            href="#"
            class="font-bold text-pool underline decoration-pool/30 underline-offset-2 hover:decoration-pool"
            @click.prevent="window.goToSection('galeri')"
            >galeri</a
          >.
        </p>
      </div>

      <div class="scroll-reveal">
        <h2 class="home-display text-4xl font-extrabold leading-[.95] tracking-[-.04em] sm:text-5xl">
          Basah di<br />setiap sudut.
        </h2>
        <p class="mt-5 max-w-lg leading-7 text-ink/70">
          Dari kapal bajak laut sampai kolam arus—pilih cara bermain air yang paling cocok untuk
          keluarga.
        </p>

        <div v-if="facilities.length" class="mt-10" role="list">
          <article
            v-for="facility in facilities"
            :key="facility.title"
            class="grid grid-cols-[auto_1fr] gap-4 border-b border-ink/10 py-6 first:border-t"
            role="listitem"
          >
            <span class="flex h-14 w-14 items-center justify-center rounded-full bg-seafoam text-pool">
              <iconify-icon :icon="facility.icon" class="text-2xl" aria-hidden="true"></iconify-icon>
            </span>
            <div>
              <h3 class="home-display text-xl font-extrabold tracking-[-.03em]">{{ facility.title }}</h3>
              <p class="mt-2 max-w-md text-sm leading-6 text-ink/70">{{ facility.description }}</p>
            </div>
          </article>
        </div>

        <div v-else class="mt-10 rounded-2xl border border-dashed border-ink/25 bg-sand p-6">
          <p class="font-bold">Daftar wahana sedang diperbarui.</p>
          <p class="mt-1 text-sm leading-6 text-ink/70">
            Sementara itu, lihat suasana kolam di galeri atau hubungi kami untuk info kunjungan.
          </p>
          <button
            type="button"
            class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white"
            @click="window.goToSection('galeri')"
          >
            Buka galeri
            <iconify-icon icon="lucide:arrow-right" class="text-sm"></iconify-icon>
          </button>
        </div>

        <a
          href="#"
          @click.prevent="window.goToSection('galeri')"
          class="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-ink/30 pb-1 text-sm font-bold text-ink transition hover:border-ink"
        >
          Lihat foto wahana
          <iconify-icon icon="lucide:arrow-up-right" class="text-base"></iconify-icon>
        </a>
      </div>
    </div>
  </section>
</template>
