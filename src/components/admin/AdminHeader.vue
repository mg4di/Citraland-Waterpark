<template>
  <header class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-lg px-5 sm:px-8">
    <div class="flex items-center gap-3">
      <button id="mobile-menu-button" type="button" class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 md:hidden"><iconify-icon icon="lucide:menu" class="text-xl"></iconify-icon></button>
      <div class="hidden items-center gap-2 text-sm text-slate-400 sm:flex"><span>Workspace</span><iconify-icon icon="lucide:chevron-right" class="text-sm"></iconify-icon><span id="breadcrumb-current" class="font-semibold text-slate-700">Dashboard</span></div>
    </div>
    <div class="flex items-center gap-3 sm:gap-5">
      <div class="relative hidden w-56 lg:block"><iconify-icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon><input id="admin-search-input" type="search" placeholder="Cari sesuatu... (Ctrl+K)" class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-aqua focus:ring-4 focus:ring-cyan-50"></div>
      <button id="header-search-button" type="button" class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 lg:hidden"><iconify-icon icon="lucide:search" class="text-lg"></iconify-icon></button>
      <div class="relative">
        <button id="notification-button" type="button" class="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-lagoon hover:text-ocean"><iconify-icon icon="lucide:bell" class="text-lg"></iconify-icon><span class="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-aqua ring-2 ring-white pulse-dot"></span></button>
        <div id="notification-dropdown" class="notification-dropdown absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 class="font-display text-sm font-bold text-slate-900">Notifikasi</h3><span class="rounded-full bg-aqua/10 px-2.5 py-0.5 text-xs font-bold text-ocean">3 baru</span></div>
          <div class="max-h-72 overflow-y-auto">
            <div class="flex gap-3 border-b border-slate-50 px-5 py-4 hover:bg-slate-50 cursor-pointer"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lagoon text-ocean"><iconify-icon icon="lucide:ticket-check"></iconify-icon></span><div><p class="text-sm text-slate-700"><b>Booking baru</b> dari Rina Pratiwi</p><p class="mt-0.5 text-xs text-slate-400">2 menit lalu</p></div></div>
            <div class="flex gap-3 border-b border-slate-50 px-5 py-4 hover:bg-slate-50 cursor-pointer"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><iconify-icon icon="lucide:credit-card"></iconify-icon></span><div><p class="text-sm text-slate-700">Pembayaran <b>BH-7K4P9X</b> dikonfirmasi</p><p class="mt-0.5 text-xs text-slate-400">18 menit lalu</p></div></div>
            <div class="flex gap-3 px-5 py-4 hover:bg-slate-50 cursor-pointer"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500"><iconify-icon icon="lucide:user-plus"></iconify-icon></span><div><p class="text-sm text-slate-700"><b>Andi Saputra</b> mendaftar akun baru</p><p class="mt-0.5 text-xs text-slate-400">1 jam lalu</p></div></div>
          </div>
          <a href="#" class="flex items-center justify-center gap-2 border-t border-slate-100 py-3 text-sm font-bold text-ocean hover:bg-lagoon">Lihat semua <iconify-icon icon="lucide:arrow-right"></iconify-icon></a>
        </div>
      </div>
      <div class="h-8 w-px bg-slate-200"></div>
      <div class="relative">
        <button id="profile-menu-button" type="button" class="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50"><span id="admin-avatar" class="flex h-9 w-9 items-center justify-center rounded-full bg-ocean text-sm font-bold text-white">AD</span><span class="hidden text-left sm:block"><span id="admin-display-name" class="block text-sm font-bold text-slate-800">Administrator</span><span class="block text-xs text-slate-400">Administrator</span></span><iconify-icon icon="lucide:chevron-down" class="hidden text-slate-400 sm:block"></iconify-icon></button>
        <div id="profile-dropdown" class="profile-dropdown absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div class="border-b border-slate-100 px-4 py-4"><p id="admin-dropdown-name" class="text-sm font-bold text-slate-800">Administrator</p><p id="admin-dropdown-email" class="text-xs text-slate-400"></p></div>
          <div class="p-2"><a id="profile-settings-link" href="#settings" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><iconify-icon icon="lucide:user"></iconify-icon> Profil Saya</a></div>
          <div class="border-t border-slate-100 p-2"><button id="admin-logout-btn" type="button" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50"><iconify-icon icon="lucide:log-out"></iconify-icon> Keluar</button></div>
        </div>
      </div>
    </div>
  </header>
</template>
