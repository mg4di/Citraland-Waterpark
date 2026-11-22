<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { galleryService } from '../../services/galleryService.js';
import { realtimeManager } from '../../services/realtimeService.js';
import { waterparkGalleryImages } from '../../data/waterparkImages.js';

const window = globalThis.window;
const gallery = ref(waterparkGalleryImages.map((image) => ({ ...image })));

function updateGallery(images) {
  const curated = (images ?? []).filter((image) => {
    const text = `${image.caption ?? ''} ${image.image_url ?? ''}`.toLowerCase();
    return !/(uhdpaper|wallpaper|harbor-cats|mimi|kucing)/.test(text);
  });
  if (!curated.length) {
    gallery.value = waterparkGalleryImages.map((image) => ({ ...image }));
    activeIndex.value = 0;
    requestAnimationFrame(updateActiveIndex);
    return;
  }

  gallery.value = curated.map((image) => {
    const localImage = waterparkGalleryImages.find(
      (item) => item.caption === image.caption || item.src === image.image_url,
    );
    return {
      src: localImage?.src || image.image_url,
      srcset: localImage?.srcset,
      alt: localImage?.alt || image.caption || 'Foto Citraland Waterpark Denpasar',
      caption: image.caption || 'Citraland Waterpark Denpasar',
      width: localImage?.width || 1200,
      height: localImage?.height || 800,
      position: localImage?.position || 'center',
    };
  });
  activeIndex.value = 0;
  requestAnimationFrame(updateActiveIndex);
}

const track = ref(null);
const activeIndex = ref(0);
let scrollFrame = null;

const slides = computed(() =>
  Array.from(track.value?.querySelectorAll('[data-gallery-slide]') ?? []),
);

function updateActiveIndex() {
  if (!track.value || !slides.value.length) return;
  const trackLeft = slides.value[0].offsetLeft;
  activeIndex.value = slides.value.reduce((closestIndex, slide, index) => {
    const distance = Math.abs(slide.offsetLeft - trackLeft - track.value.scrollLeft);
    const closestDistance = Math.abs(
      slides.value[closestIndex].offsetLeft - trackLeft - track.value.scrollLeft,
    );
    return distance < closestDistance ? index : closestIndex;
  }, 0);
}

function goTo(index) {
  const slideCount = slides.value.length;
  if (!track.value || slideCount === 0) return;
  activeIndex.value = (index + slideCount) % slideCount;
  track.value.scrollTo({
    left: slides.value[activeIndex.value].offsetLeft - slides.value[0].offsetLeft,
    behavior: 'smooth',
  });
}

function onScroll() {
  if (scrollFrame !== null) return;
  scrollFrame = requestAnimationFrame(() => {
    updateActiveIndex();
    scrollFrame = null;
  });
}

function onKeydown(event) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    goTo(activeIndex.value - 1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    goTo(activeIndex.value + 1);
  }
}

onMounted(() => {
  track.value?.addEventListener('scroll', onScroll, { passive: true });
  galleryService.getPublishedImages().then((result) => {
    if (result.success) updateGallery(result.images);
    else window.showToast?.(result.error, 'error');
  });
  unsubscribeGallery = realtimeManager.subscribeToGallery(async () => {
    const result = await galleryService.getPublishedImages();
    if (result.success) updateGallery(result.images);
    else window.showToast?.(result.error, 'error');
  });
});

let unsubscribeGallery;
onBeforeUnmount(() => {
  track.value?.removeEventListener('scroll', onScroll);
  unsubscribeGallery?.();
  if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
});
</script>

<template>
  <section id="galeri" class="scroll-mt-24 bg-sand px-5 py-20 lg:px-8 lg:py-28">
    <div class="mx-auto grid min-w-0 max-w-7xl gap-10 lg:grid-cols-[.62fr_1.38fr] lg:gap-16">
      <div data-gsap-reveal class="min-w-0 self-start lg:sticky lg:top-28">
        <h2 class="home-display text-4xl font-extrabold leading-[.95] tracking-[-.04em] sm:text-5xl">
          Suasana<br />kolam.
        </h2>
        <p class="mt-5 max-w-sm leading-7 text-ink/70">
          Foto dari Google Maps. Lihat warna air, kapal bajak laut, dan area bermain sebelum
          berangkat.
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-ink/15 py-3">
          <div class="flex flex-wrap items-center gap-1">
            <button
              type="button"
              aria-label="Foto sebelumnya"
              title="Foto sebelumnya"
              class="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition hover:border-ink hover:bg-white"
              @click="goTo(activeIndex - 1)"
            >
              <iconify-icon icon="lucide:arrow-left" class="text-lg"></iconify-icon>
            </button>
            <p class="min-w-16 text-center text-sm font-bold tabular-nums" aria-live="polite">
              {{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(gallery.length).padStart(2, '0') }}
            </p>
            <button
              type="button"
              aria-label="Foto berikutnya"
              title="Foto berikutnya"
              class="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition hover:border-ink hover:bg-white"
              @click="goTo(activeIndex + 1)"
            >
              <iconify-icon icon="lucide:arrow-right" class="text-lg"></iconify-icon>
            </button>
          </div>
          <a
            href="https://goo.gl/maps/SkPFYkq98TpqHFzL9"
            target="_blank"
            rel="noreferrer"
            class="flex items-center gap-2 text-xs font-bold text-ink/70 underline decoration-ink/25 underline-offset-4 transition hover:text-ink hover:decoration-ink"
          >
            Sumber foto
            <iconify-icon icon="lucide:arrow-up-right" class="text-sm"></iconify-icon>
          </a>
        </div>
        <p class="mt-4 text-xs leading-5 text-ink/70">
          Geser atau klik panah untuk berpindah foto.
        </p>
      </div>

      <div data-gsap-reveal class="min-w-0">
        <div
          id="gallery-track"
          ref="track"
          class="gallery-track flex h-[420px] min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto rounded-[1.75rem] bg-ink scroll-smooth sm:h-[520px]"
          role="region"
          aria-label="Galeri foto Citraland Waterpark"
          tabindex="0"
          @keydown="onKeydown"
        >
          <figure
            v-for="(image, index) in gallery"
            :key="image.src"
            data-gallery-slide
            class="relative h-full min-w-full snap-start overflow-hidden rounded-[1.75rem] bg-ink"
          >
            <img
              :src="image.src"
              :srcset="image.srcset"
              :alt="image.alt"
              :width="image.width"
              :height="image.height"
              :style="{ objectPosition: image.position }"
              sizes="(min-width: 1024px) 60vw, 100vw"
              :loading="index < 2 ? 'eager' : 'lazy'"
              :fetchpriority="index < 2 ? 'high' : 'low'"
              decoding="async"
              class="gallery-img h-full w-full object-cover"
            />
            <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent px-5 pb-5 pt-24 text-white sm:px-7 sm:pb-7">
              <p class="text-xs font-bold uppercase tracking-[.2em] text-sun">
                {{ String(index + 1).padStart(2, '0') }} / {{ String(gallery.length).padStart(2, '0') }}
              </p>
              <p class="home-display mt-1 text-2xl font-extrabold tracking-[-.03em] sm:text-3xl">
                {{ image.caption }}
              </p>
            </figcaption>
          </figure>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-1" aria-label="Pilih foto galeri">
            <button
              v-for="(_, index) in gallery"
              :key="index"
              type="button"
              :aria-label="`Tampilkan foto ${index + 1}`"
              :aria-current="activeIndex === index ? 'true' : undefined"
              class="group flex h-11 w-11 items-center justify-center rounded-full"
              @click="goTo(index)"
            >
              <span
                :class="[
                  'block h-2.5 rounded-full transition-all',
                  activeIndex === index ? 'w-7 bg-ink' : 'w-2.5 bg-ink/55 group-hover:bg-ink/80',
                ]"
              ></span>
            </button>
          </div>
          <p class="text-xs text-ink/70">Foto: Google Maps</p>
        </div>
      </div>
    </div>
  </section>
</template>
