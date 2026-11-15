<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { initializeAdminPage } from "./legacy/admin-page.js";
import AdminHeader from "./components/admin/AdminHeader.vue";
import AdminSidebar from "./components/admin/AdminSidebar.vue";

const window = globalThis.window;
const router = useRouter();
let cleanup;
onMounted(() => {
  cleanup = initializeAdminPage(() => router.push({ name: "admin-login" }));
});
onBeforeUnmount(() => cleanup?.());
</script>

<template>
  <div
    id="admin-root"
    class="min-h-screen bg-slate-50 font-sans text-slate-800"
  >
    <AdminSidebar />

    <!-- MAIN SHELL -->
    <div class="main-shell ml-64 transition-all duration-300">
      <AdminHeader />

      <!-- ==================== PAGE: DASHBOARD ==================== -->
      <main id="page-dashboard" class="page-view active p-5 sm:p-8">
        <div class="mx-auto max-w-[1500px]">
          <div
            class="flex flex-col justify-between gap-5 xl:flex-row xl:items-end animate-fade-in-up"
          >
            <div>
              <p class="text-sm font-bold uppercase tracking-[.18em] text-ocean">
                Ringkasan bisnis
              </p>
              <h1 class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p class="mt-2 text-sm text-slate-500">
                Pantau performa Citraland Waterpark. Data diperbarui otomatis.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button
                id="export-report-btn"
                class="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-aqua hover:text-ocean"
              >
                <iconify-icon icon="lucide:download"></iconify-icon>
                <span class="hidden sm:inline">Export laporan</span>
              </button>
              <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <iconify-icon icon="lucide:calendar-days" class="text-ocean"></iconify-icon>
                <input
                  id="dash-date-from"
                  type="date"
                  aria-label="Tanggal mulai dashboard"
                  class="h-7 rounded-lg bg-transparent text-xs font-semibold text-slate-600 outline-none"
                />
                <span class="text-xs text-slate-400">–</span>
                <input
                  id="dash-date-to"
                  type="date"
                  aria-label="Tanggal akhir dashboard"
                  class="h-7 rounded-lg bg-transparent text-xs font-semibold text-slate-600 outline-none"
                />
              </div>
            </div>
          </div>
          <section class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-1"
            >
              <div class="flex items-start justify-between">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-lagoon text-ocean">
                  <iconify-icon icon="lucide:wallet" class="text-xl"></iconify-icon>
                </span>
              </div>
              <p class="mt-5 text-sm font-medium text-slate-500">Total Revenue</p>
              <p id="dash-revenue" class="mt-1 font-display text-2xl font-extrabold text-slate-900">—</p>
              <p id="dash-revenue-sub" class="mt-2 text-xs text-slate-400">Menunggu data…</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-2"
            >
              <div class="flex items-start justify-between">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <iconify-icon icon="lucide:ticket" class="text-xl"></iconify-icon>
                </span>
              </div>
              <p class="mt-5 text-sm font-medium text-slate-500">Total Bookings</p>
              <p id="dash-bookings" class="mt-1 font-display text-2xl font-extrabold text-slate-900">—</p>
              <p id="dash-bookings-sub" class="mt-2 text-xs text-slate-400">Menunggu data…</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-3"
            >
              <div class="flex items-start justify-between">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <iconify-icon icon="lucide:users" class="text-xl"></iconify-icon>
                </span>
              </div>
              <p class="mt-5 text-sm font-medium text-slate-500">Tiket Terjual</p>
              <p id="dash-visitors" class="mt-1 font-display text-2xl font-extrabold text-slate-900">—</p>
              <p id="dash-visitors-sub" class="mt-2 text-xs text-slate-400">Menunggu data…</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-4"
            >
              <div class="flex items-start justify-between">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <iconify-icon icon="lucide:badge-check" class="text-xl"></iconify-icon>
                </span>
              </div>
              <p class="mt-5 text-sm font-medium text-slate-500">Check-in Hari Ini</p>
              <p id="dash-checkin" class="mt-1 font-display text-2xl font-extrabold text-slate-900">—</p>
              <p id="dash-checkin-sub" class="mt-2 text-xs text-slate-400">Menunggu data…</p>
            </article>
          </section>
          <section class="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <article
              class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-fade-in-up delay-4"
            >
              <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 class="font-display text-lg font-bold text-slate-900">Revenue Trend</h2>
                  <p id="dash-trend-sub" class="mt-1 text-sm text-slate-500">
                    Pendapatan per hari pada periode terpilih
                  </p>
                </div>
                <div class="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span class="flex items-center gap-2">
                    <i class="h-2 w-2 rounded-full bg-aqua"></i>Revenue
                  </span>
                </div>
              </div>
              <div id="dash-revenue-chart" class="mt-6 h-64"></div>
            </article>
            <article
              class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-fade-in-up delay-5"
            >
              <div>
                <h2 class="font-display text-lg font-bold text-slate-900">Booking Status</h2>
                <p class="mt-1 text-sm text-slate-500">Distribusi status pemesanan</p>
              </div>
              <div class="mt-6 flex flex-col items-center justify-center gap-8 sm:flex-row">
                <div
                  id="dash-status-donut"
                  class="donut-chart relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full"
                  style="background: conic-gradient(#e2e8f0 0 100%)"
                >
                  <div class="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <span id="dash-status-total" class="font-display text-2xl font-extrabold text-slate-900">—</span>
                    <span class="text-xs text-slate-400">Total</span>
                  </div>
                </div>
                <div id="dash-status-legend" class="w-full space-y-3 text-sm">
                  <p class="text-sm text-slate-400">Memuat status…</p>
                </div>
              </div>
            </article>
          </section>
          <section class="mt-6 grid gap-6">
            <article
              class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in-up delay-5"
            >
              <div class="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h2 class="font-display text-lg font-bold text-slate-900">Recent Bookings</h2>
                  <p class="mt-1 text-sm text-slate-500">Pemesanan terbaru pada periode ini</p>
                </div>
                <a
                  href="#bookings"
                  class="nav-trigger flex items-center gap-1 text-sm font-bold text-ocean hover:text-aqua"
                  data-page="bookings"
                >
                  Lihat semua <iconify-icon icon="lucide:arrow-up-right"></iconify-icon>
                </a>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full min-w-[760px] text-left text-sm">
                  <thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th class="px-6 py-4 font-bold">Booking ID</th>
                      <th class="px-4 py-4 font-bold">Guest</th>
                      <th class="px-4 py-4 font-bold">Type</th>
                      <th class="px-4 py-4 font-bold">Visit Date</th>
                      <th class="px-4 py-4 font-bold">Status</th>
                      <th class="px-6 py-4 text-right font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody id="dash-recent-body" class="divide-y divide-slate-100">
                    <tr>
                      <td colspan="6" class="px-6 py-12 text-center text-sm text-slate-400">
                        Memuat pemesanan…
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </div>
      </main>

      <!-- ==================== PAGE: BOOKINGS ==================== -->
      <main id="page-bookings" class="page-view p-5 sm:p-8">
        <div class="mx-auto max-w-[1500px]">
          <div
            class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end animate-fade-in-up"
          >
            <div>
              <p
                class="text-sm font-bold uppercase tracking-[.18em] text-ocean"
              >
                Workspace
              </p>
              <h1
                class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900"
              >
                Booking Management
              </h1>
              <p class="mt-2 text-sm text-slate-500">
                Kelola seluruh pemesanan tiket Citraland Waterpark.
              </p>
            </div>
            <button
              id="export-bookings-btn"
              class="flex min-h-10 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-aqua hover:text-ocean sm:self-auto"
            >
              <iconify-icon icon="lucide:download"></iconify-icon> Export
              booking
            </button>
          </div>
          <section class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-1"
            >
              <div class="flex items-start justify-between">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-lagoon text-ocean"
                  ><iconify-icon
                    icon="lucide:ticket"
                    class="text-xl"
                  ></iconify-icon></span
                >
              </div>
              <p class="mt-5 text-sm text-slate-500">Total Bookings</p>
              <p
                class="mt-1 font-display text-2xl font-extrabold text-slate-900"
                id="bk-stat-total"
              >
                —
              </p>
              <p class="mt-2 text-xs text-slate-400">Semua pemesanan</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-3"
            >
              <div class="flex items-start justify-between">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                  ><iconify-icon
                    icon="lucide:badge-check"
                    class="text-xl"
                  ></iconify-icon></span
                >
              </div>
              <p class="mt-5 text-sm text-slate-500">Paid</p>
              <p
                class="mt-1 font-display text-2xl font-extrabold text-slate-900"
                id="bk-stat-confirmed"
              >
                —
              </p>
              <p class="mt-2 text-xs text-slate-400">Pembayaran terverifikasi</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-4"
            >
              <div class="flex items-start justify-between">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500"
                  ><iconify-icon
                    icon="lucide:circle-x"
                    class="text-xl"
                  ></iconify-icon></span
                >
              </div>
              <p class="mt-5 text-sm text-slate-500">Cancelled</p>
              <p
                class="mt-1 font-display text-2xl font-extrabold text-slate-900"
                id="bk-stat-cancelled"
              >
                —
              </p>
              <p class="mt-2 text-xs text-slate-400">Dibatalkan</p>
            </article>
          </section>
          <section
            class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-fade-in-up delay-4"
          >
            <div
              class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
            >
              <div class="flex flex-wrap gap-2" id="bk-status-filters">
                <button
                  data-status="all"
                  class="bk-filter rounded-xl bg-ocean px-4 py-2.5 text-sm font-bold text-white"
                >
                  All <span class="ml-1 text-cyan-100" id="bk-c-all">—</span>
                </button>
                <button
                  data-status="paid"
                  class="bk-filter rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-lagoon hover:text-ocean"
                >
                  Paid <span class="ml-1 text-slate-400" id="bk-c-conf">0</span>
                </button>
                <button
                  data-status="pending"
                  class="bk-filter rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Pending
                  <span class="ml-1 text-slate-400" id="bk-c-comp">0</span>
                </button>
                <button
                  data-status="failed"
                  class="bk-filter rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  Failed
                  <span class="ml-1 text-slate-400" id="bk-c-failed">0</span>
                </button>
                <button
                  data-status="cancelled"
                  class="bk-filter rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  Cancelled
                  <span class="ml-1 text-slate-400" id="bk-c-canc">0</span>
                </button>
              </div>
              <div class="relative">
                <iconify-icon
                  icon="lucide:search"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                ></iconify-icon
                ><input
                  id="bk-search"
                  type="search"
                  placeholder="Cari guest atau booking ID..."
                  class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-50 sm:w-64"
                />
              </div>
            </div>
          </section>
          <section
            class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in-up delay-5"
          >
            <div
              class="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6"
            >
              <div>
                <h2 class="font-display text-lg font-bold text-slate-900">
                  Semua Booking
                </h2>
                <p id="bk-result-count" class="mt-1 text-sm text-slate-500">
                  Memuat pemesanan…
                </p>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[1150px] text-left text-sm">
                <thead
                  class="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"
                >
                  <tr>
                    <th class="px-6 py-4 font-bold">Booking ID</th>
                    <th class="px-4 py-4 font-bold">Guest Name</th>
                    <th class="px-4 py-4 font-bold">Ticket Type</th>
                    <th class="px-4 py-4 font-bold">Visit Date</th>
                    <th class="px-4 py-4 font-bold">Status</th>
                    <th class="px-4 py-4 font-bold">Check-in</th>
                    <th class="px-4 py-4 text-right font-bold">Amount</th>
                    <th class="px-6 py-4 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody
                  id="bk-table-body"
                  class="divide-y divide-slate-100"
                >
                  <tr>
                    <td colspan="8" class="px-6 py-14 text-center text-sm text-slate-400">
                      Memuat pemesanan…
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              class="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row"
            >
              <p class="text-sm text-slate-500">
                Menampilkan
                <b class="text-slate-700" id="bk-page-range">—</b> dari
                <b class="text-slate-700" id="bk-page-total">—</b>
              </p>
              <div class="flex items-center gap-1" id="bk-pagination"></div>
            </div>
          </section>
        </div>
      </main>

      <!-- ==================== PAGE: USERS ==================== -->
      <main id="page-users" class="page-view p-5 sm:p-8">
        <div class="mx-auto max-w-[1500px]">
          <div
            class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end animate-fade-in-up"
          >
            <div>
              <p
                class="text-sm font-bold uppercase tracking-[.18em] text-ocean"
              >
                Workspace
              </p>
              <h1
                class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900"
              >
                User Management
              </h1>
              <p class="mt-2 text-sm text-slate-500">
                Kelola akun pengunjung dan akses member Citraland Waterpark.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button
                id="export-users-btn"
                class="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-aqua hover:text-ocean"
              >
                <iconify-icon icon="lucide:download"></iconify-icon> Export data
              </button>
            </div>
          </div>
          <section class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-1"
            >
              <div class="flex items-start justify-between">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-lagoon text-ocean"
                  ><iconify-icon
                    icon="lucide:users"
                    class="text-xl"
                  ></iconify-icon></span
                >
              </div>
              <p class="mt-5 text-sm text-slate-500">Total Users</p>
              <p
                id="usr-stat-total"
                class="mt-1 font-display text-2xl font-extrabold text-slate-900"
              >
                —
              </p>
              <p class="mt-2 text-xs text-slate-400">Semua akun terdaftar</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-2"
            >
              <div class="flex items-start justify-between">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                  ><iconify-icon
                    icon="lucide:user-check"
                    class="text-xl"
                  ></iconify-icon></span
                >
              </div>
              <p class="mt-5 text-sm text-slate-500">Active Users</p>
              <p
                class="mt-1 font-display text-2xl font-extrabold text-slate-900"
                id="usr-stat-active"
              >
                —
              </p>
              <p class="mt-2 text-xs text-slate-400">Status akun aktif</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-3"
            >
              <div class="flex items-start justify-between">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
                  ><iconify-icon
                    icon="lucide:user-round-x"
                    class="text-xl"
                  ></iconify-icon></span
                >
              </div>
              <p class="mt-5 text-sm text-slate-500">Inactive Users</p>
              <p
                class="mt-1 font-display text-2xl font-extrabold text-slate-900"
                id="usr-stat-inactive"
              >
                —
              </p>
              <p class="mt-2 text-xs text-slate-400">Perlu ditinjau</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-4"
            >
              <div class="flex items-start justify-between">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500"
                  ><iconify-icon
                    icon="lucide:user-round-plus"
                    class="text-xl"
                  ></iconify-icon></span
                >
              </div>
              <p class="mt-5 text-sm text-slate-500">New This Month</p>
              <p
                id="usr-stat-new"
                class="mt-1 font-display text-2xl font-extrabold text-slate-900"
              >
                —
              </p>
              <p id="usr-stat-new-sub" class="mt-2 text-xs text-slate-400">Bulan berjalan</p>
            </article>
          </section>
          <section
            class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-4"
          >
            <div
              class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
            >
              <div class="relative w-full xl:max-w-sm">
                <iconify-icon
                  icon="lucide:search"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                ></iconify-icon
                ><input
                  id="usr-search"
                  type="search"
                  placeholder="Cari nama, email, atau telepon..."
                  class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-50"
                />
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <select
                  id="usr-status-filter"
                  class="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none focus:border-aqua cursor-pointer"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div
              class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"
            >
              <p id="usr-selected-count" class="text-sm text-slate-500">
                0 user dipilih
              </p>
              <div class="flex items-center gap-2">
                <button
                  id="usr-activate-btn"
                  class="flex h-9 items-center gap-2 rounded-lg border border-emerald-200 px-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50"
                >
                  <iconify-icon icon="lucide:user-check"></iconify-icon>
                  Activate
                </button>
                <button
                  id="usr-deactivate-btn"
                  class="flex h-9 items-center gap-2 rounded-lg border border-amber-200 px-3 text-xs font-bold text-amber-600 hover:bg-amber-50"
                >
                  <iconify-icon icon="lucide:user-round-x"></iconify-icon>
                  Deactivate
                </button>
              </div>
            </div>
          </section>
          <section
            class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in-up delay-5"
          >
            <div
              class="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6"
            >
              <div>
                <h2 class="font-display text-lg font-bold text-slate-900">
                  Registered Users
                </h2>
                <p id="usr-result-count" class="mt-1 text-sm text-slate-500">
                  Memuat pengguna…
                </p>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[1100px] text-left text-sm">
                <thead
                  class="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"
                >
                  <tr>
                    <th class="w-12 px-5 py-4">
                      <input
                        id="usr-select-all"
                        type="checkbox"
                        class="h-4 w-4 rounded border-slate-300 accent-ocean cursor-pointer"
                      />
                    </th>
                    <th class="px-4 py-4 font-bold">User</th>
                    <th class="px-4 py-4 font-bold">Email</th>
                    <th class="px-4 py-4 font-bold">Phone</th>
                    <th class="px-4 py-4 font-bold">Join Date</th>
                    <th class="px-4 py-4 font-bold">Bookings</th>
                    <th class="px-4 py-4 text-right font-bold">Spend</th>
                    <th class="px-4 py-4 font-bold">Status</th>
                    <th class="px-5 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody
                  id="usr-table-body"
                  class="divide-y divide-slate-100"
                >
                  <tr>
                    <td colspan="9" class="px-6 py-14 text-center text-sm text-slate-400">
                      Memuat pengguna…
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <!-- ==================== PAGE: CONTENT ==================== -->
      <main id="page-content" class="page-view p-5 sm:p-8">
        <div class="mx-auto max-w-[1500px]">
          <div
            class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end animate-fade-in-up"
          >
            <div>
              <p
                class="text-sm font-bold uppercase tracking-[.18em] text-ocean"
              >
                Workspace
              </p>
              <h1
                class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900"
              >
                Content Management
              </h1>
              <p class="mt-2 text-sm text-slate-500">
                Kelola harga tiket, fasilitas, promosi, dan galeri Citraland
                Waterpark.
              </p>
            </div>
          </div>
          <div
            class="mt-8 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm animate-fade-in-up delay-1"
          >
            <button
              data-ctab="pricing"
              class="ctab-btn active flex items-center gap-2 rounded-xl bg-ocean px-5 py-3 text-sm font-bold text-white"
            >
              <iconify-icon icon="lucide:ticket"></iconify-icon> Ticket Pricing
            </button>
            <button
              data-ctab="facilities"
              class="ctab-btn flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-ocean"
            >
              <iconify-icon icon="lucide:building-2"></iconify-icon> Facilities
            </button>
            <button
              data-ctab="promotions"
              class="ctab-btn flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-ocean"
            >
              <iconify-icon icon="lucide:badge-percent"></iconify-icon>
              Promotions
            </button>
            <button
              data-ctab="gallery"
              class="ctab-btn flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-ocean"
            >
              <iconify-icon icon="lucide:images"></iconify-icon> Gallery
            </button>
          </div>
          <!-- Pricing Tab -->
          <section id="ctab-pricing" class="tab-panel active mt-6">
            <div class="mb-5 flex items-center justify-between">
              <div>
                <h2 class="font-display text-xl font-bold text-slate-900">
                  Ticket Pricing
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  Atur harga dan tampilan tiket.
                </p>
              </div>
              <span
                id="pricing-count-badge"
                class="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"
                >— Published</span
              >
            </div>
            <div class="grid gap-5 xl:grid-cols-3" id="pricing-cards"></div>
          </section>
          <!-- Facilities Tab -->
          <section id="ctab-facilities" class="tab-panel mt-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-display text-xl font-bold text-slate-900">
                  Facilities
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  Kelola fasilitas landing page.
                </p>
              </div>
              <button
                id="add-facility-btn"
                class="flex min-h-11 items-center gap-2 rounded-xl bg-ocean px-4 text-sm font-bold text-white hover:bg-ocean/90"
              >
                <iconify-icon icon="lucide:plus"></iconify-icon> Tambah
                fasilitas
              </button>
            </div>
            <div
              class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <table class="w-full text-left text-sm">
                <thead
                  class="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"
                >
                  <tr>
                    <th class="px-6 py-4 font-bold">Nama</th>
                    <th class="px-4 py-4 font-bold">Deskripsi</th>
                    <th class="px-4 py-4 font-bold">Icon</th>
                    <th class="px-4 py-4 font-bold">Status</th>
                    <th class="px-6 py-4 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody
                  id="fac-table-body"
                  class="divide-y divide-slate-100"
                ></tbody>
              </table>
            </div>
          </section>
          <!-- Promotions Tab -->
          <section id="ctab-promotions" class="tab-panel mt-6">
            <div class="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
              <div
                class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 class="font-display text-xl font-bold text-slate-900">
                  Create Promotion
                </h2>
                <p class="mt-1 text-sm text-slate-500">Buat kode promo baru.</p>
                <div class="mt-6 space-y-4">
                  <label class="block text-sm font-bold text-slate-700"
                    >Discount code<input
                      id="promo-code"
                      placeholder="Contoh: CITRALAND10"
                      class="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 uppercase font-semibold outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-100"
                  /></label>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <label class="block text-sm font-bold text-slate-700"
                      >Type<select
                        id="promo-type"
                        class="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-aqua cursor-pointer"
                      >
                        <option>Percentage (%)</option>
                        <option>Nominal (Rp)</option>
                      </select></label
                    ><label class="block text-sm font-bold text-slate-700"
                      >Amount<input
                        id="promo-amount"
                        type="number"
                        min="0"
                        placeholder="10"
                        class="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-100"
                    /></label>
                  </div>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <label class="block text-sm font-bold text-slate-700"
                      >Start date<input
                        id="promo-start"
                        type="date"
                        class="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-aqua cursor-pointer" /></label
                    ><label class="block text-sm font-bold text-slate-700"
                      >End date<input
                        id="promo-end"
                        type="date"
                        class="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-aqua cursor-pointer"
                    /></label>
                  </div>
                  <button
                    id="publish-promo-btn"
                    class="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ocean font-bold text-white hover:bg-ocean/90"
                  >
                    <iconify-icon icon="lucide:megaphone"></iconify-icon>
                    Publish promotion
                  </button>
                </div>
              </div>
              <div
                class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="font-display text-xl font-bold text-slate-900">
                      Active Promotions
                    </h2>
                    <p class="mt-1 text-sm text-slate-500">
                      Promo yang sedang berjalan.
                    </p>
                  </div>
                  <span
                    id="promo-active-count"
                    class="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"
                    >— Active</span
                  >
                </div>
                <div id="promo-list" class="mt-6 space-y-3"></div>
              </div>
            </div>
          </section>
          <!-- Gallery Tab -->
          <section id="ctab-gallery" class="tab-panel mt-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-display text-xl font-bold text-slate-900">
                  Gallery
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  Kelola foto galeri website.
                </p>
              </div>
              <span
                id="gallery-count-badge"
                class="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"
                >— Published</span
              >
            </div>
            <div
              id="drop-zone"
              class="drop-zone mt-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-lagoon/60 p-8 text-center hover:border-aqua"
            >
              <span
                class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-ocean shadow-sm"
                ><iconify-icon
                  icon="lucide:cloud-upload"
                  class="text-2xl"
                ></iconify-icon
              ></span>
              <h3 class="mt-4 font-display font-bold">
                Drag & drop images here
              </h3>
              <p class="mt-1 text-sm text-slate-500">
                atau klik untuk memilih file · JPG, PNG, WebP maks 5MB
              </p>
              <input
                id="gallery-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                class="hidden"
              /><button
                id="choose-gallery-btn"
                type="button"
                class="mt-4 rounded-xl border border-aqua px-4 py-2 text-sm font-bold text-ocean hover:bg-aqua hover:text-white"
              >
                Choose files
              </button>
            </div>
            <div
              id="gallery-grid"
              class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            ></div>
          </section>
        </div>
      </main>

      <!-- ==================== PAGE: ANALYTICS ==================== -->
      <main id="page-analytics" class="page-view p-5 sm:p-8">
        <div class="mx-auto max-w-[1500px]">
          <div
            class="flex flex-col justify-between gap-5 lg:flex-row lg:items-end animate-fade-in-up"
          >
            <div>
              <p
                class="text-sm font-bold uppercase tracking-[.18em] text-ocean"
              >
                Business intelligence
              </p>
              <h1
                class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900"
              >
                Analytics & Reports
              </h1>
              <p class="mt-2 text-sm text-slate-500">
                Pahami performa tiket dan destinasi di seluruh platform.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <div class="relative">
                <button
                  id="analytics-export-btn"
                  class="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-aqua hover:text-ocean"
                >
                  <iconify-icon icon="lucide:download"></iconify-icon> Export
                </button>
              </div>
              <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <iconify-icon icon="lucide:calendar-days" class="text-ocean"></iconify-icon>
                <input
                  id="an-date-from"
                  type="date"
                  aria-label="Tanggal mulai analytics"
                  class="h-7 rounded-lg bg-transparent text-xs font-semibold text-slate-600 outline-none"
                />
                <span class="text-xs text-slate-400">–</span>
                <input
                  id="an-date-to"
                  type="date"
                  aria-label="Tanggal akhir analytics"
                  class="h-7 rounded-lg bg-transparent text-xs font-semibold text-slate-600 outline-none"
                />
              </div>
            </div>
          </div>
          <section class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-1"
            >
              <div class="flex items-start justify-between">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-lagoon text-ocean"
                  ><iconify-icon
                    icon="lucide:wallet"
                    class="text-xl"
                  ></iconify-icon></span
                >
              </div>
              <p class="mt-5 text-sm text-slate-500">Total Revenue</p>
              <p id="an-revenue" class="mt-1 font-display text-2xl font-extrabold text-slate-900">—</p>
              <p id="an-revenue-sub" class="mt-2 text-xs text-slate-400">vs. periode sebelumnya</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-2"
            >
              <div class="flex items-start justify-between">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <iconify-icon icon="lucide:ticket-check" class="text-xl"></iconify-icon>
                </span>
              </div>
              <p class="mt-5 text-sm text-slate-500">Total Bookings</p>
              <p id="an-bookings" class="mt-1 font-display text-2xl font-extrabold text-slate-900">—</p>
              <p id="an-bookings-sub" class="mt-2 text-xs text-slate-400">vs. periode sebelumnya</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-3"
            >
              <div class="flex items-start justify-between">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <iconify-icon icon="lucide:users-round" class="text-xl"></iconify-icon>
                </span>
              </div>
              <p class="mt-5 text-sm text-slate-500">Tiket Terjual</p>
              <p id="an-visitors" class="mt-1 font-display text-2xl font-extrabold text-slate-900">—</p>
              <p id="an-visitors-sub" class="mt-2 text-xs text-slate-400">Termasuk semua qty tiket lunas</p>
            </article>
            <article
              class="stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in-up delay-4"
            >
              <div class="flex items-start justify-between">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <iconify-icon icon="lucide:badge-dollar-sign" class="text-xl"></iconify-icon>
                </span>
              </div>
              <p class="mt-5 text-sm text-slate-500">Rentang Harga Tiket</p>
              <p id="an-price-range" class="mt-1 font-display text-2xl font-extrabold text-slate-900">—</p>
              <p class="mt-2 text-xs text-slate-400">Harga aktif di database</p>
            </article>
          </section>
          <section class="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
            <article
              class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-fade-in-up delay-4"
            >
              <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 class="font-display text-lg font-bold text-slate-900">Revenue by Month</h2>
                  <p id="an-monthly-sub" class="mt-1 text-sm text-slate-500">Revenue bulanan</p>
                </div>
                <div class="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span class="flex items-center gap-2"><i class="h-2 w-2 rounded-full bg-aqua"></i>Revenue</span>
                </div>
              </div>
              <div id="an-monthly-chart" class="mt-6 h-64"></div>
            </article>
            <article
              class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-fade-in-up delay-5"
            >
              <div>
                <h2 class="font-display text-lg font-bold text-slate-900">Ticket Distribution</h2>
                <p class="mt-1 text-sm text-slate-500">Komposisi tiket terjual</p>
              </div>
              <div class="mt-6 flex flex-col items-center justify-center gap-7 sm:flex-row">
                <div
                  id="an-ticket-donut"
                  class="donut-chart relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full"
                  style="background: conic-gradient(#e2e8f0 0 100%)"
                >
                  <div class="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <span id="an-ticket-total" class="font-display text-2xl font-extrabold text-slate-900">—</span>
                    <span class="text-xs text-slate-400">Tiket</span>
                  </div>
                </div>
                <div id="an-ticket-legend" class="w-full space-y-4 text-sm">
                  <p class="text-sm text-slate-400">Memuat komposisi…</p>
                </div>
              </div>
            </article>
          </section>
          <section class="mt-6 grid gap-6 xl:grid-cols-2">
            <article
              class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-fade-in-up delay-5"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-display text-lg font-bold text-slate-900">
                    Peak Hours Heatmap
                  </h2>
                  <p class="mt-1 text-sm text-slate-500">
                    Pola kunjungan berdasarkan hari & jam
                  </p>
                </div>
                <span
                  id="an-heatmap-badge"
                  class="rounded-lg bg-lagoon px-3 py-2 text-xs font-bold text-ocean"
                  >—</span
                >
              </div>
              <div class="mt-6 overflow-x-auto">
                <div class="min-w-[560px]">
                  <div
                    class="mb-2 grid grid-cols-[70px_repeat(7,1fr)] gap-1 text-[10px] text-slate-400"
                  >
                    <span></span><span class="text-center">08</span
                    ><span class="text-center">10</span
                    ><span class="text-center">12</span
                    ><span class="text-center">14</span
                    ><span class="text-center">16</span
                    ><span class="text-center">18</span
                    ><span class="text-center">20</span>
                  </div>
                  <div id="heatmap-grid" class="space-y-1 text-[11px]"></div>
                  <div
                    class="mt-4 flex items-center justify-end gap-2 text-[10px] text-slate-400"
                  >
                    <span>Sepi</span><i class="h-3 w-3 rounded bg-cyan-50"></i
                    ><i class="h-3 w-3 rounded bg-cyan-100"></i
                    ><i class="h-3 w-3 rounded bg-aqua/50"></i
                    ><i class="h-3 w-3 rounded bg-aqua/70"></i
                    ><i class="h-3 w-3 rounded bg-ocean"></i><span>Ramai</span>
                  </div>
                </div>
              </div>
            </article>
            <article
              class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-fade-in-up delay-6"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-display text-lg font-bold text-slate-900">
                    User Growth
                  </h2>
                  <p class="mt-1 text-sm text-slate-500">
                    Pertumbuhan member terdaftar
                  </p>
                </div>
                <span
                  id="an-new-users"
                  class="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"
                  >— pengguna baru</span
                >
              </div>
              <div class="mt-6 h-56">
                <svg
                  viewBox="0 0 720 220"
                  preserveAspectRatio="none"
                  class="h-full w-full"
                >
                  <defs>
                    <linearGradient id="ugFill" x1="0" x2="0" y1="0" y2="1">
                      <stop
                        offset="0"
                        stop-color="#0097A7"
                        stop-opacity=".22"
                      />
                      <stop offset="1" stop-color="#0097A7" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <g stroke="#e2e8f0" stroke-dasharray="3 5">
                    <line x1="45" y1="25" x2="700" y2="25" />
                    <line x1="45" y1="75" x2="700" y2="75" />
                    <line x1="45" y1="125" x2="700" y2="125" />
                    <line x1="45" y1="175" x2="700" y2="175" />
                  </g>
                  <path
                    class="chart-fill"
                    d="M45 178 C90 166 105 160 140 164 S185 145 215 150 S255 130 285 137 S330 112 360 120 S405 105 435 108 S480 81 510 91 S555 69 585 76 S630 46 660 53 S685 37 700 32 L700 190 L45 190Z"
                    fill="url(#ugFill)"
                  />
                  <path
                    class="chart-line"
                    d="M45 178 C90 166 105 160 140 164 S185 145 215 150 S255 130 285 137 S330 112 360 120 S405 105 435 108 S480 81 510 91 S555 69 585 76 S630 46 660 53 S685 37 700 32"
                    fill="none"
                    stroke="#0097A7"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                  <g class="chart-fill">
                    <circle
                      cx="140"
                      cy="164"
                      r="4"
                      fill="#0097A7"
                      stroke="white"
                      stroke-width="2"
                    />
                    <circle
                      cx="285"
                      cy="137"
                      r="4"
                      fill="#0097A7"
                      stroke="white"
                      stroke-width="2"
                    />
                    <circle
                      cx="435"
                      cy="108"
                      r="4"
                      fill="#0097A7"
                      stroke="white"
                      stroke-width="2"
                    />
                    <circle
                      cx="585"
                      cy="76"
                      r="4"
                      fill="#0097A7"
                      stroke="white"
                      stroke-width="2"
                    />
                    <circle
                      cx="700"
                      cy="32"
                      r="5"
                      fill="#00BCD4"
                      stroke="white"
                      stroke-width="3"
                    />
                  </g>
                  <g fill="#94a3b8" font-size="11">
                    <text x="45" y="212">Jan</text>
                    <text x="155" y="212">Mar</text>
                    <text x="270" y="212">Mei</text>
                    <text x="385" y="212">Jul</text>
                    <text x="500" y="212">Sep</text>
                    <text x="615" y="212">Nov</text>
                  </g>
                </svg>
              </div>
            </article>
          </section>
        </div>
      </main>

      <!-- ==================== PAGE: SETTINGS ==================== -->
      <main id="page-settings" class="page-view p-5 sm:p-8">
        <div class="mx-auto max-w-3xl">
          <div class="animate-fade-in-up">
            <p class="text-sm font-bold uppercase tracking-[.18em] text-ocean">
              System
            </p>
            <h1
              class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Pengaturan
            </h1>
            <p class="mt-2 text-sm text-slate-500">
              Konfigurasi sistem dan preferensi admin.
            </p>
          </div>
          <div class="mt-8 space-y-6">
            <div
              class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-1"
            >
              <h2 class="font-display text-lg font-bold text-slate-900">
                Profil Administrator
              </h2>
              <p id="admin-profile-status" class="mt-1 text-sm text-slate-500">
                Memuat profil dari database…
              </p>
              <div class="mt-5 grid gap-4 sm:grid-cols-2">
                <label class="block text-sm font-bold text-slate-700"
                  >Nama lengkap<input
                    id="admin-profile-name"
                    autocomplete="name"
                    class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-50" /></label
                ><label class="block text-sm font-bold text-slate-700"
                  >Email<input
                    id="admin-profile-email"
                    type="email"
                    readonly
                    class="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none" /></label
                ><label class="block text-sm font-bold text-slate-700"
                  >Role<input
                    id="admin-profile-role"
                    disabled
                    class="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none" /></label
                ><label class="block text-sm font-bold text-slate-700"
                  >Telepon<input
                    id="admin-profile-phone"
                    type="tel"
                    autocomplete="tel"
                    placeholder="08xxxxxxxxxx"
                    class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-50"
                /></label>
              </div>
              <div class="mt-5 flex justify-end">
                <button
                  id="save-admin-profile-btn"
                  class="flex min-h-10 items-center gap-2 rounded-xl bg-ocean px-5 text-sm font-bold text-white hover:bg-ocean/90 disabled:opacity-60"
                >
                  <iconify-icon icon="lucide:save"></iconify-icon> Simpan
                  perubahan
                </button>
              </div>
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-3"
            >
              <h2 class="font-display text-lg font-bold text-slate-900">
                Keamanan
              </h2>
              <div class="mt-5 space-y-4">
                <label class="block text-sm font-bold text-slate-700"
                  >Password lama<input
                    id="admin-current-password"
                    type="password"
                    autocomplete="current-password"
                    placeholder="••••••••"
                    class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-50" /></label
                ><label class="block text-sm font-bold text-slate-700"
                  >Password baru<input
                    id="admin-new-password"
                    type="password"
                    autocomplete="new-password"
                    placeholder="Minimal 8 karakter"
                    class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-50"
                /></label>
              </div>
              <div class="mt-5 flex justify-end">
                <button
                  id="update-admin-password-btn"
                  class="flex min-h-10 items-center gap-2 rounded-xl bg-ocean px-5 text-sm font-bold text-white hover:bg-ocean/90 disabled:opacity-60"
                >
                  <iconify-icon icon="lucide:shield-check"></iconify-icon>
                  Update password
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- ==================== PAGE: HELP ==================== -->
      <main id="page-help" class="page-view p-5 sm:p-8">
        <div class="mx-auto max-w-3xl">
          <div class="animate-fade-in-up">
            <p class="text-sm font-bold uppercase tracking-[.18em] text-ocean">
              System
            </p>
            <h1
              class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Pusat Bantuan
            </h1>
            <p class="mt-2 text-sm text-slate-500">
              Temukan jawaban dan panduan penggunaan sistem.
            </p>
          </div>
          <div class="mt-8 space-y-4">
            <div
              class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-1"
            >
              <div class="flex items-start gap-4">
                <span
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lagoon text-ocean"
                  ><iconify-icon
                    icon="lucide:book-open"
                    class="text-xl"
                  ></iconify-icon
                ></span>
                <div>
                  <h3 class="font-display text-base font-bold text-slate-900">
                    Panduan Penggunaan
                  </h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Pelajari cara menggunakan semua fitur admin panel Citraland
                    Waterpark.
                  </p>
                  <a
                    href="#"
                    class="mt-3 inline-flex items-center gap-1 text-sm font-bold text-ocean hover:text-aqua"
                    >Baca panduan
                    <iconify-icon icon="lucide:arrow-right"></iconify-icon
                  ></a>
                </div>
              </div>
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-2"
            >
              <div class="flex items-start gap-4">
                <span
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"
                  ><iconify-icon
                    icon="lucide:video"
                    class="text-xl"
                  ></iconify-icon
                ></span>
                <div>
                  <h3 class="font-display text-base font-bold text-slate-900">
                    Video Tutorial
                  </h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Tonton video tutorial untuk pemahaman yang lebih baik.
                  </p>
                  <a
                    href="#"
                    class="mt-3 inline-flex items-center gap-1 text-sm font-bold text-ocean hover:text-aqua"
                    >Lihat video
                    <iconify-icon icon="lucide:arrow-right"></iconify-icon
                  ></a>
                </div>
              </div>
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-3"
            >
              <div class="flex items-start gap-4">
                <span
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500"
                  ><iconify-icon
                    icon="lucide:message-circle"
                    class="text-xl"
                  ></iconify-icon
                ></span>
                <div>
                  <h3 class="font-display text-base font-bold text-slate-900">
                    Hubungi Support
                  </h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Tim support kami siap membantu 24/7.
                  </p>
                  <div class="mt-3 flex gap-3">
                    <a
                      href="#"
                      class="inline-flex items-center gap-1 text-sm font-bold text-ocean hover:text-aqua"
                      ><iconify-icon icon="lucide:mail"></iconify-icon> Email</a
                    ><a
                      href="#"
                      class="inline-flex items-center gap-1 text-sm font-bold text-ocean hover:text-aqua"
                      ><iconify-icon icon="lucide:phone"></iconify-icon>
                      Telepon</a
                    >
                  </div>
                </div>
              </div>
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-4"
            >
              <div>
                <h3 class="font-display text-base font-bold text-slate-900">
                  FAQ
                </h3>
                <div class="mt-4 space-y-3">
                  <details class="group rounded-xl border border-slate-100">
                    <summary
                      class="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Bagaimana cara menambah tiket baru?
                      <iconify-icon
                        icon="lucide:chevron-down"
                        class="transition group-open:rotate-180"
                      ></iconify-icon>
                    </summary>
                    <div
                      class="border-t border-slate-100 p-4 text-sm text-slate-500"
                    >
                      Buka Content Management → Harga Tiket, ubah harga pada
                      jenis tiket yang ingin disesuaikan, lalu klik Simpan.
                    </div>
                  </details>
                  <details class="group rounded-xl border border-slate-100">
                    <summary
                      class="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cara export laporan keuangan?
                      <iconify-icon
                        icon="lucide:chevron-down"
                        class="transition group-open:rotate-180"
                      ></iconify-icon>
                    </summary>
                    <div
                      class="border-t border-slate-100 p-4 text-sm text-slate-500"
                    >
                      Buka Analytics ? klik tombol Export ? pilih format CSV
                      atau PDF.
                    </div>
                  </details>
                  <details class="group rounded-xl border border-slate-100">
                    <summary
                      class="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Bagaimana mengelola promo?
                      <iconify-icon
                        icon="lucide:chevron-down"
                        class="transition group-open:rotate-180"
                      ></iconify-icon>
                    </summary>
                    <div
                      class="border-t border-slate-100 p-4 text-sm text-slate-500"
                    >
                      Buka Content Management ? Promotions ? isi form dan klik
                      Publish.
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- OVERLAYS & MODALS -->
    <div
      id="mobile-overlay"
      class="fixed inset-0 z-30 hidden bg-slate-950/30 md:hidden"
    ></div>

    <!-- User Modal -->
    <div
      id="user-modal"
      class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
    >
      <div
        class="modal-panel w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        <div
          class="flex items-start justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <p class="text-sm font-bold uppercase tracking-[.18em] text-ocean">
              User profile
            </p>
            <h2
              id="user-modal-title"
              class="mt-2 font-display text-2xl font-bold text-slate-900"
            >
              Edit user
            </h2>
          </div>
          <button
            id="close-user-modal"
            class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50"
          >
            <iconify-icon icon="lucide:x"></iconify-icon>
          </button>
        </div>
        <form id="user-form" class="p-6 grid gap-5 sm:grid-cols-2">
          <label class="text-sm font-bold text-slate-700"
            >Nama lengkap<input
              id="um-name"
              required
              class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-50" /></label
          ><label class="text-sm font-bold text-slate-700"
            >Email<input
              id="um-email"
              type="email"
              required
              class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-50" /></label
          ><label class="text-sm font-bold text-slate-700"
            >Telepon<input
              id="um-phone"
              class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-50" /></label
          ><label class="text-sm font-bold text-slate-700"
            >Status<select
              id="um-status"
              class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-aqua cursor-pointer"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select></label
          >
          <div class="flex justify-end gap-3 sm:col-span-2 pt-2">
            <button
              type="button"
              id="cancel-user-modal"
              class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:border-aqua hover:text-ocean"
            >
              Batal</button
            ><button
              type="submit"
              class="rounded-xl bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-ocean/90"
            >
              Simpan user
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Facility Modal -->
    <div
      id="facility-modal"
      class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
    >
      <div
        class="modal-panel w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <p class="text-sm font-bold uppercase tracking-[.18em] text-ocean">
              Facility editor
            </p>
            <h2
              id="fac-modal-title"
              class="mt-2 font-display text-2xl font-bold text-slate-900"
            >
              Tambah fasilitas
            </h2>
          </div>
          <button
            id="close-facility-modal"
            class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50"
          >
            <iconify-icon icon="lucide:x"></iconify-icon>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <label class="block text-sm font-bold text-slate-700"
            >Nama<input
              id="fac-name"
              placeholder="Contoh: Kolam Ombak"
              class="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-100" /></label
          ><label class="block text-sm font-bold text-slate-700"
            >Deskripsi<textarea
              id="fac-desc"
              placeholder="Deskripsi singkat"
              class="mt-2 h-24 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-100"
            ></textarea>
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-bold text-slate-700"
              >Icon<input
                id="fac-icon"
                placeholder="lucide:waves"
                class="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-aqua" /></label
            ><label class="block text-sm font-bold text-slate-700"
              >Status<select
                id="fac-status"
                class="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-aqua cursor-pointer"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select></label
            >
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button
              id="cancel-facility-modal"
              class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:border-aqua hover:text-ocean"
            >
              Batal</button
            ><button
              id="save-facility-btn"
              class="flex min-h-12 items-center gap-2 rounded-xl bg-ocean px-5 py-3 font-bold text-white hover:bg-ocean/90"
            >
              <iconify-icon icon="lucide:save"></iconify-icon> Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      id="delete-modal"
      class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
    >
      <div
        class="modal-panel w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        <div class="p-6 text-center">
          <span
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500"
            ><iconify-icon
              icon="lucide:alert-triangle"
              class="text-2xl"
            ></iconify-icon
          ></span>
          <h3 class="mt-4 font-display text-lg font-bold text-slate-900">
            Hapus item?
          </h3>
          <p class="mt-2 text-sm text-slate-500" id="delete-message">
            Item ini akan dihapus permanen.
          </p>
        </div>
        <div
          class="flex items-center gap-3 border-t border-slate-100 px-6 py-4"
        >
          <button
            id="delete-cancel-btn"
            class="flex-1 flex h-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Batal</button
          ><button
            id="delete-confirm-btn"
            class="flex-1 flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-500 text-sm font-bold text-white hover:bg-rose-600"
          >
            <iconify-icon icon="lucide:trash-2"></iconify-icon> Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <div
      id="toast-container"
      class="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-3"
    ></div>
  </div>
</template>
