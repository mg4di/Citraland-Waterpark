<template>
  <aside class="sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-all duration-300">
    <div class="flex h-20 items-center border-b border-slate-100 px-5">
      <a href="#dashboard" class="brand-link flex items-center gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean text-white shadow-sm"><iconify-icon icon="lucide:waves" class="text-xl"></iconify-icon></span>
        <span class="brand-label font-display text-sm font-extrabold tracking-tight text-slate-900">CITRALAND<span class="text-aqua">.</span><small class="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Waterpark admin</small></span>
      </a>
    </div>
    <nav class="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
      <p class="sidebar-section-label mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Workspace</p>
      <a href="#dashboard" class="sidebar-link nav-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-ocean" data-page="dashboard" data-label="Dashboard"><iconify-icon icon="lucide:layout-dashboard" class="shrink-0 text-lg"></iconify-icon><span class="sidebar-label">Dashboard</span></a>
      <a href="#bookings" class="sidebar-link nav-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-ocean" data-page="bookings" data-label="Booking Management"><iconify-icon icon="lucide:ticket-check" class="shrink-0 text-lg"></iconify-icon><span class="sidebar-label">Booking Management</span></a>
      <a href="#users" class="sidebar-link nav-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-ocean" data-page="users" data-label="User Management"><iconify-icon icon="lucide:users-round" class="shrink-0 text-lg"></iconify-icon><span class="sidebar-label">User Management</span></a>
      <a href="#content" class="sidebar-link nav-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-ocean" data-page="content" data-label="Content Management"><iconify-icon icon="lucide:panels-top-left" class="shrink-0 text-lg"></iconify-icon><span class="sidebar-label">Content Management</span></a>
      <a href="#analytics" class="sidebar-link nav-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-ocean" data-page="analytics" data-label="Analytics"><iconify-icon icon="lucide:chart-no-axes-combined" class="shrink-0 text-lg"></iconify-icon><span class="sidebar-label">Analytics</span></a>
      <p class="sidebar-section-label mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">System</p>
      <a href="#settings" class="sidebar-link nav-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-ocean" data-page="settings" data-label="Pengaturan"><iconify-icon icon="lucide:settings-2" class="shrink-0 text-lg"></iconify-icon><span class="sidebar-label">Pengaturan</span></a>
      <a href="#help" class="sidebar-link nav-link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-ocean" data-page="help" data-label="Pusat Bantuan"><iconify-icon icon="lucide:circle-help" class="shrink-0 text-lg"></iconify-icon><span class="sidebar-label">Pusat Bantuan</span></a>
    </nav>
    <div class="border-t border-slate-100 p-3">
      <button id="sidebar-collapse-button" type="button" class="sidebar-toggle flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-ocean"><iconify-icon icon="lucide:panel-left-close" class="shrink-0 text-lg transition-transform"></iconify-icon><span class="sidebar-label">Collapse sidebar</span></button>
    </div>
  </aside>
</template>
