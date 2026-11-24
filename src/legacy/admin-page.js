import { authService } from '../services/authService.js';
import { analyticsService } from '../services/analyticsService.js';
import { bookingService } from '../services/bookingService.js';
import { facilitiesService } from '../services/facilitiesService.js';
import { galleryService } from '../services/galleryService.js';
import { promotionService } from '../services/promotionService.js';
import { realtimeManager } from '../services/realtimeService.js';
import { ticketPricingService } from '../services/ticketPricingService.js';
import { usersService } from '../services/usersService.js';
import { areaChart, barChart, donutSegments } from '../lib/chart.js';

export function initializeAdminPage(onLogout = () => window.location.assign('/admin')) {
  // ===================== GLOBAL STATE & DATA =====================
  const root = document.getElementById('admin-root');
  const overlay = document.getElementById('mobile-overlay');
  const toastContainer = document.getElementById('toast-container');
  const documentListeners = [];
  const onDocument = (type, handler) => {
    document.addEventListener(type, handler);
    documentListeners.push(() => document.removeEventListener(type, handler));
  };

  // Bookings data
  let bookings = [];
  let bkFilter = 'all',
    bkSearch = '',
    bkPage = 1;
  const bkPerPage = 5;

  // Users data
  let users = [];
  let userStats = { total: 0, active: 0, inactive: 0, new_this_month: 0, new_prev_month: 0 };
  let usrSearch = '',
    usrStatusFilter = 'all',
    usrSelected = new Set(),
    editingUserId = null;

  // Dashboard / analytics period
  let dashFrom = '',
    dashTo = '',
    anFrom = '',
    anTo = '';
  let lastExpireAt = 0;
  let analyticsCache = {};
  let dashboardRequest = 0,
    analyticsRequest = 0,
    usersRequest = 0,
    bookingsRequest = 0;
  let pollTimer = null;

  // Facilities data
  let facilities = [];
  let editingFacId = null;

  // Promotions data
  let promotions = [];

  // Gallery data
  let galleryItems = [];

  // Pricing data
  let pricing = [];

  let deleteTarget = null;

  // ===================== TOAST =====================
  function showToast(msg, type = 'success') {
    const c = { success: 'bg-emerald-500', error: 'bg-rose-500', info: 'bg-pool' };
    const i = { success: 'lucide:check-circle', error: 'lucide:alert-circle', info: 'lucide:info' };
    const t = document.createElement('div');
    t.className = `toast show pointer-events-auto flex items-center gap-3 rounded-xl ${c[type]} px-5 py-3.5 text-sm font-semibold text-white shadow-lg`;
    const icon = document.createElement('iconify-icon');
    icon.setAttribute('icon', i[type]);
    icon.className = 'text-lg';
    const text = document.createElement('span');
    text.textContent = msg;
    t.append(icon, text);
    toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.animation = 'toastOut .3s ease both';
      setTimeout(() => t.remove(), 300);
    }, 2500);
  }

  // ===================== FORMAT & UI HELPERS =====================
  function todayWita() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Makassar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const part = (type) => parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
  function monthStartWita() {
    return todayWita().slice(0, 8) + '01';
  }
  function formatRupiah(value) {
    return `Rp${Number(value || 0).toLocaleString('id-ID')}`;
  }
  function formatRupiahShort(value) {
    const amount = Number(value || 0);
    return amount >= 1000 ? `Rp${compactNumber(amount)}` : formatRupiah(amount);
  }
  function formatNumber(value) {
    return Number(value || 0).toLocaleString('id-ID');
  }
  function compactNumber(value) {
    return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(
      Number(value || 0),
    );
  }
  function formatShortDate(value) {
    if (!value) return '-';
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00+08:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: '2-digit',
      month: 'short',
    }).format(date);
  }
  function formatDateTimeWita(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }
  function monthShort(value) {
    if (!value) return '';
    const date = new Date(`${String(value).slice(0, 7)}-01T00:00:00+08:00`);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Makassar', month: 'short' }).format(
      date,
    );
  }
  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }
  function debounce(fn, wait = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }
  function setBusy(button, busy, label) {
    if (!button) return;
    if (busy) {
      button.dataset.idleLabel = button.innerHTML;
      button.disabled = true;
      button.classList.add('opacity-60');
      if (label) button.textContent = label;
    } else {
      button.disabled = false;
      button.classList.remove('opacity-60');
      if (button.dataset.idleLabel) button.innerHTML = button.dataset.idleLabel;
      delete button.dataset.idleLabel;
    }
  }

  // ===================== ROUTING =====================
  function navigateTo(page) {
    document.querySelectorAll('.page-view').forEach((p) => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    else {
      document.getElementById('page-dashboard').classList.add('active');
      page = 'dashboard';
    }

    // Update sidebar
    document.querySelectorAll('.nav-link').forEach((l) => {
      l.classList.remove('bg-lagoon', 'text-pool', 'font-bold');
      l.classList.add('text-slate-500', 'font-semibold');
    });
    const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (activeLink) {
      activeLink.classList.remove('text-slate-500', 'font-semibold');
      activeLink.classList.add('bg-lagoon', 'text-pool', 'font-bold');
    }

    // Update breadcrumb
    const labels = {
      dashboard: 'Dashboard',
      bookings: 'Booking Management',
      users: 'User Management',
      content: 'Content Management',
      analytics: 'Analytics & Reports',
      settings: 'Pengaturan',
      help: 'Pusat Bantuan',
    };
    document.getElementById('breadcrumb-current').textContent = labels[page] || 'Dashboard';

    // Close mobile sidebar
    setSidebarOpen(false, { restoreFocus: false });

    // Re-render page-specific content
    if (page === 'bookings') renderBookings();
    if (page === 'users') {
      void loadUsers();
    }
    if (page === 'content') {
      void loadContent();
    }
    if (page === 'analytics') {
      void loadAnalytics();
    }
    if (page === 'settings') {
      void loadAdminProfile();
    }
  }

  // Hash routing
  function handleHash() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigateTo(hash);
  }
  window.addEventListener('hashchange', handleHash);

  // Nav link clicks
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      // hash change will trigger handleHash
    });
  });

  // Nav triggers (links inside content that navigate)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.nav-trigger');
    if (trigger) {
      e.preventDefault();
      const page = trigger.dataset.page;
      window.location.hash = '#' + page;
    }
  });

  // ===================== SIDEBAR & HEADER =====================
  const mobileSidebarQuery = window.matchMedia('(max-width: 767px)');
  let sidebarTrigger = null;

  function setSidebarOpen(open, { restoreFocus = true } = {}) {
    const sidebar = document.getElementById('admin-sidebar');
    const trigger = document.getElementById('mobile-menu-button');
    const isMobile = mobileSidebarQuery.matches;
    root.classList.toggle('sidebar-open', open);
    overlay.classList.toggle('hidden', !open);
    document.body.style.overflow = open && isMobile ? 'hidden' : '';
    trigger?.setAttribute('aria-expanded', String(open));
    if (isMobile) {
      sidebar?.toggleAttribute('inert', !open);
      sidebar?.setAttribute('aria-hidden', String(!open));
    } else {
      sidebar?.removeAttribute('inert');
      sidebar?.removeAttribute('aria-hidden');
    }
    if (open) {
      sidebarTrigger = trigger;
      closeAllDD();
      const closeButton = document.getElementById('sidebar-close-button');
      (closeButton ?? sidebar?.querySelector('a[href], button'))?.focus({ preventScroll: true });
    } else if (restoreFocus && sidebarTrigger) {
      sidebarTrigger.focus({ preventScroll: true });
      sidebarTrigger = null;
    }
  }

  function syncSidebarA11y() {
    const sidebar = document.getElementById('admin-sidebar');
    if (!mobileSidebarQuery.matches) {
      sidebar?.removeAttribute('inert');
      sidebar?.removeAttribute('aria-hidden');
      document.body.style.overflow = '';
      document.getElementById('mobile-menu-button')?.setAttribute('aria-expanded', 'false');
      return;
    }
    const open = root.classList.contains('sidebar-open');
    document.body.style.overflow = open ? 'hidden' : '';
    sidebar?.toggleAttribute('inert', !open);
    sidebar?.setAttribute('aria-hidden', String(!open));
    document.getElementById('mobile-menu-button')?.setAttribute('aria-expanded', String(open));
  }

  document
    .getElementById('sidebar-collapse-button')
    .addEventListener('click', () => root.classList.toggle('sidebar-collapsed'));
  document
    .getElementById('mobile-menu-button')
    ?.addEventListener('click', () => setSidebarOpen(!root.classList.contains('sidebar-open')));
  document
    .getElementById('sidebar-close-button')
    ?.addEventListener('click', () => setSidebarOpen(false));
  overlay.addEventListener('click', () => setSidebarOpen(false));
  syncSidebarA11y();
  window.addEventListener('resize', syncSidebarA11y);

  // Dropdowns (pakai event delegation agar tetap berjalan walau header di-render ulang)
  function setDropdown(open) {
    const dropdown = document.getElementById('profile-dropdown');
    const button = document.getElementById('profile-menu-button');
    dropdown?.classList.toggle('show', open);
    dropdown?.toggleAttribute('inert', !open);
    dropdown?.setAttribute('aria-hidden', String(!open));
    button?.setAttribute('aria-expanded', String(open));
  }
  function closeAllDD({ restoreFocus = false } = {}) {
    const wasOpen = document.getElementById('profile-dropdown')?.classList.contains('show');
    setDropdown(false);
    if (wasOpen && restoreFocus) {
      document.getElementById('profile-menu-button')?.focus({ preventScroll: true });
    }
  }
  onDocument('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) {
      closeAllDD();
      return;
    }
    if (target.closest('#profile-menu-button')) {
      const dd = document.getElementById('profile-dropdown');
      const open = dd?.classList.contains('show');
      closeAllDD();
      if (!open) setDropdown(true);
      return;
    }
    if (target.closest('#profile-dropdown')) {
      if (target.closest('#profile-settings-link')) closeAllDD();
      return;
    }
    closeAllDD();
  });
  onDocument('click', async (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const btn = target ? target.closest('#admin-logout-btn') : null;
    if (!btn || btn.dataset.busy === '1') return;
    btn.dataset.busy = '1';
    btn.classList.add('opacity-60', 'pointer-events-none');
    const result = await authService.logout();
    if (!result.success) {
      delete btn.dataset.busy;
      btn.classList.remove('opacity-60', 'pointer-events-none');
      showToast(result.error, 'error');
      return;
    }
    closeAllDD();
    showToast('Berhasil logout');
    await onLogout();
  });

  let currentAdminUser = null;
  let currentAdminProfile = null;
  async function loadAdminProfile() {
    const [userResult, profileResult] = await Promise.all([
      authService.getUser(),
      authService.getAdminProfile(),
    ]);
    if (!userResult.success || !userResult.user) return;
    currentAdminUser = userResult.user;
    if (!profileResult.success) {
      showToast(profileResult.error, 'error');
      setText('#admin-profile-status', profileResult.error);
      return;
    }
    currentAdminProfile = profileResult.admin;
    const name =
      currentAdminProfile.full_name ||
      currentAdminUser.user_metadata?.full_name ||
      currentAdminUser.email ||
      'Administrator';
    setText('#admin-display-name', name);
    setText('#admin-dropdown-name', name);
    setText('#admin-dropdown-email', currentAdminUser.email || '');
    setText(
      '#admin-avatar',
      name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
    );
    setText('#admin-profile-status', 'Profil dimuat dari database.');
    const nameInput = document.getElementById('admin-profile-name');
    const emailInput = document.getElementById('admin-profile-email');
    const roleInput = document.getElementById('admin-profile-role');
    const phoneInput = document.getElementById('admin-profile-phone');
    if (nameInput) nameInput.value = currentAdminProfile.full_name || '';
    if (emailInput) emailInput.value = currentAdminUser.email || '';
    if (roleInput)
      roleInput.value = String(currentAdminProfile.role || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
    if (phoneInput) phoneInput.value = currentAdminProfile.phone || '';
  }
  void loadAdminProfile();

  // Keyboard
  onDocument('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDD({ restoreFocus: true });
      if (root.classList.contains('sidebar-open')) setSidebarOpen(false);
      document.querySelectorAll('.modal-overlay.show').forEach((m) => m.classList.remove('show'));
    }
    if (e.key === 'Tab' && root.classList.contains('sidebar-open') && mobileSidebarQuery.matches) {
      const sidebar = document.getElementById('admin-sidebar');
      const focusable = [...(sidebar?.querySelectorAll('a[href], button:not([disabled])') ?? [])].filter(
        (element) => element.offsetParent !== null,
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // ===================== BOOKINGS PAGE =====================
  const statusCfg = {
    paid: { label: 'Paid', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600' },
    failed: { label: 'Failed', bg: 'bg-rose-50', text: 'text-rose-600' },
    cancelled: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-600' },
    refunded: { label: 'Refunded', bg: 'bg-seafoam', text: 'text-pool' },
  };

  function mapBooking(booking) {
    const ticket = Object.entries(booking.ticket_types ?? {})
      .map(([type, details]) => `${type === 'weekday' ? 'Weekdays' : 'Weekend'} × ${details.qty}`)
      .join(', ');
    const date = new Date(`${booking.visit_date}T00:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const checkedInAt = booking.checked_in_at ?? null;
    const checkInTime = checkedInAt
      ? new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Makassar',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date(checkedInAt))
      : '';
    return {
      dbId: booking.booking_id,
      id: booking.booking_code,
      name: booking.user_name,
      email: booking.user_email,
      ticket,
      date,
      status:
        booking.effective_status ??
        (booking.cancelled_at && !booking.checked_in_at ? 'cancelled' : booking.payment_status),
      cancelledReason: booking.cancellation_reason ?? null,
      checkedInAt,
      checkInLabel: checkedInAt ? `${checkInTime} WITA` : 'Belum masuk',
      canCheckIn:
        booking.payment_status === 'paid' &&
        !booking.checked_in_at &&
        !booking.cancelled_at &&
        booking.visit_date === todayWita(),
      amount: `Rp${Number(booking.total_amount).toLocaleString('id-ID')}`,
      raw: booking,
    };
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[character],
    );
  }

  async function loadBookings() {
    const requestId = ++bookingsRequest;
    // Tiket tidak dipakai yang sudah lewat tanggal kunjungan otomatis dibatalkan.
    // Jangan panggil setiap event realtime agar tidak memicu loop update.
    if (Date.now() - lastExpireAt > 5 * 60 * 1000) {
      lastExpireAt = Date.now();
      await bookingService.expireUnusedBookings();
    }
    const result = await bookingService.getAllBookings({
      status: bkFilter,
      searchTerm: bkSearch,
      page: 1,
      pageSize: 1000,
    });
    if (requestId !== bookingsRequest) return;
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    bookings = result.bookings.map(mapBooking);
    renderBookings();
  }

  function renderDonut(donutSelector, legendSelector, distribution, total, labels) {
    const donut = document.querySelector(donutSelector);
    const legend = document.querySelector(legendSelector);
    if (!donut) return;
    const order = ['paid', 'pending', 'failed', 'cancelled', 'refunded'];
    const items = order.map((key) => ({
      key,
      label: labels[key] ?? key,
      value: Number(distribution?.[key] ?? 0),
    }));
    const result = donutSegments(items);
    donut.style.background = result.gradient;
    const totalEl = donut.querySelector('span');
    if (totalEl) totalEl.textContent = formatNumber(total);
    if (!legend) return;
    legend.replaceChildren();
    if (!result.total) {
      legend.innerHTML = '<p class="text-sm text-slate-500">Belum ada data pada periode ini.</p>';
      return;
    }
    for (const segment of result.segments) {
      const row = document.createElement('p');
      row.className = 'flex items-center gap-3';
      const dot = document.createElement('i');
      dot.className = 'h-3 w-3 rounded-full';
      dot.style.backgroundColor = segment.color;
      const label = document.createElement('span');
      label.className = 'w-20 text-slate-500';
      label.textContent = segment.label;
      const value = document.createElement('b');
      value.className = 'ml-auto text-slate-800';
      value.textContent = `${formatNumber(segment.value)} · ${Math.round((segment.value / result.total) * 100)}%`;
      row.append(dot, label, value);
      legend.appendChild(row);
    }
  }

  function labelTableRow(row, labels) {
    row.querySelectorAll('td').forEach((cell, index) => {
      if (labels[index] !== undefined) cell.dataset.label = labels[index];
    });
  }

  function renderDashboardRecent(bookings) {
    const body = document.getElementById('dash-recent-body');
    if (!body) return;
    body.replaceChildren();
    if (!bookings.length) {
      body.innerHTML =
        '<tr><td colspan="6" class="px-6 py-14 text-center text-sm text-slate-500">Belum ada booking pada periode ini.</td></tr>';
      return;
    }
    for (const rawBooking of bookings) {
      const booking = mapBooking(rawBooking);
      const status = statusCfg[booking.status] ?? statusCfg.pending;
      const row = document.createElement('tr');
      row.className = 'hover:bg-lagoon';
      row.innerHTML = `<td class="px-6 py-4 font-bold text-pool">${escapeHtml(booking.id)}</td>
      <td class="px-4 py-4 font-semibold text-slate-700">${escapeHtml(booking.name)}</td>
      <td class="px-4 py-4 text-slate-500">${escapeHtml(booking.ticket)}</td>
      <td class="px-4 py-4 text-slate-500">${escapeHtml(booking.date)}</td>
      <td class="px-4 py-4"><span class="rounded-full ${status.bg} px-3 py-1.5 text-xs font-bold ${status.text}">${status.label}</span></td>
      <td class="px-6 py-4 text-right font-bold text-slate-800">${escapeHtml(booking.amount)}</td>`;
      labelTableRow(row, ['Booking ID', 'Guest', 'Type', 'Visit Date', 'Status', 'Amount']);
      body.appendChild(row);
    }
  }

  async function loadDashboard() {
    if (!dashFrom || !dashTo) {
      dashTo = todayWita();
      dashFrom = monthStartWita();
    }
    const fromInput = document.getElementById('dash-date-from');
    const toInput = document.getElementById('dash-date-to');
    if (fromInput && !fromInput.value) fromInput.value = dashFrom;
    if (toInput && !toInput.value) toInput.value = dashTo;

    const requestId = ++dashboardRequest;
    const result = await analyticsService.getDashboardSummary(dashFrom, dashTo);
    if (requestId !== dashboardRequest) return;
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    const s = result.summary;

    setText('#dash-revenue', formatRupiah(s.total_revenue));
    setText('#dash-bookings', formatNumber(s.total_bookings));
    setText('#dash-visitors', formatNumber(s.tickets_sold));
    setText('#dash-checkin', formatNumber(s.checked_in_today));
    setText('#dash-revenue-sub', `vs ${formatRupiah(s.prev_revenue)} periode sebelumnya`);
    setText(
      '#dash-bookings-sub',
      `${formatNumber(s.new_bookings_week)} booking dalam 7 hari terakhir`,
    );
    setText('#dash-visitors-sub', `${formatNumber(s.checked_in_total)} check-in pada periode ini`);
    setText('#dash-checkin-sub', `Kemarin ${formatNumber(s.checked_in_yesterday)} check-in`);
    setText(
      '#dash-trend-sub',
      `${formatShortDate(s.range_from)} – ${formatShortDate(s.range_to)} · WITA`,
    );

    const daily = s.daily_revenue ?? [];
    const chart = document.querySelector('#page-dashboard .h-64');
    if (chart) {
      chart.innerHTML = areaChart(
        daily.map((item) => Number(item.revenue)),
        {
          labels: daily.map((item) => formatShortDate(item.date)),
          valueFormatter: (value) => `Rp${compactNumber(value)}`,
          emptyLabel: 'Belum ada pendapatan pada periode ini',
          gradientId: 'dashRevenueFill',
        },
      );
    }

    renderDonut(
      '#page-dashboard .donut-chart',
      '#page-dashboard .donut-chart + div',
      s.status_distribution,
      s.total_bookings,
      {
        paid: 'Paid',
        pending: 'Pending',
        failed: 'Failed',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
      },
    );
    renderDashboardRecent(s.recent_bookings ?? []);
  }

  function formatPromotionDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  async function loadContent() {
    const [pricingResult, facilitiesResult, promotionsResult, galleryResult] = await Promise.all([
      ticketPricingService.getAllPricing(),
      facilitiesService.getAllFacilities(),
      promotionService.getAllPromotions(),
      galleryService.getAllImages(),
    ]);
    let failed = false;
    for (const result of [pricingResult, facilitiesResult, promotionsResult, galleryResult]) {
      if (!result.success) {
        showToast(result.error, 'error');
        failed = true;
      }
    }
    if (pricingResult.success) {
      pricing = pricingResult.pricing.map((item) => ({
        id: item.ticket_id,
        type: item.ticket_type,
        name: item.ticket_name,
        desc: item.days_description,
        price: Number(item.price),
        status: item.status,
        featured: item.ticket_type === 'weekend',
        icon: 'lucide:calendar-days',
      }));
    }
    if (facilitiesResult.success) {
      facilities = facilitiesResult.facilities.map((item) => ({
        id: item.facility_id,
        name: item.facility_name,
        desc: item.description,
        icon: item.icon,
        status: item.status === 'active' ? 'Active' : 'Inactive',
        displayOrder: item.display_order,
      }));
    }
    if (promotionsResult.success) {
      promotions = promotionsResult.promotions.map((item) => ({
        id: item.promo_id,
        code: item.promo_code,
        discount:
          item.discount_type === 'percentage'
            ? `${Number(item.discount_amount)}% off`
            : `Rp${Number(item.discount_amount).toLocaleString('id-ID')} off`,
        period: `${formatPromotionDate(item.start_date)} – ${formatPromotionDate(item.end_date)}`,
        active: item.status === 'active',
      }));
    }
    if (galleryResult.success) {
      galleryItems = galleryResult.images
        .filter((item) => item.status !== 'archived')
        .map((item) => ({
          id: item.image_id,
          title: item.caption || 'Foto waterpark',
          order: item.display_order,
          status: item.status,
          url: item.image_url,
        }));
    }
    if (pricingResult.success) renderPricing();
    if (facilitiesResult.success) renderFacilities();
    if (promotionsResult.success) renderPromotions();
    if (galleryResult.success) renderGallery();
    if (pricingResult.success)
      setText(
        '#pricing-count-badge',
        `${pricing.filter((item) => item.status === 'active').length} Published`,
      );
    if (galleryResult.success)
      setText(
        '#gallery-count-badge',
        `${galleryItems.filter((item) => item.status === 'published').length} Published`,
      );
    if (promotionsResult.success)
      setText('#promo-active-count', `${promotions.filter((item) => item.active).length} Active`);
    return !failed;
  }

  function getFilteredBookings() {
    return bookings.filter((b) => {
      const ms = bkFilter === 'all' || b.status === bkFilter;
      const mq =
        !bkSearch ||
        b.id.toLowerCase().includes(bkSearch) ||
        b.name.toLowerCase().includes(bkSearch) ||
        b.email.toLowerCase().includes(bkSearch);
      return ms && mq;
    });
  }

  function renderBookings() {
    const filtered = getFilteredBookings();
    const total = bookings.length;
    const counts = { all: total, paid: 0, pending: 0, failed: 0, cancelled: 0, refunded: 0 };
    bookings.forEach((b) => {
      if (Object.hasOwn(counts, b.status)) counts[b.status]++;
    });
    document.getElementById('bk-c-all').textContent = counts.all;
    document.getElementById('bk-c-conf').textContent = counts.paid;
    document.getElementById('bk-c-comp').textContent = counts.pending;
    document.getElementById('bk-c-failed').textContent = counts.failed;
    document.getElementById('bk-c-canc').textContent = counts.cancelled;
    document.getElementById('bk-stat-total').textContent = counts.all;
    document.getElementById('bk-stat-confirmed').textContent = counts.paid;
    document.getElementById('bk-stat-cancelled').textContent = counts.cancelled;

    const totalPages = Math.max(1, Math.ceil(filtered.length / bkPerPage));
    if (bkPage > totalPages) bkPage = totalPages;
    const start = (bkPage - 1) * bkPerPage;
    const pageData = filtered.slice(start, start + bkPerPage);

    document.getElementById('bk-result-count').textContent =
      `Menampilkan ${filtered.length} dari ${total} pemesanan`;
    document.getElementById('bk-page-range').textContent =
      filtered.length > 0 ? `${start + 1}–${Math.min(start + bkPerPage, filtered.length)}` : '0';
    document.getElementById('bk-page-total').textContent = filtered.length;

    const tbody = document.getElementById('bk-table-body');
    tbody.replaceChildren();
    if (!pageData.length) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="px-6 py-16 text-center"><span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500"><iconify-icon icon="lucide:search-x" class="text-2xl"></iconify-icon></span><p class="mt-4 font-display font-bold text-slate-700">Tidak ada booking</p></td></tr>';
      return;
    }

    pageData.forEach((b) => {
      const sc = statusCfg[b.status] ?? statusCfg.pending;
      const checkinBtn = b.canCheckIn
        ? `<button class="checkin-booking rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" title="Check-in manual" aria-label="Check-in booking ${escapeHtml(b.id)}" data-id="${escapeHtml(b.id)}"><iconify-icon icon="lucide:door-open"></iconify-icon></button>`
        : '';
      const actions =
        b.status === 'cancelled'
          ? '<span class="px-2 text-xs font-semibold text-slate-500">Riwayat</span>'
          : `${checkinBtn}<button class="delete-booking rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-500" aria-label="Hapus booking ${escapeHtml(b.id)}" data-id="${escapeHtml(b.id)}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button>`;
      const checkinCell = b.checkedInAt
        ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><iconify-icon icon="lucide:check"></iconify-icon>${escapeHtml(b.checkInLabel)}</span>`
        : '<span class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">Belum masuk</span>';
      const tr = document.createElement('tr');
      tr.className = 'table-row hover:bg-lagoon';
      tr.innerHTML = `<td class="px-6 py-5 font-bold text-pool">${escapeHtml(b.id)}</td><td class="px-4 py-5"><p class="font-semibold text-slate-700">${escapeHtml(b.name)}</p><p class="mt-1 text-xs text-slate-500">${escapeHtml(b.email)}</p></td><td class="px-4 py-5 text-slate-500">${escapeHtml(b.ticket)}</td><td class="px-4 py-5 text-slate-500">${escapeHtml(b.date)}</td><td class="px-4 py-5"><span class="rounded-full ${sc.bg} px-3 py-1.5 text-xs font-bold ${sc.text}">${sc.label}</span></td><td class="px-4 py-5">${checkinCell}</td><td class="px-4 py-5 text-right font-bold text-slate-800">${escapeHtml(b.amount)}</td><td class="px-6 py-5"><div class="flex justify-center gap-1">${actions}</div></td>`;
      labelTableRow(tr, ['Booking ID', 'Guest', 'Ticket Type', 'Visit Date', 'Status', 'Check-in', 'Amount', 'Actions']);
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.delete-booking').forEach((button) => {
      button.addEventListener('click', () => window.confirmDeleteBk(button.dataset.id));
    });
    tbody.querySelectorAll('.checkin-booking').forEach((button) => {
      button.addEventListener('click', async () => {
        if (button.dataset.busy === '1') return;
        if (!window.confirm(`Check-in booking ${button.dataset.id} sekarang?`)) return;
        button.dataset.busy = '1';
        button.classList.add('opacity-50', 'pointer-events-none');
        const result = await bookingService.adminCheckIn(button.dataset.id);
        delete button.dataset.busy;
        button.classList.remove('opacity-50', 'pointer-events-none');
        if (!result.success) {
          showToast(result.error, 'error');
          return;
        }
        showToast(`Check-in ${button.dataset.id} berhasil`);
        await loadBookings();
        await loadDashboard();
      });
    });

    // Pagination
    const pag = document.getElementById('bk-pagination');
    pag.replaceChildren();
    if (totalPages > 1) {
      const mkBtn = (label, pg, disabled = false, active = false) => {
        const b = document.createElement('button');
        b.className = `page-btn flex h-9 w-9 items-center justify-center rounded-lg ${active ? 'bg-pool text-sm font-bold text-white' : 'border border-slate-200 text-sm font-semibold text-slate-500 hover:border-aqua hover:text-pool'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`;
        b.innerHTML = label;
        b.disabled = disabled;
        b.addEventListener('click', () => {
          if (!disabled) {
            bkPage = pg;
            renderBookings();
          }
        });
        return b;
      };
      pag.appendChild(
        mkBtn('<iconify-icon icon="lucide:chevron-left"></iconify-icon>', bkPage - 1, bkPage === 1),
      );
      for (let i = 1; i <= totalPages; i++) pag.appendChild(mkBtn(i, i, false, i === bkPage));
      pag.appendChild(
        mkBtn(
          '<iconify-icon icon="lucide:chevron-right"></iconify-icon>',
          bkPage + 1,
          bkPage === totalPages,
        ),
      );
    }
  }

  window.confirmDeleteBk = function (id) {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) {
      showToast('Booking tidak ditemukan.', 'error');
      return;
    }
    deleteTarget = { type: 'booking', id, dbId: booking.dbId };
    document.getElementById('delete-message').textContent = `Booking ${id} akan dihapus permanen.`;
    document.getElementById('delete-modal').classList.add('show');
  };

  document.querySelectorAll('.bk-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      bkFilter = btn.dataset.status;
      bkPage = 1;
      document.querySelectorAll('.bk-filter').forEach((x) => {
        x.className =
          'bk-filter rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-lagoon hover:text-pool';
      });
      btn.className = 'bk-filter rounded-xl bg-pool px-4 py-2.5 text-sm font-bold text-white';
      loadBookings();
    });
  });
  let bookingSearchTimer;
  document.getElementById('bk-search').addEventListener('input', (e) => {
    bkSearch = e.target.value.toLowerCase();
    bkPage = 1;
    clearTimeout(bookingSearchTimer);
    bookingSearchTimer = setTimeout(loadBookings, 250);
  });
  function exportBookings() {
    const fields = [
      'booking_code',
      'user_name',
      'user_email',
      'user_phone',
      'visit_date',
      'ticket_types',
      'total_amount',
      'payment_status',
      'payment_method',
      'midtrans_transaction_id',
      'created_at',
      'checked_in_at',
      'cancelled_at',
      'cancellation_reason',
    ];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const content = [
      fields.join(','),
      ...bookings.map((booking) =>
        fields
          .map((field) =>
            escapeCsv(
              typeof booking.raw[field] === 'object'
                ? JSON.stringify(booking.raw[field])
                : booking.raw[field],
            ),
          )
          .join(','),
      ),
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `citraland-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  document.getElementById('export-bookings-btn').addEventListener('click', exportBookings);
  document.getElementById('export-report-btn')?.addEventListener('click', exportBookings);

  // ===================== USERS PAGE =====================
  function getInitials(name) {
    return String(name || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  function formatJoinDate(value) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  async function loadUsers() {
    const requestId = ++usersRequest;
    const result = await usersService.getOverview({ search: usrSearch, status: usrStatusFilter });
    if (requestId !== usersRequest) return;
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    users = result.users;
    userStats = result.stats;
    const ids = new Set(users.map((user) => user.user_id));
    for (const selected of [...usrSelected]) if (!ids.has(selected)) usrSelected.delete(selected);
    renderUsers();
  }

  function renderUsers() {
    setText('#usr-stat-total', formatNumber(userStats.total));
    setText('#usr-stat-active', formatNumber(userStats.active));
    setText('#usr-stat-inactive', formatNumber(userStats.inactive));
    setText('#usr-stat-new', formatNumber(userStats.new_this_month));
    const diff = Number(userStats.new_this_month || 0) - Number(userStats.new_prev_month || 0);
    setText(
      '#usr-stat-new-sub',
      userStats.new_prev_month
        ? `${diff >= 0 ? '+' : ''}${formatNumber(diff)} dari bulan lalu`
        : 'Bulan berjalan',
    );
    setText('#usr-result-count', `Menampilkan ${users.length} pengguna`);

    const tbody = document.getElementById('usr-table-body');
    tbody.replaceChildren();
    if (!users.length) {
      tbody.innerHTML =
        '<tr><td colspan="9" class="px-6 py-16 text-center"><p class="font-display font-bold text-slate-700">Tidak ada pengguna</p><p class="mt-1 text-sm text-slate-500">Coba ubah kata kunci atau filter status.</p></td></tr>';
      updateUsrCount();
      return;
    }

    users.forEach((u, index) => {
      const status = u.status === 'active' ? 'Active' : 'Inactive';
      const stBg =
        u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500';
      const tr = document.createElement('tr');
      tr.className = 'user-row hover:bg-lagoon';
      tr.innerHTML = `<td class="px-5 py-4"><input type="checkbox" class="usr-check h-4 w-4 rounded border-slate-300 accent-pool cursor-pointer" data-id="${escapeHtml(u.user_id)}" ${usrSelected.has(u.user_id) ? 'checked' : ''}></td><td class="px-4 py-4"><div class="flex items-center gap-3"><span class="avatar-c${index % 8} flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold">${escapeHtml(getInitials(u.full_name))}</span><div><p class="font-bold text-slate-800">${escapeHtml(u.full_name)}</p><p class="text-xs text-slate-500">${escapeHtml(u.email)}</p></div></div></td><td class="px-4 py-4 text-slate-500">${escapeHtml(u.email)}</td><td class="px-4 py-4 text-slate-500">${escapeHtml(u.phone || '—')}</td><td class="px-4 py-4 text-slate-500">${formatJoinDate(u.created_at)}</td><td class="px-4 py-4 text-slate-500">${formatNumber(u.paid_bookings)} / ${formatNumber(u.booking_count)}</td><td class="px-4 py-4 text-right font-semibold text-slate-700">${formatRupiah(u.total_spend)}</td><td class="px-4 py-4"><span class="rounded-full ${stBg} px-3 py-1.5 text-xs font-bold">${status}</span></td><td class="px-5 py-4"><div class="flex justify-end gap-1"><button class="edit-usr rounded-lg p-2 text-slate-500 hover:bg-lagoon hover:text-pool" aria-label="Edit pengguna ${escapeHtml(u.full_name)}" data-id="${escapeHtml(u.user_id)}"><iconify-icon icon="lucide:pencil"></iconify-icon></button><button class="toggle-usr rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600" aria-label="${u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'} pengguna ${escapeHtml(u.full_name)}" data-id="${escapeHtml(u.user_id)}" title="${u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}"><iconify-icon icon="${u.status === 'active' ? 'lucide:user-round-x' : 'lucide:user-check'}"></iconify-icon></button></div></td>`;
      labelTableRow(tr, ['', 'User', 'Email', 'Phone', 'Join Date', 'Bookings', 'Spend', 'Status', 'Actions']);
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.usr-check').forEach((cb) => {
      cb.addEventListener('change', () => {
        if (cb.checked) usrSelected.add(cb.dataset.id);
        else usrSelected.delete(cb.dataset.id);
        updateUsrCount();
      });
    });
    tbody.querySelectorAll('.edit-usr').forEach((button) => {
      button.addEventListener('click', () => {
        const user = users.find((item) => item.user_id === button.dataset.id);
        if (user) openUserModal(user);
      });
    });
    tbody.querySelectorAll('.toggle-usr').forEach((button) => {
      button.addEventListener('click', async () => {
        const user = users.find((item) => item.user_id === button.dataset.id);
        if (!user || button.dataset.busy === '1') return;
        button.dataset.busy = '1';
        const next = user.status === 'active' ? 'inactive' : 'active';
        const result = await usersService.updateStatus(user.user_id, next);
        delete button.dataset.busy;
        if (!result.success) {
          showToast(result.error, 'error');
          return;
        }
        showToast(`${user.full_name} → ${next === 'active' ? 'Active' : 'Inactive'}`);
        await loadUsers();
      });
    });
    updateUsrCount();
  }

  function updateUsrCount() {
    setText('#usr-selected-count', `${usrSelected.size} user dipilih`);
  }
  document.getElementById('usr-select-all')?.addEventListener('change', (e) => {
    document.querySelectorAll('.usr-check').forEach((checkbox) => {
      checkbox.checked = e.target.checked;
      if (e.target.checked) usrSelected.add(checkbox.dataset.id);
      else usrSelected.delete(checkbox.dataset.id);
    });
    updateUsrCount();
  });
  let usrSearchTimer;
  document.getElementById('usr-search')?.addEventListener('input', (e) => {
    usrSearch = e.target.value.trim();
    clearTimeout(usrSearchTimer);
    usrSearchTimer = setTimeout(loadUsers, 300);
  });
  document.getElementById('usr-status-filter')?.addEventListener('change', (e) => {
    usrStatusFilter = e.target.value;
    void loadUsers();
  });

  // User modal (edit only — pembuatan akun baru memerlukan Supabase service role)
  const userModal = document.getElementById('user-modal');
  function openUserModal(user) {
    editingUserId = user.user_id;
    document.getElementById('user-modal-title').textContent = 'Edit user';
    document.getElementById('um-name').value = user.full_name || '';
    const emailInput = document.getElementById('um-email');
    emailInput.value = user.email || '';
    emailInput.readOnly = true;
    document.getElementById('um-phone').value = user.phone || '';
    document.getElementById('um-status').value = user.status === 'active' ? 'Active' : 'Inactive';
    userModal.classList.add('show');
  }
  function closeUserModal() {
    userModal.classList.remove('show');
    editingUserId = null;
  }
  document.getElementById('close-user-modal')?.addEventListener('click', closeUserModal);
  document.getElementById('cancel-user-modal')?.addEventListener('click', closeUserModal);
  userModal?.addEventListener('click', (e) => {
    if (e.target === userModal) closeUserModal();
  });
  document.getElementById('user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!editingUserId) return;
    const name = document.getElementById('um-name').value.trim();
    const phone = document.getElementById('um-phone').value.trim();
    const status = document.getElementById('um-status').value === 'Active' ? 'active' : 'inactive';
    const profileResult = await usersService.updateProfile(editingUserId, {
      fullName: name,
      phone,
    });
    if (!profileResult.success) {
      showToast(profileResult.error, 'error');
      return;
    }
    const current = users.find((item) => item.user_id === editingUserId);
    if (current && current.status !== status) {
      const statusResult = await usersService.updateStatus(editingUserId, status);
      if (!statusResult.success) {
        showToast(statusResult.error, 'error');
        return;
      }
    }
    showToast(`User ${name} diperbarui`);
    closeUserModal();
    await loadUsers();
  });

  async function setSelectedUsersStatus(status) {
    if (!usrSelected.size) {
      showToast('Pilih user dulu', 'info');
      return;
    }
    const ids = [...usrSelected];
    const results = await Promise.all(ids.map((id) => usersService.updateStatus(id, status)));
    const failed = results.find((result) => !result.success);
    if (failed) {
      showToast(failed.error, 'error');
    } else {
      showToast(`${ids.length} user ${status === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`);
    }
    usrSelected.clear();
    updateUsrCount();
    await loadUsers();
  }
  document
    .getElementById('usr-activate-btn')
    ?.addEventListener('click', () => void setSelectedUsersStatus('active'));
  document
    .getElementById('usr-deactivate-btn')
    ?.addEventListener('click', () => void setSelectedUsersStatus('inactive'));

  document.getElementById('export-users-btn')?.addEventListener('click', () => {
    const fields = [
      'user_id',
      'full_name',
      'email',
      'phone',
      'status',
      'created_at',
      'booking_count',
      'paid_bookings',
      'total_spend',
    ];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const content = [
      fields.join(','),
      ...users.map((user) => fields.map((field) => escapeCsv(user[field])).join(',')),
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `citraland-users-${todayWita()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Data user diexport');
  });

  // ===================== CONTENT PAGE =====================
  // Content tabs
  document.querySelectorAll('.ctab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ctab-btn').forEach((b) => {
        b.classList.remove('bg-pool', 'text-white');
        b.classList.add('text-slate-500');
      });
      btn.classList.add('bg-pool', 'text-white');
      btn.classList.remove('text-slate-500');
      document
        .querySelectorAll('#page-content .tab-panel')
        .forEach((p) => p.classList.remove('active'));
      document.getElementById('ctab-' + btn.dataset.ctab).classList.add('active');
    });
  });

  // Pricing
  function renderPricing() {
    const container = document.getElementById('pricing-cards');
    container.replaceChildren();
    pricing.forEach((p) => {
      const card = document.createElement('article');
      card.className = `pricing-card rounded-2xl ${p.featured ? 'border-2 border-ocean ring-2 ring-aqua/15' : 'border border-slate-200'} bg-white p-6 shadow-sm`;
      const id = escapeHtml(p.id);
      card.innerHTML = `<div class="flex items-start justify-between"><div><span class="flex h-11 w-11 items-center justify-center rounded-xl ${p.featured ? 'bg-pool text-white' : 'bg-lagoon text-pool'}"><iconify-icon icon="${escapeHtml(p.icon)}" class="text-xl"></iconify-icon></span><h3 class="mt-5 font-display text-lg font-bold">${escapeHtml(p.name)}</h3><p class="mt-1 text-xs text-slate-500">${escapeHtml(p.desc)}</p></div><span class="rounded-full ${p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'} px-3 py-1 text-xs font-bold">${p.status === 'active' ? 'Published' : 'Unpublished'}</span></div><label class="mt-6 block text-sm font-bold text-slate-700">Harga tiket<input type="text" value="${p.price}" data-pid="${id}" class="price-field mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-semibold outline-none focus:border-aqua focus:ring-4 focus:ring-aqua/20"></label><label class="mt-4 block text-sm font-bold text-slate-700">Deskripsi<textarea readonly class="mt-2 h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">${escapeHtml(p.desc)}</textarea></label><div class="mt-4 rounded-xl ${p.featured ? 'bg-lagoon' : 'bg-slate-50'} p-4"><div><p class="text-xs text-slate-500">Preview harga</p><p class="price-preview mt-1 font-display text-2xl font-extrabold text-pool" data-pid="${id}">Rp${p.price.toLocaleString('id-ID')}</p></div></div><div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-5"><label class="flex items-center gap-2 text-xs font-bold text-slate-500"><input type="checkbox" ${p.status === 'active' ? 'checked' : ''} data-pid="${id}" class="pricing-status h-4 w-4 accent-pool"> Publish</label><button class="save-price-btn flex min-h-10 items-center gap-2 rounded-xl bg-pool px-4 text-sm font-bold text-white hover:bg-pool/90" data-pid="${id}"><iconify-icon icon="lucide:save"></iconify-icon> Simpan</button></div>`;
      container.appendChild(card);
    });
    container.querySelectorAll('.price-field').forEach((inp) => {
      inp.addEventListener('input', () => {
        const pid = inp.dataset.pid;
        const v = parseInt(inp.value.replace(/\D/g, '')) || 0;
        const prev = container.querySelector(`.price-preview[data-pid="${pid}"]`);
        if (prev) prev.textContent = 'Rp' + v.toLocaleString('id-ID');
      });
      inp.addEventListener('focus', () => {
        inp.value = inp.value.replace(/\D/g, '');
      });
    });
    container.querySelectorAll('.save-price-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const pid = btn.dataset.pid;
        const inp = container.querySelector(`.price-field[data-pid="${pid}"]`);
        const rawValue = inp?.value.replace(/\D/g, '') ?? '';
        const value = Number(rawValue);
        const current = pricing.find((item) => item.id === pid);
        if (!current || !rawValue || !Number.isFinite(value) || value < 0) {
          showToast('Harga tiket tidak valid.', 'error');
          return;
        }
        const result = await ticketPricingService.updatePrice(pid, value);
        if (!result.success) {
          showToast(result.error, 'error');
          return;
        }
        current.price = value;
        showToast(`Harga ${current.name} disimpan`);
      });
    });
    container.querySelectorAll('.pricing-status').forEach((input) => {
      input.addEventListener('change', async () => {
        const current = pricing.find((item) => item.id === input.dataset.pid);
        if (!current) return;
        const status = input.checked ? 'active' : 'inactive';
        const result = await ticketPricingService.setPricingStatus(current.id, status);
        if (!result.success) {
          input.checked = !input.checked;
          showToast(result.error, 'error');
          return;
        }
        current.status = status;
        showToast(`${current.name} ${status === 'active' ? 'dipublikasikan' : 'dinonaktifkan'}`);
        renderPricing();
      });
    });
  }

  // Facilities
  function renderFacilities() {
    const tbody = document.getElementById('fac-table-body');
    tbody.replaceChildren();
    facilities.forEach((f) => {
      const stCls =
        f.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500';
      const tr = document.createElement('tr');
      tr.className = 'facility-row hover:bg-lagoon';
      tr.innerHTML = `<td class="px-6 py-5 font-bold text-slate-800">${escapeHtml(f.name)}</td><td class="px-4 py-5 text-slate-500">${escapeHtml(f.desc)}</td><td class="px-4 py-5"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-lagoon text-pool"><iconify-icon icon="${escapeHtml(f.icon)}"></iconify-icon></span></td><td class="px-4 py-5"><span class="rounded-full ${stCls} px-3 py-1.5 text-xs font-bold">${f.status}</span></td><td class="px-6 py-5 text-right"><div class="flex justify-end gap-1"><button class="edit-fac rounded-lg p-2 text-slate-500 hover:bg-lagoon hover:text-pool" aria-label="Edit fasilitas ${escapeHtml(f.name)}" data-id="${escapeHtml(f.id)}"><iconify-icon icon="lucide:pencil"></iconify-icon></button><button class="del-fac rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-500" aria-label="Hapus fasilitas ${escapeHtml(f.name)}" data-id="${escapeHtml(f.id)}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button></div></td>`;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.edit-fac').forEach((b) => {
      b.addEventListener('click', () => {
        const f = facilities.find((x) => x.id === b.dataset.id);
        if (f) openFacModal(f);
      });
    });
    tbody.querySelectorAll('.del-fac').forEach((b) => {
      b.addEventListener('click', () => {
        const f = facilities.find((x) => x.id === b.dataset.id);
        if (f) {
          deleteTarget = { type: 'facility', id: f.id };
          document.getElementById('delete-message').textContent =
            `Fasilitas ${f.name} akan dihapus.`;
          document.getElementById('delete-modal').classList.add('show');
        }
      });
    });
  }

  const facModal = document.getElementById('facility-modal');
  function openFacModal(f = null) {
    editingFacId = f ? f.id : null;
    document.getElementById('fac-modal-title').textContent = f
      ? 'Edit fasilitas'
      : 'Tambah fasilitas';
    document.getElementById('fac-name').value = f?.name || '';
    document.getElementById('fac-desc').value = f?.desc || '';
    document.getElementById('fac-icon').value = f?.icon || '';
    document.getElementById('fac-status').value = f?.status || 'Active';
    facModal.classList.add('show');
  }
  function closeFacModal() {
    facModal.classList.remove('show');
    editingFacId = null;
  }
  document.getElementById('add-facility-btn').addEventListener('click', () => openFacModal());
  document.getElementById('close-facility-modal').addEventListener('click', closeFacModal);
  document.getElementById('cancel-facility-modal').addEventListener('click', closeFacModal);
  facModal.addEventListener('click', (e) => {
    if (e.target === facModal) closeFacModal();
  });
  document.getElementById('save-facility-btn').addEventListener('click', async () => {
    const name = document.getElementById('fac-name').value.trim();
    const desc = document.getElementById('fac-desc').value.trim();
    const icon = document.getElementById('fac-icon').value.trim() || 'lucide:building-2';
    const status = document.getElementById('fac-status').value;
    if (!name) {
      showToast('Nama wajib diisi', 'error');
      return;
    }
    let result;
    if (editingFacId) {
      result = await facilitiesService.updateFacility(editingFacId, {
        facility_name: name,
        description: desc,
        icon,
        status: status.toLowerCase(),
      });
    } else {
      const displayOrder =
        Math.max(0, ...facilities.map((facility) => facility.displayOrder || 0)) + 1;
      result = await facilitiesService.createFacility({
        facility_name: name,
        description: desc,
        icon,
        display_order: displayOrder,
      });
    }
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    showToast(editingFacId ? `"${name}" diperbarui` : `"${name}" ditambahkan`);
    closeFacModal();
    await loadContent();
  });

  // Promotions
  function renderPromotions() {
    const list = document.getElementById('promo-list');
    const ac = promotions.filter((p) => p.active).length;
    document.getElementById('promo-active-count').textContent = `${ac} Active`;
    list.replaceChildren();
    if (!promotions.length) {
      list.innerHTML =
        '<div class="py-10 text-center"><p class="font-display font-bold text-slate-700">Belum ada promosi</p></div>';
      return;
    }
    promotions.forEach((p) => {
      const d = document.createElement('div');
      d.className =
        'promo-card flex items-center justify-between rounded-xl border border-slate-100 p-4';
      d.innerHTML = `<div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl ${p.active ? 'bg-lagoon text-pool' : 'bg-slate-100 text-slate-500'}"><iconify-icon icon="lucide:ticket-percent"></iconify-icon></span><div><p class="font-bold ${p.active ? 'text-pool' : 'text-slate-500'}">${escapeHtml(p.code)}</p><p class="mt-0.5 text-xs text-slate-500">${escapeHtml(p.discount)} · ${escapeHtml(p.period)}</p></div></div><div class="flex items-center gap-3"><div class="toggle-switch ${p.active ? 'active' : ''}" data-id="${escapeHtml(p.id)}"><span class="toggle-knob"></span></div><button class="del-promo rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-500" aria-label="Hapus promosi ${escapeHtml(p.code)}" data-id="${escapeHtml(p.id)}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button></div>`;
      list.appendChild(d);
    });
    list.querySelectorAll('.toggle-switch').forEach((t) => {
      t.addEventListener('click', async () => {
        const p = promotions.find((x) => x.id === t.dataset.id);
        if (!p) return;
        const result = await promotionService.updatePromotionStatus(
          p.id,
          p.active ? 'inactive' : 'active',
        );
        if (!result.success) {
          showToast(result.error, 'error');
          return;
        }
        await loadContent();
      });
    });
    list.querySelectorAll('.del-promo').forEach((b) => {
      b.addEventListener('click', () => {
        const p = promotions.find((x) => x.id === b.dataset.id);
        if (p) {
          deleteTarget = { type: 'promo', id: p.id };
          document.getElementById('delete-message').textContent =
            `Promo ${p.code} akan dihapus permanen.`;
          document.getElementById('delete-modal').classList.add('show');
        }
      });
    });
  }

  document.getElementById('publish-promo-btn').addEventListener('click', async () => {
    const code = document.getElementById('promo-code').value.trim().toUpperCase();
    const type = document.getElementById('promo-type').value;
    const amount = document.getElementById('promo-amount').value;
    const start = document.getElementById('promo-start').value;
    const end = document.getElementById('promo-end').value;
    if (!code || !amount || !start || !end) {
      showToast('Lengkapi semua field', 'error');
      return;
    }
    const result = await promotionService.createPromotion({
      promo_code: code,
      discount_type: type === 'Percentage (%)' ? 'percentage' : 'nominal',
      discount_amount: Number(amount),
      start_date: start,
      end_date: end,
      status: 'active',
    });
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    document.getElementById('promo-code').value = '';
    document.getElementById('promo-amount').value = '';
    document.getElementById('promo-start').value = '';
    document.getElementById('promo-end').value = '';
    await loadContent();
    showToast(`Promo "${code}" dipublikasikan!`);
  });

  // Gallery
  function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    const publishedCount = galleryItems.filter((item) => item.status === 'published').length;
    document.getElementById('gallery-count-badge').textContent = `${publishedCount} Published`;
    grid.replaceChildren();
    if (!galleryItems.length) {
      grid.innerHTML =
        '<div class="col-span-full py-10 text-center"><p class="font-display font-bold text-slate-700">Galeri kosong</p></div>';
      return;
    }
    galleryItems.forEach((item) => {
      const d = document.createElement('div');
      d.className =
        'gallery-item group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100';
      d.draggable = true;
      d.dataset.id = item.id;
      const image = document.createElement('img');
      image.src = item.url;
      image.alt = item.title;
      image.className = 'h-44 w-full object-cover';
      const imageContainer = document.createElement('div');
      imageContainer.className = 'relative';
      imageContainer.appendChild(image);
      const overlayElement = document.createElement('div');
      overlayElement.className =
        'gallery-overlay absolute inset-0 flex items-center justify-center bg-ink/40';
      overlayElement.innerHTML = `<button class="del-gallery flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-rose-500 hover:bg-white" aria-label="Hapus foto galeri" data-id="${escapeHtml(item.id)}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button>`;
      imageContainer.appendChild(overlayElement);
      const details = document.createElement('div');
      details.className = 'flex items-center justify-between p-3';
      details.innerHTML = `<div><p class="text-sm font-bold">${escapeHtml(item.title)}</p><p class="text-xs text-slate-500">Order ${String(item.order).padStart(2, '0')} · ${escapeHtml(item.status)}</p></div>`;
      d.append(imageContainer, details);
      grid.appendChild(d);
    });
    grid.querySelectorAll('.del-gallery').forEach((b) => {
      b.addEventListener('click', () => {
        const item = galleryItems.find((image) => image.id === b.dataset.id);
        if (item) {
          deleteTarget = { type: 'gallery', id: item.id };
          document.getElementById('delete-message').textContent =
            `Gambar ${item.title} akan dihapus permanen.`;
          document.getElementById('delete-modal').classList.add('show');
        }
      });
    });
    let draggedGalleryId = null;
    grid.querySelectorAll('.gallery-item').forEach((card) => {
      card.addEventListener('dragstart', (event) => {
        draggedGalleryId = card.dataset.id;
        event.dataTransfer?.setData('text/plain', draggedGalleryId);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      });
      card.addEventListener('drop', async (event) => {
        event.preventDefault();
        const sourceId = draggedGalleryId || event.dataTransfer?.getData('text/plain');
        const targetId = card.dataset.id;
        draggedGalleryId = null;
        if (!sourceId || sourceId === targetId) return;
        const reordered = [...galleryItems];
        const sourceIndex = reordered.findIndex((item) => item.id === sourceId);
        const targetIndex = reordered.findIndex((item) => item.id === targetId);
        if (sourceIndex < 0 || targetIndex < 0) return;
        const [movedItem] = reordered.splice(sourceIndex, 1);
        reordered.splice(targetIndex, 0, movedItem);
        const results = await Promise.all(
          reordered.map((item, index) => galleryService.updateImageOrder(item.id, index + 1)),
        );
        const failedResult = results.find((result) => !result.success);
        if (failedResult) {
          showToast(failedResult.error, 'error');
          await loadContent();
          return;
        }
        await loadContent();
        showToast('Urutan galeri diperbarui');
      });
      card.addEventListener('dragend', () => {
        draggedGalleryId = null;
      });
    });
  }

  // Gallery upload
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('gallery-file-input');
  document.getElementById('choose-gallery-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  dropZone.addEventListener('click', (e) => {
    if (e.target.id !== 'choose-gallery-btn') fileInput.click();
  });
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleGalleryFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', () => {
    handleGalleryFiles(fileInput.files);
    fileInput.value = '';
  });

  function handleGalleryFiles(files) {
    if (!files.length) return;
    const selectedFiles = Array.from(files);
    void Promise.all(
      selectedFiles.map(async (file, index) => {
        const caption = file.name
          .replace(/\.[^.]+$/, '')
          .trim()
          .slice(0, 200);
        const result = await galleryService.uploadImage(
          file,
          caption,
          galleryItems.length + index + 1,
        );
        if (!result.success) showToast(`${file.name}: ${result.error}`, 'error');
        return result.success;
      }),
    ).then(async (results) => {
      const uploaded = results.filter(Boolean).length;
      if (uploaded) {
        await loadContent();
        showToast(`${uploaded} gambar berhasil diunggah`);
      }
    });
  }

  // ===================== ANALYTICS PAGE =====================
  // Jam kunjungan 09.00–17.00 WITA. Setiap check-in dihitung berdasarkan angka
  // depan jamnya (mis. 09.30 -> jam 09, 10.45 -> jam 10).
  const VISIT_START_HOUR = 9;
  const VISIT_END_HOUR = 17;

  function renderHeatmap(analytics) {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return 0;
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const hours = [];
    for (let hour = VISIT_START_HOUR; hour <= VISIT_END_HOUR; hour += 1) hours.push(hour);
    const counts = dayNames.map(() => hours.map(() => 0));
    for (const item of analytics.peak_hours ?? []) {
      const dow = Number(item.dow);
      const hour = Math.floor(Number(item.hour));
      if (!Number.isFinite(dow) || dow < 1 || dow > 7) continue;
      if (!Number.isFinite(hour)) continue;
      // Check-in di luar jam kunjungan tetap dimasukkan ke jam terdekat.
      const clamped = Math.min(VISIT_END_HOUR, Math.max(VISIT_START_HOUR, hour));
      counts[dow - 1][clamped - VISIT_START_HOUR] += Number(item.count || 0);
    }
    const max = Math.max(0, ...counts.flat());
    const colors = [
      'bg-lagoon',
      'bg-seafoam',
      'bg-aqua/40',
      'bg-aqua/50',
      'bg-aqua/70',
      'bg-ocean',
    ];
    grid.replaceChildren();
    dayNames.forEach((day, dayIndex) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[70px_repeat(9,1fr)] items-center gap-1';
      row.innerHTML =
        `<span class="text-slate-500 text-[11px]">${day}</span>` +
        counts[dayIndex]
          .map((value, hourIndex) => {
            const level = max
              ? Math.min(colors.length - 1, Math.ceil((value / max) * colors.length) - 1)
              : 0;
            const hour = hours[hourIndex];
            const label = `${String(hour).padStart(2, '0')}.00–${String(hour).padStart(2, '0')}.59`;
            return `<i class="heatmap-cell flex h-8 items-center justify-center rounded text-[10px] font-bold text-slate-600 ${colors[level]}" title="${day} ${label} WITA · ${value} check-in">${value || ''}</i>`;
          })
          .join('');
      grid.appendChild(row);
    });
    return counts.flat().reduce((total, value) => total + value, 0);
  }

  function renderTicketDonut(analytics) {
    const distribution = analytics.ticket_distribution ?? {};
    const items = [
      { key: 'weekday', label: 'Weekdays', value: Number(distribution.weekday || 0) },
      { key: 'weekend', label: 'Weekend', value: Number(distribution.weekend || 0) },
    ];
    const result = donutSegments(items);
    const donut = document.querySelector('#page-analytics .donut-chart');
    if (!donut) return;
    donut.style.background = result.gradient;
    setText('#an-ticket-total', formatNumber(result.total));
    const legend = donut.nextElementSibling;
    if (!legend) return;
    legend.replaceChildren();
    if (!result.total) {
      legend.innerHTML =
        '<p class="text-sm text-slate-500">Belum ada tiket terjual pada periode ini.</p>';
      return;
    }
    for (const segment of result.segments) {
      const row = document.createElement('p');
      row.className = 'flex items-center gap-3';
      const dot = document.createElement('i');
      dot.className = 'h-3 w-3 rounded-full';
      dot.style.backgroundColor = segment.color;
      const label = document.createElement('span');
      label.className = 'w-20 text-slate-500';
      label.textContent = segment.label;
      const value = document.createElement('b');
      value.textContent = `${formatNumber(segment.value)} · ${Math.round((segment.value / result.total) * 100)}%`;
      row.append(dot, label, value);
      legend.appendChild(row);
    }
  }

  async function loadAnalytics() {
    if (!anFrom || !anTo) {
      anTo = todayWita();
      anFrom = monthStartWita();
    }
    const fromInput = document.getElementById('an-date-from');
    const toInput = document.getElementById('an-date-to');
    if (fromInput && !fromInput.value) fromInput.value = anFrom;
    if (toInput && !toInput.value) toInput.value = anTo;

    const requestId = ++analyticsRequest;
    const result = await analyticsService.getAnalytics(anFrom, anTo);
    if (requestId !== analyticsRequest) return;
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    const a = result.analytics;
    analyticsCache = a;

    setText('#an-revenue', formatRupiah(a.total_revenue));
    setText('#an-bookings', formatNumber(a.total_bookings));
    setText('#an-visitors', formatNumber(a.tickets_sold));
    setText(
      '#an-price-range',
      `${formatRupiahShort(a.price_min)} – ${formatRupiahShort(a.price_max)}`,
    );
    setText('#an-revenue-sub', `vs ${formatRupiah(a.prev_revenue)} periode sebelumnya`);
    setText('#an-bookings-sub', `vs ${formatNumber(a.prev_bookings)} booking periode sebelumnya`);
    setText('#an-visitors-sub', `${formatNumber(a.checked_in_total)} check-in pada periode ini`);
    setText('#an-new-users', `+${formatNumber(a.new_users_this_month)} pengguna baru`);
    setText('#an-monthly-sub', `Revenue bulanan ${a.year}`);

    const monthly = a.monthly_revenue ?? [];
    const monthlyChart = document.querySelector('#page-analytics .h-64');
    if (monthlyChart) {
      monthlyChart.innerHTML = barChart(
        monthly.map((item) => Number(item.revenue)),
        monthly.map((item) => monthShort(item.month)),
        { emptyLabel: 'Belum ada revenue pada tahun ini', colors: ['#00BCD4'] },
      );
    }

    const growth = a.user_growth ?? [];
    const growthChart = document.querySelector('#page-analytics .h-56');
    if (growthChart) {
      growthChart.innerHTML = areaChart(
        growth.map((item) => Number(item.users)),
        {
          labels: growth.map((item) => monthShort(item.month)),
          valueFormatter: (value) => formatNumber(Math.round(value)),
          emptyLabel: 'Belum ada pengguna terdaftar',
          gradientId: 'userGrowthFill',
        },
      );
    }

    renderTicketDonut(a);
    const heatmapTotal = renderHeatmap(a);
    setText('#an-heatmap-badge', `${formatNumber(heatmapTotal)} check-in`);
  }

  document.getElementById('analytics-export-btn')?.addEventListener('click', exportAnalytics);

  function exportAnalytics() {
    const rows = [['month', 'revenue']];
    for (const item of analyticsCache.monthly_revenue ?? [])
      rows.push([item.month, Math.round(Number(item.revenue || 0))]);
    rows.push([]);
    rows.push(['total_revenue', Math.round(Number(analyticsCache.total_revenue || 0))]);
    rows.push(['total_bookings', analyticsCache.total_bookings ?? 0]);
    rows.push(['tickets_sold', analyticsCache.tickets_sold ?? 0]);
    rows.push(['checked_in_total', analyticsCache.checked_in_total ?? 0]);
    const content = rows.map((row) => row.join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `citraland-analytics-${anFrom}-${anTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Laporan analytics diexport');
  }

  // ===================== DELETE MODAL =====================
  document.getElementById('delete-cancel-btn').addEventListener('click', () => {
    document.getElementById('delete-modal').classList.remove('show');
    deleteTarget = null;
  });
  document.getElementById('delete-modal').addEventListener('click', (e) => {
    if (e.target.id === 'delete-modal') {
      document.getElementById('delete-modal').classList.remove('show');
      deleteTarget = null;
    }
  });
  document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const confirmButton = document.getElementById('delete-confirm-btn');
    confirmButton.disabled = true;
    let result;
    try {
      if (target.type === 'booking') {
        result = await bookingService.deleteBooking(target.dbId);
        if (result.success) {
          showToast(`Booking ${target.id} dihapus`);
          await loadBookings();
          await loadDashboard();
        }
      } else if (target.type === 'facility') {
        result = await facilitiesService.deleteFacility(target.id);
        if (result.success) {
          await loadContent();
          showToast('Fasilitas dinonaktifkan');
        }
      } else if (target.type === 'promo') {
        result = await promotionService.deletePromotion(target.id);
        if (result.success) {
          await loadContent();
          showToast('Promo dihapus');
        }
      } else if (target.type === 'gallery') {
        result = await galleryService.deleteImage(target.id);
        await loadContent();
        if (result.success) showToast('Gambar dihapus');
      }
      if (result && !result.success) showToast(result.error, 'error');
    } finally {
      confirmButton.disabled = false;
      document.getElementById('delete-modal').classList.remove('show');
      deleteTarget = null;
    }
  });

  // ===================== INIT =====================
  // Buang markup chart/booking contoh sebelum data asli dimuat agar tidak ada
  // angka mock yang sempat tampil.
  document
    .querySelectorAll('#page-dashboard .h-64, #page-analytics .h-64, #page-analytics .h-56')
    .forEach((el) => el.replaceChildren());
  const initialRecent = document.querySelector('#page-dashboard table tbody');
  if (initialRecent)
    initialRecent.innerHTML =
      '<tr><td colspan="6" class="px-6 py-12 text-center text-sm text-slate-500">Memuat pemesanan…</td></tr>';

  // Periode default: awal bulan berjalan sampai hari ini (WITA).
  dashFrom = monthStartWita();
  dashTo = todayWita();
  anFrom = dashFrom;
  anTo = dashTo;
  for (const [id, value] of [
    ['dash-date-from', dashFrom],
    ['dash-date-to', dashTo],
    ['an-date-from', anFrom],
    ['an-date-to', anTo],
  ]) {
    const input = document.getElementById(id);
    if (input) input.value = value;
  }
  function updateRange(which) {
    const fromId = which === 'dash' ? 'dash-date-from' : 'an-date-from';
    const toId = which === 'dash' ? 'dash-date-to' : 'an-date-to';
    const from = document.getElementById(fromId)?.value;
    const to = document.getElementById(toId)?.value;
    if (!from || !to) return;
    if (from > to) {
      showToast('Tanggal mulai tidak boleh melebihi tanggal akhir.', 'error');
      return;
    }
    if (which === 'dash') {
      dashFrom = from;
      dashTo = to;
      void loadDashboard();
    } else {
      anFrom = from;
      anTo = to;
      void loadAnalytics();
    }
  }
  document.getElementById('dash-date-from')?.addEventListener('change', () => updateRange('dash'));
  document.getElementById('dash-date-to')?.addEventListener('change', () => updateRange('dash'));
  document.getElementById('an-date-from')?.addEventListener('change', () => updateRange('an'));
  document.getElementById('an-date-to')?.addEventListener('change', () => updateRange('an'));

  // ===================== SETTINGS =====================
  document.getElementById('save-admin-profile-btn')?.addEventListener('click', async () => {
    const button = document.getElementById('save-admin-profile-btn');
    setBusy(button, true);
    const fullName = document.getElementById('admin-profile-name')?.value.trim();
    const phone = document.getElementById('admin-profile-phone')?.value.trim();
    const result = await authService.updateAdminProfile({ fullName, phone });
    setBusy(button, false);
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    currentAdminProfile = result.admin;
    setText('#admin-profile-status', 'Profil tersimpan di database.');
    showToast('Profil admin diperbarui');
    await loadAdminProfile();
  });

  document.getElementById('update-admin-password-btn')?.addEventListener('click', async () => {
    const button = document.getElementById('update-admin-password-btn');
    const current = document.getElementById('admin-current-password')?.value || '';
    const next = document.getElementById('admin-new-password')?.value || '';
    if (!current || !next) {
      showToast('Lengkapi password lama dan password baru.', 'error');
      return;
    }
    setBusy(button, true);
    const result = await authService.updatePassword(current, next);
    setBusy(button, false);
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    document.getElementById('admin-current-password').value = '';
    document.getElementById('admin-new-password').value = '';
    showToast('Password admin berhasil diperbarui');
  });

  // ===================== REALTIME & FALLBACK =====================
  function currentPage() {
    return window.location.hash.replace('#', '') || 'dashboard';
  }
  function refreshCurrentPage() {
    const page = currentPage();
    if (page === 'dashboard') void loadDashboard();
    if (page === 'bookings') {
      void loadBookings();
      void loadDashboard();
    }
    if (page === 'users') void loadUsers();
    if (page === 'analytics') void loadAnalytics();
    if (page === 'content') void loadContent();
    if (page === 'settings') void loadAdminProfile();
  }
  window.addEventListener('admin:refresh', refreshCurrentPage);

  const scheduleBookingsRefresh = debounce(() => {
    void loadBookings();
    void loadDashboard();
    if (currentPage() === 'users') void loadUsers();
  }, 450);
  const scheduleUsersRefresh = debounce(() => void loadUsers(), 600);
  const scheduleContentRefresh = debounce(() => void loadContent(), 500);

  handleHash();
  void loadBookings();
  void loadDashboard();
  void loadUsers();

  const unsubscribeBookings = realtimeManager.subscribeToBookings(scheduleBookingsRefresh);
  const unsubscribeUsers = realtimeManager.subscribeToUsers(scheduleUsersRefresh);
  const unsubscribePricing = realtimeManager.subscribeToTicketPricing(
    scheduleContentRefresh,
    'admin_ticket_pricing_changes',
  );
  const unsubscribeFacilities = realtimeManager.subscribeToFacilities(scheduleContentRefresh);
  const unsubscribePromotions = realtimeManager.subscribeToPromotions(scheduleContentRefresh);
  const unsubscribeGallery = realtimeManager.subscribeToGallery(scheduleContentRefresh);

  // Fallback: jika realtime belum tersambung, muat ulang tiap 60 detik.
  pollTimer = window.setInterval(() => {
    if (document.hidden) return;
    refreshCurrentPage();
  }, 60000);
  onDocument('visibilitychange', () => {
    if (!document.hidden) refreshCurrentPage();
  });

  return () => {
    documentListeners.forEach((off) => off());
    window.removeEventListener('admin:refresh', refreshCurrentPage);
    if (pollTimer) window.clearInterval(pollTimer);
    unsubscribeBookings();
    unsubscribeUsers();
    unsubscribePricing();
    unsubscribeFacilities();
    unsubscribePromotions();
    unsubscribeGallery();
  };
}
