import { authService } from '../services/authService.js';
import { bookingService } from '../services/bookingService.js';
import { paymentService } from '../services/paymentService.js';
import { promotionService } from '../services/promotionService.js';
import { ticketPricingService } from '../services/ticketPricingService.js';
import {
  formatDateID as formatTicketDate,
  formatRupiah as formatTicketRupiah,
  generateQrDataUrl,
  getBookingDisplayStatus,
  getPaymentMethodLabel,
  getPaymentStatusMeta,
  getTicketLines,
  getTicketSummary,
  getUsageStatusMeta,
} from '../services/ticketService.js';
import { logError } from '../utils/errorHandler.js';
import { validateBookingForm } from '../utils/validation.js';

export function initializeUserPage() {
  // ===== APP STATE =====
  const appState = {
    quantities: { weekday: 0, weekend: 0 },
    prices: { weekday: 35000, weekend: 50000 },
    names: { weekday: 'Tiket Weekdays', weekend: 'Tiket Weekend' },
    promo: null,
    booking: { name: '', email: '', phone: '', date: '' },
    bookingCode: '',
    snapToken: '',
    paymentStatus: 'pending',
    paymentType: '',
    currentPage: '',
    pendingPage: null,
    isSnapOpen: false,
    isVerifyingPayment: false,
    confirmationBooking: null,
    qrDataUrl: '',
    isDownloadingTicket: false,
    ticketHistory: [],
    ticketHistoryFilter: 'all',
    isLoadingHistory: false,
    paymentTotalOverride: null,
  };
  // Tiket boleh dipilih sebelum masuk; akun baru diminta saat checkout.
  const protectedPages = new Set([
    'booking-details',
    'payment',
    'confirmation',
    'ticket-history',
  ]);
  let currentUser = null;
  const profileMenus = [
    {
      key: 'desktop',
      container: 'nav-profile',
      trigger: 'nav-profile-trigger',
      dropdown: 'nav-profile-dropdown',
      name: 'nav-profile-name',
      dropdownName: 'nav-profile-dropdown-name',
      email: 'nav-profile-email',
    },
    {
      key: 'mobile',
      container: 'mobile-nav-profile',
      trigger: 'mobile-nav-profile-trigger',
      dropdown: 'mobile-nav-profile-dropdown',
      name: 'mobile-nav-profile-name',
      email: 'mobile-nav-profile-email',
    },
    {
      key: 'select-ticket',
      container: 'select-ticket-profile',
      trigger: 'select-ticket-profile-trigger',
      dropdown: 'select-ticket-profile-dropdown',
      name: 'select-ticket-profile-name',
      dropdownName: 'select-ticket-profile-dropdown-name',
      email: 'select-ticket-profile-email',
    },
    {
      key: 'booking-details',
      container: 'booking-details-profile',
      trigger: 'booking-details-profile-trigger',
      dropdown: 'booking-details-profile-dropdown',
      name: 'booking-details-profile-name',
      dropdownName: 'booking-details-profile-dropdown-name',
      email: 'booking-details-profile-email',
    },
    {
      key: 'payment',
      container: 'payment-profile',
      trigger: 'payment-profile-trigger',
      dropdown: 'payment-profile-dropdown',
      name: 'payment-profile-name',
      dropdownName: 'payment-profile-dropdown-name',
      email: 'payment-profile-email',
    },
    {
      key: 'confirmation',
      container: 'confirmation-profile',
      trigger: 'confirmation-profile-trigger',
      dropdown: 'confirmation-profile-dropdown',
      name: 'confirmation-profile-name',
      dropdownName: 'confirmation-profile-dropdown-name',
      email: 'confirmation-profile-email',
    },
  ];

  function updateNavbarAuth(user) {
    const loginLinks = [
      document.getElementById('nav-login'),
      document.getElementById('mobile-nav-login'),
      document.getElementById('select-ticket-login'),
      document.getElementById('booking-details-login'),
      document.getElementById('payment-login'),
      document.getElementById('confirmation-login'),
    ];
    const displayName =
      user?.user_metadata?.full_name?.trim() || user?.email?.split('@')[0] || 'Profil';
    for (const link of loginLinks) {
      if (link) link.style.display = user ? 'none' : '';
    }
    for (const menu of profileMenus) {
      const container = document.getElementById(menu.container);
      if (container) container.style.display = user ? '' : 'none';
      const name = document.getElementById(menu.name);
      if (name) name.textContent = displayName;
      const dropdownName = menu.dropdownName && document.getElementById(menu.dropdownName);
      if (dropdownName) dropdownName.textContent = displayName;
      const email = document.getElementById(menu.email);
      if (email) email.textContent = user?.email ?? '';
    }
    closeProfileMenus();
  }

  function setProfileMenuOpen(type, isOpen) {
    const menu = profileMenus.find((item) => item.key === type);
    if (!menu) return;
    document.getElementById(menu.dropdown)?.classList.toggle('hidden', !isOpen);
    document.getElementById(menu.trigger)?.setAttribute('aria-expanded', String(isOpen));
  }

  function closeProfileMenus() {
    for (const menu of profileMenus) setProfileMenuOpen(menu.key, false);
  }

  function toggleProfileMenu(type) {
    const menu = profileMenus.find((item) => item.key === type);
    if (!menu) return;
    const isOpen = document.getElementById(menu.dropdown)?.classList.contains('hidden');
    closeProfileMenus();
    setProfileMenuOpen(type, Boolean(isOpen));
  }

  // ===== NAVIGATION =====
  function currentPageElement() {
    const active = document.getElementById('page-' + appState.currentPage);
    if (active) return active;
    // Saat deep link, halaman home masih bertanda active dari markup awal
    // sehingga harus ikut disembunyikan saat pindah halaman.
    return appState.currentPage ? null : document.querySelector('.page.active');
  }

  function renderPage(page) {
    const currentEl = currentPageElement();
    const targetEl = document.getElementById('page-' + page);
    if (!targetEl || page === appState.currentPage) return;

    if (currentEl === targetEl) {
      // Deep link ke halaman yang sudah tampil: cukup sinkronkan state & URL.
      targetEl.style.display = 'block';
      targetEl.classList.add('active');
      appState.currentPage = page;
      history.pushState(null, '', '#' + page);
      return;
    }

    // Hide current
    if (currentEl) {
      currentEl.classList.remove('active', 'fade-in');
      currentEl.classList.add('fade-out');
      setTimeout(() => {
        currentEl.style.display = 'none';
        currentEl.classList.remove('fade-out');
      }, 300);
    }

    // Show target
    setTimeout(() => {
      targetEl.style.display = 'block';
      targetEl.classList.add('active', 'fade-in');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      appState.currentPage = page;

      // Page-specific init
      if (page === 'confirmation') setTimeout(createConfetti, 400);
      if (page === 'booking-details') {
        const nameInput = document.getElementById('bf-name');
        const emailInput = document.getElementById('bf-email');
        if (currentUser?.user_metadata?.full_name && !nameInput.value) {
          nameInput.value = currentUser.user_metadata.full_name;
        }
        if (currentUser?.email) {
          emailInput.value = currentUser.email;
          emailInput.readOnly = true;
        }
        initBookingCalendar();
        updateBookingSummary();
      }
      if (page === 'payment') updatePaymentSummary();
      if (page === 'confirmation') updateConfirmationDetails();
      if (page === 'ticket-history') loadTicketHistory();
      if (page === 'home') initSectionSpy();
      if (page === 'home') initScrollReveal();
      initScrollReveal();
      initBubbles(page);
    }, 300);

    // Update URL hash
    history.pushState(null, '', '#' + page);
  }

  function goToSection(sectionId) {
    if (!sectionId) return;
    toggleMobileMenu(false);
    const scroll = () => {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const heading = document.querySelector('#home h1');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
        return;
      }
      const target =
        (sectionId === 'harga' && document.querySelector('#harga .home-loket')) ||
        document.getElementById(sectionId);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const heading = target.querySelector('h2, h1, h3') || document.querySelector(`#${sectionId} h2`);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    };
    if (appState.currentPage !== 'home') {
      navigateTo('home');
      setTimeout(scroll, 450);
    } else {
      setTimeout(scroll, 40);
    }
  }

  async function navigateTo(page) {
    closeProfileMenus();
    toggleMobileMenu(false);
    if (page === 'select-ticket') appState.paymentTotalOverride = null;
    if (page === 'confirmation' && appState.paymentStatus !== 'paid') {
      showToast('E-ticket hanya tersedia setelah pembayaran dikonfirmasi.', 'info');
      page = appState.bookingCode && appState.snapToken ? 'payment' : 'booking-details';
    }
    if (page === 'payment' && (!appState.snapToken || !appState.bookingCode)) {
      showToast('Mulai pemesanan terlebih dahulu sebelum membuka pembayaran.', 'info');
      page = 'booking-details';
    }
    if (protectedPages.has(page)) {
      const result = await authService.ensureActiveSession();
      if (!result.success) {
        currentUser = null;
        appState.pendingPage = page;
        showToast(
          result.error || 'Sesi tidak dapat diverifikasi. Silakan masuk kembali untuk melanjutkan.',
          'error',
        );
        renderPage('login');
        return;
      }
      currentUser = result.user;
      if (!currentUser) {
        appState.pendingPage = page;
        showToast(
          page === 'ticket-history'
            ? 'Silakan masuk untuk melihat riwayat tiket.'
            : 'Silakan masuk atau daftar terlebih dahulu untuk memesan tiket.',
          'info',
        );
        renderPage('login');
        return;
      }
    } else if (page === 'home' && !currentUser) {
      appState.pendingPage = null;
    }

    renderPage(page);
  }

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const hash = location.hash.replace('#', '') || 'home';
    navigateTo(hash);
  });

  authService.onAuthStateChange((user, _session, event) => {
    currentUser = user;
    updateNavbarAuth(user);
    if (!user) {
      appState.ticketHistory = [];
      appState.confirmationBooking = null;
      appState.qrDataUrl = '';
      appState.paymentTotalOverride = null;
    }
    if (event === 'PASSWORD_RECOVERY') {
      // Pengunjung baru membuka tautan reset dari email.
      openSetNewPasswordDialog();
    }
    if (!user && protectedPages.has(appState.currentPage)) {
      appState.pendingPage = appState.currentPage;
      renderPage('login');
    }
  });

  updateNavbarAuth(null);
  document.addEventListener('click', (event) => {
    if (!event.target.closest(profileMenus.map((menu) => `#${menu.container}`).join(', '))) {
      closeProfileMenus();
    }
  });

  async function logoutUser() {
    const result = await authService.logout();
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }

    currentUser = null;
    appState.pendingPage = null;
    appState.ticketHistory = [];
    appState.confirmationBooking = null;
    appState.qrDataUrl = '';
    appState.paymentTotalOverride = null;
    updateNavbarAuth(null);
    toggleMobileMenu(false);
    showToast('Anda berhasil keluar.', 'success');
    navigateTo('home');
  }

  // ===== MOBILE MENU =====
  let mobileMenuReturnFocus = null;

  function mobileMenuFocusable() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return [];
    return Array.from(
      menu.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0);
  }

  function toggleMobileMenu(open) {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    const isOpen = Boolean(open);
    if (isOpen && !menu.classList.contains('open')) {
      mobileMenuReturnFocus = document.activeElement;
    }
    menu.classList.toggle('open', isOpen);
    menu.inert = !isOpen;
    menu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
    document
      .querySelectorAll('[data-mobile-menu-trigger]')
      .forEach((trigger) => trigger.setAttribute('aria-expanded', String(isOpen)));

    if (isOpen) {
      setTimeout(() => menu.querySelector('[data-mobile-menu-close]')?.focus(), 60);
    } else if (mobileMenuReturnFocus?.focus) {
      mobileMenuReturnFocus.focus({ preventScroll: true });
      mobileMenuReturnFocus = null;
    }
  }

  // ===== TOAST =====
  let toastTimeout;
  function showToast(message, type = 'success') {
    clearTimeout(toastTimeout);
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const msg = document.getElementById('toast-message');
    msg.textContent = message;
    if (type === 'success') {
      icon.setAttribute('icon', 'lucide:check-circle');
      icon.className = 'text-emerald-400 text-xl';
    } else if (type === 'error') {
      icon.setAttribute('icon', 'lucide:alert-circle');
      icon.className = 'text-rose-400 text-xl';
    } else {
      icon.setAttribute('icon', 'lucide:info');
      icon.className = 'text-aqua text-xl';
    }
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ===== PASSWORD TOGGLE =====
  function togglePassword(btn) {
    const input = btn.parentElement.querySelector('input');
    const icon = btn.querySelector('iconify-icon');
    if (input.type === 'password') {
      input.type = 'text';
      icon.setAttribute('icon', 'lucide:eye-off');
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Sembunyikan kata sandi');
    } else {
      input.type = 'password';
      icon.setAttribute('icon', 'lucide:eye');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Tampilkan kata sandi');
    }
  }

  // ===== QUANTITY CONTROLS (Select Ticket Page) =====
  function updateQty(type, delta) {
    const max = 10;
    const otherType = type === 'weekday' ? 'weekend' : 'weekday';
    if (delta > 0 && appState.quantities[otherType] > 0) {
      showToast('Pilih satu jenis tiket sesuai tanggal kunjungan.', 'error');
      return;
    }
    appState.quantities[type] = Math.max(0, Math.min(max, appState.quantities[type] + delta));
    document.getElementById(type + '-qty').value = appState.quantities[type];
    updateSummaryBar();
  }

  function formatRupiah(n) {
    return 'Rp' + n.toLocaleString('id-ID');
  }

  function updateSummaryBar() {
    const total = appState.quantities.weekday + appState.quantities.weekend;
    const price =
      appState.quantities.weekday * appState.prices.weekday +
      appState.quantities.weekend * appState.prices.weekend;
    const bar = document.getElementById('summaryBar');
    document.getElementById('summaryCount').textContent = total + ' tiket';
    document.getElementById('summaryPrice').textContent = formatRupiah(price);
    if (total > 0) bar.classList.remove('hidden-bar');
    else bar.classList.add('hidden-bar');
  }

  function selectTicketType(type) {
    if (!Object.hasOwn(appState.quantities, type)) return;
    appState.paymentTotalOverride = null;
    for (const key of Object.keys(appState.quantities)) {
      appState.quantities[key] = key === type ? 1 : 0;
      const input = document.getElementById(`${key}-qty`);
      if (input) input.value = appState.quantities[key];
    }
    updateSummaryBar();
    navigateTo('select-ticket');
  }

  function goToBooking(type) {
    appState.paymentTotalOverride = null;
    if (appState.quantities[type] === 0) {
      showToast('Pilih jumlah tiket dulu, lalu lanjutkan.', 'info');
      document.getElementById(type + '-qty')?.focus();
      return;
    }
    const otherType = type === 'weekday' ? 'weekend' : 'weekday';
    appState.quantities[otherType] = 0;
    document.getElementById(otherType + '-qty').value = 0;
    navigateTo('booking-details');
  }

  function goToBookingFromSummary() {
    appState.paymentTotalOverride = null;
    const total = appState.quantities.weekday + appState.quantities.weekend;
    if (total === 0) {
      showToast('Pilih minimal 1 tiket', 'error');
      return;
    }
    navigateTo('booking-details');
  }

  // ===== BOOKING DETAILS =====
  let displayedCalendarMonth = new Date();

  function formatDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getSelectedTicketType() {
    return Object.keys(appState.quantities).find((type) => appState.quantities[type] > 0);
  }

  function isDateAvailableForTicket(date, type) {
    const day = date.getDay();
    if (day === 1) return false;
    return type === 'weekday' ? day >= 2 && day <= 5 : day === 0 || day === 6;
  }

  function renderBookingCalendar() {
    const calendarDays = document.getElementById('bf-calendar-days');
    const monthLabel = document.getElementById('bf-calendar-month');
    const previousButton = document.getElementById('bf-calendar-prev');
    const dateInput = document.getElementById('bf-date');
    if (!calendarDays || !monthLabel || !dateInput) return;

    const selectedType = getSelectedTicketType();
    const firstOfMonth = new Date(
      displayedCalendarMonth.getFullYear(),
      displayedCalendarMonth.getMonth(),
      1,
    );
    const daysInMonth = new Date(
      displayedCalendarMonth.getFullYear(),
      displayedCalendarMonth.getMonth() + 1,
      0,
    ).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    monthLabel.textContent = new Intl.DateTimeFormat('id-ID', {
      month: 'long',
      year: 'numeric',
    }).format(firstOfMonth);
    if (previousButton) {
      previousButton.disabled =
        firstOfMonth.getFullYear() === today.getFullYear() &&
        firstOfMonth.getMonth() === today.getMonth();
    }

    calendarDays.replaceChildren();
    for (let blank = 0; blank < firstOfMonth.getDay(); blank += 1) {
      const spacer = document.createElement('span');
      spacer.setAttribute('aria-hidden', 'true');
      calendarDays.appendChild(spacer);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), day);
      const dateValue = formatDateValue(date);
      const isSelected = dateValue === dateInput.value;
      const isAllowed = Boolean(
        selectedType && date >= today && isDateAvailableForTicket(date, selectedType),
      );
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(day);
      button.dataset.date = dateValue;
      button.disabled = !isAllowed;
      button.setAttribute('aria-label', formatDateID(dateValue));
      if (isSelected) button.setAttribute('aria-pressed', 'true');
      button.className = isSelected
        ? 'mx-auto flex h-10 w-full max-w-10 items-center justify-center rounded-full bg-pool text-sm font-bold text-white'
        : isAllowed
          ? 'mx-auto flex h-10 w-full max-w-10 items-center justify-center rounded-full text-sm font-semibold text-slate-700 transition hover:bg-lagoon hover:text-pool focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocean'
          : 'mx-auto flex h-10 w-full max-w-10 items-center justify-center rounded-full text-sm text-slate-300 disabled:cursor-not-allowed';
      calendarDays.appendChild(button);
    }
  }

  function initBookingCalendar() {
    const dateInput = document.getElementById('bf-date');
    const calendarDays = document.getElementById('bf-calendar-days');
    const monthLabel = document.getElementById('bf-calendar-month');
    const dateLabel = document.getElementById('bf-date-label');
    const previousButton = document.getElementById('bf-calendar-prev');
    const nextButton = document.getElementById('bf-calendar-next');
    if (!dateInput || !calendarDays || !monthLabel || !dateLabel || !previousButton || !nextButton)
      return;

    if (!calendarDays.dataset.initialized) {
      calendarDays.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-date]');
        if (!button || button.disabled) return;
        dateInput.value = button.dataset.date;
        dateLabel.textContent = formatDateID(dateInput.value);
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        renderBookingCalendar();
      });
      previousButton.addEventListener('click', () => {
        const today = new Date();
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const previousMonth = new Date(
          displayedCalendarMonth.getFullYear(),
          displayedCalendarMonth.getMonth() - 1,
          1,
        );
        if (previousMonth >= currentMonth) {
          displayedCalendarMonth = previousMonth;
          renderBookingCalendar();
        }
      });
      nextButton.addEventListener('click', () => {
        displayedCalendarMonth = new Date(
          displayedCalendarMonth.getFullYear(),
          displayedCalendarMonth.getMonth() + 1,
          1,
        );
        renderBookingCalendar();
      });
      calendarDays.dataset.initialized = 'true';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedType = getSelectedTicketType();
    let selectedDate = dateInput.value ? new Date(`${dateInput.value}T00:00:00`) : null;
    if (
      !selectedDate ||
      !selectedType ||
      selectedDate < today ||
      !isDateAvailableForTicket(selectedDate, selectedType)
    ) {
      selectedDate = new Date(today);
      selectedDate.setDate(selectedDate.getDate() + 7);
      while (selectedType && !isDateAvailableForTicket(selectedDate, selectedType)) {
        selectedDate.setDate(selectedDate.getDate() + 1);
      }
    }

    dateInput.min = formatDateValue(today);
    dateInput.value = selectedType ? formatDateValue(selectedDate) : '';
    dateLabel.textContent = dateInput.value
      ? formatDateID(dateInput.value)
      : 'Pilih tiket terlebih dahulu';
    displayedCalendarMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    renderBookingCalendar();
  }

  function initBookingPage() {
    const form = document.getElementById('booking-form');
    const dateInput = document.getElementById('bf-date');
    initBookingCalendar();
    dateInput.addEventListener('change', () => {
      updateBookingSummary();
      dateInput.classList.remove('error');
      dateInput.setAttribute('aria-invalid', 'false');
      const dateError = document.getElementById('bf-date-error');
      if (dateError) {
        dateError.textContent = '';
        dateError.classList.add('hidden');
      }
    });
    updateBookingSummary();

    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
          errorElement.textContent = '';
          errorElement.classList.add('hidden');
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const authResult = await authService.ensureActiveSession();
      if (!authResult.success) {
        showToast(authResult.error, 'error');
        return;
      }
      currentUser = authResult.user;
      if (!currentUser?.email) {
        appState.pendingPage = 'booking-details';
        showToast('Silakan masuk dengan akun email untuk memesan tiket.', 'info');
        navigateTo('login');
        return;
      }

      const ticketCount = Object.values(appState.quantities).reduce(
        (total, quantity) => total + quantity,
        0,
      );
      if (ticketCount === 0) {
        showToast('Pilih tiket terlebih dahulu', 'error');
        navigateTo('select-ticket');
        return;
      }
      const name = document.getElementById('bf-name');
      const email = document.getElementById('bf-email');
      const phone = document.getElementById('bf-phone');
      const formData = {
        userName: name.value.trim(),
        userEmail: currentUser.email,
        userPhone: phone.value.trim(),
        visitDate: dateInput.value,
      };
      const validation = validateBookingForm(formData);
      const fields = [
        { key: 'userName', input: name, error: 'bf-name-error' },
        { key: 'userEmail', input: email, error: 'bf-email-error' },
        { key: 'userPhone', input: phone, error: 'bf-phone-error' },
        { key: 'visitDate', input: dateInput, error: 'bf-date-error' },
      ];
      let firstInvalid = null;
      for (const field of fields) {
        const message = validation.errors[field.key] || '';
        const invalid = Boolean(message);
        field.input.classList.toggle('error', invalid);
        field.input.setAttribute('aria-invalid', String(invalid));
        const errorElement = document.getElementById(field.error);
        if (errorElement) {
          errorElement.textContent = message;
          errorElement.classList.toggle('hidden', !invalid);
        }
        if (invalid && !firstInvalid) firstInvalid = field.input;
      }
      if (!validation.valid) {
        firstInvalid?.focus({ preventScroll: true });
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const ticketType = getSelectedTicketType();
      const dateValidation = bookingService.validateVisitDate(formData.visitDate, ticketType);
      if (!dateValidation.valid) {
        const dateError = document.getElementById('bf-date-error');
        if (dateError) {
          dateError.textContent = dateValidation.error;
          dateError.classList.remove('hidden');
        }
        dateInput.setAttribute('aria-invalid', 'true');
        dateInput.closest('.rounded-2xl')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      appState.booking = {
        name: formData.userName,
        email: formData.userEmail.toLowerCase(),
        phone: formData.userPhone,
        date: formData.visitDate,
      };

      const btnText = document.getElementById('bf-btn-text');
      const btnIcon = document.getElementById('bf-btn-icon');
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      btnText.textContent = 'Memproses...';
      btnIcon.classList.add('hidden');

      const ticketTypes = {
        [ticketType]: {
          qty: appState.quantities[ticketType],
          price: appState.prices[ticketType],
        },
      };
      const result = await paymentService.createTransaction({
        ...formData,
        ticketTypes,
        totalAmount: getOrderTotals().total,
        promoCode: appState.promo?.promotion.promo_code,
      });
      if (result.success) {
        appState.bookingCode = result.booking_code;
        appState.snapToken = result.snap_token;
        appState.paymentStatus = 'pending';
        appState.confirmationBooking = null;
        appState.qrDataUrl = '';
        appState.paymentTotalOverride = null;
        updatePaymentSummary();
        navigateTo('payment');
      } else {
        showToast(result.error, 'error');
      }
      submitButton.disabled = false;
      btnText.textContent = 'Lanjut ke Pembayaran';
      btnIcon.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
    });
  }

  async function checkPaymentStatus() {
    if (!appState.bookingCode || !appState.booking.email) {
      showToast('Data booking tidak ditemukan. Silakan ulangi pemesanan.', 'error');
      navigateTo('booking-details');
      return;
    }
    if (appState.isVerifyingPayment) return;

    appState.isVerifyingPayment = true;
    setPaymentButtonBusy(true, 'Memeriksa status...');
    try {
      const result = await paymentService.getBookingStatus(
        appState.bookingCode,
        appState.booking.email,
      );
      if (result.success && result.payment_status === 'paid') {
        appState.paymentStatus = 'paid';
        await loadConfirmationBooking();
        updateConfirmationDetails();
        navigateTo('confirmation');
      } else if (result.success && result.payment_status !== 'pending') {
        appState.paymentStatus = result.payment_status;
        showToast('Pembayaran belum berhasil. Silakan coba kembali.', 'error');
      } else if (result.success) {
        showToast('Pembayaran masih menunggu konfirmasi dari Midtrans.', 'info');
      } else {
        showToast(result.error || 'Gagal memeriksa status pembayaran.', 'error');
      }
    } finally {
      appState.isVerifyingPayment = false;
      setPaymentButtonBusy(false);
    }
  }

  function formatDateID(dateStr) {
    if (!dateStr) return 'Pilih tanggal kunjungan';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const d = new Date(dateStr + 'T00:00:00');
    return (
      days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
    );
  }

  function getSelectedTickets() {
    return Object.keys(appState.quantities)
      .filter((type) => appState.quantities[type] > 0)
      .map((type) => ({
        type,
        name: appState.names[type],
        quantity: appState.quantities[type],
        subtotal: appState.prices[type] * appState.quantities[type],
      }));
  }

  function getOrderTotals() {
    const subtotal = getSelectedTickets().reduce((total, ticket) => total + ticket.subtotal, 0);
    const serviceFee = 0;
    if (
      appState.paymentTotalOverride !== null &&
      Number.isFinite(Number(appState.paymentTotalOverride))
    ) {
      const total = Number(appState.paymentTotalOverride);
      return { subtotal, serviceFee, discount: Math.max(0, subtotal + serviceFee - total), total };
    }
    const discount = appState.promo
      ? Math.min(appState.promo.discountAmount, subtotal + serviceFee)
      : 0;
    return { subtotal, serviceFee, discount, total: subtotal + serviceFee - discount };
  }

  function renderOrderLines(containerId, tickets, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.replaceChildren();
    if (!tickets.length) {
      const message = document.createElement('p');
      message.className = 'text-slate-500';
      message.textContent = emptyMessage;
      container.appendChild(message);
      return;
    }
    tickets.forEach((ticket) => {
      const row = document.createElement('div');
      row.className = 'flex justify-between gap-3 text-slate-500';
      const description = document.createElement('span');
      description.textContent = `${ticket.name} × ${ticket.quantity}`;
      const amount = document.createElement('span');
      amount.className = 'shrink-0 font-semibold text-slate-800';
      amount.textContent = formatRupiah(ticket.subtotal);
      row.append(description, amount);
      container.appendChild(row);
    });
  }

  function updateBookingSummary() {
    const selectedTickets = getSelectedTickets();
    const quantity = selectedTickets.reduce((total, ticket) => total + ticket.quantity, 0);
    const { total } = getOrderTotals();
    const dateVal = document.getElementById('bf-date')?.value;
    document.getElementById('bs-name').textContent = selectedTickets.length
      ? selectedTickets.map((ticket) => ticket.name).join(', ')
      : 'Tiket terpilih';
    document.getElementById('bs-qty').textContent = quantity + ' tiket';
    document.getElementById('bs-date').textContent = dateVal
      ? formatDateID(dateVal)
      : 'Pilih tanggal kunjungan';

    renderOrderLines('bs-lines', selectedTickets, 'Belum ada tiket dipilih.');
    document.getElementById('bs-total').textContent = formatRupiah(total);
    const mobileTotal = document.getElementById('bf-mobile-total');
    if (mobileTotal) mobileTotal.textContent = formatRupiah(total);
    const mobileSummary = document.getElementById('bf-mobile-summary');
    if (mobileSummary) {
      mobileSummary.textContent = selectedTickets.length
        ? `${quantity} tiket · ${selectedTickets.map((ticket) => ticket.name).join(', ')}`
        : 'Belum ada tiket dipilih.';
    }
  }

  // ===== PAYMENT PAGE =====
  function initPaymentPage() {
    updatePaymentSummary();
    // Countdown
    let secs = 24 * 3600 - 15;
    const cdEl = document.getElementById('countdown');
    if (cdEl) {
      setInterval(() => {
        const h = Math.floor(secs / 3600),
          m = Math.floor((secs % 3600) / 60),
          s = secs % 60;
        cdEl.textContent =
          String(h).padStart(2, '0') +
          ':' +
          String(m).padStart(2, '0') +
          ':' +
          String(s).padStart(2, '0');
        if (secs > 0) secs--;
      }, 1000);
    }
  }

  function updatePaymentSummary() {
    const tickets = getSelectedTickets();
    const { serviceFee, discount, total } = getOrderTotals();
    const date = appState.booking.date || document.getElementById('bf-date')?.value || '';
    renderOrderLines('pay-lines', tickets, 'Belum ada tiket dipilih.');
    const payDate = document.getElementById('pay-date');
    if (payDate) payDate.textContent = formatDateID(date);
    const customerName = document.getElementById('pay-customer-name');
    if (customerName) customerName.textContent = appState.booking.name || 'Nama pemesan';
    const customerEmail = document.getElementById('pay-customer-email');
    if (customerEmail) customerEmail.textContent = appState.booking.email || 'Email pemesan';
    const bookingCode = document.getElementById('pay-booking-code');
    if (bookingCode) bookingCode.textContent = appState.bookingCode || 'Kode booking';
    const serviceFeeElement = document.getElementById('pay-service-fee');
    if (serviceFeeElement) serviceFeeElement.textContent = formatRupiah(serviceFee);
    const discountRow = document.getElementById('discount-row');
    if (discountRow) {
      discountRow.classList.toggle('hidden', discount === 0);
      const discountAmount = document.getElementById('pay-discount');
      if (discountAmount) discountAmount.textContent = '-' + formatRupiah(discount);
    }
    const payTotal = document.getElementById('pay-total');
    if (payTotal) payTotal.textContent = formatRupiah(total);
  }

  async function loadConfirmationBooking() {
    if (appState.confirmationBooking) return appState.confirmationBooking;
    if (!appState.bookingCode) return null;
    const result = await bookingService.getBookingByCode(appState.bookingCode);
    if (!result.success) return null;
    const booking = result.booking;
    if (
      currentUser?.email &&
      booking.user_email?.toLowerCase() !== currentUser.email.toLowerCase()
    ) {
      return null;
    }
    appState.confirmationBooking = booking;
    return booking;
  }

  async function renderConfirmationQr(booking) {
    const image = document.getElementById('confirm-qr-image');
    const fallback = document.getElementById('confirm-qr-fallback');
    if (!image || !fallback) return;
    if (!booking) {
      image.classList.add('hidden');
      fallback.classList.remove('hidden');
      return;
    }
    try {
      const dataUrl = appState.qrDataUrl || (await generateQrDataUrl(booking));
      appState.qrDataUrl = dataUrl;
      image.src = dataUrl;
      image.classList.remove('hidden');
      fallback.classList.add('hidden');
    } catch (error) {
      console.error('QR generation failed:', error);
      image.classList.add('hidden');
      fallback.classList.remove('hidden');
    }
  }

  async function updateConfirmationDetails() {
    appState.paymentTotalOverride = null;
    const booking = appState.confirmationBooking || (await loadConfirmationBooking());
    if (booking) {
      appState.bookingCode = booking.booking_code;
      if (appState.paymentStatus !== 'paid') appState.paymentStatus = booking.payment_status;
      appState.paymentType = booking.payment_method || appState.paymentType;
      appState.booking = {
        name: booking.user_name,
        email: booking.user_email,
        phone: booking.user_phone,
        date: booking.visit_date,
      };
    }

    const tickets = booking ? getTicketLines(booking) : getSelectedTickets();
    const ticketSubtotal = tickets.reduce((sum, ticket) => sum + ticket.subtotal, 0);
    const totals = booking
      ? {
          serviceFee: 0,
          discount: Math.max(0, ticketSubtotal - Number(booking.total_amount)),
          total: Number(booking.total_amount),
        }
      : getOrderTotals();
    const customerName = document.getElementById('confirm-name');
    const ticketTypes = document.getElementById('confirm-ticket-types');
    const visitDate = document.getElementById('confirm-date');
    const customerEmail = document.getElementById('confirm-email');
    const customerPhone = document.getElementById('confirm-phone');
    const qrTicketTypes = document.getElementById('confirm-qr-types');
    const qrCode = document.getElementById('confirm-qr-code');
    if (customerName)
      customerName.textContent = booking?.user_name || appState.booking.name || 'Nama pengunjung';
    if (ticketTypes)
      ticketTypes.textContent = booking
        ? getTicketSummary(booking)
        : tickets.length
          ? tickets.map((ticket) => `${ticket.name} × ${ticket.quantity}`).join(', ')
          : 'Belum ada tiket dipilih';
    if (visitDate)
      visitDate.textContent = formatTicketDate(booking?.visit_date || appState.booking.date);
    if (customerEmail)
      customerEmail.textContent =
        booking?.user_email || appState.booking.email || 'Email belum tersedia';
    if (customerPhone)
      customerPhone.textContent =
        booking?.user_phone || appState.booking.phone || 'Nomor telepon belum tersedia';
    if (qrTicketTypes)
      qrTicketTypes.textContent = tickets.length
        ? tickets.map((ticket) => ticket.type.toUpperCase()).join('-')
        : 'TICKET';
    if (qrCode) qrCode.textContent = booking?.booking_code || appState.bookingCode || '-';
    renderOrderLines('confirm-lines', tickets, 'Belum ada tiket dipilih.');
    const serviceFeeElement = document.getElementById('confirm-service-fee');
    if (serviceFeeElement) serviceFeeElement.textContent = formatRupiah(totals.serviceFee);
    const discountRow = document.getElementById('confirm-discount-row');
    if (discountRow) {
      discountRow.classList.toggle('hidden', totals.discount === 0);
      const discountAmount = document.getElementById('confirm-discount');
      if (discountAmount) discountAmount.textContent = '-' + formatRupiah(totals.discount);
    }
    const paymentMethodElement = document.getElementById('confirm-payment-method');
    if (paymentMethodElement) {
      paymentMethodElement.textContent = getPaymentMethodLabel(
        booking ?? { payment_method: appState.paymentType },
      );
    }
    const totalElement = document.getElementById('confirm-total');
    if (totalElement) totalElement.textContent = formatRupiah(totals.total);
    const bookingCodeElement = document.getElementById('confirm-code');
    if (bookingCodeElement)
      bookingCodeElement.textContent = booking?.booking_code || appState.bookingCode || '-';
    await renderConfirmationQr(booking);
  }

  function setDownloadButtonBusy(busy) {
    const button = document.getElementById('download-ticket-btn');
    const text = document.getElementById('download-ticket-text');
    const icon = document.getElementById('download-ticket-icon');
    const spinner = document.getElementById('download-ticket-spinner');
    if (button) button.disabled = busy;
    if (text) text.textContent = busy ? 'Menyiapkan PDF...' : 'Unduh e-ticket';
    icon?.classList.toggle('hidden', busy);
  }

  async function downloadTicket() {
    if (appState.isDownloadingTicket) return;
    const booking = appState.confirmationBooking || (await loadConfirmationBooking());
    if (!booking) {
      showToast('Data tiket tidak ditemukan. Buka riwayat tiket untuk melihat pesanan.', 'error');
      return;
    }
    if (booking.payment_status !== 'paid') {
      showToast('E-ticket hanya tersedia setelah pembayaran dikonfirmasi.', 'info');
      return;
    }

    appState.isDownloadingTicket = true;
    setDownloadButtonBusy(true);
    try {
      const qrDataUrl = appState.qrDataUrl || (await generateQrDataUrl(booking));
      appState.qrDataUrl = qrDataUrl;
      const { downloadTicketPdf } = await import('../services/ticketPdfService.js');
      downloadTicketPdf(booking, qrDataUrl);
      showToast('E-ticket berhasil diunduh!', 'success');
    } catch (error) {
      console.error('Download e-ticket failed:', error);
      showToast('Gagal membuat PDF e-ticket. Silakan coba lagi.', 'error');
    } finally {
      appState.isDownloadingTicket = false;
      setDownloadButtonBusy(false);
    }
  }

  async function applyPromo() {
    const input = document.getElementById('promo-input');
    const code = input.value.trim().toUpperCase();
    const subtotal = getSelectedTickets().reduce((total, ticket) => total + ticket.subtotal, 0);
    if (!code) {
      showToast('Masukkan kode promo.', 'error');
      return;
    }
    const result = await promotionService.validatePromoCode(code, subtotal);
    if (!result.success) {
      appState.promo = null;
      showToast(result.error, 'error');
      return;
    }
    appState.promo = {
      promotion: result.promotion,
      discountAmount: result.discountAmount,
    };
    const success = document.getElementById('promo-success');
    success.classList.remove('hidden');
    success.classList.add('flex', 'promo-success');
    success.querySelector('span').textContent =
      `Kode promo berhasil diterapkan! Diskon ${formatRupiah(result.discountAmount)}`;
    document.getElementById('discount-row')?.classList.remove('hidden');
    document.getElementById('promo-btn').textContent = '✓';
    input.disabled = true;
    updateBookingSummary();
    updatePaymentSummary();
    showToast('Kode promo berhasil diterapkan!', 'success');
  }

  function setPaymentButtonBusy(busy, label = 'Bayar Sekarang') {
    const button = document.getElementById('pay-btn');
    const text = document.getElementById('pay-btn-text');
    const icon = document.getElementById('pay-btn-icon');
    if (button) button.disabled = busy;
    if (text) text.textContent = busy ? label : 'Bayar Sekarang';
    icon?.classList.toggle('hidden', busy);
  }

  async function verifyPaymentStatus(paymentResult) {
    if (appState.isVerifyingPayment) return;
    if (!appState.bookingCode || !appState.booking.email) {
      showToast('Data booking tidak ditemukan. Silakan ulangi pemesanan.', 'error');
      navigateTo('booking-details');
      return;
    }

    appState.isVerifyingPayment = true;
    appState.isSnapOpen = false;
    setPaymentButtonBusy(true, 'Memverifikasi pembayaran...');
    showToast('Memverifikasi pembayaran...', 'info');
    try {
      const result = await paymentService.pollBookingStatus(
        appState.bookingCode,
        appState.booking.email,
        { maxAttempts: 10, intervalMs: 1500 },
      );
      if (result.success && result.payment_status === 'paid') {
        appState.paymentStatus = 'paid';
        appState.paymentType = paymentResult?.payment_type || appState.paymentType;
        await loadConfirmationBooking();
        updateConfirmationDetails();
        navigateTo('confirmation');
        return;
      }
      if (result.success && result.payment_status !== 'pending') {
        appState.paymentStatus = result.payment_status;
        showToast('Pembayaran belum berhasil. Silakan periksa status dan coba kembali.', 'error');
        return;
      }
      showToast(
        result.success
          ? 'Status pembayaran masih diproses. Anda dapat menekan "Sudah membayar? Periksa status" untuk mengecek kembali.'
          : result.error || 'Status pembayaran belum dapat diverifikasi. Coba periksa kembali.',
        'info',
      );
    } finally {
      appState.isVerifyingPayment = false;
      setPaymentButtonBusy(false);
    }
  }

  function processPayment() {
    if (!appState.snapToken || !appState.bookingCode) {
      showToast('Isi data booking terlebih dahulu untuk memulai pembayaran.', 'error');
      navigateTo('booking-details');
      return;
    }
    if (appState.isSnapOpen || appState.isVerifyingPayment) return;

    appState.isSnapOpen = true;
    setPaymentButtonBusy(true, 'Membuka pembayaran...');
    paymentService
      .displaySnapPopup(appState.snapToken, {
        onSuccess: (result) => {
          verifyPaymentStatus(result).catch((error) => {
            console.error('Payment status verification failed:', error);
            showToast('Gagal memverifikasi pembayaran. Silakan periksa status kembali.', 'error');
          });
        },
        onPending: () => {
          appState.isSnapOpen = false;
          setPaymentButtonBusy(false);
          showToast('Pembayaran menunggu penyelesaian. Selesaikan proses di Midtrans.', 'info');
        },
        onError: () => {
          appState.isSnapOpen = false;
          setPaymentButtonBusy(false);
          showToast('Pembayaran gagal. Silakan coba kembali.', 'error');
        },
        onClose: () => {
          appState.isSnapOpen = false;
          setPaymentButtonBusy(false);
          showToast('Booking tersimpan dan menunggu pembayaran.', 'info');
        },
      })
      .catch((error) => {
        appState.isSnapOpen = false;
        setPaymentButtonBusy(false);
        console.error('Midtrans Snap popup failed:', error);
        showToast(
          error instanceof Error
            ? error.message
            : 'Pembayaran gagal diinisialisasi. Silakan coba lagi.',
          'error',
        );
      });
  }

  // ===== CONFIRMATION =====

  // ===== TICKET HISTORY =====
  const HISTORY_TONE_CLASSES = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
    violet: 'bg-seafoam text-pool',
    ocean: 'bg-lagoon text-pool',
  };

  function formatHistoryCreatedAt(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function createHistoryBadge(label, tone) {
    const badge = document.createElement('span');
    badge.className = `inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${HISTORY_TONE_CLASSES[tone] || HISTORY_TONE_CLASSES.slate}`;
    badge.textContent = label;
    return badge;
  }

  function createHistoryCard(booking) {
    const status = getBookingDisplayStatus(booking);
    // Badge pembayaran mengikuti status pembayaran asli: tiket yang sudah
    // lunas tetap "Lunas" walau kedaluwarsa. Status pemakaian ditampilkan
    // terpisah lewat badge "Kedaluwarsa"/"Sudah digunakan".
    const payment = getPaymentStatusMeta(booking.payment_status);
    const usage = getUsageStatusMeta(booking);
    const article = document.createElement('article');
    article.className =
      'scroll-reveal visible flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md';

    const header = document.createElement('div');
    header.className = 'flex items-start justify-between gap-4';
    const codeWrap = document.createElement('div');
    const code = document.createElement('p');
    code.className = 'font-display text-lg font-extrabold tracking-widest text-pool';
    code.textContent = booking.booking_code;
    const created = document.createElement('p');
    created.className = 'mt-1 text-xs text-slate-500';
    created.textContent = `Dipesan ${formatHistoryCreatedAt(booking.created_at)}`;
    codeWrap.append(code, created);
    header.append(codeWrap, createHistoryBadge(payment.label, payment.tone));

    const meta = document.createElement('div');
    meta.className = 'mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500';
    const dateBadge = document.createElement('span');
    dateBadge.className =
      'inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 font-semibold text-slate-600';
    const dateIcon = document.createElement('iconify-icon');
    dateIcon.setAttribute('icon', 'lucide:calendar-days');
    dateIcon.className = 'text-pool';
    const dateText = document.createElement('span');
    dateText.textContent = formatTicketDate(booking.visit_date);
    dateBadge.append(dateIcon, dateText);
    meta.append(dateBadge, createHistoryBadge(usage.label, usage.tone));

    const summary = document.createElement('div');
    summary.className = 'mt-5 rounded-2xl bg-lagoon p-4';
    const summaryTitle = document.createElement('p');
    summaryTitle.className = 'text-sm font-bold text-slate-800';
    summaryTitle.textContent = getTicketSummary(booking);
    const summaryTotal = document.createElement('p');
    summaryTotal.className = 'mt-1 font-display text-xl font-extrabold text-pool';
    summaryTotal.textContent = formatTicketRupiah(booking.total_amount);
    summary.append(summaryTitle, summaryTotal);

    const actions = document.createElement('div');
    actions.className = 'mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5';
    if (booking.checked_in_at) {
      const note = document.createElement('p');
      note.className = 'w-full text-xs font-semibold text-slate-500';
      const usedAt = new Date(booking.checked_in_at).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      note.textContent = `Tiket sudah digunakan pada ${usedAt} dan tidak dapat dipakai lagi.`;
      actions.append(note);
    } else if (status === 'paid') {
      const view = document.createElement('button');
      view.type = 'button';
      view.className =
        'inline-flex min-h-10 items-center gap-2 rounded-full bg-pool px-4 text-xs font-bold text-white transition hover:bg-aqua hover:text-ink';
      view.textContent = 'Lihat E-Ticket';
      view.addEventListener('click', () => openTicketFromHistory(booking.booking_code));
      const download = document.createElement('button');
      download.type = 'button';
      download.className =
        'inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-pool';
      download.textContent = 'Unduh PDF';
      download.addEventListener('click', () => downloadHistoryTicket(booking.booking_code));
      actions.append(view, download);
    } else if (status === 'pending') {
      const expired = booking.visit_date < formatDateValue(new Date());
      const note = document.createElement('p');
      note.className = 'w-full text-xs font-semibold text-amber-600';
      note.textContent = expired
        ? 'Tiket sudah kedaluwarsa karena tanggal kunjungan telah lewat.'
        : 'Menunggu pembayaran. E-ticket tersedia setelah pembayaran berhasil.';
      actions.append(note);
      if (!expired) {
        const pay = document.createElement('button');
        pay.type = 'button';
        pay.className =
          'inline-flex min-h-10 items-center gap-2 rounded-full bg-amber-500 px-4 text-xs font-bold text-white transition hover:bg-amber-600';
        pay.textContent = 'Lanjutkan Pembayaran';
        pay.addEventListener('click', () => resumePaymentFromHistory(booking.booking_code));
        actions.append(pay);
      }
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className =
        'inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-50';
      cancel.textContent = 'Batalkan Pesanan';
      cancel.addEventListener('click', () => cancelPendingBooking(booking.booking_code));
      actions.append(cancel);
    } else if (status === 'cancelled') {
      const note = document.createElement('p');
      note.className = 'w-full text-xs font-semibold text-slate-500';
      note.textContent =
        usage.label === 'Kedaluwarsa'
          ? 'Tiket tidak dipakai dan tanggal kunjungan sudah lewat, sehingga otomatis dibatalkan.'
          : 'Pesanan ini telah dibatalkan.';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className =
        'inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-pool';
      retry.textContent = 'Pesan tiket lagi';
      retry.addEventListener('click', () => navigateTo('select-ticket'));
      actions.append(note, retry);
    } else {
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className =
        'inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-pool';
      retry.textContent = 'Pesan tiket lagi';
      retry.addEventListener('click', () => navigateTo('select-ticket'));
      actions.append(retry);
    }

    article.append(header, meta, summary, actions);
    return article;
  }

  function getFilteredHistory() {
    const filter = appState.ticketHistoryFilter;
    if (filter === 'all') return appState.ticketHistory;
    if (filter === 'used') {
      return appState.ticketHistory.filter((booking) => {
        const usage = getUsageStatusMeta(booking);
        return usage.label === 'Sudah digunakan' || usage.label === 'Kedaluwarsa';
      });
    }
    if (filter === 'cancelled') {
      // Tiket yang pembayarannya dibatalkan dan belum pernah aktif/dipakai.
      return appState.ticketHistory.filter(
        (booking) =>
          booking.payment_status === 'cancelled' &&
          getUsageStatusMeta(booking).label === 'Belum aktif',
      );
    }
    return appState.ticketHistory.filter((booking) => getBookingDisplayStatus(booking) === filter);
  }

  function renderTicketHistory() {
    const list = document.getElementById('ticket-history-list');
    const empty = document.getElementById('ticket-history-empty');
    const loading = document.getElementById('ticket-history-loading');
    const error = document.getElementById('ticket-history-error');
    if (!list) return;
    loading?.classList.add('hidden');
    error?.classList.add('hidden');
    const bookings = getFilteredHistory();
    list.replaceChildren();
    if (!bookings.length) {
      const hasAny = appState.ticketHistory.length > 0;
      const title = empty?.querySelector('h3');
      const description = empty?.querySelector('p');
      if (title)
        title.textContent = hasAny ? 'Tidak ada tiket untuk filter ini' : 'Belum ada riwayat tiket';
      if (description)
        description.textContent = hasAny
          ? 'Coba pilih filter lain untuk melihat tiketmu.'
          : 'Pesanan tiket yang sudah kamu buat akan muncul di sini.';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');
    for (const booking of bookings) list.appendChild(createHistoryCard(booking));
  }

  async function loadTicketHistory() {
    if (!currentUser?.email) return;
    const list = document.getElementById('ticket-history-list');
    const empty = document.getElementById('ticket-history-empty');
    const loading = document.getElementById('ticket-history-loading');
    const error = document.getElementById('ticket-history-error');
    appState.isLoadingHistory = true;
    loading?.classList.remove('hidden');
    empty?.classList.add('hidden');
    error?.classList.add('hidden');
    list?.replaceChildren();

    // Pastikan tiket yang tidak dipakai & sudah lewat masa berlaku
    // langsung berstatus dibatalkan sebelum data ditampilkan.
    await bookingService.expireUnusedBookings();
    const result = await bookingService.getUserBookings(currentUser.email);
    appState.isLoadingHistory = false;
    if (!result.success) {
      loading?.classList.add('hidden');
      const message = document.getElementById('ticket-history-error-message');
      if (message) message.textContent = result.error;
      else if (error) error.textContent = result.error;
      error?.classList.remove('hidden');
      return;
    }
    appState.ticketHistory = result.bookings;
    renderTicketHistory();
  }

  async function openTicketFromHistory(bookingCode) {
    const result = await bookingService.getBookingByCode(bookingCode);
    if (!result.success) {
      showToast(result.error || 'Tiket tidak ditemukan.', 'error');
      return;
    }
    const booking = result.booking;
    if (
      currentUser?.email &&
      booking.user_email?.toLowerCase() !== currentUser.email.toLowerCase()
    ) {
      showToast('Anda hanya dapat melihat tiket akun sendiri.', 'error');
      return;
    }
    if (booking.payment_status !== 'paid') {
      showToast('E-ticket hanya tersedia setelah pembayaran dikonfirmasi.', 'info');
      return;
    }
    if (getBookingDisplayStatus(booking) === 'cancelled') {
      showToast('Tiket ini sudah dibatalkan dan tidak dapat digunakan.', 'error');
      return;
    }
    if (booking.checked_in_at) {
      showToast('Tiket ini sudah digunakan dan tidak dapat dipakai lagi.', 'error');
      return;
    }
    appState.confirmationBooking = booking;
    appState.bookingCode = booking.booking_code;
    appState.paymentStatus = booking.payment_status;
    appState.paymentType = booking.payment_method || '';
    appState.booking = {
      name: booking.user_name,
      email: booking.user_email,
      phone: booking.user_phone,
      date: booking.visit_date,
    };
    appState.qrDataUrl = '';
    appState.paymentTotalOverride = null;
    navigateTo('confirmation');
  }

  async function resumePaymentFromHistory(bookingCode) {
    const cached = appState.ticketHistory.find((booking) => booking.booking_code === bookingCode);
    let booking = cached;
    if (!booking) {
      const result = await bookingService.getBookingByCode(bookingCode);
      if (!result.success) {
        showToast(result.error || 'Tiket tidak ditemukan.', 'error');
        return;
      }
      booking = result.booking;
    }
    if (
      currentUser?.email &&
      booking.user_email?.toLowerCase() !== currentUser.email.toLowerCase()
    ) {
      showToast('Anda hanya dapat melanjutkan pembayaran akun sendiri.', 'error');
      return;
    }
    if (booking.payment_status !== 'pending') {
      showToast('Booking ini tidak sedang menunggu pembayaran.', 'info');
      return;
    }
    if (booking.visit_date < formatDateValue(new Date())) {
      showToast('Tanggal kunjungan tiket ini sudah lewat. Silakan buat pesanan baru.', 'error');
      return;
    }

    const result = await paymentService.resumeTransaction(booking.booking_code);
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }

    appState.bookingCode = result.booking_code;
    appState.snapToken = result.snap_token;
    appState.paymentStatus = 'pending';
    appState.paymentType = booking.payment_method || '';
    appState.confirmationBooking = null;
    appState.qrDataUrl = '';
    appState.promo = null;
    appState.paymentTotalOverride = Number(result.total_amount ?? booking.total_amount);
    appState.booking = {
      name: booking.user_name,
      email: booking.user_email,
      phone: booking.user_phone,
      date: booking.visit_date,
    };

    appState.quantities = { weekday: 0, weekend: 0 };
    for (const [type, details] of Object.entries(booking.ticket_types ?? {})) {
      if (!Object.hasOwn(appState.quantities, type)) continue;
      const quantity = Number(details?.qty ?? 0);
      const price = Number(details?.price ?? appState.prices[type]);
      appState.quantities[type] = quantity;
      if (Number.isFinite(price) && price >= 0) appState.prices[type] = price;
    }
    for (const type of Object.keys(appState.quantities)) {
      const input = document.getElementById(`${type}-qty`);
      if (input) input.value = String(appState.quantities[type]);
    }

    const promoInput = document.getElementById('promo-input');
    if (promoInput) {
      promoInput.value = '';
      promoInput.disabled = false;
    }
    const promoSuccess = document.getElementById('promo-success');
    if (promoSuccess) {
      promoSuccess.classList.add('hidden');
      promoSuccess.classList.remove('flex');
    }
    const promoButton = document.getElementById('promo-btn');
    if (promoButton) promoButton.textContent = 'Pakai';

    updateSummaryBar();
    updatePaymentSummary();
    showToast('Silakan lanjutkan pembayaran tiket kamu.', 'info');
    navigateTo('payment');
  }

  async function cancelPendingBooking(bookingCode) {
    const cached = appState.ticketHistory.find((booking) => booking.booking_code === bookingCode);
    if (
      currentUser?.email &&
      cached &&
      cached.user_email?.toLowerCase() !== currentUser.email.toLowerCase()
    ) {
      showToast('Anda hanya dapat membatalkan pesanan akun sendiri.', 'error');
      return;
    }
    const confirmed =
      typeof window.confirm === 'function'
        ? window.confirm(
            `Batalkan pesanan ${bookingCode}? Pesanan yang dibatalkan tidak dapat dilanjutkan lagi.`,
          )
        : true;
    if (!confirmed) return;
    const result = await bookingService.cancelOwnBooking(bookingCode);
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    const wasActivePayment =
      appState.currentPage === 'payment' && appState.bookingCode === bookingCode;
    if (wasActivePayment) {
      appState.bookingCode = '';
      appState.snapToken = '';
      appState.paymentStatus = 'cancelled';
      appState.paymentType = '';
    }
    showToast('Pesanan berhasil dibatalkan.', 'success');
    await loadTicketHistory();
    if (wasActivePayment) navigateTo('ticket-history');
  }

  async function downloadHistoryTicket(bookingCode) {
    const cached = appState.ticketHistory.find((booking) => booking.booking_code === bookingCode);
    let booking = cached;
    if (!booking) {
      const result = await bookingService.getBookingByCode(bookingCode);
      if (!result.success) {
        showToast(result.error || 'Tiket tidak ditemukan.', 'error');
        return;
      }
      booking = result.booking;
    }
    if (
      currentUser?.email &&
      booking.user_email?.toLowerCase() !== currentUser.email.toLowerCase()
    ) {
      showToast('Anda hanya dapat mengunduh tiket akun sendiri.', 'error');
      return;
    }
    if (booking.payment_status !== 'paid') {
      showToast('E-ticket hanya tersedia setelah pembayaran dikonfirmasi.', 'info');
      return;
    }
    if (getBookingDisplayStatus(booking) === 'cancelled') {
      showToast('Tiket ini sudah dibatalkan sehingga tidak dapat diunduh.', 'error');
      return;
    }
    if (booking.checked_in_at) {
      showToast('Tiket ini sudah digunakan sehingga tidak dapat diunduh lagi.', 'error');
      return;
    }
    try {
      const qrDataUrl = await generateQrDataUrl(booking);
      const { downloadTicketPdf } = await import('../services/ticketPdfService.js');
      downloadTicketPdf(booking, qrDataUrl);
      showToast('E-ticket berhasil diunduh!', 'success');
    } catch (error) {
      console.error('Download history e-ticket failed:', error);
      showToast('Gagal membuat PDF e-ticket. Silakan coba lagi.', 'error');
    }
  }

  function setHistoryFilter(filter) {
    appState.ticketHistoryFilter = filter;
    document.querySelectorAll('.history-filter').forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('bg-pool', active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('border', !active);
      button.classList.toggle('border-slate-200', !active);
      button.classList.toggle('bg-white', !active);
      button.classList.toggle('text-slate-600', !active);
    });
    renderTicketHistory();
  }

  function initTicketHistoryPage() {
    document.querySelectorAll('.history-filter').forEach((button) => {
      button.addEventListener('click', () => setHistoryFilter(button.dataset.filter));
    });
    document.getElementById('ticket-history-retry')?.addEventListener('click', loadTicketHistory);
  }

  function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#00BCD4', '#0097A7', '#10b981', '#f59e0b', '#007884', '#ec4899', '#06b6d4'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.classList.add('confetti-piece');
        p.style.left = Math.random() * 100 + '%';
        p.style.width = Math.random() * 8 + 6 + 'px';
        p.style.height = p.style.width;
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        p.style.animationDuration = Math.random() * 2 + 2 + 's';
        container.appendChild(p);
        setTimeout(() => p.remove(), 4500);
      }, i * 40);
    }
  }

  // ===== BUBBLES =====
  function initBubbles(page) {
    const ids = {
      login: 'bubbles-login',
      'select-ticket': 'bubbles-ticket',
      'booking-details': 'bubbles-booking',
    };
    const containerId = ids[page];
    if (!containerId) return;
    const container = document.getElementById(containerId);
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const b = document.createElement('div');
        b.classList.add('bubble');
        const s = Math.random() * 18 + 5;
        b.style.width = s + 'px';
        b.style.height = s + 'px';
        b.style.left = Math.random() * 100 + '%';
        b.style.bottom = '-20px';
        b.style.animationDuration = Math.random() * 6 + 6 + 's';
        b.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(b);
      }, i * 500);
    }
  }

  // ===== SCROLL REVEAL =====
  function initScrollReveal() {
    const els = document.querySelectorAll('.scroll-reveal');
    const check = () => {
      els.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 60) el.classList.add('visible');
      });
    };
    window.addEventListener('scroll', check);
    setTimeout(check, 100);
  }

  // ===== HOME SECTION NAV STATE =====
  let homeSpyHandler = null;
  function initSectionSpy() {
    const links = Array.from(document.querySelectorAll('[data-nav-section]'));
    if (!links.length) return;
    const sections = links
      .map((link) => link.dataset.navSection)
      .filter((id) => id && id !== 'home')
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const setActive = (id) => {
      for (const link of links) {
        const active = link.dataset.navSection === id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    };

    if (homeSpyHandler) window.removeEventListener('scroll', homeSpyHandler);
    homeSpyHandler = () => {
      const marker = window.scrollY + window.innerHeight * 0.4;
      let current = 'home';
      for (const section of sections) {
        const top = section.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = section.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', homeSpyHandler, { passive: true });
    homeSpyHandler();
  }

  // ===== COUNTER ANIMATION =====
  function animateCounters() {
    document.querySelectorAll('.counter').forEach((c) => {
      const target = parseFloat(c.dataset.target);
      const isDec = target % 1 !== 0;
      const dur = 2000,
        start = performance.now();
      const update = (t) => {
        const p = Math.min((t - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        c.textContent = isDec ? (e * target).toFixed(1) : Math.floor(e * target);
        if (p < 1) requestAnimationFrame(update);
        else c.textContent = isDec ? target.toFixed(1) : target;
      };
      requestAnimationFrame(update);
    });
  }

  // ===== HEADER SCROLL =====
  window.addEventListener('scroll', () => {
    const h = document.getElementById('mainHeader');
    if (h) {
      if (window.pageYOffset > 80) h.classList.add('header-scrolled');
      else h.classList.remove('header-scrolled');
    }
  });

  // ===== KEYBOARD =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleMobileMenu(false);
      closeProfileMenus();
      return;
    }
    const menu = document.getElementById('mobileMenu');
    if (e.key === 'Tab' && menu?.classList.contains('open')) {
      const focusable = mobileMenuFocusable();
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

  // ===== LOGIN FORM =====
  function setFieldError(input, errorId, message) {
    if (!input) return;
    const invalid = Boolean(message);
    input.classList.toggle('error', invalid);
    input.setAttribute('aria-invalid', String(invalid));
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.toggle('hidden', !invalid);
    }
  }

  function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => setFieldError(input, `${input.id}-error`, ''));
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email');
      const pass = document.getElementById('login-password');
      setFieldError(email, 'login-email-error', '');
      setFieldError(pass, 'login-password-error', '');
      if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        setFieldError(email, 'login-email-error', 'Masukkan email yang valid.');
        email.focus({ preventScroll: true });
        return;
      }
      if (!pass.value || pass.value.length < 8) {
        setFieldError(pass, 'login-password-error', 'Kata sandi minimal 8 karakter.');
        pass.focus({ preventScroll: true });
        return;
      }
      document.getElementById('login-btn-text').textContent = 'Memproses...';
      document.getElementById('login-btn-icon').classList.add('hidden');
      const result = await authService.login(email.value, pass.value);
      document.getElementById('login-btn-text').textContent = 'Masuk ke Citraland Waterpark';
      document.getElementById('login-btn-icon').classList.remove('hidden');
      if (!result.success) {
        setFieldError(pass, 'login-password-error', result.error);
        pass.focus({ preventScroll: true });
        return;
      }
      currentUser = result.user;
      updateNavbarAuth(currentUser);
      const destination = appState.pendingPage || 'home';
      appState.pendingPage = null;
      showToast('Berhasil masuk! Selamat datang.', 'success');
      navigateTo(destination);
    });
  }

  function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => setFieldError(input, `${input.id}-error`, ''));
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('register-name');
      const email = document.getElementById('register-email');
      const password = document.getElementById('register-password');
      const confirmPassword = document.getElementById('register-confirm-password');
      const fields = [
        [name, 'register-name-error'],
        [email, 'register-email-error'],
        [password, 'register-password-error'],
        [confirmPassword, 'register-confirm-password-error'],
      ];
      fields.forEach(([field, errorId]) => setFieldError(field, errorId, ''));

      if (name.value.trim().length < 2) {
        setFieldError(name, 'register-name-error', 'Masukkan nama lengkap.');
        name.focus({ preventScroll: true });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        setFieldError(email, 'register-email-error', 'Masukkan email yang valid.');
        email.focus({ preventScroll: true });
        return;
      }
      if (password.value.length < 8) {
        setFieldError(password, 'register-password-error', 'Kata sandi minimal 8 karakter.');
        password.focus({ preventScroll: true });
        return;
      }
      if (password.value !== confirmPassword.value) {
        setFieldError(confirmPassword, 'register-confirm-password-error', 'Konfirmasi kata sandi tidak cocok.');
        confirmPassword.focus({ preventScroll: true });
        return;
      }

      const result = await authService.register(email.value, password.value, name.value);
      if (!result.success) {
        setFieldError(email, 'register-email-error', result.error);
        email.focus({ preventScroll: true });
        return;
      }
      if (result.session) {
        currentUser = result.user;
        updateNavbarAuth(currentUser);
        const destination = appState.pendingPage || 'home';
        appState.pendingPage = null;
        showToast('Akun berhasil dibuat. Selamat datang!', 'success');
        navigateTo(destination);
      } else {
        showToast('Akun berhasil dibuat. Periksa email untuk verifikasi, lalu masuk.', 'success');
        navigateTo('login');
      }
    });
  }

  // ===== PASSWORD RESET =====
  function setResetMessage(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    if (!element) return;
    const targets = ['reset-request-error', 'reset-request-success', 'reset-password-error'];
    for (const id of targets) document.getElementById(id)?.classList.add('hidden');
    if (!message) return;
    element.textContent = message;
    element.classList.remove('hidden');
    element.classList.toggle('text-rose-600', type === 'error');
    element.classList.toggle('text-emerald-700', type === 'success');
  }

  // Password manager sering menyisipkan kata sandi acak ke input password baru.
  // Input dikunci (readonly) sampai pengunjung fokus, lalu dikunci lagi saat
  // dialog dibuka supaya kolom selalu mulai kosong.
  function armPasswordAutofillGuard() {
    for (const input of document.querySelectorAll('#reset-password-form [data-autofill-guard]')) {
      input.setAttribute('readonly', 'readonly');
      input.value = '';
    }
  }

  function toggleResetModal(modalId, open) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const wasOpen = !modal.classList.contains('hidden');
    modal.classList.toggle('hidden', !open);
    modal.classList.toggle('flex', open);
    const anyOpen = ['reset-request-modal', 'reset-password-modal'].some(
      (id) => !document.getElementById(id)?.classList.contains('hidden'),
    );
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    if (open) {
      if (modalId === 'reset-password-modal' && !wasOpen) {
        document.getElementById('reset-password-form')?.reset();
        armPasswordAutofillGuard();
        setResetMessage('reset-password-error', '');
      }
      // Fokus ke kartu dialog, bukan ke input password, agar kolom tetap
      // readonly (bebas autofill) sampai pengunjung menyentuhnya sendiri.
      const focusTarget =
        modalId === 'reset-password-modal'
          ? (modal.querySelector('[data-dialog-focus]') ?? modal)
          : modal.querySelector('input');
      setTimeout(() => focusTarget?.focus({ preventScroll: true }), 50);
    }
  }

  function closeResetModals() {
    toggleResetModal('reset-request-modal', false);
    toggleResetModal('reset-password-modal', false);
  }

  // Dipanggil tombol "Lupa kata sandi?" dan tautan reset di email.
  function openPasswordResetDialog() {
    const emailField = document.getElementById('reset-email');
    if (emailField) {
      const typed = document.getElementById('login-email')?.value?.trim();
      emailField.value = typed || currentUser?.email || '';
    }
    setResetMessage('reset-request-error', '');
    setResetMessage('reset-request-success', '');
    const submit = document.getElementById('reset-request-submit');
    if (submit) submit.disabled = false;
    const label = document.getElementById('reset-request-submit-text');
    if (label) label.textContent = 'Kirim tautan reset';
    toggleResetModal('reset-request-modal', true);
  }

  function openSetNewPasswordDialog() {
    const email = document.getElementById('reset-password-email');
    if (email) email.textContent = currentUser?.email ? `(${currentUser.email})` : '';
    const submit = document.getElementById('reset-password-submit');
    if (submit) submit.disabled = false;
    const label = document.getElementById('reset-password-submit-text');
    if (label) label.textContent = 'Simpan kata sandi';
    toggleResetModal('reset-password-modal', true);
  }

  async function setBusy(prefix, busy) {
    const spinner = document.getElementById(`${prefix}-spinner`);
    const submit = document.getElementById(`${prefix}-submit`);
    if (spinner) spinner.classList.toggle('hidden', !busy);
    if (submit) submit.disabled = busy;
  }

  function initPasswordReset() {
    document.getElementById('forgot-password-link')?.addEventListener('click', (event) => {
      event.preventDefault();
      openPasswordResetDialog();
    });

    document.querySelectorAll('[data-reset-close]').forEach((button) => {
      button.addEventListener('click', () => toggleResetModal(button.dataset.resetClose, false));
    });

    for (const input of document.querySelectorAll('#reset-password-form [data-autofill-guard]')) {
      // pointerdown/touchstart lebih dulu dari focus supaya keyboard iOS tetap muncul.
      const unlock = () => input.removeAttribute('readonly');
      input.addEventListener('pointerdown', unlock);
      input.addEventListener('touchstart', unlock, { passive: true });
      input.addEventListener('focus', unlock);
    }
    armPasswordAutofillGuard();

    for (const modalId of ['reset-request-modal', 'reset-password-modal']) {
      document.getElementById(modalId)?.addEventListener('click', (event) => {
        if (event.target === event.currentTarget) toggleResetModal(modalId, false);
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeResetModals();
    });

    // Langkah 1: minta tautan reset.
    let isRequestingReset = false;
    document.getElementById('reset-request-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (isRequestingReset) return;
      const emailInput = document.getElementById('reset-email');
      const submitLabel = document.getElementById('reset-request-submit-text');
      const email = emailInput?.value?.trim() ?? '';
      emailInput?.classList.remove('error');
      setResetMessage('reset-request-error', '');
      setResetMessage('reset-request-success', '');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput?.classList.add('error');
        setResetMessage('reset-request-error', 'Masukkan email yang valid.');
        emailInput?.focus();
        return;
      }

      isRequestingReset = true;
      if (submitLabel) submitLabel.textContent = 'Mengirim...';
      void setBusy('reset-request', true);
      try {
        const result = await authService.requestPasswordReset(email);
        if (!result.success) {
          if (submitLabel) submitLabel.textContent = 'Kirim tautan reset';
          setResetMessage('reset-request-error', result.error);
          return;
        }
        if (submitLabel) submitLabel.textContent = 'Kirim ulang tautan';
        setResetMessage(
          'reset-request-success',
          `Tautan reset dikirim ke ${result.email}. Periksa inbox atau folder spam (berlaku ±1 jam).`,
          'success',
        );
      } catch (error) {
        if (submitLabel) submitLabel.textContent = 'Kirim tautan reset';
        setResetMessage(
          'reset-request-error',
          'Gagal mengirim tautan reset. Periksa koneksi lalu coba lagi.',
        );
        logError('Request password reset UI', error);
      } finally {
        isRequestingReset = false;
        void setBusy('reset-request', false);
      }
    });

    // Langkah 2: simpan kata sandi baru dari sesi recovery.
    let isSavingPassword = false;
    document.getElementById('reset-password-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (isSavingPassword) return;
      const passwordInput = document.getElementById('reset-new-password');
      const confirmInput = document.getElementById('reset-confirm-password');
      const submitLabel = document.getElementById('reset-password-submit-text');
      const password = passwordInput?.value ?? '';
      const confirmation = confirmInput?.value ?? '';
      passwordInput?.classList.remove('error');
      confirmInput?.classList.remove('error');
      setResetMessage('reset-password-error', '');

      if (password.length < 8) {
        passwordInput?.classList.add('error');
        setResetMessage('reset-password-error', 'Kata sandi minimal 8 karakter.');
        passwordInput?.focus();
        return;
      }
      if (password !== confirmation) {
        confirmInput?.classList.add('error');
        setResetMessage('reset-password-error', 'Konfirmasi kata sandi tidak cocok.');
        confirmInput?.focus();
        return;
      }

      if (submitLabel) submitLabel.textContent = 'Menyimpan...';
      isSavingPassword = true;
      void setBusy('reset-password', true);
      try {
        const result = await authService.updatePasswordFromRecovery(password);
        if (submitLabel) submitLabel.textContent = 'Simpan kata sandi';
        if (!result.success) {
          setResetMessage('reset-password-error', result.error);
          return;
        }

        const email = result.email ?? '';
        closeResetModals();
        await authService.logout();
        currentUser = null;
        updateNavbarAuth(null);
        const loginEmail = document.getElementById('login-email');
        if (loginEmail && email) loginEmail.value = email;
        if (location.hash !== '#login') history.replaceState(null, '', '#login');
        navigateTo('login');
        showToast('Kata sandi diperbarui. Silakan masuk dengan kata sandi baru.', 'success');
      } catch (error) {
        setResetMessage(
          'reset-password-error',
          'Gagal menyimpan kata sandi baru. Periksa koneksi lalu coba lagi.',
        );
        logError('Save new password UI', error);
      } finally {
        isSavingPassword = false;
        void setBusy('reset-password', false);
      }
    });
  }

  // ===== INIT =====
  (async () => {
    // Show initial page
    const hash = location.hash.replace('#', '') || 'home';
    const landingParams = new URLSearchParams(window.location.search);
    const landingHashParams = new URLSearchParams(window.location.hash.slice(1));
    // Tautan reset bisa datang sebagai penanda ?recovery=1 (implicit flow),
    // token #...&type=recovery, atau rute #reset-password (tautan PKCE lama).
    const isRecoveryLanding =
      hash === 'reset-password' ||
      landingParams.get('recovery') === '1' ||
      landingParams.get('type') === 'recovery' ||
      landingHashParams.get('type') === 'recovery';
    const initialPage = [
      'home',
      'login',
      'register',
      'select-ticket',
      'booking-details',
      'payment',
      'confirmation',
      'ticket-history',
    ].includes(hash)
      ? hash
      : 'home';

    initLoginForm();
    initRegisterForm();
    initPasswordReset();
    initBookingPage();
    initPaymentPage();
    initTicketHistoryPage();
    initScrollReveal();
    setTimeout(animateCounters, 500);

    // Cek status akun untuk sesi yang tersimpan (mis. akun dinonaktifkan
    // admin saat pengunjung masih memiliki sesi login).
    const sessionGuard = await authService.ensureActiveSession();
    if (!sessionGuard.success) {
      currentUser = null;
      updateNavbarAuth(null);
      showToast(sessionGuard.error || 'Akun Anda tidak dapat digunakan.', 'error');
      if (protectedPages.has(initialPage)) {
        appState.pendingPage = initialPage;
        navigateTo('login');
        return;
      }
    }

    // Mendarat dari tautan reset email: supabase-js sudah menukar token di URL
    // menjadi sesi recovery saat client dibuat.
    if (isRecoveryLanding) {
      // Bersihkan token/penanda di URL agar muat ulang tidak mengulang proses.
      const currentUrl = window.location.href;
      const cleanedUrl = new URL(currentUrl);
      for (const key of ['code', 'sb_flow_id', 'recovery', 'type', 'error', 'error_description']) {
        cleanedUrl.searchParams.delete(key);
      }
      if (cleanedUrl.toString() !== currentUrl) {
        history.replaceState(null, '', cleanedUrl.toString());
      }

      if (sessionGuard.success && sessionGuard.user) {
        currentUser = sessionGuard.user;
        updateNavbarAuth(currentUser);
        navigateTo('home');
        openSetNewPasswordDialog();
        return;
      }

      navigateTo('login');
      showToast(
        landingParams.has('code')
          ? 'Tautan reset hanya berlaku di browser tempat Anda meminta reset. Silakan minta tautan baru lewat "Lupa kata sandi?".'
          : 'Tautan reset tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.',
        'error',
      );
      return;
    }

    navigateTo(initialPage);
  })();

  if (typeof window !== 'undefined') {
    window.navigateTo = navigateTo;
    window.goToSection = goToSection;
    window.openPasswordResetDialog = openPasswordResetDialog;
    window.toggleMobileMenu = toggleMobileMenu;
    window.toggleProfileMenu = toggleProfileMenu;
    window.logoutUser = logoutUser;
    window.showToast = showToast;
    window.togglePassword = togglePassword;
    window.updateQty = updateQty;
    window.setTicketPrice = (type, price, name) => {
      if (!Object.hasOwn(appState.prices, type) || !Number.isFinite(price) || price < 0) return;
      appState.prices[type] = price;
      if (name) appState.names[type] = name;

      const heroPrice = document.getElementById(`hero-${type}-price`);
      if (heroPrice) {
        heroPrice.textContent = (price / 1000).toLocaleString('id-ID', {
          maximumFractionDigits: 1,
        });
      }
      const infoPrice = document.getElementById(`info-${type}-price`);
      if (infoPrice) infoPrice.textContent = formatRupiah(price);
      const minPrice = Math.min(appState.prices.weekday, appState.prices.weekend);
      const maxPrice = Math.max(appState.prices.weekday, appState.prices.weekend);
      const startingPrice = document.getElementById('hero-starting-price');
      if (startingPrice) startingPrice.textContent = formatRupiah(minPrice);
      const priceRange = document.getElementById('hero-price-range');
      if (priceRange) {
        priceRange.textContent =
          minPrice === maxPrice
            ? formatRupiah(minPrice)
            : `${formatRupiah(minPrice)}–${formatRupiah(maxPrice)}`;
      }
      const mobilePrice = document.getElementById('mobile-price-from');
      if (mobilePrice) mobilePrice.textContent = formatRupiah(minPrice);

      updateSummaryBar();
      updateBookingSummary();
    };
    window.selectTicketType = selectTicketType;
    window.goToBooking = goToBooking;
    window.goToBookingFromSummary = goToBookingFromSummary;
    window.applyPromo = applyPromo;
    window.processPayment = processPayment;
    window.checkPaymentStatus = checkPaymentStatus;
    window.downloadTicket = downloadTicket;
    window.openTicketFromHistory = openTicketFromHistory;
    window.downloadHistoryTicket = downloadHistoryTicket;
    window.setHistoryFilter = setHistoryFilter;
  }

  ticketPricingService.getActivePricing().then((result) => {
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    result.pricing.forEach((ticket) => {
      window.setTicketPrice(
        ticket.ticket_type,
        Number(ticket.price),
        `Tiket ${ticket.ticket_type === 'weekday' ? 'Weekdays' : 'Weekend'}`,
      );
    });
  });
}
