<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { initializeUserPage } from './legacy/user-page.js';
import FacilitySection from './components/user/FacilitySection.vue';
import GallerySection from './components/user/GallerySection.vue';
import TicketPricingSection from './components/user/TicketPricingSection.vue';
import TicketSelectionSection from './components/user/TicketSelectionSection.vue';
import UserFooter from './components/user/UserFooter.vue';
import { waterparkHeroImage } from './data/waterparkImages.js';
import { initHomeGsap } from './animations/homeGsap.js';

const window = globalThis.window;

let disposeHomeGsap;

onMounted(() => {
  initializeUserPage();
  disposeHomeGsap = initHomeGsap();
});

onBeforeUnmount(() => disposeHomeGsap?.());
</script>

<template>
  <!-- Confetti Container -->
  <div id="confetti-container" class="fixed inset-0 pointer-events-none z-[200]"></div>

  <!-- ==================== PAGE 1: HOME ==================== -->
  <div id="page-home" class="page active">
    <div class="home-shell home-body min-h-screen bg-sand text-ink">
      <!-- Header -->
      <header id="mainHeader" data-gsap-hero="header" class="home-header fixed top-0 left-0 right-0 z-50 transition-all duration-500">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <a
            href="#"
            @click.prevent="window.goToSection('home')"
            class="group flex items-center gap-3 text-white"
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
            <span class="home-brand-text home-display text-lg font-extrabold tracking-[-.04em]"
              >CITRALAND<span class="text-sun">.</span></span
            >
          </a>

          <nav class="hidden items-center gap-7 text-sm font-semibold text-white/75 lg:flex" aria-label="Navigasi utama">
            <a href="#" data-nav-section="home" @click.prevent="window.goToSection('home')" class="home-nav-link is-active">Beranda</a>
            <a href="#" data-nav-section="harga" @click.prevent="window.goToSection('harga')" class="home-nav-link">Harga</a>
            <a href="#" data-nav-section="fasilitas" @click.prevent="window.goToSection('fasilitas')" class="home-nav-link">Fasilitas</a>
            <a href="#" data-nav-section="info" @click.prevent="window.goToSection('info')" class="home-nav-link">Info</a>
            <a href="#" data-nav-section="galeri" @click.prevent="window.goToSection('galeri')" class="home-nav-link">Galeri</a>
          </nav>

          <div class="flex items-center gap-2">
            <div class="hidden items-center gap-2 sm:flex">
              <a
                id="nav-login"
                href="#"
                @click.prevent="window.navigateTo('login')"
                class="flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk
              </a>
              <div id="nav-profile" class="relative" style="display: none">
                <button
                  id="nav-profile-trigger"
                  type="button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  @click.stop="window.toggleProfileMenu('desktop')"
                  class="flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon>
                  <span id="nav-profile-name">Profil</span>
                  <iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
                </button>
                <div
                  id="nav-profile-dropdown"
                  class="hidden absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-ink/10 bg-sand p-2 text-ink shadow-2xl"
                  @click.stop
                >
                  <div class="border-b border-ink/10 px-3 py-2">
                    <p id="nav-profile-dropdown-name" class="truncate text-sm font-bold"></p>
                    <p id="nav-profile-email" class="truncate text-xs text-ink/70"></p>
                  </div>
                  <button
                    type="button"
                    @click="window.navigateTo('ticket-history')"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink/75 transition hover:bg-seafoam hover:text-ink"
                  >
                    <iconify-icon icon="lucide:history"></iconify-icon> Riwayat tiket
                  </button>
                  <button
                    type="button"
                    @click="window.logoutUser()"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click.prevent="window.toggleMobileMenu(true)"
              class="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10 lg:hidden"
              aria-label="Buka menu navigasi"
              aria-expanded="false"
              aria-controls="mobileMenu"
              data-mobile-menu-trigger
            >
              <iconify-icon icon="lucide:menu" class="text-2xl"></iconify-icon>
            </button>
          </div>
        </div>
      </header>

      <main>
        <!-- Hero -->
        <section id="home" class="home-hero relative isolate overflow-hidden bg-ink text-white">
          <img
            :src="waterparkHeroImage.src"
            :alt="waterparkHeroImage.alt"
            width="1080"
            height="711"
            fetchpriority="high"
            decoding="async"
            data-gsap-hero="image"
            class="absolute inset-0 h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-slate-950/55"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/35"></div>
          <div class="home-grain absolute inset-0"></div>

          <div class="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-28 pt-32 lg:px-8 lg:pb-14">
            <div class="grid items-end gap-12 lg:grid-cols-[1.3fr_.7fr] lg:gap-16">
              <div class="max-w-3xl">
                <h1 data-gsap-hero="title" class="home-display text-[clamp(2.8rem,7.6vw,6.5rem)] font-extrabold leading-[.88] tracking-[-.04em]">
                  Bajak laut,<br />ombak,<br /><span class="text-sun">seru seharian.</span>
                </h1>
                <p data-gsap-hero="copy" class="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                  Waterpark keluarga di Denpasar Utara. Tiket mulai <span id="hero-starting-price">Rp35.000</span>, anak di bawah 85 cm gratis.
                </p>
                <div data-gsap-hero="actions" class="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#"
                    @click.prevent="window.goToSection('harga')"
                    class="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-sun px-7 text-sm font-bold text-ink transition hover:bg-seafoam"
                  >
                    Pesan tiket
                    <iconify-icon icon="lucide:arrow-up-right" class="text-lg"></iconify-icon>
                  </a>
                  <a
                    href="#"
                    @click.prevent="window.goToSection('galeri')"
                    class="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                  >
                    <iconify-icon icon="lucide:play-circle" class="text-xl"></iconify-icon>
                    Lihat suasana
                  </a>
                </div>
                <div data-gsap-hero="trust" class="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/75">
                  <span class="flex items-center gap-2">
                    <iconify-icon icon="mdi:star" class="text-base text-amber-300"></iconify-icon>
                    4,5/5 <span class="text-white/60">·</span> 3.611 ulasan Google
                  </span>
                  <span class="hidden h-4 w-px bg-white/20 sm:block"></span>
                  <span class="flex items-center gap-2">
                    <iconify-icon icon="lucide:clock-3" class="text-base text-sun"></iconify-icon>
                    Selasa–Minggu, 09.00–18.00 WITA
                  </span>
                </div>
              </div>

              <aside
                data-gsap-hero="ticket" class="home-ticket relative mx-auto hidden w-full max-w-sm rotate-1 bg-sand p-6 text-ink shadow-2xl shadow-deep/50 sm:block sm:p-7 lg:mx-0 lg:justify-self-end"
                aria-label="Ringkasan harga tiket"
              >
                <div class="flex items-start justify-between gap-4 border-b border-ink/15 pb-4">
                  <div>
                    <p class="text-xs font-bold uppercase tracking-[.2em] text-ink/70">Denpasar, Bali</p>
                    <p class="home-display mt-1 text-2xl font-extrabold">Tiket harian</p>
                  </div>
                  <span class="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-white">Resmi</span>
                </div>

                <div class="grid grid-cols-2 gap-4 py-5">
                  <div>
                    <p class="text-xs font-bold uppercase tracking-[.12em] text-ink/70">Weekdays</p>
                    <p class="home-display mt-1 text-3xl font-extrabold leading-none">Rp<span id="hero-weekday-price">35</span><span class="text-base">rb</span></p>
                    <p class="mt-2 text-xs text-ink/70">Selasa–Jumat</p>
                  </div>
                  <div class="border-l border-dashed border-ink/25 pl-4">
                    <p class="text-xs font-bold uppercase tracking-[.12em] text-ink/70">Weekend</p>
                    <p class="home-display mt-1 text-3xl font-extrabold leading-none">Rp<span id="hero-weekend-price">50</span><span class="text-base">rb</span></p>
                    <p class="mt-2 text-xs text-ink/70">Sabtu–Minggu</p>
                  </div>
                </div>

                <div class="home-ticket-tear"></div>

                <div class="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p class="text-xs font-bold uppercase tracking-[.16em] text-ink/70">Anak</p>
                    <p class="text-sm font-semibold">&lt; 85 cm gratis</p>
                  </div>
                  <iconify-icon icon="lucide:users-round" class="text-2xl text-ink/35"></iconify-icon>
                </div>

                <a
                  href="#"
                  @click.prevent="window.goToSection('harga')"
                  class="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white transition hover:bg-pool"
                >
                  Lihat semua tiket
                  <iconify-icon icon="lucide:arrow-right" class="text-base"></iconify-icon>
                </a>
                <p class="mt-3 text-center text-xs text-ink/70">Senin tutup · Harga per orang</p>
              </aside>
            </div>

            <div data-gsap-hero="facts" class="mt-12 grid gap-3 border-t border-white/15 pt-6 text-sm text-white/75 sm:grid-cols-3">
              <p class="flex items-center gap-2">
                <iconify-icon icon="lucide:map-pin" class="text-base text-sun"></iconify-icon>
                Denpasar Utara, Bali
              </p>
              <p class="flex items-center gap-2">
                <iconify-icon icon="lucide:ticket" class="text-base text-sun"></iconify-icon>
                <span><span id="hero-price-range">Rp35.000–Rp50.000</span> per orang</span>
              </p>
              <a
                href="https://goo.gl/maps/SkPFYkq98TpqHFzL9"
                target="_blank"
                rel="noreferrer"
                class="flex items-center gap-2 transition hover:text-white"
              >
                <iconify-icon icon="mdi:star" class="text-base text-amber-300"></iconify-icon>
                4,5/5 di Google Maps
                <iconify-icon icon="lucide:arrow-up-right" class="text-sm"></iconify-icon>
              </a>
            </div>
          </div>
        </section>

        <TicketPricingSection />
        <FacilitySection />

        <!-- Info kunjungan -->
        <section id="info" data-gsap-section="info" class="scroll-mt-24 bg-seafoam px-5 py-20 lg:px-8 lg:py-28">
          <div class="mx-auto grid min-w-0 max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div data-gsap-reveal class="min-w-0 self-start lg:sticky lg:top-28">
              <h2 class="home-display text-4xl font-extrabold leading-[.95] tracking-[-.04em] sm:text-5xl">
                Sebelum berangkat,<br />ini yang perlu kamu tahu.
              </h2>
              <p class="mt-5 max-w-md leading-7 text-ink/70">
                Jam buka, lokasi, aturan anak, dan harga tiket—tanpa perlu menyusuri halaman lain.
              </p>
              <a
                href="https://goo.gl/maps/SkPFYkq98TpqHFzL9"
                target="_blank"
                rel="noreferrer"
                class="mt-7 inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-sm font-bold text-ink transition hover:border-ink"
              >
                Buka Google Maps
                <iconify-icon icon="lucide:arrow-up-right" class="text-base"></iconify-icon>
              </a>
            </div>

            <div class="border-t border-ink/20">
              <div data-gsap-item class="grid gap-3 border-b border-ink/20 py-6 sm:grid-cols-[10rem_1fr]">
                <p class="text-xs font-bold uppercase tracking-[.18em] text-ink/70">Jam buka</p>
                <div>
                  <p class="font-semibold">Selasa–Minggu, 09.00–18.00 WITA</p>
                  <p class="mt-1 text-sm text-ink/70">Senin tutup.</p>
                </div>
              </div>
              <div data-gsap-item class="grid gap-3 border-b border-ink/20 py-6 sm:grid-cols-[10rem_1fr]">
                <p class="text-xs font-bold uppercase tracking-[.18em] text-ink/70">Lokasi</p>
                <div>
                  <p class="font-semibold">Perumahan CitraLand, Denpasar Utara</p>
                  <p class="mt-1 text-sm leading-6 text-ink/70">
                    Jl. Cargo Permai, Ubung Kaja, Kec. Denpasar Utara, Kota Denpasar, Bali 80116.
                  </p>
                </div>
              </div>
              <div data-gsap-item class="grid gap-3 border-b border-ink/20 py-6 sm:grid-cols-[10rem_1fr]">
                <p class="text-xs font-bold uppercase tracking-[.18em] text-ink/70">Anak</p>
                <div>
                  <p class="font-semibold">Di bawah 85 cm gratis</p>
                  <p class="mt-1 text-sm text-ink/70">Tiket berbayar berlaku per orang.</p>
                </div>
              </div>
              <div data-gsap-item class="grid gap-3 border-b border-ink/20 py-6 sm:grid-cols-[10rem_1fr]">
                <p class="text-xs font-bold uppercase tracking-[.18em] text-ink/70">Tiket</p>
                <div class="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p class="font-semibold"><span id="info-weekday-price">Rp35.000</span> weekdays · <span id="info-weekend-price">Rp50.000</span> weekend</p>
                    <p class="mt-1 text-sm text-ink/70">Pilih tiket dulu, masuk saat checkout.</p>
                  </div>
                  <a
                    href="#"
                    @click.prevent="window.goToSection('harga')"
                    class="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white transition hover:bg-pool"
                  >
                    Pilih tiket
                    <iconify-icon icon="lucide:arrow-right" class="text-sm"></iconify-icon>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <GallerySection />

        <!-- Ulasan -->
        <section id="ulasan" data-gsap-section="ulasan" class="scroll-mt-24 bg-ink px-5 py-20 text-white lg:px-8 lg:py-28">
          <div class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div data-gsap-reveal>
              <h2 class="home-display text-4xl font-extrabold leading-[.95] tracking-[-.04em] sm:text-5xl">
                Kata mereka<br />yang sudah basah.
              </h2>
              <p class="mt-5 max-w-md leading-7 text-white/70">
                Rating publik, bukan klaim kami. Ulasan bisa berbeda-beda—baca konteks lengkapnya di sumbernya.
              </p>

              <div class="mt-8 grid gap-3 sm:grid-cols-2">
                <a
                  href="https://goo.gl/maps/SkPFYkq98TpqHFzL9"
                  target="_blank"
                  rel="noreferrer"
                  data-gsap-item
                  class="group rounded-2xl border border-white/15 p-5 transition-colors hover:border-white/35 hover:bg-white/5"
                >
                  <div class="flex items-baseline gap-1">
                    <span class="home-display text-4xl font-extrabold text-sun">4,5</span>
                    <span class="text-sm text-white/55">/5</span>
                  </div>
                  <p class="mt-2 text-sm font-semibold">Google Maps</p>
                  <p class="mt-1 text-xs text-white/60">3.611 ulasan · buka sumber</p>
                </a>
                <a
                  href="https://www.tripadvisor.co.id/Search?q=Citraland%20Waterpark%20Denpasar"
                  target="_blank"
                  rel="noreferrer"
                  data-gsap-item
                  class="group rounded-2xl border border-white/15 p-5 transition-colors hover:border-white/35 hover:bg-white/5"
                >
                  <div class="flex items-baseline gap-1">
                    <span class="home-display text-4xl font-extrabold text-sun">4,3</span>
                    <span class="text-sm text-white/55">/5</span>
                  </div>
                  <p class="mt-2 text-sm font-semibold">Tripadvisor</p>
                  <p class="mt-1 text-xs text-white/60">Baca ulasan positif &amp; kritis</p>
                </a>
              </div>
            </div>

            <figure data-gsap-reveal class="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-sand p-7 text-ink sm:p-9">
              <iconify-icon icon="lucide:quote" class="text-4xl text-ink/20"></iconify-icon>
              <blockquote class="home-display mt-8 text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl">
                “Great waterpark for kids”
              </blockquote>
              <figcaption class="mt-8 border-t border-ink/15 pt-5 text-sm leading-6 text-ink/70">
                Judul ulasan di Tripadvisor. Bukan rating perorangan yang kami klaim.
                <a
                  href="https://www.tripadvisor.co.id/Search?q=Citraland%20Waterpark%20Denpasar"
                  target="_blank"
                  rel="noreferrer"
                  class="mt-3 flex w-fit items-center gap-2 font-bold text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink"
                >
                  Baca di Tripadvisor
                  <iconify-icon icon="lucide:arrow-up-right" class="text-base"></iconify-icon>
                </a>
              </figcaption>
            </figure>
          </div>
        </section>

        <!-- Closing CTA -->
        <section data-gsap-section="closing" class="bg-sun px-5 py-16 text-ink lg:px-8">
          <div class="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 data-gsap-item class="home-display text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Siap basah-basahan?</h2>
              <p data-gsap-item class="mt-2 text-ink/80">Pilih hari, tambah tiket, lalu masuk saat checkout.</p>
            </div>
            <a
              href="#"
              data-gsap-item
              @click.prevent="window.goToSection('harga')"
              class="home-focus-ink inline-flex min-h-14 w-fit items-center justify-center gap-3 rounded-full bg-ink px-7 text-sm font-bold text-white transition-colors hover:bg-pool"
            >
              Pilih tiket
              <iconify-icon icon="lucide:arrow-up-right" class="text-lg"></iconify-icon>
            </a>
          </div>
        </section>
      </main>

      <UserFooter />

      <!-- Mobile booking bar -->
      <div class="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-sand/95 px-4 pb-[calc(env(safe-area-inset-bottom)+.75rem)] pt-3 backdrop-blur lg:hidden">
        <div class="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[.16em] text-ink/70">Mulai dari</p>
            <p id="mobile-price-from" class="home-display text-xl font-extrabold leading-none">Rp35.000</p>
          </div>
          <a
            href="#"
            @click.prevent="window.goToSection('harga')"
            class="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-bold text-white"
          >
            Pilih tiket
            <iconify-icon icon="lucide:arrow-right" class="text-base"></iconify-icon>
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 2: LOGIN ==================== -->
  <div id="page-login" class="page">
    <div class="min-h-screen bg-lagoon font-sans text-slate-800">
      <section class="relative min-h-screen overflow-hidden bg-ink">
        <div class="absolute inset-0 bg-gradient-to-br from-deep via-ink to-pool"></div>
        <div
          class="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full border-[42px] border-white/10 animate-pulse-ring"
        ></div>
        <div
          class="absolute -bottom-56 -left-24 h-[470px] w-[470px] rounded-full border-[28px] border-aqua/15 animate-pulse-ring"
          style="animation-delay: 1.5s"
        ></div>
        <div
          class="absolute right-[12%] top-[20%] h-24 w-24 rounded-full bg-aqua/10 blur-2xl animate-float"
        ></div>
        <div id="bubbles-login" class="absolute inset-0 overflow-hidden pointer-events-none"></div>

        <!-- Header -->
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a
              href="#"
              @click.prevent="window.navigateTo('home')"
              class="flex items-center gap-3 text-white group"
            >
              <span
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                ><img
                  src="/images/logo.webp"
                  alt="Logo Citraland Waterpark"
                  class="h-full w-full rounded-[inherit] object-contain"
              /></span>
              <span class="home-brand-text font-display text-lg font-extrabold tracking-tight"
                >CITRALAND<span class="text-sun">.</span></span
              >
            </a>
            <nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex">
              <a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Home</a
              >
              <a
                href="#"
                @click.prevent="
                  window.navigateTo('home');
                  setTimeout(
                    () =>
                      document.getElementById('fasilitas')?.scrollIntoView({ behavior: 'smooth' }),
                    300,
                  );
                "
                class="nav-link transition hover:text-sun"
                >Fasilitas</a
              >
              <a
                href="#"
                @click.prevent="
                  window.navigateTo('home');
                  setTimeout(
                    () => document.getElementById('harga')?.scrollIntoView({ behavior: 'smooth' }),
                    300,
                  );
                "
                class="nav-link transition hover:text-sun"
                >Harga</a
              >
            </nav>
            <a
              href="#"
              @click.prevent="window.navigateTo('login')"
              class="hidden sm:flex min-h-11 items-center gap-2 rounded-full bg-white/15 border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-pool backdrop-blur-sm"
              ><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a
            >
          </div>
        </header>

        <main
          class="relative mx-auto flex max-w-7xl items-center justify-center px-6 pb-20 pt-28 lg:px-10 min-h-screen"
        >
          <div
            class="animate-card-entry grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/30 lg:grid-cols-[.9fr_1.1fr]"
          >
            <!-- Left Panel -->
            <aside
              class="aside-panel relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between"
            >
              <div
                class="absolute -right-20 top-20 h-64 w-64 rounded-full border-[24px] border-white/10 animate-pulse-ring"
              ></div>
              <div class="relative z-10 animate-slide-in-left">
                <span
                  class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-transparent text-seafoam"
                  ><iconify-icon icon="lucide:user" class="text-3xl"></iconify-icon
                ></span>
                <p class="mt-10 text-sm font-bold uppercase tracking-[.22em] text-seafoam">
                  Selamat datang kembali
                </p>
                <h1
                  class="mt-4 max-w-sm font-display text-4xl font-extrabold leading-tight tracking-tight"
                >
                  Siap membuat momen baru di Citraland Waterpark?
                </h1>
                <p class="mt-6 max-w-sm leading-7 text-white/75">
                  Masuk untuk melihat pesanan, mengelola e-ticket, dan menikmati proses liburan yang
                  lebih praktis.
                </p>
              </div>
              <div class="relative z-10 mt-14 space-y-4 animate-slide-in-left delay-300">
                <div
                  class="feature-card rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <div class="flex items-start gap-4">
                    <span
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aqua/15 text-seafoam"
                      ><iconify-icon icon="lucide:ticket-check" class="text-xl"></iconify-icon
                    ></span>
                    <div>
                      <p class="font-bold">Semua tiket dalam satu tempat</p>
                      <p class="mt-1 text-sm leading-6 text-white/65">
                        Akses cepat ke booking dan e-ticket kamu kapan saja.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  class="feature-card rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <div class="flex items-start gap-4">
                    <span
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aqua/15 text-seafoam"
                      ><iconify-icon icon="lucide:calendar-heart" class="text-xl"></iconify-icon
                    ></span>
                    <div>
                      <p class="font-bold">Riwayat kunjungan tersimpan</p>
                      <p class="mt-1 text-sm leading-6 text-white/65">
                        Pantau semua aktivitas liburanmu dengan mudah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Right Panel -->
            <section class="p-7 sm:p-10 lg:p-12 animate-slide-in-right">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-bold uppercase tracking-[.2em] text-pool">
                    Akun Citraland Waterpark
                  </p>
                  <h2
                    class="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900"
                  >
                    Masuk ke akunmu
                  </h2>
                  <p class="mt-3 text-sm leading-6 text-slate-500">
                    Lanjutkan perjalanan seru bersama keluarga.
                  </p>
                </div>
                <a
                  href="#"
                  @click.prevent="window.navigateTo('home')"
                  aria-label="Kembali ke beranda"
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-aqua hover:text-pool hover:rotate-90 duration-300"
                  ><iconify-icon icon="lucide:x"></iconify-icon
                ></a>
              </div>
              <form id="login-form" class="mt-8" novalidate>
                <div class="animate-fade-in-up delay-200">
                  <label for="login-email" class="mb-2 block text-sm font-bold text-slate-700"
                    >Alamat email</label
                  >
                  <div class="relative">
                    <iconify-icon
                      icon="lucide:mail"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    ></iconify-icon
                    ><input
                      id="login-email"
                      name="email"
                      type="email"
                      autocomplete="username"
                      aria-describedby="login-email-error"
                      aria-invalid="false"
                      placeholder="nama@email.com"
                      class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <p id="login-email-error" class="mt-2 hidden text-xs font-medium text-rose-600" role="alert"></p>
                </div>
                <div class="mt-5 animate-fade-in-up delay-300">
                  <div class="mb-2 flex items-center justify-between">
                    <label for="login-password" class="block text-sm font-bold text-slate-700"
                      >Kata sandi</label
                    ><a
                      id="forgot-password-link"
                      href="#"
                      @click.prevent="window.openPasswordResetDialog()"
                      class="text-xs font-bold text-pool transition hover:text-aqua"
                      >Lupa kata sandi?</a
                    >
                  </div>
                  <div class="relative">
                    <iconify-icon
                      icon="lucide:lock-keyhole"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    ></iconify-icon
                    ><input
                      id="login-password"
                      name="password"
                      type="password"
                      autocomplete="current-password"
                      aria-describedby="login-password-error"
                      aria-invalid="false"
                      placeholder="Kata sandi"
                      class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-base outline-none placeholder:text-slate-500"
                    /><button
                      type="button"
                      @click.prevent="window.togglePassword($event.currentTarget)"
                      aria-label="Tampilkan atau sembunyikan kata sandi"
                      aria-pressed="false"
                      class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-lagoon hover:text-pool"
                    >
                      <iconify-icon icon="lucide:eye"></iconify-icon>
                    </button>
                  </div>
                  <p id="login-password-error" class="mt-2 hidden text-xs font-medium text-rose-600" role="alert"></p>
                </div>
                <div class="mt-5 flex items-center justify-between animate-fade-in-up delay-400">
                  <label class="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
                    ><input
                      type="checkbox"
                      class="checkbox-custom h-4 w-4 rounded border-slate-300"
                    /><span>Ingat saya</span></label
                  ><span class="flex items-center gap-1.5 text-xs text-emerald-700"
                    ><iconify-icon icon="lucide:shield-check"></iconify-icon> Sesi aman</span
                  >
                </div>
                <button
                  type="submit"
                  class="btn-primary mt-7 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-aqua px-6 text-sm font-bold text-ink shadow-lg shadow-ink/15 transition-all hover:bg-ocean hover:shadow-xl active:scale-[0.98] animate-fade-in-up delay-500"
                >
                  <span id="login-btn-text">Masuk ke Citraland Waterpark</span
                  ><iconify-icon
                    icon="lucide:arrow-right"
                    class="text-lg"
                    id="login-btn-icon"
                  ></iconify-icon>
                </button>
              </form>
              <p class="mt-8 text-center text-sm text-slate-500 animate-fade-in-up delay-800">
                Belum punya akun?
                <a
                  href="#"
                  @click.prevent="window.navigateTo('register')"
                  class="font-bold text-pool transition hover:text-aqua hover:underline underline-offset-2"
                  >Daftar sekarang</a
                >
              </p>
              <div
                class="mt-7 flex items-center justify-center gap-5 border-t border-slate-100 pt-6 text-xs text-slate-500"
              >
                <span class="flex items-center gap-1.5"
                  ><iconify-icon icon="lucide:lock" class="text-emerald-500"></iconify-icon> SSL
                  Secure</span
                ><span class="flex items-center gap-1.5"
                  ><iconify-icon icon="lucide:badge-check" class="text-pool"></iconify-icon> Data
                  terlindungi</span
                >
              </div>
            </section>
          </div>
        </main>
        <div class="wave-divider-lagoon"></div>
      </section>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 3: REGISTER ==================== -->
  <div id="page-register" class="page">
    <div class="min-h-screen bg-lagoon font-sans text-slate-800">
      <section class="relative min-h-screen overflow-hidden bg-ink">
        <div class="absolute inset-0 bg-gradient-to-br from-deep via-ink to-pool"></div>
        <div
          class="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full border-[42px] border-white/10 animate-pulse-ring"
        ></div>
        <div
          class="absolute -bottom-56 -left-24 h-[470px] w-[470px] rounded-full border-[28px] border-aqua/15 animate-pulse-ring"
          style="animation-delay: 1.5s"
        ></div>
        <div
          id="bubbles-register"
          class="absolute inset-0 overflow-hidden pointer-events-none"
        ></div>
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a
              href="#"
              @click.prevent="window.navigateTo('home')"
              class="flex items-center gap-3 text-white group"
            >
              <span
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                ><img
                  src="/images/logo.webp"
                  alt="Logo Citraland Waterpark"
                  class="h-full w-full rounded-[inherit] object-contain"
              /></span>
              <span class="home-brand-text font-display text-lg font-extrabold tracking-tight"
                >CITRALAND<span class="text-sun">.</span></span
              >
            </a>
            <a
              href="#"
              @click.prevent="window.navigateTo('login')"
              class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-pool"
              ><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a
            >
          </div>
        </header>

        <main
          class="relative mx-auto flex max-w-7xl items-center justify-center px-6 pb-20 pt-28 lg:px-10 min-h-screen"
        >
          <div
            class="animate-card-entry grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/30 lg:grid-cols-[.9fr_1.1fr]"
          >
            <aside
              class="aside-panel relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between"
            >
              <div
                class="absolute -right-20 top-20 h-64 w-64 rounded-full border-[24px] border-white/10 animate-pulse-ring"
              ></div>
              <div class="relative z-10 animate-slide-in-left">
                <span
                  class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-transparent text-seafoam"
                  ><iconify-icon icon="lucide:user" class="text-3xl"></iconify-icon
                ></span>
                <p class="mt-10 text-sm font-bold uppercase tracking-[.22em] text-seafoam">
                  Mulai petualanganmu
                </p>
                <h1
                  class="mt-4 max-w-sm font-display text-4xl font-extrabold leading-tight tracking-tight"
                >
                  Satu akun untuk hari-hari seru di Citraland Waterpark.
                </h1>
                <p class="mt-6 max-w-sm leading-7 text-white/75">
                  Simpan tiket dan nikmati pengalaman liburan yang lebih praktis bersama keluarga.
                </p>
              </div>
              <div
                class="feature-card relative z-10 mt-14 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm animate-slide-in-left delay-300"
              >
                <div class="flex items-start gap-4">
                  <span
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aqua/15 text-seafoam"
                    ><iconify-icon icon="lucide:ticket-check" class="text-xl"></iconify-icon
                  ></span>
                  <div>
                    <p class="font-bold">Semua tiket dalam satu tempat</p>
                    <p class="mt-1 text-sm leading-6 text-white/65">
                      Akses cepat ke booking dan e-ticket kamu kapan saja.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section class="p-7 sm:p-10 lg:p-12 animate-slide-in-right">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-bold uppercase tracking-[.2em] text-pool">
                    Akun Citraland Waterpark
                  </p>
                  <h2
                    class="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900"
                  >
                    Buat akun baru
                  </h2>
                  <p class="mt-3 text-sm leading-6 text-slate-500">
                    Isi data berikut untuk memulai perjalananmu.
                  </p>
                </div>
                <a
                  href="#"
                  @click.prevent="window.navigateTo('home')"
                  aria-label="Kembali ke beranda"
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-aqua hover:text-pool hover:rotate-90 duration-300"
                  ><iconify-icon icon="lucide:x"></iconify-icon
                ></a>
              </div>
              <form id="register-form" class="mt-7" novalidate>
                <div class="animate-fade-in-up delay-100">
                  <label for="register-name" class="mb-2 block text-sm font-bold text-slate-700"
                    >Nama lengkap</label
                  >
                  <div class="relative">
                    <iconify-icon
                      icon="lucide:user-round"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    ></iconify-icon
                    ><input
                      id="register-name"
                      aria-describedby="register-name-error"
                      aria-invalid="false"
                      name="name"
                      type="text"
                      autocomplete="name"
                      placeholder="Nama lengkapmu"
                      class="input-field h-[50px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <p id="register-name-error" class="mt-2 hidden text-xs font-medium text-rose-600" role="alert"></p>
                </div>
                <div class="mt-4 animate-fade-in-up delay-200">
                  <label for="register-email" class="mb-2 block text-sm font-bold text-slate-700"
                    >Alamat email</label
                  >
                  <div class="relative">
                    <iconify-icon
                      icon="lucide:mail"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    ></iconify-icon
                    ><input
                      id="register-email"
                      aria-describedby="register-email-error"
                      aria-invalid="false"
                      name="email"
                      type="email"
                      autocomplete="email"
                      placeholder="nama@email.com"
                      class="input-field h-[50px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <p id="register-email-error" class="mt-2 hidden text-xs font-medium text-rose-600" role="alert"></p>
                </div>
                <div class="mt-4 animate-fade-in-up delay-300">
                  <label for="register-password" class="mb-2 block text-sm font-bold text-slate-700"
                    >Kata sandi</label
                  >
                  <div class="relative">
                    <iconify-icon
                      icon="lucide:lock-keyhole"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    ></iconify-icon
                    ><input
                      id="register-password"
                      aria-describedby="register-password-error"
                      aria-invalid="false"
                      name="password"
                      type="password"
                      autocomplete="new-password"
                      placeholder="Min. 8 karakter"
                      class="input-field h-[50px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-base outline-none placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      @click.prevent="window.togglePassword($event.currentTarget)"
                      class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-lagoon hover:text-pool"
                      aria-label="Tampilkan atau sembunyikan kata sandi"
                      aria-pressed="false"
                    >
                      <iconify-icon icon="lucide:eye"></iconify-icon>
                    </button>
                  </div>
                  <p id="register-password-error" class="mt-2 hidden text-xs font-medium text-rose-600" role="alert"></p>
                </div>
                <div class="mt-4 animate-fade-in-up delay-400">
                  <label
                    for="register-confirm-password"
                    class="mb-2 block text-sm font-bold text-slate-700"
                    >Konfirmasi kata sandi</label
                  >
                  <div class="relative">
                    <iconify-icon
                      icon="lucide:lock-keyhole"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    ></iconify-icon
                    ><input
                      id="register-confirm-password"
                      aria-describedby="register-confirm-password-error"
                      aria-invalid="false"
                      name="confirm-password"
                      type="password"
                      autocomplete="new-password"
                      placeholder="Ulangi sandi"
                      class="input-field h-[50px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-base outline-none placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      @click.prevent="window.togglePassword($event.currentTarget)"
                      class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-lagoon hover:text-pool"
                      aria-label="Tampilkan atau sembunyikan kata sandi"
                      aria-pressed="false"
                    >
                      <iconify-icon icon="lucide:eye"></iconify-icon>
                    </button>
                  </div>
                  <p id="register-confirm-password-error" class="mt-2 hidden text-xs font-medium text-rose-600" role="alert"></p>
                </div>
                <button
                  type="submit"
                  class="btn-primary mt-6 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-aqua px-6 text-sm font-bold text-ink shadow-lg shadow-ink/15 transition-all hover:bg-ocean hover:shadow-xl active:scale-[0.98]"
                >
                  <span id="register-btn-text">Daftar akun</span
                  ><iconify-icon
                    icon="lucide:arrow-right"
                    class="text-lg"
                    id="register-btn-icon"
                  ></iconify-icon>
                </button>
              </form>
              <p class="mt-6 text-center text-sm text-slate-500">
                Sudah punya akun?
                <a
                  href="#"
                  @click.prevent="window.navigateTo('login')"
                  class="font-bold text-pool transition hover:text-aqua hover:underline underline-offset-2"
                  >Masuk</a
                >
              </p>
              <div
                class="mt-6 flex items-center justify-center gap-5 border-t border-slate-100 pt-5 text-xs text-slate-500"
              >
                <span class="flex items-center gap-1.5"
                  ><iconify-icon icon="lucide:lock" class="text-emerald-500"></iconify-icon> SSL
                  Secure</span
                ><span class="flex items-center gap-1.5"
                  ><iconify-icon icon="lucide:badge-check" class="text-pool"></iconify-icon> Data
                  terlindungi</span
                >
              </div>
            </section>
          </div>
        </main>
        <div class="wave-divider-lagoon"></div>
      </section>
    </div>
  </div>

  <!-- ==================== PAGE 3: SELECT TICKET ==================== -->
  <div id="page-select-ticket" class="page">
    <div class="min-h-screen bg-lagoon text-slate-800 font-sans">
      <div class="relative hero-bg overflow-hidden">
        <div
          class="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full border-[42px] border-white/10 animate-pulse-ring"
        ></div>
        <div
          class="absolute -bottom-56 -left-24 h-[470px] w-[470px] rounded-full border-[28px] border-aqua/15 animate-pulse-ring"
          style="animation-delay: 1.5s"
        ></div>
        <div
          class="absolute right-[12%] top-[20%] h-24 w-24 rounded-full bg-aqua/10 blur-2xl animate-float"
        ></div>
        <div id="bubbles-ticket" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a
              href="#"
              @click.prevent="window.navigateTo('home')"
              class="flex items-center gap-3 text-white group"
            >
              <span
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent text-white"
                ><img
                  src="/images/logo.webp"
                  alt="Logo Citraland Waterpark"
                  class="h-full w-full rounded-[inherit] object-contain"
              /></span>
              <span class="home-brand-text font-display text-lg font-extrabold tracking-tight"
                >CITRALAND<span class="text-sun">.</span></span
              >
            </a>
            <nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex">
              <a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Home</a
              >
              <a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Fasilitas</a
              >
              <a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Harga</a
              >
            </nav>
            <div class="flex items-center gap-3">
              <a
                id="select-ticket-login"
                href="#"
                @click.prevent="window.navigateTo('login')"
                class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-pool"
              >
                <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk
              </a>
              <div id="select-ticket-profile" class="relative" style="display: none">
                <button
                  id="select-ticket-profile-trigger"
                  type="button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  @click.stop="window.toggleProfileMenu('select-ticket')"
                  class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-pool"
                >
                  <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon>
                  <span id="select-ticket-profile-name">Profil</span>
                  <iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
                </button>
                <div
                  id="select-ticket-profile-dropdown"
                  class="hidden absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl"
                  @click.stop
                >
                  <div class="border-b border-slate-100 px-3 py-2">
                    <p
                      id="select-ticket-profile-dropdown-name"
                      class="truncate text-sm font-bold"
                    ></p>
                    <p id="select-ticket-profile-email" class="truncate text-xs text-slate-500"></p>
                  </div>
                  <button
                    type="button"
                    @click="window.navigateTo('ticket-history')"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-lagoon hover:text-pool"
                  >
                    <iconify-icon icon="lucide:history"></iconify-icon> Riwayat Tiket
                  </button>
                  <button
                    type="button"
                    @click="window.logoutUser()"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
                  </button>
                </div>
              </div>
              <button
                type="button"
                @click.prevent="window.toggleMobileMenu(true)"
                aria-label="Buka menu navigasi"
                aria-expanded="false"
                aria-controls="mobileMenu"
                data-mobile-menu-trigger
                class="flex h-11 w-11 items-center justify-center rounded-xl text-white lg:hidden"
              >
                <iconify-icon icon="lucide:menu" class="text-2xl"></iconify-icon>
              </button>
            </div>
          </div>
        </header>
        <div class="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-10">
          <div class="max-w-3xl">
            <p
              class="text-sm font-bold uppercase tracking-[.22em] text-sun animate-fade-in-up"
            >
              Citraland Waterpark Denpasar
            </p>
            <h1
              class="mt-4 font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl animate-fade-in-up delay-100"
            >
              Pilih tiket untuk kunjunganmu
            </h1>
            <p class="mt-5 max-w-xl text-lg leading-8 text-white/75 animate-fade-in-up delay-200">
              Pilih jenis tiket sesuai hari kunjungan: Weekdays Selasa–Jumat, Weekend Sabtu–Minggu.
              Senin libur. Anak di bawah 85 cm gratis.
            </p>
          </div>
        </div>
        <div class="wave-divider-lagoon"></div>
      </div>
      <main class="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div
          class="scroll-reveal flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-sm font-bold uppercase tracking-[.18em] text-pool">Langkah pemesanan</p>
            <h2 class="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">
              1. Pilih jenis tiket
            </h2>
          </div>
          <div class="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-full bg-pool text-white animate-step-pulse"
              >1</span
            ><span class="step-line h-px w-10 bg-slate-300"></span
            ><span
              class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white"
              >2</span
            ><span class="step-line h-px w-10 bg-slate-300"></span
            ><span
              class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white"
              >3</span
            ><span class="step-line h-px w-10 bg-slate-300"></span
            ><span
              class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white"
              >4</span
            ><span class="ml-1 hidden md:inline">dari 4</span>
          </div>
        </div>
        <TicketSelectionSection />
        <div
          class="scroll-reveal mt-8 flex items-center justify-center gap-2 text-sm text-slate-600"
          style="transition-delay: 0.4s"
        >
          <iconify-icon icon="lucide:shield-check" class="text-lg text-pool"></iconify-icon
          >Pembayaran aman dan e-ticket akan langsung dicetak ke akun kamu.
        </div>
      </main>
      <div
        id="summaryBar"
        class="summary-bar hidden-bar fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl"
      >
        <div class="mx-auto max-w-7xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 lg:px-10">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3 sm:gap-6">
              <div class="flex min-w-0 items-center gap-2">
                <span
                  class="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lagoon text-pool sm:flex"
                  ><iconify-icon icon="lucide:ticket" class="text-sm"></iconify-icon
                ></span>
                <div class="min-w-0">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs sm:normal-case sm:tracking-normal">Total tiket</p>
                  <p class="truncate font-display font-bold text-slate-900" id="summaryCount">0 tiket</p>
                </div>
              </div>
              <div class="h-8 w-px bg-slate-200"></div>
              <div class="min-w-0">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs sm:normal-case sm:tracking-normal">Total harga</p>
                <p class="truncate font-display font-bold text-pool" id="summaryPrice">Rp0</p>
              </div>
            </div>
            <a
              href="#"
              @click.prevent="window.goToBookingFromSummary()"
              class="btn-primary flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-aqua px-4 text-xs font-bold text-ink shadow-lg transition hover:bg-ocean sm:min-h-11 sm:px-6 sm:text-sm"
              ><span class="sm:hidden">Lanjutkan</span><span class="hidden sm:inline">Lanjutkan Pesan</span>
              <iconify-icon icon="lucide:arrow-right" class="text-base"></iconify-icon
            ></a>
          </div>
        </div>
      </div>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 4: BOOKING DETAILS ==================== -->
  <div id="page-booking-details" class="page">
    <div class="min-h-screen bg-lagoon text-slate-800 font-sans">
      <div class="relative hero-bg-2 overflow-hidden">
        <div
          class="absolute inset-0 bg-gradient-to-br from-deep via-ink to-pool opacity-90"
        ></div>
        <div
          class="absolute -right-24 -top-32 h-96 w-96 rounded-full border-[36px] border-white/10 animate-pulse-ring"
        ></div>
        <div
          class="absolute -bottom-48 left-1/4 h-96 w-96 rounded-full border-[28px] border-aqua/15 animate-pulse-ring"
          style="animation-delay: 1.5s"
        ></div>
        <div
          id="bubbles-booking"
          class="absolute inset-0 overflow-hidden pointer-events-none"
        ></div>
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a
              href="#"
              @click.prevent="window.navigateTo('home')"
              class="flex items-center gap-3 text-white group"
            >
              <span
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent text-white"
                ><img
                  src="/images/logo.webp"
                  alt="Logo Citraland Waterpark"
                  class="h-full w-full rounded-[inherit] object-contain"
              /></span>
              <span class="home-brand-text font-display text-lg font-extrabold tracking-tight"
                >CITRALAND<span class="text-sun">.</span></span
              >
            </a>
            <nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex">
              <a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Home</a
              >
              <a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Fasilitas</a
              >
              <a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Harga</a
              >
            </nav>
            <div class="flex items-center gap-3">
              <a
                id="booking-details-login"
                href="#"
                @click.prevent="window.navigateTo('login')"
                class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-pool"
              >
                <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk
              </a>
              <div id="booking-details-profile" class="relative" style="display: none">
                <button
                  id="booking-details-profile-trigger"
                  type="button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  @click.stop="window.toggleProfileMenu('booking-details')"
                  class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-pool"
                >
                  <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon>
                  <span id="booking-details-profile-name">Profil</span>
                  <iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
                </button>
                <div
                  id="booking-details-profile-dropdown"
                  class="hidden absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl"
                  @click.stop
                >
                  <div class="border-b border-slate-100 px-3 py-2">
                    <p
                      id="booking-details-profile-dropdown-name"
                      class="truncate text-sm font-bold"
                    ></p>
                    <p
                      id="booking-details-profile-email"
                      class="truncate text-xs text-slate-500"
                    ></p>
                  </div>
                  <button
                    type="button"
                    @click="window.navigateTo('ticket-history')"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-lagoon hover:text-pool"
                  >
                    <iconify-icon icon="lucide:history"></iconify-icon> Riwayat Tiket
                  </button>
                  <button
                    type="button"
                    @click="window.logoutUser()"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div class="relative mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-10">
          <div class="flex items-center gap-3 text-sm text-seafoam animate-fade-in-up">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"
              ><iconify-icon icon="lucide:ticket-check"></iconify-icon
            ></span>
            Lengkapi pemesananmu
          </div>
          <h1
            class="mt-4 font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl animate-fade-in-up delay-100"
          >
            Detail Pemesanan
          </h1>
          <p class="mt-3 max-w-xl text-white/70 animate-fade-in-up delay-200">
            Isi data pengunjung dengan benar agar e-ticket dapat kami kirimkan tanpa kendala.
          </p>
        </div>
        <div class="wave-divider-lagoon"></div>
      </div>
      <main class="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <section
          class="scroll-reveal mb-10 overflow-x-auto rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm md:px-8"
        >
          <div class="flex items-center justify-between gap-2 md:gap-5">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aqua text-sm font-bold text-ink animate-check-pop"
                ><iconify-icon icon="lucide:check" class="text-base"></iconify-icon
              ></span>
              <div class="hidden sm:block">
                <p class="text-xs text-slate-500">Langkah 1</p>
                <p class="truncate text-sm font-semibold text-slate-600">Pilih Tiket</p>
              </div>
            </div>
            <div class="progress-line completed h-1 flex-1 rounded-full bg-aqua"></div>
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aqua text-sm font-bold text-ink ring-4 ring-aqua/20 animate-summary-pulse"
                >2</span
              >
              <div>
                <p class="text-xs text-pool font-semibold">Langkah 2</p>
                <p class="truncate text-sm font-bold text-slate-900">Detail Pemesanan</p>
              </div>
            </div>
            <div class="progress-line h-1 flex-1 rounded-full bg-slate-200"></div>
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500"
                >3</span
              >
              <div class="hidden sm:block">
                <p class="text-xs text-slate-500">Langkah 3</p>
                <p class="truncate text-sm font-semibold text-slate-500">Pembayaran</p>
              </div>
            </div>
            <div class="progress-line h-1 flex-1 rounded-full bg-slate-200"></div>
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500"
                >4</span
              >
              <div class="hidden sm:block">
                <p class="text-xs text-slate-500">Langkah 4</p>
                <p class="truncate text-sm font-semibold text-slate-500">Selesai</p>
              </div>
            </div>
          </div>
        </section>
        <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <form
            id="booking-form"
            class="min-w-0 scroll-reveal rounded-3xl border border-slate-200 bg-white p-[16px] shadow-sm sm:p-6 md:p-9"
            novalidate
          >
            <div class="flex items-start justify-between gap-5 border-b border-slate-100 pb-7">
              <div>
                <p class="text-sm font-bold uppercase tracking-[.2em] text-pool">
                  Data pengunjung
                </p>
                <h2 class="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">
                  Siapa yang akan berkunjung?
                </h2>
                <p class="mt-2 text-sm text-slate-500">
                  Masukkan data pemesan utama untuk keperluan konfirmasi tiket.
                </p>
              </div>
              <span
                class="hidden h-12 w-12 items-center justify-center rounded-2xl bg-lagoon text-pool sm:flex"
                ><iconify-icon icon="lucide:user-round" class="text-xl"></iconify-icon
              ></span>
            </div>
            <div class="mt-8 grid min-w-0 gap-6 md:grid-cols-2">
              <div class="md:col-span-2">
                <label for="bf-name" class="mb-2 block text-sm font-bold text-slate-700"
                  >Nama lengkap <span class="text-rose-500">*</span></label
                >
                <div class="relative">
                  <iconify-icon
                    icon="lucide:user"
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  ></iconify-icon
                  ><input
                    id="bf-name"
                    type="text"
                    autocomplete="name"
                    aria-describedby="bf-name-error"
                    aria-invalid="false"
                    placeholder="Contoh: Rina Pratiwi"
                    class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base outline-none placeholder:text-slate-500"
                  />
                </div>
                <p id="bf-name-error" class="mt-2 hidden text-xs font-medium text-rose-600" role="alert">
                  Nama lengkap wajib diisi.
                </p>
              </div>
              <div>
                <label for="bf-email" class="mb-2 block text-sm font-bold text-slate-700"
                  >Email akun <span class="text-rose-500">*</span></label
                >
                <div class="relative">
                  <iconify-icon
                    icon="lucide:mail"
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  ></iconify-icon
                  ><input
                    id="bf-email"
                    type="email"
                    autocomplete="email"
                    aria-describedby="bf-email-help bf-email-error"
                    aria-invalid="false"
                    placeholder="nama@email.com"
                    class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base outline-none placeholder:text-slate-500"
                  />
                </div>
                <p id="bf-email-help" class="mt-2 text-xs text-slate-500">
                  E-ticket dikirim ke email akun yang sedang masuk.
                </p>
                <p id="bf-email-error" class="mt-2 hidden text-xs font-medium text-rose-600" role="alert"></p>
              </div>
              <div>
                <label for="bf-phone" class="mb-2 block text-sm font-bold text-slate-700"
                  >Nomor telepon <span class="text-rose-500">*</span></label
                >
                <div class="relative">
                  <iconify-icon
                    icon="lucide:phone"
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  ></iconify-icon
                  ><input
                    id="bf-phone"
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    aria-describedby="bf-phone-error"
                    aria-invalid="false"
                    placeholder="08xx-xxxx-xxxx"
                    class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base outline-none placeholder:text-slate-500"
                  />
                </div>
                <p id="bf-phone-error" class="mt-2 hidden text-xs font-medium text-rose-600" role="alert"></p>
              </div>
              <div class="md:col-span-2">
                <label for="bf-date" class="mb-2 block text-sm font-bold text-slate-700"
                  >Tanggal kunjungan <span class="text-rose-500">*</span></label
                >
                <input id="bf-date" type="date" class="hidden" tabindex="-1" aria-hidden="true" />
                <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p id="bf-date-label" class="font-semibold text-slate-800">
                      Pilih tanggal kunjungan
                    </p>
                    <div class="flex items-center gap-2">
                      <button
                        id="bf-calendar-prev"
                        type="button"
                        aria-label="Bulan sebelumnya"
                        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-ocean hover:text-pool"
                      >
                        <iconify-icon icon="lucide:chevron-left"></iconify-icon>
                      </button>
                      <p
                        id="bf-calendar-month"
                        class="min-w-24 text-center text-sm font-bold capitalize text-slate-800"
                      ></p>
                      <button
                        id="bf-calendar-next"
                        type="button"
                        aria-label="Bulan berikutnya"
                        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-ocean hover:text-pool"
                      >
                        <iconify-icon icon="lucide:chevron-right"></iconify-icon>
                      </button>
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500"
                    aria-hidden="true"
                  >
                    <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span
                    ><span>Jum</span><span>Sab</span>
                  </div>
                  <div
                    id="bf-calendar-days"
                    class="mt-2 grid min-w-0 grid-cols-7 gap-0.5"
                    role="group"
                    aria-label="Pilih tanggal kunjungan"
                    aria-describedby="bf-date-error"
                  ></div>
                  <p id="bf-date-error" class="mt-3 hidden text-xs font-medium text-rose-600" role="alert"></p>
                  <p class="mt-3 text-xs text-slate-500">
                    Weekdays: Selasa–Jumat · Weekend: Sabtu–Minggu · Senin libur. Anak di bawah 85
                    cm gratis.
                  </p>
                </div>
              </div>
              <div class="rounded-2xl bg-slate-50 p-5 md:col-span-2">
                <div class="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p class="font-bold text-slate-900">Punya kode promo?</p>
                    <p class="mt-1 text-sm text-slate-500">
                      Masukkan kode untuk mendapatkan potongan harga.
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <input
                      id="promo-input"
                      type="text"
                      placeholder="CITRALAND"
                      class="h-11 min-w-0 w-full max-w-32 rounded-xl border border-slate-200 bg-white px-3 text-base uppercase outline-none focus:border-ocean sm:w-40"
                    /><button
                      id="promo-btn"
                      @click.prevent="window.applyPromo()"
                      class="h-11 rounded-xl bg-ink px-4 text-xs font-bold text-white transition hover:bg-pool"
                    >
                      Pakai
                    </button>
                  </div>
                </div>
                <div
                  id="promo-success"
                  class="mt-3 hidden items-center gap-2 text-sm text-emerald-700"
                >
                  <iconify-icon icon="lucide:check-circle" class="text-lg"></iconify-icon>
                  <span>Kode promo berhasil diterapkan! Diskon Rp10.000</span>
                </div>
              </div>
            </div>
            <div class="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-lagoon px-4 py-3 sm:hidden">
              <div class="min-w-0">
                <p class="text-[10px] font-bold uppercase tracking-[.16em] text-pool">Total pembayaran</p>
                <p id="bf-mobile-summary" class="mt-0.5 truncate text-xs font-semibold text-slate-700">
                  Belum ada tiket dipilih.
                </p>
              </div>
              <p id="bf-mobile-total" class="shrink-0 font-display text-xl font-extrabold text-pool">Rp0</p>
            </div>
            <div
              class="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-7 sm:flex-row sm:justify-between"
            >
              <a
                href="#"
                @click.prevent="window.navigateTo('select-ticket')"
                class="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-slate-200 px-6 text-sm font-bold text-slate-600 transition-all hover:border-ocean hover:text-pool"
                ><iconify-icon icon="lucide:arrow-left"></iconify-icon>Kembali</a
              ><button
                type="submit"
                class="btn-primary inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-aqua px-7 text-sm font-bold text-ink shadow-lg shadow-ink/15 transition-all hover:bg-ocean active:scale-[0.98]"
              >
                <span id="bf-btn-text">Lanjut ke Pembayaran</span
                ><iconify-icon
                  icon="lucide:arrow-right"
                  class="text-lg"
                  id="bf-btn-icon"
                ></iconify-icon>
              </button>
            </div>
          </form>
          <aside
            class="min-w-0 scroll-reveal summary-card sticky top-6 rounded-3xl border border-slate-200 bg-white p-[16px] shadow-sm sm:p-6 md:p-7"
            style="transition-delay: 0.15s"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-bold uppercase tracking-[.2em] text-pool">Ringkasan</p>
                <h2 class="mt-2 font-display text-xl font-bold text-slate-900">Pesanan kamu</h2>
              </div>
              <span
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-lagoon text-pool"
                ><iconify-icon icon="lucide:receipt" class="text-xl"></iconify-icon
              ></span>
            </div>
            <div class="mt-7 rounded-2xl bg-lagoon p-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="font-bold text-slate-800" id="bs-name">Tiket terpilih</p>
                  <p class="mt-1 text-xs text-slate-500">Citraland Waterpark Denpasar</p>
                </div>
                <span
                  class="rounded-full bg-white px-3 py-1 text-xs font-bold text-pool"
                  id="bs-qty"
                  >0 tiket</span
                >
              </div>
              <div class="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <iconify-icon icon="lucide:calendar-days" class="text-pool"></iconify-icon
                ><span id="bs-date">Pilih tanggal kunjungan</span>
              </div>
            </div>
            <div class="mt-6 space-y-4 text-sm">
              <div id="bs-lines" class="space-y-3">
                <p class="text-slate-500">Belum ada tiket dipilih.</p>
              </div>
            </div>
            <div class="my-6 h-px bg-slate-100"></div>
            <div class="flex items-end justify-between">
              <span class="font-bold text-slate-700">Total pembayaran</span
              ><span class="font-display text-2xl font-extrabold text-pool" id="bs-total"
                >Rp0</span
              >
            </div>
            <div
              class="mt-6 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs leading-5 text-emerald-700"
            >
              <iconify-icon
                icon="lucide:shield-check"
                class="mt-0.5 shrink-0 text-lg"
              ></iconify-icon
              ><span>Data kamu aman. E-ticket akan dikirim setelah pembayaran berhasil.</span>
            </div>
          </aside>
        </div>
      </main>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 5: PAYMENT ==================== -->
  <div id="page-payment" class="page">
    <div class="min-h-screen bg-lagoon font-sans text-slate-800">
      <div class="relative h-20 bg-ink">
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a
              href="#"
              @click.prevent="window.navigateTo('home')"
              class="flex items-center gap-3 text-white group"
              ><span
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent text-white"
                ><img
                  src="/images/logo.webp"
                  alt="Logo Citraland Waterpark"
                  class="h-full w-full rounded-[inherit] object-contain" /></span
              ><span class="home-brand-text font-display text-lg font-extrabold tracking-tight"
                >CITRALAND<span class="text-sun">.</span></span
              ></a
            >
            <nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex">
              <a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Home</a
              ><a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Fasilitas</a
              ><a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Harga</a
              >
            </nav>
            <div class="flex items-center gap-3">
              <a
                id="payment-login"
                href="#"
                @click.prevent="window.navigateTo('login')"
                class="hidden min-h-11 items-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-pool sm:flex"
                ><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a
              >
              <div id="payment-profile" class="relative" style="display: none">
                <button
                  id="payment-profile-trigger"
                  type="button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  @click.stop="window.toggleProfileMenu('payment')"
                  class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-pool"
                >
                  <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon
                  ><span id="payment-profile-name">Profil</span
                  ><iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
                </button>
                <div
                  id="payment-profile-dropdown"
                  class="hidden absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl"
                  @click.stop
                >
                  <div class="border-b border-slate-100 px-3 py-2">
                    <p id="payment-profile-dropdown-name" class="truncate text-sm font-bold"></p>
                    <p id="payment-profile-email" class="truncate text-xs text-slate-500"></p>
                  </div>
                  <button
                    type="button"
                    @click="window.navigateTo('ticket-history')"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-lagoon hover:text-pool"
                  >
                    <iconify-icon icon="lucide:history"></iconify-icon> Riwayat Tiket</button
                  ><button
                    type="button"
                    @click="window.logoutUser()"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
                  </button>
                </div>
              </div>
              <button
                type="button"
                @click.prevent="window.toggleMobileMenu(true)"
                aria-label="Buka menu navigasi"
                aria-expanded="false"
                aria-controls="mobileMenu"
                data-mobile-menu-trigger
                class="flex h-11 w-11 items-center justify-center rounded-xl text-white lg:hidden"
              >
                <iconify-icon icon="lucide:menu" class="text-2xl"></iconify-icon>
              </button>
            </div>
          </div>
        </header>
      </div>
      <main class="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div class="mx-auto max-w-5xl">
          <nav class="scroll-reveal mb-10">
            <ol
              class="flex items-center justify-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm"
            >
              <li class="flex items-center gap-2 text-pool">
                <a
                  href="#"
                  @click.prevent="window.navigateTo('select-ticket')"
                  class="flex items-center gap-2 transition hover:opacity-80"
                  ><span
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-pool text-white animate-check-pop"
                    ><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span
                  ><span class="hidden sm:inline">Pilih Tiket</span></a
                >
              </li>
              <li class="progress-line completed h-px w-8 bg-ocean sm:w-16"></li>
              <li class="flex items-center gap-2 text-pool">
                <a
                  href="#"
                  @click.prevent="window.navigateTo('booking-details')"
                  class="flex items-center gap-2 transition hover:opacity-80"
                  ><span
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-pool text-white animate-check-pop"
                    style="animation-delay: 0.1s"
                    ><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span
                  ><span class="hidden sm:inline">Data Pengunjung</span></a
                >
              </li>
              <li class="progress-line h-px w-8 bg-ocean sm:w-16"></li>
              <li class="flex items-center gap-2 text-pool">
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-aqua text-ink animate-summary-pulse shadow-lg shadow-aqua/30"
                  >3</span
                ><span class="font-bold">Pembayaran</span>
              </li>
              <li class="h-px w-8 bg-slate-200 sm:w-16"></li>
              <li class="flex items-center gap-2 text-slate-500">
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white"
                  >4</span
                ><span class="hidden sm:inline">Selesai</span>
              </li>
            </ol>
          </nav>
          <div class="scroll-reveal mb-10 text-center" style="transition-delay: 0.1s">
            <p class="text-sm font-bold uppercase tracking-[.22em] text-pool">Langkah 3 dari 4</p>
            <h1
              class="mt-3 font-display text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl"
            >
              Selesaikan pembayaran
            </h1>
            <p class="mx-auto mt-4 max-w-xl text-slate-500">
              Pilih metode pembayaran yang paling nyaman. Tiket akan dikirim setelah pembayaran
              berhasil dikonfirmasi.
            </p>
          </div>
          <section
            class="scroll-reveal mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100"
            style="transition-delay: 0.2s"
          >
            <div
              class="flex items-start justify-between gap-4 border-b border-slate-100 p-6 md:p-8"
            >
              <div>
                <p class="text-xs font-bold uppercase tracking-[.2em] text-pool">
                  Pembayaran aman
                </p>
                <h2 class="mt-2 font-display text-2xl font-bold text-slate-900">
                  Pembayaran melalui Midtrans
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  Pilih metode pembayaran di jendela aman Midtrans.
                </p>
              </div>
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lagoon text-pool"
              >
                <iconify-icon icon="lucide:shield-check" class="text-xl"></iconify-icon>
              </span>
            </div>

            <div class="space-y-6 p-6 md:p-8">
              <div class="rounded-2xl bg-lagoon p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="font-bold text-slate-900">Citraland Waterpark Denpasar</p>
                    <p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <iconify-icon icon="lucide:calendar-days" class="text-pool"></iconify-icon>
                      <span id="pay-date">Pilih tanggal kunjungan</span>
                    </p>
                  </div>
                  <span
                    id="pay-booking-code"
                    class="rounded-full bg-white px-3 py-1 text-xs font-bold text-pool"
                  >
                    Kode booking
                  </span>
                </div>
                <div
                  class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-aqua/20 pt-4"
                >
                  <div>
                    <p class="text-xs text-slate-500">Pemesan</p>
                    <p class="text-sm font-semibold text-slate-800" id="pay-customer-name">
                      Nama pemesan
                    </p>
                    <p class="text-xs text-slate-500" id="pay-customer-email">Email pemesan</p>
                  </div>
                  <div
                    class="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3"
                  >
                    <div
                      class="countdown-timer flex h-8 w-8 items-center justify-center rounded-full bg-amber-100"
                    >
                      <iconify-icon icon="lucide:clock" class="text-amber-600"></iconify-icon>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-amber-800">Selesaikan dalam</p>
                      <p class="text-sm font-bold text-amber-700" id="countdown">23:59:45</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h3 class="font-display text-base font-bold text-slate-900">Rincian pesanan</h3>
                  <span class="text-xs text-slate-500">Termasuk biaya layanan</span>
                </div>
                <div class="mt-4 space-y-3 text-sm">
                  <div id="pay-lines" class="space-y-3"></div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Biaya layanan</span>
                    <span class="font-semibold text-slate-800" id="pay-service-fee">Rp0</span>
                  </div>
                  <div id="discount-row" class="hidden flex justify-between text-emerald-700">
                    <span>Diskon promo</span>
                    <span class="font-semibold" id="pay-discount">-Rp10.000</span>
                  </div>
                </div>
                <div class="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                  <span class="font-bold text-slate-700">Total pembayaran</span>
                  <span class="font-display text-2xl font-extrabold text-pool" id="pay-total"
                    >Rp0</span
                  >
                </div>
              </div>

              <div class="rounded-2xl border border-aqua/20 bg-lagoon p-5">
                <div class="flex items-start gap-4">
                  <span
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-pool"
                  >
                    <iconify-icon icon="lucide:credit-card" class="text-xl"></iconify-icon>
                  </span>
                  <div>
                    <p class="font-bold text-slate-900">Metode pembayaran di Snap</p>
                    <p class="mt-1 text-sm leading-6 text-slate-600">
                      Klik "Bayar Sekarang" untuk membuka popup Midtrans. Detail kartu dan
                      pembayaran hanya dimasukkan di halaman aman Midtrans.
                    </p>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <button
                  id="pay-btn"
                  @click.prevent="window.processPayment()"
                  class="btn-primary flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-aqua px-6 font-bold text-ink shadow-xl shadow-aqua/30 transition-all hover:bg-ocean active:scale-[0.98]"
                >
                  <span id="pay-btn-text">Bayar Sekarang</span>
                  <iconify-icon
                    icon="lucide:arrow-right"
                    class="text-lg"
                    id="pay-btn-icon"
                  ></iconify-icon>
                </button>
                <button
                  id="check-payment-btn"
                  @click.prevent="window.checkPaymentStatus()"
                  class="min-h-11 w-full rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:border-ocean hover:text-pool"
                >
                  Sudah membayar? Periksa status
                </button>
                <p
                  class="flex items-center justify-center gap-2 text-center text-xs text-slate-500"
                >
                  <iconify-icon icon="lucide:lock-keyhole" class="text-emerald-500"></iconify-icon>
                  Pembayaran aman dan terenkripsi
                </p>
              </div>

              <div
                class="flex items-center justify-center gap-5 border-t border-slate-100 pt-5 text-slate-500"
              >
                <span class="flex items-center gap-1 text-xs">
                  <iconify-icon icon="lucide:shield-check" class="text-emerald-500"></iconify-icon>
                  SSL Secure
                </span>
                <span class="flex items-center gap-1 text-xs">
                  <iconify-icon icon="lucide:badge-check" class="text-pool"></iconify-icon>
                  Terpercaya
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 6: CONFIRMATION ==================== -->
  <div id="page-confirmation" class="page">
    <div class="min-h-screen bg-lagoon font-sans text-slate-800">
      <div class="relative overflow-hidden hero-gradient-success">
        <div
          class="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[30px] border-white/5 animate-float"
        ></div>
        <div
          class="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full border-[24px] border-aqua/10 animate-float"
          style="animation-delay: 2s"
        ></div>
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a
              href="#"
              @click.prevent="window.navigateTo('home')"
              class="flex items-center gap-3 text-white group"
              ><span
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                ><img
                  src="/images/logo.webp"
                  alt="Logo Citraland Waterpark"
                  class="h-full w-full rounded-[inherit] object-contain" /></span
              ><span class="home-brand-text font-display text-lg font-extrabold tracking-tight"
                >CITRALAND<span class="text-sun">.</span></span
              ></a
            >
            <nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex">
              <a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Home</a
              ><a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Fasilitas</a
              ><a
                href="#"
                @click.prevent="window.navigateTo('home')"
                class="nav-link transition hover:text-sun"
                >Harga</a
              >
            </nav>
            <div class="flex items-center gap-3">
              <a
                id="confirmation-login"
                href="#"
                @click.prevent="window.navigateTo('login')"
                class="hidden min-h-11 items-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-pool sm:flex"
                ><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a
              >
              <div id="confirmation-profile" class="relative" style="display: none">
                <button
                  id="confirmation-profile-trigger"
                  type="button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  @click.stop="window.toggleProfileMenu('confirmation')"
                  class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-pool"
                >
                  <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon
                  ><span id="confirmation-profile-name">Profil</span
                  ><iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
                </button>
                <div
                  id="confirmation-profile-dropdown"
                  class="hidden absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl"
                  @click.stop
                >
                  <div class="border-b border-slate-100 px-3 py-2">
                    <p
                      id="confirmation-profile-dropdown-name"
                      class="truncate text-sm font-bold"
                    ></p>
                    <p id="confirmation-profile-email" class="truncate text-xs text-slate-500"></p>
                  </div>
                  <button
                    type="button"
                    @click="window.navigateTo('ticket-history')"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-lagoon hover:text-pool"
                  >
                    <iconify-icon icon="lucide:history"></iconify-icon> Riwayat Tiket</button
                  ><button
                    type="button"
                    @click="window.logoutUser()"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
                  </button>
                </div>
              </div>
              <button
                type="button"
                @click.prevent="window.toggleMobileMenu(true)"
                aria-label="Buka menu navigasi"
                aria-expanded="false"
                aria-controls="mobileMenu"
                data-mobile-menu-trigger
                class="flex h-11 w-11 items-center justify-center rounded-xl text-white lg:hidden"
              >
                <iconify-icon icon="lucide:menu" class="text-2xl"></iconify-icon>
              </button>
            </div>
          </div>
        </header>
        <div class="relative mx-auto max-w-7xl px-6 pb-24 pt-36 lg:px-10">
          <div class="mx-auto max-w-3xl text-center">
            <div class="animate-success-bounce">
              <span
                class="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-white shadow-lg shadow-emerald-950/30"
                ><iconify-icon icon="lucide:check" class="text-4xl"></iconify-icon
                ><span
                  class="absolute inset-0 rounded-full bg-emerald-400/30"
                  style="animation: ripple 2s ease-out infinite"
                ></span
              ></span>
            </div>
            <p
              class="mt-8 text-sm font-bold uppercase tracking-[.22em] text-sun animate-fade-in-up delay-200"
            >
              Pembayaran berhasil
            </p>
            <h1
              class="mt-3 font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl animate-fade-in-up delay-300"
            >
              Tiketmu sudah siap!
            </h1>
            <p
              class="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70 animate-fade-in-up delay-400"
            >
              Terima kasih telah memilih Citraland Waterpark. Tunjukkan QR code ini di pintu masuk
              untuk memulai keseruanmu.
            </p>
            <div class="mt-10 flex items-center justify-center gap-3 animate-fade-in-up delay-500">
              <div class="flex items-center gap-2">
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-pool text-xs font-bold text-white"
                  ><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span
                ><span class="hidden sm:inline text-xs font-semibold text-white/60"
                  >Pilih Tiket</span
                >
              </div>
              <div class="progress-line completed h-0.5 w-8 bg-ocean sm:w-12"></div>
              <div class="flex items-center gap-2">
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-pool text-xs font-bold text-white"
                  ><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span
                ><span class="hidden sm:inline text-xs font-semibold text-white/60">Data</span>
              </div>
              <div class="progress-line completed h-0.5 w-8 bg-ocean sm:w-12"></div>
              <div class="flex items-center gap-2">
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-pool text-xs font-bold text-white"
                  ><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span
                ><span class="hidden sm:inline text-xs font-semibold text-white/60">Bayar</span>
              </div>
              <div class="progress-line completed h-0.5 w-8 bg-emerald-400 sm:w-12"></div>
              <div class="flex items-center gap-2">
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-white shadow-lg shadow-emerald-400/30"
                  >4</span
                ><span class="text-xs font-bold text-white">Selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main class="relative mx-auto -mt-10 max-w-7xl px-6 pb-24 lg:px-10">
        <div class="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <article
            class="animate-ticket-reveal overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70"
          >
            <div
              class="flex flex-col justify-between gap-5 border-b border-slate-100 p-7 sm:flex-row sm:items-start sm:p-9"
            >
              <div class="animate-slide-in-left delay-300">
                <div class="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <iconify-icon icon="lucide:badge-check" class="text-lg"></iconify-icon> E-ticket
                  terverifikasi
                </div>
                <h2 class="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900">
                  Citraland Waterpark Denpasar
                </h2>
                <p class="mt-1 text-sm text-slate-500">Tiket masuk wisata kolam renang</p>
              </div>
              <div
                class="animate-slide-in-right delay-400 rounded-2xl bg-lagoon px-5 py-3 text-left sm:text-right"
              >
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Kode booking
                </p>
                <p
                  class="mt-1 font-display text-xl font-extrabold tracking-widest text-pool booking-code"
                  id="confirm-code"
                >
                  -
                </p>
              </div>
            </div>
            <div class="grid gap-8 p-7 sm:grid-cols-[1fr_190px] sm:p-9">
              <div class="animate-fade-in-up delay-500">
                <p class="text-xs font-bold uppercase tracking-[.18em] text-pool">
                  Detail pengunjung
                </p>
                <div class="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  <div>
                    <p class="text-xs text-slate-500">Nama pengunjung</p>
                    <p class="mt-1 font-bold text-slate-800" id="confirm-name">Nama pengunjung</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">Jenis tiket</p>
                    <p class="mt-1 font-bold text-slate-800" id="confirm-ticket-types">
                      Tiket terpilih
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">Tanggal kunjungan</p>
                    <p class="mt-1 flex items-center gap-2 font-bold text-slate-800">
                      <iconify-icon icon="lucide:calendar-days" class="text-pool"></iconify-icon
                      ><span id="confirm-date">Pilih tanggal kunjungan</span>
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">Nomor telepon</p>
                    <p class="mt-1 font-bold text-slate-800" id="confirm-phone">Nomor telepon</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">Jam masuk</p>
                    <p class="mt-1 flex items-center gap-2 font-bold text-slate-800">
                      <iconify-icon icon="lucide:clock-3" class="text-pool"></iconify-icon>09.00 –
                      17.00 WIB
                    </p>
                  </div>
                </div>
              </div>
              <div
                class="flex flex-col items-center justify-center border-t border-slate-100 pt-7 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 animate-scale-in delay-600"
              >
                <div class="qr-container animate-qr-pulse">
                  <div
                    class="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl border-8 border-white bg-white shadow-md ring-1 ring-slate-200"
                  >
                    <img
                      id="confirm-qr-image"
                      alt="QR code e-ticket"
                      class="hidden h-full w-full object-contain"
                    /><iconify-icon
                      id="confirm-qr-fallback"
                      icon="lucide:qr-code"
                      class="text-[9rem] text-slate-300"
                    ></iconify-icon>
                  </div>
                </div>
                <p class="mt-4 text-center text-xs font-semibold text-slate-500">
                  Scan di pintu masuk
                </p>
                <p class="mt-1 text-center text-xs text-slate-500 booking-code">
                  <span id="confirm-qr-code">-</span>-<span id="confirm-qr-types">TICKET</span>
                </p>
              </div>
            </div>
            <div
              class="flex flex-col gap-3 border-t border-dashed border-slate-200 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9"
            >
              <p class="text-sm text-slate-500">Simpan tiket ini sebelum berangkat.</p>
              <div class="flex gap-2">
                <button
                  id="download-ticket-btn"
                  @click.prevent="window.downloadTicket()"
                  class="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-aqua px-6 text-sm font-bold text-ink transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <iconify-icon icon="lucide:download" id="download-ticket-icon"></iconify-icon
                  ><span id="download-ticket-text">Unduh e-ticket</span
                  ><span id="download-ticket-spinner" class="loading-spinner hidden"></span>
                </button>
              </div>
            </div>
          </article>
          <aside
            class="animate-slide-in-right delay-400 rounded-3xl bg-white p-7 shadow-xl shadow-slate-200/70 lg:p-8 h-fit"
          >
            <div class="flex items-center justify-between">
              <h2 class="font-display text-xl font-bold text-slate-900">Ringkasan pesanan</h2>
              <span
                class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1.5"
                ><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Lunas</span
              >
            </div>
            <div class="mt-7 space-y-5 border-b border-slate-100 pb-6">
              <div id="confirm-lines" class="space-y-3 text-sm"></div>
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-slate-500">Biaya layanan</span
                ><span class="font-semibold text-slate-800" id="confirm-service-fee">Rp0</span>
              </div>
              <div
                id="confirm-discount-row"
                class="hidden flex justify-between gap-4 text-sm text-emerald-700"
              >
                <span>Diskon promo</span><span class="font-semibold" id="confirm-discount"></span>
              </div>
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-slate-500">Metode pembayaran</span
                ><span class="font-semibold text-slate-800" id="confirm-payment-method"
                  >Kartu kredit / debit</span
                >
              </div>
            </div>
            <div class="flex items-end justify-between pt-6">
              <span class="font-semibold text-slate-600">Total pembayaran</span
              ><span class="font-display text-2xl font-extrabold text-pool" id="confirm-total"
                >Rp0</span
              >
            </div>
            <div class="mt-8 rounded-2xl bg-lagoon p-5">
              <div class="flex gap-3">
                <iconify-icon
                  icon="lucide:info"
                  class="mt-0.5 text-xl text-pool shrink-0"
                ></iconify-icon>
                <p class="text-sm leading-6 text-slate-600">
                  Tiket berlaku untuk satu kali kunjungan dan tidak dapat dipindahtangankan.
                </p>
              </div>
            </div>
          </aside>
        </div>
        <section class="scroll-reveal mt-14">
          <div class="text-center">
            <p class="text-sm font-bold uppercase tracking-[.22em] text-pool">
              Sebelum berkunjung
            </p>
            <h2 class="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900">
              Langkah selanjutnya
            </h2>
          </div>
          <div class="mt-8 grid gap-5 md:grid-cols-3">
            <div class="step-card rounded-3xl bg-white p-7 shadow-sm">
              <span
                class="step-number flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon font-display text-lg font-extrabold text-pool"
                >01</span
              >
              <h3 class="mt-6 font-display text-lg font-bold">Simpan e-ticket</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                Simpan QR code di ponsel atau unduh tiket untuk akses lebih cepat.
              </p>
            </div>
            <div class="step-card rounded-3xl bg-white p-7 shadow-sm">
              <span
                class="step-number flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon font-display text-lg font-extrabold text-pool"
                >02</span
              >
              <h3 class="mt-6 font-display text-lg font-bold">Datang sesuai jadwal</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                Tunjukkan QR code dan kode booking kepada petugas di gerbang.
              </p>
            </div>
            <div class="step-card rounded-3xl bg-white p-7 shadow-sm">
              <span
                class="step-number flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon font-display text-lg font-extrabold text-pool"
                >03</span
              >
              <h3 class="mt-6 font-display text-lg font-bold">Nikmati Citraland Waterpark</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                Bersiap untuk hari penuh keseruan bersama keluarga dan teman.
              </p>
            </div>
          </div>
        </section>
        <div
          class="scroll-reveal mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style="transition-delay: 0.2s"
        >
          <a
            href="#"
            @click.prevent="window.navigateTo('home')"
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-aqua hover:text-pool hover:shadow-sm"
            ><iconify-icon icon="lucide:arrow-left"></iconify-icon> Kembali ke beranda</a
          ><a
            href="#"
            @click.prevent="window.navigateTo('select-ticket')"
            class="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pool px-6 text-sm font-bold text-white transition hover:bg-aqua hover:text-ink shadow-lg shadow-ink/15"
            >Pesan tiket lagi <iconify-icon icon="lucide:arrow-up-right"></iconify-icon
          ></a>
        </div>
      </main>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 7: TICKET HISTORY ==================== -->
  <div id="page-ticket-history" class="page">
    <div class="min-h-screen bg-lagoon font-sans text-slate-800">
      <div class="relative overflow-hidden bg-gradient-to-br from-deep via-ink to-pool">
        <div
          class="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[32px] border-white/10 animate-pulse-ring"
        ></div>
        <div
          class="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full border-[24px] border-aqua/15 animate-pulse-ring"
          style="animation-delay: 1.5s"
        ></div>
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a
              href="#"
              @click.prevent="window.navigateTo('home')"
              class="flex items-center gap-3 text-white group"
            >
              <span
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                ><img
                  src="/images/logo.webp"
                  alt="Logo Citraland Waterpark"
                  class="h-full w-full rounded-[inherit] object-contain"
              /></span>
              <span class="home-brand-text font-display text-lg font-extrabold tracking-tight"
                >CITRALAND<span class="text-sun">.</span></span
              >
            </a>
            <div class="flex items-center gap-3">
              <a
                href="#"
                @click.prevent="window.navigateTo('select-ticket')"
                class="hidden min-h-11 items-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-pool sm:flex"
                ><iconify-icon icon="lucide:ticket" class="text-base"></iconify-icon> Pesan Tiket</a
              >
              <button
                type="button"
                @click.prevent="window.toggleMobileMenu(true)"
                aria-label="Buka menu navigasi"
                aria-expanded="false"
                aria-controls="mobileMenu"
                data-mobile-menu-trigger
                class="flex h-11 w-11 items-center justify-center rounded-xl text-white lg:hidden"
              >
                <iconify-icon icon="lucide:menu" class="text-2xl"></iconify-icon>
              </button>
            </div>
          </div>
        </header>
        <div class="relative mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-10">
          <div class="max-w-2xl">
            <p
              class="text-sm font-bold uppercase tracking-[.22em] text-sun animate-fade-in-up"
            >
              Akun saya
            </p>
            <h1
              class="mt-4 font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl animate-fade-in-up delay-100"
            >
              Riwayat Tiket
            </h1>
            <p
              class="mt-4 max-w-xl text-base leading-7 text-white/75 animate-fade-in-up delay-200"
            >
              Lihat semua pesanan tiketmu, status pembayaran, dan status pemakaian tiket.
            </p>
          </div>
        </div>
        <div class="wave-divider-lagoon"></div>
      </div>
      <main class="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div
          class="scroll-reveal flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-sm font-bold uppercase tracking-[.18em] text-pool">Tiket saya</p>
            <h2 class="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">
              Semua pesanan tiket
            </h2>
          </div>
          <div id="ticket-history-filters" class="flex flex-wrap gap-2">
            <button
              type="button"
              data-filter="all"
              class="history-filter rounded-full bg-pool px-4 py-2 text-xs font-bold text-white transition"
            >
              Semua
            </button>
            <button
              type="button"
              data-filter="paid"
              class="history-filter rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-pool"
            >
              Sudah dibayar
            </button>
            <button
              type="button"
              data-filter="pending"
              class="history-filter rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-pool"
            >
              Menunggu
            </button>
            <button
              type="button"
              data-filter="cancelled"
              class="history-filter rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-pool"
            >
              Dibatalkan
            </button>
            <button
              type="button"
              data-filter="used"
              class="history-filter rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-pool"
            >
              Sudah digunakan
            </button>
          </div>
        </div>
        <div id="ticket-history-loading" class="mt-8 hidden grid gap-5 md:grid-cols-2">
          <div class="h-56 animate-pulse rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div class="h-4 w-32 rounded bg-slate-100"></div>
            <div class="mt-4 h-8 w-48 rounded bg-slate-100"></div>
            <div class="mt-6 h-20 rounded-2xl bg-slate-50"></div>
          </div>
          <div class="h-56 animate-pulse rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div class="h-4 w-32 rounded bg-slate-100"></div>
            <div class="mt-4 h-8 w-48 rounded bg-slate-100"></div>
            <div class="mt-6 h-20 rounded-2xl bg-slate-50"></div>
          </div>
        </div>
        <div
          id="ticket-history-error"
          class="mt-8 hidden rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700"
        >
          <p id="ticket-history-error-message"></p>
          <button
            id="ticket-history-retry"
            type="button"
            class="mt-3 inline-flex min-h-10 items-center rounded-full bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-700"
          >
            Coba lagi
          </button>
        </div>
        <div
          id="ticket-history-empty"
          class="mt-8 hidden rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center"
        >
          <span
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lagoon text-pool"
            ><iconify-icon icon="lucide:ticket" class="text-3xl"></iconify-icon
          ></span>
          <h3 class="mt-5 font-display text-xl font-bold text-slate-900">
            Belum ada riwayat tiket
          </h3>
          <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Pesanan tiket yang sudah kamu buat akan muncul di sini.
          </p>
          <a
            href="#"
            @click.prevent="window.navigateTo('select-ticket')"
            class="btn-primary mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-aqua px-6 text-sm font-bold text-ink transition hover:bg-ocean"
            >Pesan Tiket <iconify-icon icon="lucide:arrow-right"></iconify-icon
          ></a>
        </div>
        <div id="ticket-history-list" class="mt-8 grid gap-5 md:grid-cols-2"></div>
      </main>
      <UserFooter />
    </div>
  </div>

  <!-- Mobile Menu Overlay -->
  <div
    id="mobileMenu"
    class="mobile-menu fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-deep/98 backdrop-blur-xl"
    role="dialog"
    aria-modal="true"
    aria-label="Menu navigasi"
    aria-hidden="true"
    inert
  >
    <div class="flex items-center justify-between px-5 py-4">
      <a
        href="#"
        @click.prevent="window.goToSection('home')"
        class="flex items-center gap-3 text-white"
        aria-label="Citraland Waterpark, kembali ke beranda"
        ><span class="flex h-11 w-11 items-center justify-center"
          ><img
            src="/images/logo.webp"
            width="44"
            height="41"
            alt=""
            class="h-full w-full object-contain" /></span
        ><span class="home-brand-text home-display text-lg font-extrabold tracking-[-.04em]"
          >CITRALAND<span class="text-sun">.</span></span
        ></a
      ><button
        type="button"
        data-mobile-menu-close
        @click.prevent="window.toggleMobileMenu(false)"
        class="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
        aria-label="Tutup menu"
      >
        <iconify-icon icon="lucide:x" class="text-2xl"></iconify-icon>
      </button>
    </div>
    <nav class="flex flex-col px-5 pt-8" aria-label="Navigasi seluler">
      <a
        href="#"
        @click.prevent="window.goToSection('home')"
        class="border-b border-white/10 py-4 text-3xl font-bold tracking-[-.04em] text-white transition hover:text-sun"
        >Beranda</a
      >
      <a
        href="#"
        @click.prevent="window.goToSection('harga')"
        class="border-b border-white/10 py-4 text-3xl font-bold tracking-[-.04em] text-white transition hover:text-sun"
        >Harga</a
      >
      <a
        href="#"
        @click.prevent="window.goToSection('fasilitas')"
        class="border-b border-white/10 py-4 text-3xl font-bold tracking-[-.04em] text-white transition hover:text-sun"
        >Fasilitas</a
      >
      <a
        href="#"
        @click.prevent="window.goToSection('info')"
        class="border-b border-white/10 py-4 text-3xl font-bold tracking-[-.04em] text-white transition hover:text-sun"
        >Info kunjungan</a
      >
      <a
        href="#"
        @click.prevent="window.goToSection('galeri')"
        class="border-b border-white/10 py-4 text-3xl font-bold tracking-[-.04em] text-white transition hover:text-sun"
        >Galeri</a
      >
      <div class="mt-6 flex flex-col gap-3 w-full max-w-xs">
        <a
          id="mobile-nav-login"
          href="#"
          @click.prevent="
            window.navigateTo('login');
            window.toggleMobileMenu(false);
          "
          class="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          ><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a
        >
        <div id="mobile-nav-profile" class="w-full" style="display: none">
          <button
            id="mobile-nav-profile-trigger"
            type="button"
            aria-expanded="false"
            aria-haspopup="true"
            @click.stop="window.toggleProfileMenu('mobile')"
            class="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon>
            <span id="mobile-nav-profile-name">Profil</span>
            <iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
          </button>
          <div
            id="mobile-nav-profile-dropdown"
            class="hidden mt-2 rounded-2xl border border-white/15 bg-white/10 p-2"
          >
            <p
              id="mobile-nav-profile-email"
              class="truncate px-3 py-2 text-center text-sm text-white/70"
            ></p>
            <button
              type="button"
              @click="window.navigateTo('ticket-history')"
              class="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-sun transition hover:bg-white/10"
            >
              <iconify-icon icon="lucide:history"></iconify-icon> Riwayat tiket
            </button>
            <button
              type="button"
              @click="window.logoutUser()"
              class="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-white/10"
            >
              <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
            </button>
          </div>
        </div>
        <a
          href="#"
          @click.prevent="window.goToSection('harga')"
          class="flex min-h-12 items-center justify-center gap-2 rounded-full bg-sun px-5 text-sm font-bold text-ink transition hover:bg-seafoam"
          >Pesan tiket <iconify-icon icon="lucide:arrow-up-right" class="text-lg"></iconify-icon
        ></a>
        <p class="mt-3 text-center text-xs leading-5 text-white/60">
          Selasa–Minggu, 09.00–18.00 WITA · Senin tutup
        </p>
      </div>
    </nav>
  </div>

  <!-- Password reset: minta tautan lewat email -->
  <div
    id="reset-request-modal"
    class="fixed inset-0 z-[140] hidden items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="reset-request-title"
  >
    <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 id="reset-request-title" class="font-display text-xl font-bold text-slate-900">
            Lupa kata sandi?
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Masukkan email akun Anda. Kami kirimkan tautan untuk membuat kata sandi baru.
          </p>
        </div>
        <button
          type="button"
          data-reset-close="reset-request-modal"
          aria-label="Tutup"
          class="rounded-full p-2 text-slate-500 transition hover:bg-seafoam hover:text-slate-600"
        >
          <iconify-icon icon="lucide:x" class="text-lg"></iconify-icon>
        </button>
      </div>
      <form id="reset-request-form" class="mt-6" novalidate>
        <label for="reset-email" class="mb-2 block text-sm font-bold text-slate-700"
          >Email akun</label
        >
        <div class="relative">
          <iconify-icon
            icon="lucide:mail"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          ></iconify-icon
          ><input
            id="reset-email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="nama@email.com"
            class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base outline-none placeholder:text-slate-500"
          />
        </div>
        <p
          id="reset-request-error"
          class="mt-3 hidden text-xs font-semibold text-rose-600"
          role="alert"
        ></p>
        <p
          id="reset-request-success"
          class="mt-3 hidden text-xs font-semibold text-emerald-700"
          role="status"
        ></p>
        <button
          type="submit"
          id="reset-request-submit"
          class="btn-primary mt-5 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-aqua px-6 text-sm font-bold text-ink shadow-lg shadow-ink/15 transition-all hover:bg-ocean hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span id="reset-request-submit-text">Kirim tautan reset</span>
        </button>
      </form>
    </div>
  </div>

  <!-- Password reset: buat kata sandi baru (setelah klik tautan email) -->
  <div
    id="reset-password-modal"
    class="fixed inset-0 z-[140] hidden items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="reset-password-title"
  >
    <div
      data-dialog-focus
      tabindex="-1"
      class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl outline-none sm:p-7"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 id="reset-password-title" class="font-display text-xl font-bold text-slate-900">
            Buat kata sandi baru
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Masukkan kata sandi baru untuk akun <b id="reset-password-email"></b>.
          </p>
        </div>
        <button
          type="button"
          data-reset-close="reset-password-modal"
          aria-label="Tutup"
          class="rounded-full p-2 text-slate-500 transition hover:bg-seafoam hover:text-slate-600"
        >
          <iconify-icon icon="lucide:x" class="text-lg"></iconify-icon>
        </button>
      </div>
      <form id="reset-password-form" class="mt-6" novalidate>
        <label for="reset-new-password" class="mb-2 block text-sm font-bold text-slate-700"
          >Kata sandi baru</label
        >
        <div class="relative">
          <iconify-icon
            icon="lucide:lock-keyhole"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          ></iconify-icon
          ><input
            id="reset-new-password"
            name="reset-password"
            type="password"
            autocomplete="off"
            readonly
            data-autofill-guard
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            placeholder="Min. 8 karakter"
            class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-base outline-none placeholder:text-slate-500"
          /><button
            type="button"
            @click.prevent="window.togglePassword($event.currentTarget)"
            class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-lagoon hover:text-pool"
            aria-label="Tampilkan atau sembunyikan kata sandi"
          >
            <iconify-icon icon="lucide:eye"></iconify-icon>
          </button>
        </div>
        <label for="reset-confirm-password" class="mb-2 mt-4 block text-sm font-bold text-slate-700"
          >Ulangi kata sandi baru</label
        >
        <div class="relative">
          <iconify-icon
            icon="lucide:lock-keyhole"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          ></iconify-icon
          ><input
            id="reset-confirm-password"
            name="reset-confirm-password"
            type="password"
            autocomplete="off"
            readonly
            data-autofill-guard
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            placeholder="Ulangi kata sandi baru"
            class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-base outline-none placeholder:text-slate-500"
          /><button
            type="button"
            @click.prevent="window.togglePassword($event.currentTarget)"
            class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-lagoon hover:text-pool"
            aria-label="Tampilkan atau sembunyikan kata sandi"
          >
            <iconify-icon icon="lucide:eye"></iconify-icon>
          </button>
        </div>
        <p
          id="reset-password-error"
          class="mt-3 hidden text-xs font-semibold text-rose-600"
          role="alert"
        ></p>
        <button
          type="submit"
          id="reset-password-submit"
          class="btn-primary mt-5 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-aqua px-6 text-sm font-bold text-ink shadow-lg shadow-ink/15 transition-all hover:bg-ocean hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span id="reset-password-submit-text">Simpan kata sandi</span>
        </button>
      </form>
    </div>
  </div>

  <!-- Toast -->
  <div
    id="toast"
    class="toast fixed bottom-6 left-1/2 z-[150] flex items-center gap-3 rounded-2xl bg-ink px-6 py-4 text-white shadow-2xl border border-white/10"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <iconify-icon
      id="toast-icon"
      icon="lucide:check-circle"
      class="text-emerald-400 text-xl"
    ></iconify-icon
    ><span id="toast-message" class="text-sm font-medium">Berhasil!</span>
  </div>
</template>
