<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const gallery = [
  {
    src: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Sc6iYceeZF306CAScPqQZGGRo1-3Q8HBrSb32GOFWPtA9dQTfymZ0OrYndGYARdgsYRnjSV1KCjSOtSnI4Z17mycHGyE4zxkSpfbz6Y3wFnLnp-KrW3IoZWSkjR0vROGGnPiaaPA=w1200-h800-k-no',
    alt: 'Kolam bermain dan kapal bajak laut di Citraland Waterpark, foto Google Maps',
    caption: 'Kolam bermain bertema bajak laut',
  },
  {
    src: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QMdguxEu0WftzZVqJbPufprKkEzTdEPrGscjaHSvkaja_IcIx4_1iIx1GjSSVKR42-CPeNpGc_Q1CYZST8tmsOdK8PLSS5_MLw88liSj8oICFS9MRV4hByt7-VWynl9XXEbYCq9g=w1200-h1200-k-no',
    alt: 'Seluncuran merah dan area bermain anak di Citraland Waterpark, foto Google Maps',
    caption: 'Area seluncuran air anak',
  },
  {
    src: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Tn5GEWcUGMO_8pjjyZBAr_CyH6XyUhHSF2Ff6ZFPJir8ifmlkd9xBb1RQafJhOigAoNre2Kn7MLMlz9zj3XqwpoQALtwCDYn4cD8qsqnTkjGKu973xARlyslm5tmAMr5yp_AY=w1200-h1600-k-no',
    alt: 'Pintu masuk bertema bajak laut Citraland Waterpark Denpasar, foto Google Maps',
    caption: 'Pintu masuk Citraland Waterpark',
  },
  {
    src: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9ReyG69OKZQcbE29PNRlHs6xK6uQuyqIwPoYFkWWJf6fM805NmjUv5e7U0wl5ZvjdJQv3BumMqwUVAxqYJj7Tfxf78eRZICXEupfLxw8qhGo2Ym4LWFdtoB4X53KaFsEPU2zeiF=w1200-h1600-k-no',
    alt: 'Dekorasi patung bajak laut di Citraland Waterpark, foto Google Maps',
    caption: 'Dekorasi bajak laut di area waterpark',
  },
]

const track = ref(null)
const activeIndex = ref(0)
let scrollFrame = null

const slides = computed(() => Array.from(track.value?.querySelectorAll('[data-gallery-slide]') ?? []))

function updateActiveIndex() {
  if (!track.value || !slides.value.length) return
  const trackLeft = slides.value[0].offsetLeft
  activeIndex.value = slides.value.reduce((closestIndex, slide, index) => {
    const distance = Math.abs(slide.offsetLeft - trackLeft - track.value.scrollLeft)
    const closestDistance = Math.abs(slides.value[closestIndex].offsetLeft - trackLeft - track.value.scrollLeft)
    return distance < closestDistance ? index : closestIndex
  }, 0)
}

function goTo(index) {
  const slideCount = slides.value.length
  if (!track.value || slideCount === 0) return
  activeIndex.value = (index + slideCount) % slideCount
  track.value.scrollTo({
    left: slides.value[activeIndex.value].offsetLeft - slides.value[0].offsetLeft,
    behavior: 'smooth',
  })
}

function onScroll() {
  if (scrollFrame !== null) return
  scrollFrame = requestAnimationFrame(() => {
    updateActiveIndex()
    scrollFrame = null
  })
}

function onKeydown(event) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goTo(activeIndex.value - 1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    goTo(activeIndex.value + 1)
  }
}

onMounted(() => {
  track.value?.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  track.value?.removeEventListener('scroll', onScroll)
  if (scrollFrame !== null) cancelAnimationFrame(scrollFrame)
})
</script>

<template>
  <section id="galeri" class="mx-auto max-w-7xl px-6 py-24 lg:px-10">
    <div class="scroll-reveal flex items-end justify-between">
      <div><p class="text-sm font-bold uppercase tracking-[.22em] text-ocean">Galeri Citraland Waterpark</p><h2 class="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Suasana di Denpasar</h2></div>
    </div>
    <p class="mt-3 text-xs text-slate-400">
      Foto dari Google Maps.
      <a
        href="https://goo.gl/maps/SkPFYkq98TpqHFzL9"
        target="_blank"
        rel="noreferrer"
        class="font-semibold text-ocean underline underline-offset-2"
      >Lihat sumber foto</a>
    </p>
    <div class="mt-10">
      <div
        id="gallery-track"
        ref="track"
        class="gallery-track flex h-[300px] snap-x snap-mandatory gap-4 overflow-x-auto rounded-3xl scroll-smooth sm:h-[420px] lg:h-[500px]"
        role="region"
        aria-label="Galeri foto Citraland Waterpark"
        tabindex="0"
        @keydown="onKeydown"
      >
        <figure v-for="image in gallery" :key="image.src" data-gallery-slide class="relative h-full min-w-full snap-start overflow-hidden rounded-3xl bg-slate-100">
          <img :src="image.src" :alt="image.alt" class="gallery-img h-full w-full object-cover">
          <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent px-6 pb-6 pt-20 text-lg font-bold text-white sm:px-10 sm:pb-9">{{ image.caption }}</figcaption>
        </figure>
      </div>
      <div class="mt-5 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2" aria-label="Pilih foto galeri">
          <button
            v-for="(_, index) in gallery"
            :key="index"
            type="button"
            :aria-label="`Tampilkan foto ${index + 1}`"
            :aria-current="activeIndex === index ? 'true' : undefined"
            :class="[
              'h-2.5 rounded-full transition-all hover:bg-ocean',
              activeIndex === index ? 'w-7 bg-ocean' : 'w-2.5 bg-slate-300',
            ]"
            @click="goTo(index)"
          ></button>
        </div>
        <div class="flex gap-2">
          <button type="button" aria-label="Foto sebelumnya" title="Foto sebelumnya" class="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-ocean hover:bg-lagoon hover:text-ocean" @click="goTo(activeIndex - 1)"><iconify-icon icon="lucide:arrow-left" class="text-lg"></iconify-icon></button>
          <button type="button" aria-label="Foto berikutnya" title="Foto berikutnya" class="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-ocean hover:bg-lagoon hover:text-ocean" @click="goTo(activeIndex + 1)"><iconify-icon icon="lucide:arrow-right" class="text-lg"></iconify-icon></button>
        </div>
      </div>
    </div>
  </section>
</template>
