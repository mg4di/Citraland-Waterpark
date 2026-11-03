export function initializeUserPage() {

    // ===== APP STATE =====
    const appState = {
      quantities: { weekday: 0, weekend: 0 },
      prices: { weekday: 35000, weekend: 50000 },
      names: { weekday: 'Tiket Weekdays', weekend: 'Tiket Weekend' },
      promoApplied: false,
      booking: { name: '', email: '', phone: '', date: '' },
      currentPage: 'home'
    };

    // ===== NAVIGATION =====
    function navigateTo(page) {
      const pages = ['home','login','register','select-ticket','booking-details','payment','confirmation'];
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
          initBookingCalendar();
          updateBookingSummary();
        }
        if (page === 'payment') updatePaymentSummary();
        if (page === 'confirmation') updateConfirmationDetails();
        if (page === 'home') initScrollReveal();
        initScrollReveal();
        initBubbles(page);
      }, 300);

      // Update URL hash
      history.pushState(null, '', '#' + page);
    }

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      const hash = location.hash.replace('#','') || 'home';
      navigateTo(hash);
    });

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
      // Set default date
      const dateInput = document.getElementById('bf-date');
      initBookingCalendar();
      dateInput.addEventListener('change', updateBookingSummary);
      updateBookingSummary();

      // Form submit
      document.getElementById('booking-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const ticketCount = Object.values(appState.quantities).reduce((total, quantity) => total + quantity, 0);
        if (ticketCount === 0) {
          showToast('Pilih tiket terlebih dahulu','error');
          navigateTo('select-ticket');
          return;
        }
        const name = document.getElementById('bf-name');
        const email = document.getElementById('bf-email');
        const phone = document.getElementById('bf-phone');
        let valid = true;
        if (!name.value.trim()) { name.classList.add('error'); document.getElementById('bf-name-error').classList.remove('hidden'); valid = false; }
        else { name.classList.remove('error'); document.getElementById('bf-name-error').classList.add('hidden'); }
        if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('error'); valid = false; } else { email.classList.remove('error'); }
        if (!phone.value.trim() || phone.value.trim().length < 10) { phone.classList.add('error'); valid = false; } else { phone.classList.remove('error'); }

        if (!valid) { showToast('Lengkapi semua data yang wajib diisi','error'); return; }

        appState.booking = {
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          date: document.getElementById('bf-date').value
        };

        const btnText = document.getElementById('bf-btn-text');
        const btnIcon = document.getElementById('bf-btn-icon');
        const btnSpinner = document.getElementById('bf-btn-spinner');
        btnText.textContent = 'Memproses...'; btnIcon.classList.add('hidden'); btnSpinner.classList.remove('hidden');
        setTimeout(() => {
          btnText.textContent = 'Lanjut ke Pembayaran'; btnIcon.classList.remove('hidden'); btnSpinner.classList.add('hidden');
          navigateTo('payment');
        }, 1500);
      });

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
      const discount = appState.promoApplied ? Math.min(10000, subtotal + serviceFee) : 0;
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
      // Payment method selection
      const options = document.querySelectorAll('#payment-methods .payment-option');
      const cardDetails = document.getElementById('card-details');
      options.forEach(opt => {
        opt.addEventListener('click', () => {
          options.forEach(o => { o.classList.remove('selected','border-2','border-ocean','bg-lagoon'); o.classList.add('border','border-slate-200','bg-white'); });
          opt.classList.add('selected','border-2','border-ocean','bg-lagoon');
          opt.classList.remove('border','border-slate-200','bg-white');
          opt.querySelector('input').checked = true;
          if (opt.dataset.method === 'credit-card') cardDetails.classList.add('open');
          else cardDetails.classList.remove('open');
        });
      });

      // Card number formatting
      document.getElementById('card-number')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\s/g,'').replace(/\D/g,'');
        let f = ''; for (let i=0;i<v.length;i++) { if(i>0&&i%4===0) f+=' '; f+=v[i]; } e.target.value = f;
      });
      document.getElementById('card-expiry')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g,'');
        if (v.length >= 2) v = v.substring(0,2) + ' / ' + v.substring(2,4);
        e.target.value = v;
      });
      document.getElementById('card-cvv')?.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g,''); });

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

    function updateConfirmationDetails() {
      const tickets = getSelectedTickets();
      const { serviceFee, discount, total } = getOrderTotals();
      const customerName = document.getElementById('confirm-name');
      const ticketTypes = document.getElementById('confirm-ticket-types');
      const visitDate = document.getElementById('confirm-date');
      const customerEmail = document.getElementById('confirm-email');
      const customerPhone = document.getElementById('confirm-phone');
      const qrTicketTypes = document.getElementById('confirm-qr-types');
      const paymentMethod = document.querySelector('#payment-methods .payment-option.selected');
      const paymentMethodNames = {
        'credit-card': 'Kartu kredit / debit',
        ewallet: 'E-wallet',
        'bank-transfer': 'Transfer bank',
        installment: 'Cicilan tanpa kartu'
      };
      if (customerName) customerName.textContent = appState.booking.name || 'Nama pengunjung';
      if (ticketTypes) ticketTypes.textContent = tickets.length
        ? tickets.map(ticket => `${ticket.name} × ${ticket.quantity}`).join(', ')
        : 'Belum ada tiket dipilih';
      if (visitDate) visitDate.textContent = formatDateID(appState.booking.date);
      if (customerEmail) customerEmail.textContent = appState.booking.email || 'Email belum tersedia';
      if (customerPhone) customerPhone.textContent = appState.booking.phone || 'Nomor telepon belum tersedia';
      if (qrTicketTypes) qrTicketTypes.textContent = tickets.length
        ? tickets.map(ticket => ticket.type.toUpperCase()).join('-')
        : 'TICKET';
      renderOrderLines('confirm-lines', tickets, 'Belum ada tiket dipilih.');
      const serviceFeeElement = document.getElementById('confirm-service-fee');
      if (serviceFeeElement) serviceFeeElement.textContent = formatRupiah(serviceFee);
      const discountRow = document.getElementById('confirm-discount-row');
      if (discountRow) {
        discountRow.classList.toggle('hidden', discount === 0);
        const discountAmount = document.getElementById('confirm-discount');
        if (discountAmount) discountAmount.textContent = '-' + formatRupiah(discount);
      }
      const paymentMethodElement = document.getElementById('confirm-payment-method');
      if (paymentMethodElement) paymentMethodElement.textContent = paymentMethodNames[paymentMethod?.dataset.method] || 'Belum dipilih';
      const totalElement = document.getElementById('confirm-total');
      if (totalElement) totalElement.textContent = formatRupiah(total);
    }

    function applyPromo() {
      const code = document.getElementById('promo-input').value.trim().toUpperCase();
      if (['CITRALAND10','CITRALAND','DISKON10','HEMAT'].includes(code)) {
        appState.promoApplied = true;
        document.getElementById('promo-success').classList.remove('hidden');
        document.getElementById('promo-success').classList.add('flex','promo-success');
        document.getElementById('discount-row').classList.remove('hidden');
        document.getElementById('promo-btn').textContent = '✓';
        document.getElementById('promo-input').disabled = true;
        updatePaymentSummary();
        showToast('Kode promo berhasil diterapkan!','success');
      } else { showToast('Kode promo tidak valid','error'); }
    }

    function processPayment() {
      updatePaymentSummary();
      const btnText = document.getElementById('pay-btn-text');
      const btnIcon = document.getElementById('pay-btn-icon');
      const btnSpinner = document.getElementById('pay-btn-spinner');
      btnText.textContent = 'Memproses pembayaran...'; btnIcon.classList.add('hidden'); btnSpinner.classList.remove('hidden');
      setTimeout(() => {
        btnText.textContent = 'Pembayaran berhasil!'; btnSpinner.classList.add('hidden'); btnIcon.classList.remove('hidden');
        btnIcon.setAttribute('icon','lucide:check-circle');
        showToast('Pembayaran berhasil! Mengalihkan...','success');
        setTimeout(() => navigateTo('confirmation'), 1500);
      }, 2500);
    }

    // ===== CONFIRMATION =====
    function copyBookingCode() {
      const code = document.getElementById('confirm-code').textContent;
      navigator.clipboard.writeText(code).then(() => showToast('Kode booking disalin: '+code,'success')).catch(() => showToast('Gagal menyalin','error'));
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
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMobileMenu(false); });

    // ===== LOGIN FORM =====
    function initLoginForm() {
      const form = document.getElementById('login-form');
      if (!form) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email');
        const pass = document.getElementById('login-password');
        if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('error'); showToast('Masukkan email yang valid','error'); return; }
        if (!pass.value || pass.value.length < 6) { pass.classList.add('error'); showToast('Kata sandi minimal 6 karakter','error'); return; }
        email.classList.remove('error'); pass.classList.remove('error');
        document.getElementById('login-btn-text').textContent = 'Memproses...';
        document.getElementById('login-btn-icon').classList.add('hidden');
        document.getElementById('login-btn-spinner').classList.remove('hidden');
        setTimeout(() => {
          document.getElementById('login-btn-text').textContent = 'Masuk ke Citraland Waterpark';
          document.getElementById('login-btn-icon').classList.remove('hidden');
          document.getElementById('login-btn-spinner').classList.add('hidden');
          showToast('Berhasil masuk! Selamat datang.','success');
          setTimeout(() => navigateTo('home'), 1500);
        }, 2000);
      });
    }

    function initRegisterForm() {
      const form = document.getElementById('register-form');
      if (!form) return;
      form.addEventListener('submit', (event) => {
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

        showToast('Data valid. Layanan pendaftaran akun belum terhubung.','info');
      });
    }

    // ===== INIT =====
    (() => {
      // Show initial page
      const hash = location.hash.replace('#','') || 'home';
      const initialPage = ['home','login','register','select-ticket','booking-details','payment','confirmation'].includes(hash) ? hash : 'home';
      const el = document.getElementById('page-' + initialPage);
      el.style.display = 'block';
      el.classList.add('active','fade-in');
      appState.currentPage = initialPage;

      initLoginForm();
      initRegisterForm();
      initBookingPage();
      initPaymentPage();
      initScrollReveal();
      initBubbles(initialPage);
      setTimeout(animateCounters, 500);
    })()

  if (typeof window !== 'undefined') {
    window.navigateTo = navigateTo;
    window.toggleMobileMenu = toggleMobileMenu;
    window.showToast = showToast;
    window.togglePassword = togglePassword;
    window.updateQty = updateQty;
    window.goToBooking = goToBooking;
    window.goToBookingFromSummary = goToBookingFromSummary;
    window.applyPromo = applyPromo;
    window.processPayment = processPayment;
    window.copyBookingCode = copyBookingCode;
  }
}
