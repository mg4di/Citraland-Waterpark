<script setup>
import { onMounted } from 'vue'
import { initializeUserPage } from './legacy/user-page.js'
import FacilitySection from './components/user/FacilitySection.vue'
import GallerySection from './components/user/GallerySection.vue'
import TicketPricingSection from './components/user/TicketPricingSection.vue'
import TicketSelectionSection from './components/user/TicketSelectionSection.vue'
import UserFooter from './components/user/UserFooter.vue'
import { waterparkHeroImage } from './data/waterparkImages.js'

const window = globalThis.window

onMounted(initializeUserPage)
</script>

<template>
<!-- Confetti Container -->
  <div id="confetti-container" class="fixed inset-0 pointer-events-none z-[200]"></div>

  <!-- ==================== PAGE 1: HOME ==================== -->
  <div id="page-home" class="page active">
    <div class="min-h-screen bg-white text-slate-800 font-sans">
      <!-- Header -->
      <header id="mainHeader" class="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <a href="#" @click.prevent="window.navigateTo('home')" class="flex items-center gap-3 text-white group">
            <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <iconify-icon icon="lucide:waves" class="text-2xl"></iconify-icon>
            </span>
            <span class="font-display text-lg font-extrabold tracking-tight">CITRALAND<span class="text-cyan-200">.</span></span>
          </a>
          <nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex">
            <a href="#" @click.prevent="window.navigateTo('home')" class="nav-link active transition hover:text-cyan-200">Home</a>
            <a href="#fasilitas" class="nav-link transition hover:text-cyan-200">Fasilitas</a>
            <a href="#harga" class="nav-link transition hover:text-cyan-200">Harga</a>
            <a href="#galeri" class="nav-link transition hover:text-cyan-200">Galeri</a>
            <a href="#tentang" class="nav-link transition hover:text-cyan-200">Tentang</a>
          </nav>
          <div class="flex items-center gap-3">
            <div class="hidden items-center gap-3 sm:flex">
              <a id="nav-login" href="#" @click.prevent="window.navigateTo('login')" class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean">
              <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk
              </a>
              <div id="nav-profile" class="relative" style="display: none">
                <button id="nav-profile-trigger" type="button" aria-expanded="false" aria-haspopup="true" @click.stop="window.toggleProfileMenu('desktop')" class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean">
                  <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon>
                  <span id="nav-profile-name">Profil</span>
                  <iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
                </button>
                <div id="nav-profile-dropdown" class="hidden absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl" @click.stop>
                  <div class="border-b border-slate-100 px-3 py-2">
                    <p id="nav-profile-dropdown-name" class="truncate text-sm font-bold"></p>
                    <p id="nav-profile-email" class="truncate text-xs text-slate-500"></p>
                  </div>
                  <button type="button" @click="window.navigateTo('ticket-history')" class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-lagoon hover:text-ocean">
                    <iconify-icon icon="lucide:history"></iconify-icon> Riwayat Tiket
                  </button>
                  <button type="button" @click="window.logoutUser()" class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                    <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
                  </button>
                </div>
              </div>
            </div>
            <button @click.prevent="window.toggleMobileMenu(true)" class="flex h-11 w-11 items-center justify-center rounded-xl text-white lg:hidden transition hover:bg-white/10" aria-label="Menu">
              <iconify-icon icon="lucide:menu" class="text-2xl"></iconify-icon>
            </button>
          </div>
        </div>
      </header>

      <!-- Hero -->
      <section class="relative flex min-h-screen items-center overflow-hidden bg-slate-900">
        <img :src="waterparkHeroImage.src" :alt="waterparkHeroImage.alt" fetchpriority="high" decoding="async" class="hero-bg-img absolute inset-0 h-full w-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-slate-900/10"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/30"></div>
        <div class="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-1/3 right-1/3 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-float" style="animation-delay:1.5s"></div>
        <div class="relative mx-auto w-full max-w-7xl px-6 pt-28 pb-32 lg:px-10">
          <div class="max-w-2xl">
            <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm animate-fade-in-up">
              <span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75"></span><span class="relative inline-flex h-2 w-2 rounded-full bg-cyan-300"></span></span>
              Waterpark keluarga di Denpasar Utara, Bali
            </div>
            <h1 class="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white md:text-7xl animate-fade-in-up delay-100">Citraland <span class="text-cyan-300">Waterpark</span></h1>
            <p class="mt-7 max-w-lg text-lg leading-8 text-white/80 animate-fade-in-up delay-200">Nikmati wahana air bertema bajak laut, kolam ombak, dan keseruan bersama keluarga di Bali.</p>
            <div class="mt-9 flex flex-wrap items-center gap-4 animate-fade-in-up delay-300">
              <a href="#harga" class="btn-primary inline-flex min-h-14 items-center gap-3 rounded-full bg-aqua px-7 text-sm font-bold text-white shadow-xl shadow-cyan-900/30 transition-all hover:bg-ocean hover:shadow-2xl">Pesan Tiket Sekarang <iconify-icon icon="lucide:arrow-up-right" class="text-lg"></iconify-icon></a>
              <a href="#galeri" class="inline-flex min-h-14 items-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-all hover:bg-white/15"><iconify-icon icon="lucide:play-circle" class="text-xl"></iconify-icon> Lihat suasana</a>
            </div>
          </div>
          <div class="mt-20 flex items-center gap-10 text-white animate-fade-in-up delay-400">
            <div><p class="flex items-center gap-2 font-display text-3xl font-bold"><iconify-icon icon="mdi:star" class="text-amber-300"></iconify-icon>4,5/5</p><p class="mt-1 text-sm text-white/70">Google Maps · 3.611 ulasan</p></div>
            <div class="h-12 w-px bg-white/30"></div>
            <div><p class="font-display text-3xl font-bold">Rp35.000</p><p class="mt-1 text-sm text-white/70">Harga mulai per orang</p></div>
          </div>
        </div>
      </section>

      <FacilitySection />
      <TicketPricingSection />

      <GallerySection />

      <!-- Testimoni -->
      <section id="tentang" class="bg-slate-900 px-6 py-24 text-white relative overflow-hidden">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div class="mx-auto max-w-7xl relative">
          <div class="scroll-reveal text-center"><p class="text-sm font-bold uppercase tracking-[.22em] text-cyan-300">Ulasan pengunjung</p><h2 class="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Cerita dari Tripadvisor</h2><p class="mx-auto mt-4 max-w-xl text-white/65">Rating Tripadvisor 4,3/5. Buka sumber untuk membaca ulasan lengkap dan konteks terbarunya.</p></div>
          <div class="mt-12 grid gap-6 md:grid-cols-3">
            <a href="https://www.tripadvisor.co.id/Search?q=Citraland%20Waterpark%20Denpasar" target="_blank" rel="noreferrer" class="scroll-reveal testimonial-card rounded-3xl border border-white/5 bg-white/10 p-7 backdrop-blur-sm transition hover:bg-white/15"><p class="text-xs font-bold uppercase tracking-wider text-cyan-200">Tripadvisor</p><div class="mt-4 flex gap-1 text-amber-300" aria-label="5 dari 5 bintang"><iconify-icon v-for="star in 5" :key="star" icon="mdi:star"></iconify-icon></div><p class="mt-5 font-display text-xl font-bold">“Great waterpark for kids”</p><p class="mt-4 text-sm text-white/60">Lihat ulasan wisatawan</p></a>
            <a href="https://www.tripadvisor.co.id/Search?q=Citraland%20Waterpark%20Denpasar" target="_blank" rel="noreferrer" class="scroll-reveal testimonial-card rounded-3xl border border-white/5 bg-white/10 p-7 backdrop-blur-sm transition hover:bg-white/15" style="transition-delay:.1s"><p class="text-xs font-bold uppercase tracking-wider text-cyan-200">Tripadvisor</p><div class="mt-4 flex gap-1 text-amber-300" aria-label="5 dari 5 bintang"><iconify-icon v-for="star in 5" :key="star" icon="mdi:star"></iconify-icon></div><p class="mt-5 font-display text-xl font-bold">“Exciting Vacation to Citraland Waterpark”</p><p class="mt-4 text-sm text-white/60">Lihat ulasan wisatawan</p></a>
            <a href="https://www.tripadvisor.co.id/Search?q=Citraland%20Waterpark%20Denpasar" target="_blank" rel="noreferrer" class="scroll-reveal testimonial-card rounded-3xl border border-white/5 bg-white/10 p-7 backdrop-blur-sm transition hover:bg-white/15" style="transition-delay:.2s"><p class="text-xs font-bold uppercase tracking-wider text-cyan-200">Tripadvisor</p><div class="mt-4 flex gap-1 text-amber-300" aria-label="5 dari 5 bintang"><iconify-icon v-for="star in 5" :key="star" icon="mdi:star"></iconify-icon></div><p class="mt-5 font-display text-xl font-bold">“Wouldn't recommend to overseas visitors”</p><p class="mt-4 text-sm text-white/60">Lihat ulasan wisatawan</p></a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 2: LOGIN ==================== -->
  <div id="page-login" class="page">
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
      <section class="relative min-h-screen overflow-hidden bg-slate-900">
        <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-ocean to-[#20b8c5]"></div>
        <div class="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full border-[42px] border-white/10 animate-pulse-ring"></div>
        <div class="absolute -bottom-56 -left-24 h-[470px] w-[470px] rounded-full border-[28px] border-cyan-200/10 animate-pulse-ring" style="animation-delay:1.5s"></div>
        <div class="absolute right-[12%] top-[20%] h-24 w-24 rounded-full bg-cyan-200/10 blur-2xl animate-float"></div>
        <div id="bubbles-login" class="absolute inset-0 overflow-hidden pointer-events-none"></div>

        <!-- Header -->
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a href="#" @click.prevent="window.navigateTo('home')" class="flex items-center gap-3 text-white group">
              <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"><iconify-icon icon="lucide:waves" class="text-2xl"></iconify-icon></span>
              <span class="font-display text-lg font-extrabold tracking-tight">CITRALAND<span class="text-cyan-200">.</span></span>
            </a>
            <nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex">
              <a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Home</a>
              <a href="#" @click.prevent="window.navigateTo('home');setTimeout(()=>document.getElementById('fasilitas')?.scrollIntoView({behavior:'smooth'}),300)" class="nav-link transition hover:text-cyan-200">Fasilitas</a>
              <a href="#" @click.prevent="window.navigateTo('home');setTimeout(()=>document.getElementById('harga')?.scrollIntoView({behavior:'smooth'}),300)" class="nav-link transition hover:text-cyan-200">Harga</a>
            </nav>
            <a href="#" @click.prevent="window.navigateTo('login')" class="hidden sm:flex min-h-11 items-center gap-2 rounded-full bg-white/15 border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean backdrop-blur-sm"><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a>
          </div>
        </header>

        <main class="relative mx-auto flex max-w-7xl items-center justify-center px-6 pb-20 pt-28 lg:px-10 min-h-screen">
          <div class="animate-card-entry grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/30 lg:grid-cols-[.9fr_1.1fr]">
            <!-- Left Panel -->
            <aside class="aside-panel relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <div class="absolute -right-20 top-20 h-64 w-64 rounded-full border-[24px] border-white/10 animate-pulse-ring"></div>
              <div class="relative z-10 animate-slide-in-left">
                <span class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-cyan-100"><iconify-icon icon="lucide:waves" class="text-3xl"></iconify-icon></span>
                <p class="mt-10 text-sm font-bold uppercase tracking-[.22em] text-cyan-100">Selamat datang kembali</p>
                <h1 class="mt-4 max-w-sm font-display text-4xl font-extrabold leading-tight tracking-tight">Siap membuat momen baru di Citraland Waterpark?</h1>
                <p class="mt-6 max-w-sm leading-7 text-white/75">Masuk untuk melihat pesanan, mengelola e-ticket, dan menikmati proses liburan yang lebih praktis.</p>
              </div>
              <div class="relative z-10 mt-14 space-y-4 animate-slide-in-left delay-300">
                <div class="feature-card rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"><div class="flex items-start gap-4"><span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-200/20 text-cyan-100"><iconify-icon icon="lucide:ticket-check" class="text-xl"></iconify-icon></span><div><p class="font-bold">Semua tiket dalam satu tempat</p><p class="mt-1 text-sm leading-6 text-white/65">Akses cepat ke booking dan e-ticket kamu kapan saja.</p></div></div></div>
                <div class="feature-card rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"><div class="flex items-start gap-4"><span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-200/20 text-cyan-100"><iconify-icon icon="lucide:calendar-heart" class="text-xl"></iconify-icon></span><div><p class="font-bold">Riwayat kunjungan tersimpan</p><p class="mt-1 text-sm leading-6 text-white/65">Pantau semua aktivitas liburanmu dengan mudah.</p></div></div></div>
              </div>
            </aside>

            <!-- Right Panel -->
            <section class="p-7 sm:p-10 lg:p-12 animate-slide-in-right">
              <div class="flex items-start justify-between gap-4">
                <div><p class="text-sm font-bold uppercase tracking-[.2em] text-ocean">Akun Citraland Waterpark</p><h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900">Masuk ke akunmu</h2><p class="mt-3 text-sm leading-6 text-slate-500">Lanjutkan perjalanan seru bersama keluarga.</p></div>
                <a href="#" @click.prevent="window.navigateTo('home')" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all hover:border-aqua hover:text-ocean hover:rotate-90 duration-300"><iconify-icon icon="lucide:x"></iconify-icon></a>
              </div>
              <form id="login-form" class="mt-8" novalidate>
                <div class="animate-fade-in-up delay-200">
                  <label class="mb-2 block text-sm font-bold text-slate-700">Alamat email</label>
                  <div class="relative"><iconify-icon icon="lucide:mail" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="login-email" type="email" placeholder="nama@email.com" class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400"></div>
                </div>
                <div class="mt-5 animate-fade-in-up delay-300">
                  <div class="mb-2 flex items-center justify-between"><label class="block text-sm font-bold text-slate-700">Kata sandi</label><a href="#" @click.prevent="window.showToast('Link reset kata sandi dikirim ke email Anda','success')" class="text-xs font-bold text-ocean transition hover:text-aqua">Lupa kata sandi?</a></div>
                  <div class="relative"><iconify-icon icon="lucide:lock-keyhole" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="login-password" type="password" placeholder="Masukkan kata sandi" class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none placeholder:text-slate-400"><button type="button" @click.prevent="window.togglePassword($event.currentTarget)" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-ocean"><iconify-icon icon="lucide:eye"></iconify-icon></button></div>
                </div>
                <div class="mt-5 flex items-center justify-between animate-fade-in-up delay-400"><label class="flex cursor-pointer items-center gap-3 text-sm text-slate-600"><input type="checkbox" class="checkbox-custom h-4 w-4 rounded border-slate-300"><span>Ingat saya</span></label><span class="flex items-center gap-1.5 text-xs text-emerald-600"><iconify-icon icon="lucide:shield-check"></iconify-icon> Sesi aman</span></div>
                <button type="submit" class="btn-primary mt-7 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-aqua px-6 text-sm font-bold text-white shadow-lg shadow-cyan-900/15 transition-all hover:bg-ocean hover:shadow-xl active:scale-[0.98] animate-fade-in-up delay-500"><span id="login-btn-text">Masuk ke Citraland Waterpark</span><iconify-icon icon="lucide:arrow-right" class="text-lg" id="login-btn-icon"></iconify-icon><div class="loading-spinner hidden" id="login-btn-spinner"></div></button>
              </form>
              <p class="mt-8 text-center text-sm text-slate-500 animate-fade-in-up delay-800">Belum punya akun? <a href="#" @click.prevent="window.navigateTo('register')" class="font-bold text-ocean transition hover:text-aqua hover:underline underline-offset-2">Daftar sekarang</a></p>
              <div class="mt-7 flex items-center justify-center gap-5 border-t border-slate-100 pt-6 text-xs text-slate-400"><span class="flex items-center gap-1.5"><iconify-icon icon="lucide:lock" class="text-emerald-500"></iconify-icon> SSL Secure</span><span class="flex items-center gap-1.5"><iconify-icon icon="lucide:badge-check" class="text-ocean"></iconify-icon> Data terlindungi</span></div>
            </section>
          </div>
        </main>
        <div class="wave-divider"></div>
      </section>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 3: REGISTER ==================== -->
  <div id="page-register" class="page">
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
      <section class="relative min-h-screen overflow-hidden bg-slate-900">
        <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-ocean to-[#20b8c5]"></div>
        <div class="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full border-[42px] border-white/10 animate-pulse-ring"></div>
        <div class="absolute -bottom-56 -left-24 h-[470px] w-[470px] rounded-full border-[28px] border-cyan-200/10 animate-pulse-ring" style="animation-delay:1.5s"></div>
        <div id="bubbles-register" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a href="#" @click.prevent="window.navigateTo('home')" class="flex items-center gap-3 text-white group">
              <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"><iconify-icon icon="lucide:waves" class="text-2xl"></iconify-icon></span>
              <span class="font-display text-lg font-extrabold tracking-tight">CITRALAND<span class="text-cyan-200">.</span></span>
            </a>
            <a href="#" @click.prevent="window.navigateTo('login')" class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean"><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a>
          </div>
        </header>

        <main class="relative mx-auto flex max-w-7xl items-center justify-center px-6 pb-20 pt-28 lg:px-10 min-h-screen">
          <div class="animate-card-entry grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/30 lg:grid-cols-[.9fr_1.1fr]">
            <aside class="aside-panel relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <div class="absolute -right-20 top-20 h-64 w-64 rounded-full border-[24px] border-white/10 animate-pulse-ring"></div>
              <div class="relative z-10 animate-slide-in-left">
                <span class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-cyan-100"><iconify-icon icon="lucide:waves" class="text-3xl"></iconify-icon></span>
                <p class="mt-10 text-sm font-bold uppercase tracking-[.22em] text-cyan-100">Mulai petualanganmu</p>
                <h1 class="mt-4 max-w-sm font-display text-4xl font-extrabold leading-tight tracking-tight">Satu akun untuk hari-hari seru di Citraland Waterpark.</h1>
                <p class="mt-6 max-w-sm leading-7 text-white/75">Simpan tiket dan nikmati pengalaman liburan yang lebih praktis bersama keluarga.</p>
              </div>
              <div class="feature-card relative z-10 mt-14 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm animate-slide-in-left delay-300">
                <div class="flex items-start gap-4"><span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-200/20 text-cyan-100"><iconify-icon icon="lucide:ticket-check" class="text-xl"></iconify-icon></span><div><p class="font-bold">Semua tiket dalam satu tempat</p><p class="mt-1 text-sm leading-6 text-white/65">Akses cepat ke booking dan e-ticket kamu kapan saja.</p></div></div>
              </div>
            </aside>

            <section class="p-7 sm:p-10 lg:p-12 animate-slide-in-right">
              <div class="flex items-start justify-between gap-4">
                <div><p class="text-sm font-bold uppercase tracking-[.2em] text-ocean">Akun Citraland Waterpark</p><h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900">Buat akun baru</h2><p class="mt-3 text-sm leading-6 text-slate-500">Isi data berikut untuk memulai perjalananmu.</p></div>
                <a href="#" @click.prevent="window.navigateTo('home')" aria-label="Kembali ke beranda" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all hover:border-aqua hover:text-ocean hover:rotate-90 duration-300"><iconify-icon icon="lucide:x"></iconify-icon></a>
              </div>
              <form id="register-form" class="mt-7" novalidate>
                <div class="animate-fade-in-up delay-100">
                  <label for="register-name" class="mb-2 block text-sm font-bold text-slate-700">Nama lengkap</label>
                  <div class="relative"><iconify-icon icon="lucide:user-round" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="register-name" type="text" autocomplete="name" placeholder="Nama lengkapmu" class="input-field h-[50px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400"></div>
                </div>
                <div class="mt-4 animate-fade-in-up delay-200">
                  <label for="register-email" class="mb-2 block text-sm font-bold text-slate-700">Alamat email</label>
                  <div class="relative"><iconify-icon icon="lucide:mail" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="register-email" type="email" autocomplete="email" placeholder="nama@email.com" class="input-field h-[50px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400"></div>
                </div>
                <div class="mt-4 animate-fade-in-up delay-300">
                  <label for="register-password" class="mb-2 block text-sm font-bold text-slate-700">Kata sandi</label>
                  <div class="relative"><iconify-icon icon="lucide:lock-keyhole" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="register-password" type="password" autocomplete="new-password" placeholder="Minimal 8 karakter" class="input-field h-[50px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400"></div>
                </div>
                <div class="mt-4 animate-fade-in-up delay-400">
                  <label for="register-confirm-password" class="mb-2 block text-sm font-bold text-slate-700">Konfirmasi kata sandi</label>
                  <div class="relative"><iconify-icon icon="lucide:lock-keyhole" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="register-confirm-password" type="password" autocomplete="new-password" placeholder="Ulangi kata sandi" class="input-field h-[50px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400"></div>
                </div>
                <button type="submit" class="btn-primary mt-6 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-aqua px-6 text-sm font-bold text-white shadow-lg shadow-cyan-900/15 transition-all hover:bg-ocean hover:shadow-xl active:scale-[0.98]"><span id="register-btn-text">Daftar akun</span><iconify-icon icon="lucide:arrow-right" class="text-lg" id="register-btn-icon"></iconify-icon><div class="loading-spinner hidden" id="register-btn-spinner"></div></button>
              </form>
              <p class="mt-6 text-center text-sm text-slate-500">Sudah punya akun? <a href="#" @click.prevent="window.navigateTo('login')" class="font-bold text-ocean transition hover:text-aqua hover:underline underline-offset-2">Masuk</a></p>
              <div class="mt-6 flex items-center justify-center gap-5 border-t border-slate-100 pt-5 text-xs text-slate-400"><span class="flex items-center gap-1.5"><iconify-icon icon="lucide:lock" class="text-emerald-500"></iconify-icon> SSL Secure</span><span class="flex items-center gap-1.5"><iconify-icon icon="lucide:badge-check" class="text-ocean"></iconify-icon> Data terlindungi</span></div>
            </section>
          </div>
        </main>
        <div class="wave-divider"></div>
      </section>
    </div>
  </div>

  <!-- ==================== PAGE 3: SELECT TICKET ==================== -->
  <div id="page-select-ticket" class="page">
    <div class="min-h-screen bg-lagoon text-slate-800 font-sans">
      <div class="relative hero-bg overflow-hidden">
        <div class="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full border-[42px] border-white/10 animate-pulse-ring"></div>
        <div class="absolute -bottom-56 -left-24 h-[470px] w-[470px] rounded-full border-[28px] border-cyan-200/10 animate-pulse-ring" style="animation-delay:1.5s"></div>
        <div class="absolute right-[12%] top-[20%] h-24 w-24 rounded-full bg-cyan-200/10 blur-2xl animate-float"></div>
        <div id="bubbles-ticket" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a href="#" @click.prevent="window.navigateTo('home')" class="flex items-center gap-3 text-white group">
              <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean shadow-lg"><iconify-icon icon="lucide:waves" class="text-2xl"></iconify-icon></span>
              <span class="font-display text-lg font-extrabold tracking-tight">CITRALAND<span class="text-cyan-200">.</span></span>
            </a>
            <nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex">
              <a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Home</a>
              <a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Fasilitas</a>
              <a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Harga</a>
            </nav>
            <div class="flex items-center gap-3">
              <a id="select-ticket-login" href="#" @click.prevent="window.navigateTo('login')" class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean">
                <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk
              </a>
              <div id="select-ticket-profile" class="relative" style="display: none">
                <button id="select-ticket-profile-trigger" type="button" aria-expanded="false" aria-haspopup="true" @click.stop="window.toggleProfileMenu('select-ticket')" class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean">
                  <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon>
                  <span id="select-ticket-profile-name">Profil</span>
                  <iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
                </button>
                <div id="select-ticket-profile-dropdown" class="hidden absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl" @click.stop>
                  <div class="border-b border-slate-100 px-3 py-2">
                    <p id="select-ticket-profile-dropdown-name" class="truncate text-sm font-bold"></p>
                    <p id="select-ticket-profile-email" class="truncate text-xs text-slate-500"></p>
                  </div>
                  <button type="button" @click="window.navigateTo('ticket-history')" class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-lagoon hover:text-ocean">
                    <iconify-icon icon="lucide:history"></iconify-icon> Riwayat Tiket
                  </button>
                  <button type="button" @click="window.logoutUser()" class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                    <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
                  </button>
                </div>
              </div>
              <button @click.prevent="window.toggleMobileMenu(true)" class="flex h-11 w-11 items-center justify-center rounded-xl text-white lg:hidden">
                <iconify-icon icon="lucide:menu" class="text-2xl"></iconify-icon>
              </button>
            </div>
          </div>
        </header>
        <div class="mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-10"><div class="max-w-3xl"><p class="text-sm font-bold uppercase tracking-[.22em] text-cyan-200 animate-fade-in-up">Citraland Waterpark Denpasar</p><h1 class="mt-4 font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl animate-fade-in-up delay-100">Pilih tiket untuk kunjunganmu</h1><p class="mt-5 max-w-xl text-lg leading-8 text-cyan-50 animate-fade-in-up delay-200">Pilih jenis tiket sesuai hari kunjungan: Weekdays Selasa–Jumat, Weekend Sabtu–Minggu. Senin libur. Anak di bawah 85 cm gratis.</p></div></div>
        <div class="wave-divider-lagoon"></div>
      </div>
      <main class="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div class="scroll-reveal flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p class="text-sm font-bold uppercase tracking-[.18em] text-ocean">Langkah pemesanan</p><h2 class="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">1. Pilih jenis tiket</h2></div><div class="flex items-center gap-3 text-sm font-semibold text-slate-500"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-ocean text-white animate-step-pulse">1</span><span class="step-line h-px w-10 bg-slate-300"></span><span class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white">2</span><span class="step-line h-px w-10 bg-slate-300"></span><span class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white">3</span><span class="step-line h-px w-10 bg-slate-300"></span><span class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white">4</span><span class="ml-1 hidden md:inline">dari 4</span></div></div>
        <TicketSelectionSection />
        <div class="scroll-reveal mt-8 flex items-center justify-center gap-2 text-sm text-slate-500" style="transition-delay:.4s"><iconify-icon icon="lucide:shield-check" class="text-lg text-ocean"></iconify-icon>Pembayaran aman dan e-ticket dikirim langsung ke email kamu.</div>
      </main>
      <div id="summaryBar" class="summary-bar hidden-bar fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl"><div class="mx-auto max-w-7xl px-6 py-4 lg:px-10"><div class="flex items-center justify-between gap-4"><div class="flex items-center gap-6"><div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-lagoon text-ocean"><iconify-icon icon="lucide:ticket" class="text-sm"></iconify-icon></span><div><p class="text-xs text-slate-500">Total tiket</p><p class="font-display font-bold text-slate-900" id="summaryCount">0 tiket</p></div></div><div class="hidden sm:block h-8 w-px bg-slate-200"></div><div class="hidden sm:block"><p class="text-xs text-slate-500">Total harga</p><p class="font-display font-bold text-ocean" id="summaryPrice">Rp0</p></div></div><a href="#" @click.prevent="window.goToBookingFromSummary()" class="btn-primary flex min-h-11 items-center gap-2 rounded-full bg-aqua px-6 text-sm font-bold text-white shadow-lg transition hover:bg-ocean">Lanjutkan Pesan <iconify-icon icon="lucide:arrow-right" class="text-base"></iconify-icon></a></div></div></div>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 4: BOOKING DETAILS ==================== -->
  <div id="page-booking-details" class="page">
    <div class="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div class="relative hero-bg-2 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-ocean via-[#008b9d] to-slate-900 opacity-90"></div>
        <div class="absolute -right-24 -top-32 h-96 w-96 rounded-full border-[36px] border-white/10 animate-pulse-ring"></div>
        <div class="absolute -bottom-48 left-1/4 h-96 w-96 rounded-full border-[28px] border-cyan-200/10 animate-pulse-ring" style="animation-delay:1.5s"></div>
        <div id="bubbles-booking" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a href="#" @click.prevent="window.navigateTo('home')" class="flex items-center gap-3 text-white group">
              <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean shadow-lg"><iconify-icon icon="lucide:waves" class="text-2xl"></iconify-icon></span>
              <span class="font-display text-lg font-extrabold tracking-tight">CITRALAND<span class="text-cyan-200">.</span></span>
            </a>
            <nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex">
              <a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Home</a>
              <a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Fasilitas</a>
              <a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Harga</a>
            </nav>
            <div class="flex items-center gap-3">
              <a id="booking-details-login" href="#" @click.prevent="window.navigateTo('login')" class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean">
                <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk
              </a>
              <div id="booking-details-profile" class="relative" style="display: none">
                <button id="booking-details-profile-trigger" type="button" aria-expanded="false" aria-haspopup="true" @click.stop="window.toggleProfileMenu('booking-details')" class="flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean">
                  <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon>
                  <span id="booking-details-profile-name">Profil</span>
                  <iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
                </button>
                <div id="booking-details-profile-dropdown" class="hidden absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl" @click.stop>
                  <div class="border-b border-slate-100 px-3 py-2">
                    <p id="booking-details-profile-dropdown-name" class="truncate text-sm font-bold"></p>
                    <p id="booking-details-profile-email" class="truncate text-xs text-slate-500"></p>
                  </div>
                  <button type="button" @click="window.navigateTo('ticket-history')" class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-lagoon hover:text-ocean">
                    <iconify-icon icon="lucide:history"></iconify-icon> Riwayat Tiket
                  </button>
                  <button type="button" @click="window.logoutUser()" class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                    <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div class="relative mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-10"><div class="flex items-center gap-3 text-sm text-cyan-100 animate-fade-in-up"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"><iconify-icon icon="lucide:ticket-check"></iconify-icon></span> Lengkapi pemesananmu</div><h1 class="mt-4 font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl animate-fade-in-up delay-100">Detail Pemesanan</h1><p class="mt-3 max-w-xl text-white/70 animate-fade-in-up delay-200">Isi data pengunjung dengan benar agar e-ticket dapat kami kirimkan tanpa kendala.</p></div>
        <div class="wave-divider-slate"></div>
      </div>
      <main class="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <section class="scroll-reveal mb-10 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm md:px-8"><div class="flex items-center justify-between gap-2 md:gap-5"><div class="flex min-w-0 items-center gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aqua text-sm font-bold text-white animate-check-pop"><iconify-icon icon="lucide:check" class="text-base"></iconify-icon></span><div class="hidden sm:block"><p class="text-xs text-slate-400">Langkah 1</p><p class="truncate text-sm font-semibold text-slate-600">Pilih Tiket</p></div></div><div class="progress-line completed h-1 flex-1 rounded-full bg-aqua"></div><div class="flex min-w-0 items-center gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aqua text-sm font-bold text-white ring-4 ring-cyan-100 animate-summary-pulse">2</span><div><p class="text-xs text-ocean font-semibold">Langkah 2</p><p class="truncate text-sm font-bold text-slate-900">Detail Pemesanan</p></div></div><div class="progress-line h-1 flex-1 rounded-full bg-slate-200"></div><div class="flex min-w-0 items-center gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400">3</span><div class="hidden sm:block"><p class="text-xs text-slate-400">Langkah 3</p><p class="truncate text-sm font-semibold text-slate-400">Pembayaran</p></div></div><div class="progress-line h-1 flex-1 rounded-full bg-slate-200"></div><div class="flex min-w-0 items-center gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400">4</span><div class="hidden sm:block"><p class="text-xs text-slate-400">Langkah 4</p><p class="truncate text-sm font-semibold text-slate-400">Selesai</p></div></div></div></section>
        <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <form id="booking-form" class="scroll-reveal rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-9" novalidate>
            <div class="flex items-start justify-between gap-5 border-b border-slate-100 pb-7"><div><p class="text-sm font-bold uppercase tracking-[.2em] text-ocean">Data pengunjung</p><h2 class="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">Siapa yang akan berkunjung?</h2><p class="mt-2 text-sm text-slate-500">Masukkan data pemesan utama untuk keperluan konfirmasi tiket.</p></div><span class="hidden h-12 w-12 items-center justify-center rounded-2xl bg-lagoon text-ocean sm:flex"><iconify-icon icon="lucide:user-round" class="text-xl"></iconify-icon></span></div>
            <div class="mt-8 grid gap-6 md:grid-cols-2">
              <div class="md:col-span-2"><label class="mb-2 block text-sm font-bold text-slate-700">Nama lengkap <span class="text-rose-500">*</span></label><div class="relative"><iconify-icon icon="lucide:user" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="bf-name" type="text" placeholder="Contoh: Rina Pratiwi" class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400"></div><p id="bf-name-error" class="mt-2 text-xs font-medium text-rose-600 hidden">Nama lengkap wajib diisi.</p></div>
              <div><label class="mb-2 block text-sm font-bold text-slate-700">Email akun <span class="text-rose-500">*</span></label><div class="relative"><iconify-icon icon="lucide:mail" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="bf-email" type="email" placeholder="nama@email.com" class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400"></div><p class="mt-2 text-xs text-slate-400">E-ticket dikirim ke email akun yang sedang masuk.</p></div>
              <div><label class="mb-2 block text-sm font-bold text-slate-700">Nomor telepon <span class="text-rose-500">*</span></label><div class="relative"><iconify-icon icon="lucide:phone" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="bf-phone" type="tel" placeholder="08xx-xxxx-xxxx" class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400"></div></div>
              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-bold text-slate-700">Tanggal kunjungan <span class="text-rose-500">*</span></label>
                <input id="bf-date" type="date" class="hidden" tabindex="-1" aria-hidden="true">
                <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div class="mb-4 flex items-center justify-between gap-3">
                    <p id="bf-date-label" class="font-semibold text-slate-800">Pilih tanggal kunjungan</p>
                    <div class="flex items-center gap-2">
                      <button id="bf-calendar-prev" type="button" aria-label="Bulan sebelumnya" class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-ocean hover:text-ocean"><iconify-icon icon="lucide:chevron-left"></iconify-icon></button>
                      <p id="bf-calendar-month" class="min-w-32 text-center text-sm font-bold capitalize text-slate-800"></p>
                      <button id="bf-calendar-next" type="button" aria-label="Bulan berikutnya" class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-ocean hover:text-ocean"><iconify-icon icon="lucide:chevron-right"></iconify-icon></button>
                    </div>
                  </div>
                  <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400" aria-hidden="true">
                    <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                  </div>
                  <div id="bf-calendar-days" class="mt-2 grid grid-cols-7 gap-1" role="group" aria-label="Pilih tanggal kunjungan"></div>
                  <p class="mt-3 text-xs text-slate-500">Weekdays: Selasa–Jumat · Weekend: Sabtu–Minggu · Senin libur. Anak di bawah 85 cm gratis.</p>
                </div>
              </div>
            </div>
            <div class="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-7 sm:flex-row sm:justify-between"><a href="#" @click.prevent="window.navigateTo('select-ticket')" class="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-slate-200 px-6 text-sm font-bold text-slate-600 transition-all hover:border-ocean hover:text-ocean"><iconify-icon icon="lucide:arrow-left"></iconify-icon>Kembali</a><button type="submit" class="btn-primary inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-aqua px-7 text-sm font-bold text-white shadow-lg shadow-cyan-900/15 transition-all hover:bg-ocean active:scale-[0.98]"><span id="bf-btn-text">Lanjut ke Pembayaran</span><iconify-icon icon="lucide:arrow-right" class="text-lg" id="bf-btn-icon"></iconify-icon><div class="loading-spinner hidden" id="bf-btn-spinner"></div></button></div>
          </form>
          <aside class="scroll-reveal summary-card sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7" style="transition-delay:.15s"><div class="flex items-center justify-between"><div><p class="text-sm font-bold uppercase tracking-[.2em] text-ocean">Ringkasan</p><h2 class="mt-2 font-display text-xl font-bold text-slate-900">Pesanan kamu</h2></div><span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-lagoon text-ocean"><iconify-icon icon="lucide:receipt" class="text-xl"></iconify-icon></span></div><div class="mt-7 rounded-2xl bg-lagoon p-4"><div class="flex items-start justify-between gap-4"><div><p class="font-bold text-slate-800" id="bs-name">Tiket terpilih</p><p class="mt-1 text-xs text-slate-500">Citraland Waterpark Denpasar</p></div><span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-ocean" id="bs-qty">0 tiket</span></div><div class="mt-4 flex items-center gap-2 text-xs text-slate-500"><iconify-icon icon="lucide:calendar-days" class="text-ocean"></iconify-icon><span id="bs-date">Pilih tanggal kunjungan</span></div></div><div class="mt-6 space-y-4 text-sm"><div id="bs-lines" class="space-y-3"><p class="text-slate-500">Belum ada tiket dipilih.</p></div></div><div class="my-6 h-px bg-slate-100"></div><div class="flex items-end justify-between"><span class="font-bold text-slate-700">Total pembayaran</span><span class="font-display text-2xl font-extrabold text-ocean" id="bs-total">Rp0</span></div><div class="mt-6 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs leading-5 text-emerald-700"><iconify-icon icon="lucide:shield-check" class="mt-0.5 shrink-0 text-lg"></iconify-icon><span>Data kamu aman. E-ticket akan dikirim setelah pembayaran berhasil.</span></div></aside>
        </div>
      </main>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 5: PAYMENT ==================== -->
  <div id="page-payment" class="page">
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div class="relative h-20 bg-slate-900"><header class="absolute top-0 left-0 right-0 z-30"><div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10"><a href="#" @click.prevent="window.navigateTo('home')" class="flex items-center gap-3 text-white group"><span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean shadow-lg"><iconify-icon icon="lucide:waves" class="text-2xl"></iconify-icon></span><span class="font-display text-lg font-extrabold tracking-tight">CITRALAND<span class="text-cyan-200">.</span></span></a><nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex"><a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Home</a><a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Fasilitas</a><a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Harga</a></nav><a href="#" @click.prevent="window.navigateTo('login')" class="hidden sm:flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean"><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a></div></header></div>
      <main class="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14"><div class="mx-auto max-w-5xl">
        <nav class="scroll-reveal mb-10"><ol class="flex items-center justify-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm"><li class="flex items-center gap-2 text-ocean"><a href="#" @click.prevent="window.navigateTo('select-ticket')" class="flex items-center gap-2 transition hover:opacity-80"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-ocean text-white animate-check-pop"><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span><span class="hidden sm:inline">Pilih Tiket</span></a></li><li class="progress-line completed h-px w-8 bg-ocean sm:w-16"></li><li class="flex items-center gap-2 text-ocean"><a href="#" @click.prevent="window.navigateTo('booking-details')" class="flex items-center gap-2 transition hover:opacity-80"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-ocean text-white animate-check-pop" style="animation-delay:.1s"><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span><span class="hidden sm:inline">Data Pengunjung</span></a></li><li class="progress-line h-px w-8 bg-ocean sm:w-16"></li><li class="flex items-center gap-2 text-ocean"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-aqua text-white animate-summary-pulse shadow-lg shadow-cyan-200">3</span><span class="font-bold">Pembayaran</span></li><li class="h-px w-8 bg-slate-200 sm:w-16"></li><li class="flex items-center gap-2 text-slate-400"><span class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white">4</span><span class="hidden sm:inline">Selesai</span></li></ol></nav>
        <div class="scroll-reveal mb-10 text-center" style="transition-delay:.1s"><p class="text-sm font-bold uppercase tracking-[.22em] text-ocean">Langkah 3 dari 4</p><h1 class="mt-3 font-display text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">Selesaikan pembayaran</h1><p class="mx-auto mt-4 max-w-xl text-slate-500">Pilih metode pembayaran yang paling nyaman. Tiket akan dikirim setelah pembayaran berhasil dikonfirmasi.</p></div>
        <div class="grid gap-7 lg:grid-cols-[1.2fr_.8fr]">
          <section class="scroll-reveal rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8" style="transition-delay:.2s">
            <div class="flex items-center justify-between border-b border-slate-100 pb-6"><div><h2 class="font-display text-xl font-bold text-slate-900">Pembayaran melalui Midtrans</h2><p class="mt-1 text-sm text-slate-500">Pilih metode pembayaran dengan aman di jendela Midtrans.</p></div><span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-lagoon text-ocean"><iconify-icon icon="lucide:shield-check" class="text-xl"></iconify-icon></span></div>
            <div class="mt-6 rounded-2xl border border-cyan-100 bg-lagoon p-5"><div class="flex items-start gap-4"><span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-ocean"><iconify-icon icon="lucide:credit-card" class="text-xl"></iconify-icon></span><div><p class="font-bold text-slate-900">Metode pembayaran tersedia di Snap</p><p class="mt-1 text-sm leading-6 text-slate-600">Klik "Bayar Sekarang" untuk membuka popup Midtrans. Detail kartu dan pembayaran hanya dimasukkan di halaman aman Midtrans.</p></div></div></div>
            <div class="mt-8 rounded-2xl bg-slate-50 p-5"><div class="flex items-center justify-between gap-4"><div><p class="font-bold text-slate-900">Punya kode promo?</p><p class="mt-1 text-sm text-slate-500">Masukkan kode untuk mendapatkan potongan harga.</p></div><div class="flex gap-2"><input id="promo-input" type="text" placeholder="CITRALAND" class="h-11 w-32 rounded-xl border border-slate-200 bg-white px-3 text-xs uppercase outline-none focus:border-ocean sm:w-40"><button id="promo-btn" @click.prevent="window.applyPromo()" class="h-11 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-ocean">Pakai</button></div></div><div id="promo-success" class="mt-3 hidden items-center gap-2 text-sm text-emerald-600"><iconify-icon icon="lucide:check-circle" class="text-lg"></iconify-icon><span>Kode promo berhasil diterapkan! Diskon Rp10.000</span></div></div>
          </section>
          <aside class="scroll-reveal summary-card h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8 lg:sticky lg:top-8" style="transition-delay:.3s"><div class="flex items-center justify-between"><h2 class="font-display text-xl font-bold text-slate-900">Ringkasan pesanan</h2><span id="pay-booking-code" class="rounded-full bg-lagoon px-3 py-1 text-xs font-bold text-ocean">Kode booking</span></div><div class="mt-6 rounded-2xl bg-lagoon p-5"><div class="flex items-start justify-between gap-4"><div><p class="font-bold text-slate-900">Citraland Waterpark Denpasar</p><p class="mt-2 flex items-center gap-2 text-sm text-slate-500"><iconify-icon icon="lucide:calendar-days" class="text-ocean"></iconify-icon><span id="pay-date">Pilih tanggal kunjungan</span></p><p class="mt-3 text-sm font-semibold text-slate-700" id="pay-customer-name">Nama pemesan</p><p class="text-xs text-slate-500" id="pay-customer-email">Email pemesan</p></div><iconify-icon icon="lucide:waves" class="text-2xl text-ocean animate-float"></iconify-icon></div></div>
            <div class="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3"><div class="countdown-timer flex h-8 w-8 items-center justify-center rounded-full bg-amber-100"><iconify-icon icon="lucide:clock" class="text-amber-600"></iconify-icon></div><div><p class="text-xs font-bold text-amber-800">Selesaikan dalam</p><p class="text-sm font-bold text-amber-700" id="countdown">23:59:45</p></div></div>
            <div class="mt-6 space-y-4 text-sm"><div id="pay-lines" class="space-y-3"></div><div class="flex justify-between"><span class="text-slate-500">Biaya layanan</span><span class="font-semibold text-slate-800" id="pay-service-fee">Rp0</span></div><div id="discount-row" class="hidden flex justify-between text-emerald-600"><span>Diskon promo</span><span class="font-semibold" id="pay-discount">-Rp10.000</span></div></div>
            <div class="my-6 h-px bg-slate-100"></div><div class="flex items-end justify-between"><span class="font-bold text-slate-700">Total pembayaran</span><span class="font-display text-2xl font-extrabold text-ocean" id="pay-total">Rp0</span></div>
            <button id="pay-btn" @click.prevent="window.processPayment()" class="btn-primary mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-aqua px-6 font-bold text-white shadow-xl shadow-cyan-200 transition-all hover:bg-ocean active:scale-[0.98]"><span id="pay-btn-text">Bayar Sekarang</span><iconify-icon icon="lucide:arrow-right" class="text-lg" id="pay-btn-icon"></iconify-icon><div class="loading-spinner hidden" id="pay-btn-spinner"></div></button>
            <button id="check-payment-btn" @click.prevent="window.checkPaymentStatus()" class="mt-3 min-h-11 w-full rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:border-ocean hover:text-ocean">Sudah membayar? Periksa status</button>
            <p class="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><iconify-icon icon="lucide:lock-keyhole" class="text-emerald-500"></iconify-icon> Pembayaran aman dan terenkripsi</p>
            <div class="mt-6 flex items-center justify-center gap-5 border-t border-slate-100 pt-5 text-slate-400"><span class="flex items-center gap-1 text-xs"><iconify-icon icon="lucide:shield-check" class="text-emerald-500"></iconify-icon> SSL Secure</span><span class="flex items-center gap-1 text-xs"><iconify-icon icon="lucide:badge-check" class="text-ocean"></iconify-icon> Terpercaya</span></div>
          </aside>
        </div>
      </div></main>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 6: CONFIRMATION ==================== -->
  <div id="page-confirmation" class="page">
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div class="relative overflow-hidden hero-gradient-success">
        <div class="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[30px] border-white/5 animate-float"></div>
        <div class="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full border-[24px] border-cyan-400/5 animate-float" style="animation-delay:2s"></div>
        <header class="absolute top-0 left-0 right-0 z-30"><div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10"><a href="#" @click.prevent="window.navigateTo('home')" class="flex items-center gap-3 text-white group"><span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"><iconify-icon icon="lucide:waves" class="text-2xl"></iconify-icon></span><span class="font-display text-lg font-extrabold tracking-tight">CITRALAND<span class="text-cyan-200">.</span></span></a><nav class="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex"><a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Home</a><a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Fasilitas</a><a href="#" @click.prevent="window.navigateTo('home')" class="nav-link transition hover:text-cyan-200">Harga</a></nav><a href="#" @click.prevent="window.navigateTo('login')" class="hidden sm:flex min-h-11 items-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean"><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a></div></header>
        <div class="relative mx-auto max-w-7xl px-6 pb-24 pt-36 lg:px-10"><div class="mx-auto max-w-3xl text-center">
          <div class="animate-success-bounce"><span class="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-white shadow-lg shadow-emerald-950/30"><iconify-icon icon="lucide:check" class="text-4xl"></iconify-icon><span class="absolute inset-0 rounded-full bg-emerald-400/30" style="animation:ripple 2s ease-out infinite"></span></span></div>
          <p class="mt-8 text-sm font-bold uppercase tracking-[.22em] text-cyan-200 animate-fade-in-up delay-200">Pembayaran berhasil</p>
          <h1 class="mt-3 font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl animate-fade-in-up delay-300">Tiketmu sudah siap!</h1>
          <p class="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70 animate-fade-in-up delay-400">Terima kasih telah memilih Citraland Waterpark. Tunjukkan QR code ini di pintu masuk untuk memulai keseruanmu.</p>
          <div class="mt-10 flex items-center justify-center gap-3 animate-fade-in-up delay-500"><div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-ocean text-xs font-bold text-white"><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span><span class="hidden sm:inline text-xs font-semibold text-white/60">Pilih Tiket</span></div><div class="progress-line completed h-0.5 w-8 bg-ocean sm:w-12"></div><div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-ocean text-xs font-bold text-white"><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span><span class="hidden sm:inline text-xs font-semibold text-white/60">Data</span></div><div class="progress-line completed h-0.5 w-8 bg-ocean sm:w-12"></div><div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-ocean text-xs font-bold text-white"><iconify-icon icon="lucide:check" class="text-sm"></iconify-icon></span><span class="hidden sm:inline text-xs font-semibold text-white/60">Bayar</span></div><div class="progress-line completed h-0.5 w-8 bg-emerald-400 sm:w-12"></div><div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-white shadow-lg shadow-emerald-400/30">4</span><span class="text-xs font-bold text-white">Selesai</span></div></div>
        </div></div>
      </div>
      <main class="relative mx-auto -mt-10 max-w-7xl px-6 pb-24 lg:px-10">
        <div class="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <article class="animate-ticket-reveal overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70">
            <div class="flex flex-col justify-between gap-5 border-b border-slate-100 p-7 sm:flex-row sm:items-start sm:p-9"><div class="animate-slide-in-left delay-300"><div class="flex items-center gap-2 text-sm font-bold text-emerald-600"><iconify-icon icon="lucide:badge-check" class="text-lg"></iconify-icon> E-ticket terverifikasi</div><h2 class="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900">Citraland Waterpark Denpasar</h2><p class="mt-1 text-sm text-slate-500">Tiket masuk wisata kolam renang</p></div><div class="animate-slide-in-right delay-400 rounded-2xl bg-lagoon px-5 py-3 text-left sm:text-right relative group cursor-pointer" @click.prevent="window.copyBookingCode()"><p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Kode booking</p><p class="mt-1 font-display text-xl font-extrabold tracking-widest text-ocean booking-code" id="confirm-code">-</p><button class="copy-btn absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:text-ocean"><iconify-icon icon="lucide:copy" class="text-sm"></iconify-icon></button></div></div>
            <div class="grid gap-8 p-7 sm:grid-cols-[1fr_190px] sm:p-9"><div class="animate-fade-in-up delay-500"><p class="text-xs font-bold uppercase tracking-[.18em] text-ocean">Detail pengunjung</p><div class="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2"><div><p class="text-xs text-slate-400">Nama pengunjung</p><p class="mt-1 font-bold text-slate-800" id="confirm-name">Nama pengunjung</p></div><div><p class="text-xs text-slate-400">Jenis tiket</p><p class="mt-1 font-bold text-slate-800" id="confirm-ticket-types">Tiket terpilih</p></div><div><p class="text-xs text-slate-400">Tanggal kunjungan</p><p class="mt-1 flex items-center gap-2 font-bold text-slate-800"><iconify-icon icon="lucide:calendar-days" class="text-ocean"></iconify-icon><span id="confirm-date">Pilih tanggal kunjungan</span></p></div><div><p class="text-xs text-slate-400">Nomor telepon</p><p class="mt-1 font-bold text-slate-800" id="confirm-phone">Nomor telepon</p></div><div><p class="text-xs text-slate-400">Jam masuk</p><p class="mt-1 flex items-center gap-2 font-bold text-slate-800"><iconify-icon icon="lucide:clock-3" class="text-ocean"></iconify-icon>09.00 – 17.00 WIB</p></div></div></div>
              <div class="flex flex-col items-center justify-center border-t border-slate-100 pt-7 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 animate-scale-in delay-600"><div class="qr-container animate-qr-pulse"><div class="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl border-8 border-white bg-white shadow-md ring-1 ring-slate-200"><img id="confirm-qr-image" alt="QR code e-ticket" class="hidden h-full w-full object-contain" /><iconify-icon id="confirm-qr-fallback" icon="lucide:qr-code" class="text-[9rem] text-slate-300"></iconify-icon></div></div><p class="mt-4 text-center text-xs font-semibold text-slate-500">Scan di pintu masuk</p><p class="mt-1 text-center text-[11px] text-slate-400 booking-code"><span id="confirm-qr-code">-</span>-<span id="confirm-qr-types">TICKET</span></p></div>
            </div>
            <div class="flex flex-col gap-3 border-t border-dashed border-slate-200 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9"><p class="text-sm text-slate-500">Simpan tiket ini sebelum berangkat.</p><div class="flex gap-2"><button id="download-ticket-btn" @click.prevent="window.downloadTicket()" class="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-aqua px-6 text-sm font-bold text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"><iconify-icon icon="lucide:download" id="download-ticket-icon"></iconify-icon><span id="download-ticket-text">Unduh e-ticket</span><span id="download-ticket-spinner" class="loading-spinner hidden"></span></button></div></div>
          </article>
          <aside class="animate-slide-in-right delay-400 rounded-3xl bg-white p-7 shadow-xl shadow-slate-200/70 lg:p-8 h-fit"><div class="flex items-center justify-between"><h2 class="font-display text-xl font-bold text-slate-900">Ringkasan pesanan</h2><span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Lunas</span></div><div class="mt-7 space-y-5 border-b border-slate-100 pb-6"><div id="confirm-lines" class="space-y-3 text-sm"></div><div class="flex justify-between gap-4 text-sm"><span class="text-slate-500">Biaya layanan</span><span class="font-semibold text-slate-800" id="confirm-service-fee">Rp0</span></div><div id="confirm-discount-row" class="hidden flex justify-between gap-4 text-sm text-emerald-600"><span>Diskon promo</span><span class="font-semibold" id="confirm-discount"></span></div><div class="flex justify-between gap-4 text-sm"><span class="text-slate-500">Metode pembayaran</span><span class="font-semibold text-slate-800" id="confirm-payment-method">Kartu kredit / debit</span></div></div><div class="flex items-end justify-between pt-6"><span class="font-semibold text-slate-600">Total pembayaran</span><span class="font-display text-2xl font-extrabold text-ocean" id="confirm-total">Rp0</span></div><div class="mt-8 rounded-2xl bg-lagoon p-5"><div class="flex gap-3"><iconify-icon icon="lucide:info" class="mt-0.5 text-xl text-ocean shrink-0"></iconify-icon><p class="text-sm leading-6 text-slate-600">Tiket berlaku untuk satu kali kunjungan dan tidak dapat dipindahtangankan.</p></div></div></aside>
        </div>
        <section class="scroll-reveal mt-14"><div class="text-center"><p class="text-sm font-bold uppercase tracking-[.22em] text-ocean">Sebelum berkunjung</p><h2 class="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900">Langkah selanjutnya</h2></div><div class="mt-8 grid gap-5 md:grid-cols-3"><div class="step-card rounded-3xl bg-white p-7 shadow-sm"><span class="step-number flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon font-display text-lg font-extrabold text-ocean">01</span><h3 class="mt-6 font-display text-lg font-bold">Simpan e-ticket</h3><p class="mt-2 text-sm leading-6 text-slate-500">Simpan QR code di ponsel atau unduh tiket untuk akses lebih cepat.</p></div><div class="step-card rounded-3xl bg-white p-7 shadow-sm"><span class="step-number flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon font-display text-lg font-extrabold text-ocean">02</span><h3 class="mt-6 font-display text-lg font-bold">Datang sesuai jadwal</h3><p class="mt-2 text-sm leading-6 text-slate-500">Tunjukkan QR code dan kode booking kepada petugas di gerbang.</p></div><div class="step-card rounded-3xl bg-white p-7 shadow-sm"><span class="step-number flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon font-display text-lg font-extrabold text-ocean">03</span><h3 class="mt-6 font-display text-lg font-bold">Nikmati Citraland Waterpark</h3><p class="mt-2 text-sm leading-6 text-slate-500">Bersiap untuk hari penuh keseruan bersama keluarga dan teman.</p></div></div></section>
        <div class="scroll-reveal mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style="transition-delay:.2s"><a href="#" @click.prevent="window.navigateTo('home')" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-aqua hover:text-ocean hover:shadow-sm"><iconify-icon icon="lucide:arrow-left"></iconify-icon> Kembali ke beranda</a><a href="#" @click.prevent="window.navigateTo('select-ticket')" class="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ocean px-6 text-sm font-bold text-white transition hover:bg-aqua shadow-lg shadow-cyan-900/15">Pesan tiket lagi <iconify-icon icon="lucide:arrow-up-right"></iconify-icon></a></div>
      </main>
      <UserFooter />
    </div>
  </div>

  <!-- ==================== PAGE 7: TICKET HISTORY ==================== -->
  <div id="page-ticket-history" class="page">
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div class="relative overflow-hidden bg-gradient-to-br from-slate-950 via-ocean to-[#20b8c5]">
        <div class="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[32px] border-white/10 animate-pulse-ring"></div>
        <div class="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full border-[24px] border-cyan-200/10 animate-pulse-ring" style="animation-delay:1.5s"></div>
        <header class="absolute top-0 left-0 right-0 z-30">
          <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a href="#" @click.prevent="window.navigateTo('home')" class="flex items-center gap-3 text-white group">
              <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"><iconify-icon icon="lucide:waves" class="text-2xl"></iconify-icon></span>
              <span class="font-display text-lg font-extrabold tracking-tight">CITRALAND<span class="text-cyan-200">.</span></span>
            </a>
            <div class="flex items-center gap-3">
              <a href="#" @click.prevent="window.navigateTo('select-ticket')" class="hidden min-h-11 items-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean sm:flex"><iconify-icon icon="lucide:ticket" class="text-base"></iconify-icon> Pesan Tiket</a>
              <button @click.prevent="window.toggleMobileMenu(true)" class="flex h-11 w-11 items-center justify-center rounded-xl text-white lg:hidden"><iconify-icon icon="lucide:menu" class="text-2xl"></iconify-icon></button>
            </div>
          </div>
        </header>
        <div class="relative mx-auto max-w-7xl px-6 pb-20 pt-32 lg:px-10">
          <div class="max-w-2xl">
            <p class="text-sm font-bold uppercase tracking-[.22em] text-cyan-200 animate-fade-in-up">Akun saya</p>
            <h1 class="mt-4 font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl animate-fade-in-up delay-100">Riwayat Tiket</h1>
            <p class="mt-4 max-w-xl text-base leading-7 text-cyan-50/80 animate-fade-in-up delay-200">Lihat semua pesanan tiketmu, status pembayaran, dan status pemakaian tiket.</p>
          </div>
        </div>
        <div class="wave-divider-slate"></div>
      </div>
      <main class="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div class="scroll-reveal flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-sm font-bold uppercase tracking-[.18em] text-ocean">Tiket saya</p>
            <h2 class="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">Semua pesanan tiket</h2>
          </div>
          <div id="ticket-history-filters" class="flex flex-wrap gap-2">
            <button type="button" data-filter="all" class="history-filter rounded-full bg-ocean px-4 py-2 text-xs font-bold text-white transition">Semua</button>
            <button type="button" data-filter="paid" class="history-filter rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-ocean">Sudah dibayar</button>
            <button type="button" data-filter="pending" class="history-filter rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-ocean">Menunggu</button>
            <button type="button" data-filter="failed" class="history-filter rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-ocean">Gagal</button>
            <button type="button" data-filter="used" class="history-filter rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-ocean">Sudah digunakan</button>
          </div>
        </div>
        <div id="ticket-history-loading" class="mt-8 hidden grid gap-5 md:grid-cols-2">
          <div class="h-56 animate-pulse rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><div class="h-4 w-32 rounded bg-slate-100"></div><div class="mt-4 h-8 w-48 rounded bg-slate-100"></div><div class="mt-6 h-20 rounded-2xl bg-slate-50"></div></div>
          <div class="h-56 animate-pulse rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><div class="h-4 w-32 rounded bg-slate-100"></div><div class="mt-4 h-8 w-48 rounded bg-slate-100"></div><div class="mt-6 h-20 rounded-2xl bg-slate-50"></div></div>
        </div>
        <div id="ticket-history-error" class="mt-8 hidden rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700"><p id="ticket-history-error-message"></p><button id="ticket-history-retry" type="button" class="mt-3 inline-flex min-h-10 items-center rounded-full bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-700">Coba lagi</button></div>
        <div id="ticket-history-empty" class="mt-8 hidden rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lagoon text-ocean"><iconify-icon icon="lucide:ticket" class="text-3xl"></iconify-icon></span>
          <h3 class="mt-5 font-display text-xl font-bold text-slate-900">Belum ada riwayat tiket</h3>
          <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Pesanan tiket yang sudah kamu buat akan muncul di sini.</p>
          <a href="#" @click.prevent="window.navigateTo('select-ticket')" class="btn-primary mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-aqua px-6 text-sm font-bold text-white transition hover:bg-ocean">Pesan Tiket <iconify-icon icon="lucide:arrow-right"></iconify-icon></a>
        </div>
        <div id="ticket-history-list" class="mt-8 grid gap-5 md:grid-cols-2"></div>
      </main>
      <UserFooter />
    </div>
  </div>

  <!-- Mobile Menu Overlay -->
  <div id="mobileMenu" class="mobile-menu fixed inset-0 z-[100] bg-slate-900/98 backdrop-blur-xl">
    <div class="flex items-center justify-between px-6 py-5"><a href="#" @click.prevent="window.navigateTo('home');window.toggleMobileMenu(false)" class="flex items-center gap-3 text-white"><span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean shadow-lg"><iconify-icon icon="lucide:waves" class="text-2xl"></iconify-icon></span><span class="font-display text-lg font-extrabold tracking-tight">CITRALAND<span class="text-cyan-200">.</span></span></a><button @click.prevent="window.toggleMobileMenu(false)" class="flex h-11 w-11 items-center justify-center rounded-xl text-white transition hover:bg-white/10"><iconify-icon icon="lucide:x" class="text-2xl"></iconify-icon></button></div>
    <nav class="flex flex-col items-center gap-6 px-6 pt-16 text-lg font-medium text-white">
      <a href="#" @click.prevent="window.navigateTo('home');window.toggleMobileMenu(false)" class="transition hover:text-cyan-300">Home</a>
      <a href="#" @click.prevent="window.navigateTo('home');window.toggleMobileMenu(false)" class="transition hover:text-cyan-300">Fasilitas</a>
      <a href="#" @click.prevent="window.navigateTo('home');window.toggleMobileMenu(false)" class="transition hover:text-cyan-300">Harga</a>
      <a href="#" @click.prevent="window.navigateTo('home');window.toggleMobileMenu(false)" class="transition hover:text-cyan-300">Galeri</a>
      <a href="#" @click.prevent="window.navigateTo('home');window.toggleMobileMenu(false)" class="transition hover:text-cyan-300">Tentang</a>
      <div class="mt-6 flex flex-col gap-3 w-full max-w-xs">
        <a id="mobile-nav-login" href="#" @click.prevent="window.navigateTo('login');window.toggleMobileMenu(false)" class="flex items-center justify-center gap-2 rounded-full border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ocean"><iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon> Masuk</a>
        <div id="mobile-nav-profile" class="w-full" style="display: none">
          <button id="mobile-nav-profile-trigger" type="button" aria-expanded="false" aria-haspopup="true" @click.stop="window.toggleProfileMenu('mobile')" class="flex w-full items-center justify-center gap-2 rounded-full border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            <iconify-icon icon="lucide:user-round" class="text-base"></iconify-icon>
            <span id="mobile-nav-profile-name">Profil</span>
            <iconify-icon icon="lucide:chevron-down" class="text-sm"></iconify-icon>
          </button>
          <div id="mobile-nav-profile-dropdown" class="hidden mt-2 rounded-2xl border border-white/15 bg-white/10 p-2">
            <p id="mobile-nav-profile-email" class="truncate px-3 py-2 text-center text-sm text-white/70"></p>
            <button type="button" @click="window.navigateTo('ticket-history')" class="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-white/10">
              <iconify-icon icon="lucide:history"></iconify-icon> Riwayat Tiket
            </button>
            <button type="button" @click="window.logoutUser()" class="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-white/10">
              <iconify-icon icon="lucide:log-out"></iconify-icon> Keluar
            </button>
          </div>
        </div>
        <a href="#harga" @click="window.toggleMobileMenu(false)" class="btn-primary flex items-center justify-center gap-2 rounded-full bg-aqua px-5 py-3 text-sm font-bold text-white transition hover:bg-ocean">Pesan Tiket <iconify-icon icon="lucide:arrow-up-right" class="text-lg"></iconify-icon></a>
      </div>
    </nav>
  </div>

  <!-- Toast -->
  <div id="toast" class="toast fixed bottom-6 left-1/2 z-[150] flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-2xl border border-white/10"><iconify-icon id="toast-icon" icon="lucide:check-circle" class="text-emerald-400 text-xl"></iconify-icon><span id="toast-message" class="text-sm font-medium">Berhasil!</span></div>
</template>
