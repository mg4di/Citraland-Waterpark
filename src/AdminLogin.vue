<script setup>
import { useRouter } from 'vue-router'
import { grantAdminDemoAccess } from './admin-session.js'

const router = useRouter()

function enterAdmin() {
  grantAdminDemoAccess()
  router.push({ name: 'admin-dashboard' })
}
</script>

<template>
  <section class="relative min-h-screen overflow-hidden bg-slate-900">
    <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-ocean to-[#20b8c5]"></div>
    <div class="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full border-[42px] border-white/10 animate-pulse-ring"></div>
    <div class="absolute -bottom-56 -left-24 h-[470px] w-[470px] rounded-full border-[28px] border-cyan-200/10 animate-pulse-ring" style="animation-delay:1.5s"></div>
    <div class="absolute right-[12%] top-[20%] h-24 w-24 rounded-full bg-cyan-200/10 blur-2xl animate-float"></div>

    <main class="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12 lg:px-10">
      <div class="animate-card-entry grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/30 lg:grid-cols-[.9fr_1.1fr]">
        <aside class="aside-panel relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div class="absolute -right-20 top-20 h-64 w-64 rounded-full border-[24px] border-white/10 animate-pulse-ring"></div>
          <div class="relative z-10 animate-slide-in-left">
            <a href="/" class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-cyan-100 transition hover:bg-white/25">
              <iconify-icon icon="lucide:waves" class="text-3xl"></iconify-icon>
            </a>
            <p class="mt-10 text-sm font-bold uppercase tracking-[.22em] text-cyan-100">Citraland Waterpark Admin</p>
            <h1 class="mt-4 max-w-sm font-display text-4xl font-extrabold leading-tight tracking-tight">Kelola Citraland Waterpark.</h1>
            <p class="mt-6 max-w-sm leading-7 text-white/75">Pantau aktivitas, kelola pemesanan, dan atur informasi waterpark dari satu dashboard.</p>
          </div>
          <div class="relative z-10 mt-14 space-y-4 animate-slide-in-left delay-300">
            <div class="feature-card rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div class="flex items-start gap-4">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-200/20 text-cyan-100"><iconify-icon icon="lucide:ticket-check" class="text-xl"></iconify-icon></span>
                <div><p class="font-bold">Kelola pemesanan</p><p class="mt-1 text-sm leading-6 text-white/65">Lihat booking dan status tiket pengunjung.</p></div>
              </div>
            </div>
            <div class="feature-card rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div class="flex items-start gap-4">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-200/20 text-cyan-100"><iconify-icon icon="lucide:chart-no-axes-combined" class="text-xl"></iconify-icon></span>
                <div><p class="font-bold">Pantau performa</p><p class="mt-1 text-sm leading-6 text-white/65">Akses ringkasan dan laporan waterpark.</p></div>
              </div>
            </div>
          </div>
        </aside>

        <section class="p-7 sm:p-10 lg:p-12 animate-slide-in-right">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-bold uppercase tracking-[.2em] text-ocean">Admin portal</p>
              <h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900">Masuk ke dashboard</h2>
              <p class="mt-3 text-sm leading-6 text-slate-500">Gunakan formulir demo untuk membuka halaman admin.</p>
            </div>
            <a href="/" aria-label="Kembali ke halaman utama" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all hover:border-aqua hover:text-ocean hover:rotate-90 duration-300">
              <iconify-icon icon="lucide:x"></iconify-icon>
            </a>
          </div>

          <form class="mt-8" @submit.prevent="enterAdmin">
            <div class="animate-fade-in-up delay-200">
              <label for="admin-email" class="mb-2 block text-sm font-bold text-slate-700">Alamat email</label>
              <div class="relative">
                <iconify-icon icon="lucide:mail" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon>
                <input id="admin-email" type="email" autocomplete="username" placeholder="admin@bluehaven.id" class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400">
              </div>
            </div>
            <div class="mt-5 animate-fade-in-up delay-300">
              <label for="admin-password" class="mb-2 block text-sm font-bold text-slate-700">Kata sandi</label>
              <div class="relative">
                <iconify-icon icon="lucide:lock-keyhole" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon>
                <input id="admin-password" type="password" autocomplete="current-password" placeholder="Masukkan kata sandi" class="input-field h-[52px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-slate-400">
              </div>
            </div>
            <div class="mt-5 flex items-center justify-between animate-fade-in-up delay-400">
              <label class="flex cursor-pointer items-center gap-3 text-sm text-slate-600"><input type="checkbox" class="checkbox-custom h-4 w-4 rounded border-slate-300"><span>Ingat saya</span></label>
              <span class="flex items-center gap-1.5 text-xs text-emerald-600"><iconify-icon icon="lucide:shield-check"></iconify-icon> Sesi demo</span>
            </div>
            <button type="submit" class="btn-primary mt-7 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-aqua px-6 text-sm font-bold text-white shadow-lg shadow-cyan-900/15 transition-all hover:bg-ocean hover:shadow-xl active:scale-[0.98] animate-fade-in-up delay-500">
              <span>Masuk ke Admin</span>
              <iconify-icon icon="lucide:arrow-right" class="text-lg"></iconify-icon>
            </button>
          </form>

          <p class="mt-8 text-center text-sm text-slate-500 animate-fade-in-up delay-800">Mode demo: email dan kata sandi tidak diperlukan.</p>
          <div class="mt-7 flex items-center justify-center gap-5 border-t border-slate-100 pt-6 text-xs text-slate-400">
            <span class="flex items-center gap-1.5"><iconify-icon icon="lucide:lock" class="text-emerald-500"></iconify-icon> SSL Secure</span>
            <a href="/" class="flex items-center gap-1.5 transition hover:text-ocean"><iconify-icon icon="lucide:arrow-left"></iconify-icon> Halaman utama</a>
          </div>
        </section>
      </div>
    </main>
  </section>
</template>
