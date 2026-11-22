<script setup>
const window = globalThis.window;
</script>

<template>
  <footer class="bg-deep px-5 pb-28 pt-14 text-white lg:px-8 lg:pb-14">
    <div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr_auto]">
      <div>
        <a
          href="#"
          @click.prevent="window.goToSection('home')"
          class="group flex w-fit items-center gap-3"
          aria-label="Citraland Waterpark, kembali ke beranda"
        >
          <span class="flex h-11 w-11 items-center justify-center">
            <img
              src="/images/logo.webp"
              width="44"
              height="41"
              alt=""
              class="h-full w-full object-contain transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
            />
          </span>
          <span class="home-display text-lg font-extrabold tracking-[-.04em]"
            >CITRALAND<span class="text-sun">.</span></span
          >
        </a>
        <p class="mt-5 max-w-xs text-sm leading-6 text-white/65">
          Ruang bermain air untuk menciptakan kenangan indah bersama keluarga.
        </p>
        <p class="mt-5 flex items-center gap-2 text-sm font-semibold text-white/75">
          <iconify-icon icon="lucide:clock-3" class="text-base text-sun"></iconify-icon>
          Selasa–Minggu, 09.00–18.00 WITA
        </p>
        <p class="mt-1 text-xs text-white/60">Senin tutup.</p>
      </div>

      <div>
        <h3 class="text-sm font-bold text-white">Kontak</h3>
        <div class="mt-4 space-y-3 text-sm leading-6 text-white/65">
          <p class="flex items-start gap-3">
            <iconify-icon icon="lucide:map-pin" class="mt-1 shrink-0 text-sun"></iconify-icon>
            <span
              >Perumahan CitraLand, Jl. Cargo Permai, Ubung Kaja, Kec. Denpasar Utara, Kota
              Denpasar, Bali 80116</span
            >
          </p>
          <a
            href="https://goo.gl/maps/SkPFYkq98TpqHFzL9"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 font-semibold text-sun transition hover:text-white"
            >Lihat di Google Maps
            <iconify-icon icon="lucide:arrow-up-right" class="text-sm"></iconify-icon>
          </a>
          <p class="flex items-start gap-3">
            <iconify-icon icon="lucide:phone" class="mt-1 shrink-0 text-sun"></iconify-icon>
            <a href="tel:+623614714830" class="transition hover:text-white">+62 361 4714830</a>
          </p>
          <a
            href="https://linktr.ee/Citralandwaterparkdps"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 font-semibold text-sun transition hover:text-white"
            >Info lainnya
            <iconify-icon icon="lucide:arrow-up-right" class="text-sm"></iconify-icon>
          </a>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-bold text-white">Ikuti keseruan kami</h3>
        <div class="mt-4 flex gap-3">
          <a
            href="https://www.instagram.com/citralandwaterparkdps/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram Citraland Waterpark"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-sun hover:bg-sun hover:text-ink"
            ><iconify-icon icon="lucide:instagram"></iconify-icon
          ></a>
          <a
            href="https://www.youtube.com/channel/UC5cbRbk9zHN1NfzUOsX_85Q"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube Citraland Waterpark Denpasar"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-sun hover:bg-sun hover:text-ink"
            ><iconify-icon icon="lucide:youtube"></iconify-icon
          ></a>
          <a
            href="https://www.tiktok.com/@citralandwaterparkdps"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok Citraland Waterpark"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-sun hover:bg-sun hover:text-ink"
            ><iconify-icon icon="lucide:music-2"></iconify-icon
          ></a>
        </div>
        <button
          type="button"
          class="mt-8 flex min-h-11 items-center gap-2 text-sm font-semibold text-white/65 transition hover:text-white"
          @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
        >
          Kembali ke atas
          <iconify-icon icon="lucide:arrow-up" class="text-base"></iconify-icon>
        </button>
      </div>
    </div>

    <div class="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
      <p>© 2026 Citraland Waterpark Denpasar</p>
      <p>Denpasar Utara, Bali</p>
    </div>
  </footer>
</template>
