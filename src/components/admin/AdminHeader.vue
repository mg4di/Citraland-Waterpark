<template>
  <header class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-lg px-5 sm:px-8">
    <div class="flex items-center gap-3">
      <button id="mobile-menu-button" type="button" class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 md:hidden"><iconify-icon icon="lucide:menu" class="text-xl"></iconify-icon></button>
      <div class="hidden items-center gap-2 text-sm text-slate-400 sm:flex"><span>Workspace</span><iconify-icon icon="lucide:chevron-right" class="text-sm"></iconify-icon><span id="breadcrumb-current" class="font-semibold text-slate-700">Dashboard</span></div>
    </div>
    <div class="flex items-center gap-3 sm:gap-5">
      <div class="relative">
        <button id="profile-menu-button" type="button" class="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50"><span id="admin-avatar" class="flex h-9 w-9 items-center justify-center rounded-full bg-ocean text-sm font-bold text-white">AD</span><span class="hidden text-left sm:block"><span id="admin-display-name" class="block text-sm font-bold text-slate-800">Administrator</span><span class="block text-xs text-slate-400">Administrator</span></span><iconify-icon icon="lucide:chevron-down" class="hidden text-slate-400 sm:block"></iconify-icon></button>
        <div id="profile-dropdown" class="profile-dropdown absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div class="border-b border-slate-100 px-4 py-4"><p id="admin-dropdown-name" class="text-sm font-bold text-slate-800">Administrator</p><p id="admin-dropdown-email" class="text-xs text-slate-400"></p></div>
          <div class="p-2"><a id="profile-settings-link" href="#settings" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><iconify-icon icon="lucide:user"></iconify-icon> Profil Saya</a></div>
          <div class="border-t border-slate-100 p-2"><button id="admin-logout-btn" type="button" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-red-500 transition hover:bg-red-50"><iconify-icon icon="lucide:log-out" class="text-lg"></iconify-icon><span class="flex-1"><span class="block text-sm font-semibold">Logout</span><span class="block text-xs font-normal text-slate-400">Keluar dari akun admin</span></span><iconify-icon icon="lucide:chevron-right" class="text-sm text-red-300"></iconify-icon></button></div>
        </div>
      </div>
    </div>
  </header>
</template>
