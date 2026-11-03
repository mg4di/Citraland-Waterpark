<script setup>
const window = globalThis.window
</script>

<template>
  <footer class="bg-slate-950 px-6 py-12 text-white lg:px-10">
    <div class="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
      <div>
        <a href="#" @click.prevent="window.navigateTo('home')" class="group flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-aqua transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <iconify-icon icon="lucide:waves" class="text-xl"></iconify-icon>
          </span>
          <span class="font-display text-lg font-extrabold">CITRALAND<span class="text-cyan-300">.</span></span>
        </a>
        <p class="mt-5 max-w-xs text-sm leading-6 text-white/50">Ruang bermain air untuk menciptakan kenangan indah bersama keluarga.</p>
      </div>

      <div>
        <h3 class="font-bold">Contact Info</h3>
        <div class="mt-4 space-y-3 text-sm text-white/60">
          <p class="flex items-start gap-3">
            <iconify-icon icon="lucide:map-pin" class="mt-1 shrink-0 text-aqua"></iconify-icon>
            <span>Perumahan CitraLand, Jl. Cargo Permai, Ubung Kaja, Kec. Denpasar Utara, Kota Denpasar, Bali 80116</span>
          </p>
          <a href="https://goo.gl/maps/SkPFYkq98TpqHFzL9" target="_blank" rel="noreferrer" class="inline-block text-cyan-200 hover:text-white">Lihat di Google Maps</a>
          <p class="flex items-start gap-3">
            <iconify-icon icon="lucide:phone" class="mt-1 shrink-0 text-aqua"></iconify-icon>
            <a href="tel:+623614714830" class="hover:text-white">+62 361 4714830</a>
          </p>
          <p class="flex items-start gap-3">
            <iconify-icon icon="lucide:clock-3" class="mt-1 shrink-0 text-aqua"></iconify-icon>
            <span>Selasa-Minggu, 09.00–18.00 WITA. Senin tutup.</span>
          </p>
          <a href="https://linktr.ee/Citralandwaterparkdps" target="_blank" rel="noreferrer" class="inline-block text-cyan-200 hover:text-white">Info Lainnya</a>
        </div>
      </div>

      <div>
        <h3 class="font-bold">Ikuti keseruan kami</h3>
        <div class="mt-4 flex gap-3">
          <a href="https://www.instagram.com/citralandwaterparkdps/" target="_blank" rel="noreferrer" aria-label="Instagram Citraland Waterpark" class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-aqua"><iconify-icon icon="lucide:instagram"></iconify-icon></a>
          <a href="https://www.youtube.com/channel/UC5cbRbk9zHN1NfzUOsX_85Q" target="_blank" rel="noreferrer" aria-label="YouTube Citraland Waterpark Denpasar" class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-aqua"><iconify-icon icon="lucide:youtube"></iconify-icon></a>
          <a href="https://www.tiktok.com/@citralandwaterparkdps" target="_blank" rel="noreferrer" aria-label="TikTok Citraland Waterpark" class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-aqua"><iconify-icon icon="lucide:music-2"></iconify-icon></a>
        </div>
      </div>
    </div>

    <div class="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/40">© 2026 Citraland Waterpark Denpasar</div>
  </footer>
</template>
