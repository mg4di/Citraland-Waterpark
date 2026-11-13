import { authService } from '../services/authService.js'
import { bookingService } from '../services/bookingService.js'
import { paymentService } from '../services/paymentService.js'
import { promotionService } from '../services/promotionService.js'
import { ticketPricingService } from '../services/ticketPricingService.js'
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
} from '../services/ticketService.js'
import { validateBookingForm } from '../utils/validation.js'

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
    const bookingPages = new Set(['select-ticket', 'booking-details', 'payment', 'confirmation']);
    const protectedPages = new Set([...bookingPages, 'ticket-history']);
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
      const displayName = user?.user_metadata?.full_name?.trim() || user?.email?.split('@')[0] || 'Profil';
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
    function renderPage(page) {
      const currentEl = document.getElementById('page-' + appState.currentPage);
      const targetEl = document.getElementById('page-' + page);
      if (!targetEl || page === appState.currentPage) return;

      // Hide current
      if (currentEl) {
        currentEl.classList.remove('active','fade-in');
        currentEl.classList.add('fade-out');
        setTimeout(() => { currentEl.style.display = 'none'; currentEl.classList.remove('fade-out'); }, 300);
      }

      // Show target
      setTimeout(() => {
        targetEl.style.display = 'block';
        targetEl.classList.add('active','fade-in');
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
        if (page === 'home') initScrollReveal();
        initScrollReveal();
        initBubbles(page);
      }, 300);

      // Update URL hash
      history.pushState(null, '', '#' + page);
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
        const result = await authService.getUser();
        if (!result.success) {
          currentUser = null;
          appState.pendingPage = page;
          showToast('Sesi tidak dapat diverifikasi. Silakan masuk kembali untuk melanjutkan.', 'error');
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
      const hash = location.hash.replace('#','') || 'home';
      navigateTo(hash);
    });

    authService.onAuthStateChange((user) => {
      currentUser = user;
      updateNavbarAuth(user);
      if (!user) {
        appState.ticketHistory = [];
        appState.confirmationBooking = null;
        appState.qrDataUrl = '';
        appState.paymentTotalOverride = null;
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
    function toggleMobileMenu(open) {
      const menu = document.getElementById('mobileMenu');
      if (open) { menu.classList.add('open'); document.body.style.overflow = 'hidden'; }
      else { menu.classList.remove('open'); document.body.style.overflow = ''; }
    }

    // ===== TOAST =====
    let toastTimeout;
    function showToast(message, type = 'success') {
      clearTimeout(toastTimeout);
      const toast = document.getElementById('toast');
      const icon = document.getElementById('toast-icon');
      const msg = document.getElementById('toast-message');
      msg.textContent = message;
      if (type === 'success') { icon.setAttribute('icon','lucide:check-circle'); icon.className='text-emerald-400 text-xl'; }
      else if (type === 'error') { icon.setAttribute('icon','lucide:alert-circle'); icon.className='text-red-400 text-xl'; }
      else { icon.setAttribute('icon','lucide:info'); icon.className='text-blue-400 text-xl'; }
      toast.classList.add('show');
      toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ===== PASSWORD TOGGLE =====
    function togglePassword(btn) {
      const input = btn.parentElement.querySelector('input');
      const icon = btn.querySelector('iconify-icon');
      if (input.type === 'password') { input.type = 'text'; icon.setAttribute('icon','lucide:eye-off'); }
      else { input.type = 'password'; icon.setAttribute('icon','lucide:eye'); }
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
      if (delta > 0) showToast('Tiket ' + appState.names[type] + ' ditambahkan!', 'success');
    }

    function formatRupiah(n) { return 'Rp' + n.toLocaleString('id-ID'); }

    function updateSummaryBar() {
      const total = appState.quantities.weekday + appState.quantities.weekend;
      const price = (appState.quantities.weekday * appState.prices.weekday) + (appState.quantities.weekend * appState.prices.weekend);
      const bar = document.getElementById('summaryBar');
      document.getElementById('summaryCount').textContent = total + ' tiket';
      document.getElementById('summaryPrice').textContent = formatRupiah(price);
      if (total > 0) bar.classList.remove('hidden-bar'); else bar.classList.add('hidden-bar');
    }

    function goToBooking(type) {
      appState.paymentTotalOverride = null;
      const otherType = type === 'weekday' ? 'weekend' : 'weekday';
      appState.quantities[otherType] = 0;
      document.getElementById(otherType + '-qty').value = 0;
      if (appState.quantities[type] === 0) {
        appState.quantities[type] = 1;
        document.getElementById(type + '-qty').value = 1;
        updateSummaryBar();
      }
      navigateTo('booking-details');
    }

    function goToBookingFromSummary() {
      appState.paymentTotalOverride = null;
      const total = appState.quantities.weekday + appState.quantities.weekend;
      if (total === 0) { showToast('Pilih minimal 1 tiket','error'); return; }
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
      return Object.keys(appState.quantities).find(type => appState.quantities[type] > 0);
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
      const firstOfMonth = new Date(displayedCalendarMonth.getFullYear(), displayedCalendarMonth.getMonth(), 1);
      const daysInMonth = new Date(displayedCalendarMonth.getFullYear(), displayedCalendarMonth.getMonth() + 1, 0).getDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      monthLabel.textContent = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(firstOfMonth);
      if (previousButton) {
        previousButton.disabled = firstOfMonth.getFullYear() === today.getFullYear()
          && firstOfMonth.getMonth() === today.getMonth();
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
        const isAllowed = Boolean(selectedType && date >= today && isDateAvailableForTicket(date, selectedType));
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = String(day);
        button.dataset.date = dateValue;
        button.disabled = !isAllowed;
        button.setAttribute('aria-label', formatDateID(dateValue));
        if (isSelected) button.setAttribute('aria-pressed', 'true');
        button.className = isSelected
          ? 'mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-ocean text-sm font-bold text-white'
          : isAllowed
            ? 'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-slate-700 transition hover:bg-lagoon hover:text-ocean focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocean'
            : 'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm text-slate-300 disabled:cursor-not-allowed';
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
      if (!dateInput || !calendarDays || !monthLabel || !dateLabel || !previousButton || !nextButton) return;

      if (!calendarDays.dataset.initialized) {
        calendarDays.addEventListener('click', event => {
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
          const previousMonth = new Date(displayedCalendarMonth.getFullYear(), displayedCalendarMonth.getMonth() - 1, 1);
          if (previousMonth >= currentMonth) {
            displayedCalendarMonth = previousMonth;
            renderBookingCalendar();
          }
        });
        nextButton.addEventListener('click', () => {
          displayedCalendarMonth = new Date(displayedCalendarMonth.getFullYear(), displayedCalendarMonth.getMonth() + 1, 1);
          renderBookingCalendar();
        });
        calendarDays.dataset.initialized = 'true';
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedType = getSelectedTicketType();
      let selectedDate = dateInput.value ? new Date(`${dateInput.value}T00:00:00`) : null;
      if (!selectedDate || !selectedType || selectedDate < today || !isDateAvailableForTicket(selectedDate, selectedType)) {
        selectedDate = new Date(today);
        selectedDate.setDate(selectedDate.getDate() + 7);
        while (selectedType && !isDateAvailableForTicket(selectedDate, selectedType)) {
          selectedDate.setDate(selectedDate.getDate() + 1);
        }
      }

      dateInput.min = formatDateValue(today);
      dateInput.value = selectedType ? formatDateValue(selectedDate) : '';
      dateLabel.textContent = dateInput.value ? formatDateID(dateInput.value) : 'Pilih tiket terlebih dahulu';
      displayedCalendarMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      renderBookingCalendar();
    }

    function initBookingPage() {
      const form = document.getElementById('booking-form');
      const promoPanel = document.getElementById('promo-input')?.closest('.rounded-2xl.bg-slate-50.p-5');
      const actionRow = form?.querySelector('button[type="submit"]')?.parentElement;
      if (form && promoPanel && promoPanel.parentElement !== form && actionRow) {
        form.insertBefore(promoPanel, actionRow);
      }

      const dateInput = document.getElementById('bf-date');
      initBookingCalendar();
      dateInput.addEventListener('change', updateBookingSummary);
      updateBookingSummary();

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const authResult = await authService.getUser();
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

        const ticketCount = Object.values(appState.quantities).reduce((total, quantity) => total + quantity, 0);
        if (ticketCount === 0) {
          showToast('Pilih tiket terlebih dahulu','error');
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
        for (const [field, input] of Object.entries({
          userName: name,
          userEmail: email,
          userPhone: phone,
          visitDate: dateInput,
        })) input.classList.toggle('error', Boolean(validation.errors[field]));
        if (!validation.valid) {
          showToast(Object.values(validation.errors)[0], 'error');
          return;
        }
        const ticketType = getSelectedTicketType();
        const dateValidation = bookingService.validateVisitDate(formData.visitDate, ticketType);
        if (!dateValidation.valid) {
          showToast(dateValidation.error, 'error');
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
        const btnSpinner = document.getElementById('bf-btn-spinner');
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        btnText.textContent = 'Memproses...';
        btnIcon.classList.add('hidden');
        btnSpinner.classList.remove('hidden');

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
        const result = await paymentService.getBookingStatus(appState.bookingCode, appState.booking.email);
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
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      const d = new Date(dateStr + 'T00:00:00');
      return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    function getSelectedTickets() {
      return Object.keys(appState.quantities)
        .filter(type => appState.quantities[type] > 0)
        .map(type => ({
          type,
          name: appState.names[type],
          quantity: appState.quantities[type],
          subtotal: appState.prices[type] * appState.quantities[type]
        }));
    }

    function getOrderTotals() {
      const subtotal = getSelectedTickets().reduce((total, ticket) => total + ticket.subtotal, 0);
      const serviceFee = 0;
      if (appState.paymentTotalOverride !== null && Number.isFinite(Number(appState.paymentTotalOverride))) {
        const total = Number(appState.paymentTotalOverride);
        return { subtotal, serviceFee, discount: Math.max(0, subtotal + serviceFee - total), total };
      }
      const discount = appState.promo ? Math.min(appState.promo.discountAmount, subtotal + serviceFee) : 0;
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
      tickets.forEach(ticket => {
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
        ? selectedTickets.map(ticket => ticket.name).join(', ')
        : 'Tiket terpilih';
      document.getElementById('bs-qty').textContent = quantity + ' tiket';
      document.getElementById('bs-date').textContent = dateVal ? formatDateID(dateVal) : 'Pilih tanggal kunjungan';

      renderOrderLines('bs-lines', selectedTickets, 'Belum ada tiket dipilih.');
      document.getElementById('bs-total').textContent = formatRupiah(total);
    }

    // ===== PAYMENT PAGE =====
    function initPaymentPage() {
      updatePaymentSummary();
      // Countdown
      let secs = 24*3600 - 15;
      const cdEl = document.getElementById('countdown');
      if (cdEl) {
        setInterval(() => {
          const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60), s = secs%60;
          cdEl.textContent = String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
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
      if (currentUser?.email && booking.user_email?.toLowerCase() !== currentUser.email.toLowerCase()) {
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
        const dataUrl = appState.qrDataUrl || await generateQrDataUrl(booking);
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
      const booking = appState.confirmationBooking || await loadConfirmationBooking();
      if (booking) {
        appState.bookingCode = booking.booking_code;
        if (appState.paymentStatus !== 'paid') appState.paymentStatus = booking.payment_status;
        appState.paymentType = booking.payment_method || booking.midtrans_payment_type || appState.paymentType;
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
      if (customerName) customerName.textContent = booking?.user_name || appState.booking.name || 'Nama pengunjung';
      if (ticketTypes) ticketTypes.textContent = booking
        ? getTicketSummary(booking)
        : tickets.length
          ? tickets.map(ticket => `${ticket.name} × ${ticket.quantity}`).join(', ')
          : 'Belum ada tiket dipilih';
      if (visitDate) visitDate.textContent = formatTicketDate(booking?.visit_date || appState.booking.date);
      if (customerEmail) customerEmail.textContent = booking?.user_email || appState.booking.email || 'Email belum tersedia';
      if (customerPhone) customerPhone.textContent = booking?.user_phone || appState.booking.phone || 'Nomor telepon belum tersedia';
      if (qrTicketTypes) qrTicketTypes.textContent = tickets.length
        ? tickets.map(ticket => ticket.type.toUpperCase()).join('-')
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
        paymentMethodElement.textContent = getPaymentMethodLabel(booking ?? { payment_method: appState.paymentType });
      }
      const totalElement = document.getElementById('confirm-total');
      if (totalElement) totalElement.textContent = formatRupiah(totals.total);
      const bookingCodeElement = document.getElementById('confirm-code');
      if (bookingCodeElement) bookingCodeElement.textContent = booking?.booking_code || appState.bookingCode || '-';
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
      spinner?.classList.toggle('hidden', !busy);
    }

    async function downloadTicket() {
      if (appState.isDownloadingTicket) return;
      const booking = appState.confirmationBooking || await loadConfirmationBooking();
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
        const qrDataUrl = appState.qrDataUrl || await generateQrDataUrl(booking);
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
      success.querySelector('span').textContent = `Kode promo berhasil diterapkan! Diskon ${formatRupiah(result.discountAmount)}`;
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
      const spinner = document.getElementById('pay-btn-spinner');
      if (button) button.disabled = busy;
      if (text) text.textContent = busy ? label : 'Bayar Sekarang';
      icon?.classList.toggle('hidden', busy);
      spinner?.classList.toggle('hidden', !busy);
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
      paymentService.displaySnapPopup(appState.snapToken, {
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
      }).catch((error) => {
        appState.isSnapOpen = false;
        setPaymentButtonBusy(false);
        console.error('Midtrans Snap popup failed:', error);
        showToast(error instanceof Error ? error.message : 'Pembayaran gagal diinisialisasi. Silakan coba lagi.', 'error');
      });
    }

    // ===== CONFIRMATION =====

    // ===== TICKET HISTORY =====
    const HISTORY_TONE_CLASSES = {
      emerald: 'bg-emerald-50 text-emerald-700',
      amber: 'bg-amber-50 text-amber-700',
      rose: 'bg-rose-50 text-rose-700',
      slate: 'bg-slate-100 text-slate-600',
      violet: 'bg-violet-50 text-violet-700',
      ocean: 'bg-lagoon text-ocean',
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
      const payment = getPaymentStatusMeta(status);
      const usage = getUsageStatusMeta(booking);
      const article = document.createElement('article');
      article.className = 'scroll-reveal visible flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md';

      const header = document.createElement('div');
      header.className = 'flex items-start justify-between gap-4';
      const codeWrap = document.createElement('div');
      const code = document.createElement('p');
      code.className = 'font-display text-lg font-extrabold tracking-widest text-ocean';
      code.textContent = booking.booking_code;
      const created = document.createElement('p');
      created.className = 'mt-1 text-xs text-slate-400';
      created.textContent = `Dipesan ${formatHistoryCreatedAt(booking.created_at)}`;
      codeWrap.append(code, created);
      header.append(codeWrap, createHistoryBadge(payment.label, payment.tone));

      const meta = document.createElement('div');
      meta.className = 'mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500';
      const dateBadge = document.createElement('span');
      dateBadge.className = 'inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 font-semibold text-slate-600';
      const dateIcon = document.createElement('iconify-icon');
      dateIcon.setAttribute('icon', 'lucide:calendar-days');
      dateIcon.className = 'text-ocean';
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
      summaryTotal.className = 'mt-1 font-display text-xl font-extrabold text-ocean';
      summaryTotal.textContent = formatTicketRupiah(booking.total_amount);
      summary.append(summaryTitle, summaryTotal);

      const actions = document.createElement('div');
      actions.className = 'mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5';
      if (status === 'paid') {
        const view = document.createElement('button');
        view.type = 'button';
        view.className = 'inline-flex min-h-10 items-center gap-2 rounded-full bg-ocean px-4 text-xs font-bold text-white transition hover:bg-aqua';
        view.textContent = 'Lihat E-Ticket';
        view.addEventListener('click', () => openTicketFromHistory(booking.booking_code));
        const download = document.createElement('button');
        download.type = 'button';
        download.className = 'inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-ocean';
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
          pay.className = 'inline-flex min-h-10 items-center gap-2 rounded-full bg-amber-500 px-4 text-xs font-bold text-white transition hover:bg-amber-600';
          pay.textContent = 'Lanjutkan Pembayaran';
          pay.addEventListener('click', () => resumePaymentFromHistory(booking.booking_code));
          actions.append(pay);
        }
        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-50';
        cancel.textContent = 'Batalkan Pesanan';
        cancel.addEventListener('click', () => cancelPendingBooking(booking.booking_code));
        actions.append(cancel);
      } else if (status === 'cancelled') {
        const note = document.createElement('p');
        note.className = 'w-full text-xs font-semibold text-slate-500';
        note.textContent = booking.cancellation_reason === 'expired'
          ? 'Tiket tidak dipakai dan tanggal kunjungan sudah lewat, sehingga otomatis dibatalkan.'
          : 'Pesanan ini telah dibatalkan.';
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-ocean';
        retry.textContent = 'Pesan tiket lagi';
        retry.addEventListener('click', () => navigateTo('select-ticket'));
        actions.append(note, retry);
      } else {
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:border-ocean hover:text-ocean';
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
        if (title) title.textContent = hasAny ? 'Tidak ada tiket untuk filter ini' : 'Belum ada riwayat tiket';
        if (description) description.textContent = hasAny
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
      if (currentUser?.email && booking.user_email?.toLowerCase() !== currentUser.email.toLowerCase()) {
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
      appState.confirmationBooking = booking;
      appState.bookingCode = booking.booking_code;
      appState.paymentStatus = booking.payment_status;
      appState.paymentType = booking.payment_method || booking.midtrans_payment_type || '';
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
      if (currentUser?.email && booking.user_email?.toLowerCase() !== currentUser.email.toLowerCase()) {
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
      appState.paymentType = booking.payment_method || booking.midtrans_payment_type || '';
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
      if (currentUser?.email && cached && cached.user_email?.toLowerCase() !== currentUser.email.toLowerCase()) {
        showToast('Anda hanya dapat membatalkan pesanan akun sendiri.', 'error');
        return;
      }
      const confirmed = typeof window.confirm === 'function'
        ? window.confirm(`Batalkan pesanan ${bookingCode}? Pesanan yang dibatalkan tidak dapat dilanjutkan lagi.`)
        : true;
      if (!confirmed) return;
      const result = await bookingService.cancelOwnBooking(bookingCode);
      if (!result.success) {
        showToast(result.error, 'error');
        return;
      }
      const wasActivePayment = appState.currentPage === 'payment' && appState.bookingCode === bookingCode;
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
      if (currentUser?.email && booking.user_email?.toLowerCase() !== currentUser.email.toLowerCase()) {
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
        button.classList.toggle('bg-ocean', active);
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
      const colors = ['#00BCD4','#0097A7','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4'];
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const p = document.createElement('div');
          p.classList.add('confetti-piece');
          p.style.left = Math.random()*100+'%';
          p.style.width = (Math.random()*8+6)+'px';
          p.style.height = p.style.width;
          p.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
          p.style.borderRadius = Math.random()>.5?'50%':'2px';
          p.style.animationDuration = (Math.random()*2+2)+'s';
          container.appendChild(p);
          setTimeout(() => p.remove(), 4500);
        }, i*40);
      }
    }

    // ===== BUBBLES =====
    function initBubbles(page) {
      const ids = { 'login':'bubbles-login', 'select-ticket':'bubbles-ticket', 'booking-details':'bubbles-booking' };
      const containerId = ids[page];
      if (!containerId) return;
      const container = document.getElementById(containerId);
      if (!container || container.children.length > 0) return;
      for (let i=0;i<8;i++) {
        setTimeout(() => {
          const b = document.createElement('div');
          b.classList.add('bubble');
          const s = Math.random()*18+5;
          b.style.width=s+'px'; b.style.height=s+'px';
          b.style.left=Math.random()*100+'%'; b.style.bottom='-20px';
          b.style.animationDuration=(Math.random()*6+6)+'s';
          b.style.animationDelay=(Math.random()*3)+'s';
          container.appendChild(b);
        }, i*500);
      }
    }

    // ===== SCROLL REVEAL =====
    function initScrollReveal() {
      const els = document.querySelectorAll('.scroll-reveal');
      const check = () => { els.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight - 60) el.classList.add('visible'); }); };
      window.addEventListener('scroll', check);
      setTimeout(check, 100);
    }

    // ===== COUNTER ANIMATION =====
    function animateCounters() {
      document.querySelectorAll('.counter').forEach(c => {
        const target = parseFloat(c.dataset.target);
        const isDec = target % 1 !== 0;
        const dur = 2000, start = performance.now();
        const update = (t) => {
          const p = Math.min((t-start)/dur,1);
          const e = 1 - Math.pow(1-p,3);
          c.textContent = isDec ? (e*target).toFixed(1) : Math.floor(e*target);
          if (p<1) requestAnimationFrame(update);
          else c.textContent = isDec ? target.toFixed(1) : target;
        };
        requestAnimationFrame(update);
      });
    }

    // ===== HEADER SCROLL =====
    window.addEventListener('scroll', () => {
      const h = document.getElementById('mainHeader');
      if (h) { if (window.pageYOffset > 80) h.classList.add('header-scrolled'); else h.classList.remove('header-scrolled'); }
    });

    // ===== KEYBOARD =====
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleMobileMenu(false);
        closeProfileMenus();
      }
    });

    // ===== LOGIN FORM =====
    function initLoginForm() {
      const form = document.getElementById('login-form');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email');
        const pass = document.getElementById('login-password');
        if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('error'); showToast('Masukkan email yang valid','error'); return; }
        if (!pass.value || pass.value.length < 8) { pass.classList.add('error'); showToast('Kata sandi minimal 8 karakter','error'); return; }
        email.classList.remove('error'); pass.classList.remove('error');
        document.getElementById('login-btn-text').textContent = 'Memproses...';
        document.getElementById('login-btn-icon').classList.add('hidden');
        document.getElementById('login-btn-spinner').classList.remove('hidden');
        const result = await authService.login(email.value, pass.value);
        document.getElementById('login-btn-text').textContent = 'Masuk ke Citraland Waterpark';
        document.getElementById('login-btn-icon').classList.remove('hidden');
        document.getElementById('login-btn-spinner').classList.add('hidden');
        if (!result.success) {
          showToast(result.error, 'error');
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
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('register-name');
        const email = document.getElementById('register-email');
        const password = document.getElementById('register-password');
        const confirmPassword = document.getElementById('register-confirm-password');
        [name, email, password, confirmPassword].forEach((field) => field.classList.remove('error'));

        if (name.value.trim().length < 2) { name.classList.add('error'); showToast('Masukkan nama lengkap','error'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('error'); showToast('Masukkan email yang valid','error'); return; }
        if (password.value.length < 8) { password.classList.add('error'); showToast('Kata sandi minimal 8 karakter','error'); return; }
        if (password.value !== confirmPassword.value) { confirmPassword.classList.add('error'); showToast('Konfirmasi kata sandi tidak cocok','error'); return; }

        const result = await authService.register(email.value, password.value, name.value);
        if (!result.success) {
          showToast(result.error, 'error');
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

    // ===== INIT =====
    (() => {
      // Show initial page
      const hash = location.hash.replace('#','') || 'home';
      const initialPage = ['home','login','register','select-ticket','booking-details','payment','confirmation','ticket-history'].includes(hash) ? hash : 'home';

      initLoginForm();
      initRegisterForm();
      initBookingPage();
      initPaymentPage();
      initTicketHistoryPage();
      initScrollReveal();
      setTimeout(animateCounters, 500);
      navigateTo(initialPage);
    })()

  if (typeof window !== 'undefined') {
    window.navigateTo = navigateTo;
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
      updateSummaryBar();
      updateBookingSummary();
    };
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
  })
}
