import { authService } from '../services/authService.js'
import { bookingService } from '../services/bookingService.js'
import { facilitiesService } from '../services/facilitiesService.js'
import { galleryService } from '../services/galleryService.js'
import { promotionService } from '../services/promotionService.js'
import { realtimeManager } from '../services/realtimeService.js'
import { ticketPricingService } from '../services/ticketPricingService.js'

export function initializeAdminPage(onLogout = () => window.location.assign('/admin')) {

// ===================== GLOBAL STATE & DATA =====================
const root = document.getElementById('admin-root');
const overlay = document.getElementById('mobile-overlay');
const toastContainer = document.getElementById('toast-container');

// Bookings data
let bookings = [];
let bkFilter='all', bkSearch='', bkPage=1; const bkPerPage=5;

// Users data
let users = [
  {id:'USR-1001',name:'Dimas Pratama',email:'dimas@email.com',phone:'0812-3456-7890',joinDate:'12 Des 2024',status:'Active'},
  {id:'USR-1002',name:'Rina Pratiwi',email:'rina@email.com',phone:'0813-2201-8842',joinDate:'10 Des 2024',status:'Active'},
  {id:'USR-1003',name:'Andi Saputra',email:'andi@email.com',phone:'0815-9921-4400',joinDate:'08 Des 2024',status:'Active'},
  {id:'USR-1004',name:'Maya Lestari',email:'maya@email.com',phone:'0812-7700-1234',joinDate:'05 Des 2024',status:'Inactive'},
  {id:'USR-1005',name:'Fajar Nugraha',email:'fajar@email.com',phone:'0819-6722-1108',joinDate:'02 Des 2024',status:'Active'},
  {id:'USR-1006',name:'Sari Wulandari',email:'sari@email.com',phone:'0821-5531-2240',joinDate:'28 Nov 2024',status:'Active'},
  {id:'USR-1007',name:'Budi Hartono',email:'budi@email.com',phone:'0817-8841-3200',joinDate:'25 Nov 2024',status:'Inactive'},
  {id:'USR-1008',name:'Nadia Permata',email:'nadia@email.com',phone:'0822-1088-7731',joinDate:'21 Nov 2024',status:'Active'},
  {id:'USR-1009',name:'Rizky Maulana',email:'rizky@email.com',phone:'0812-6012-9921',joinDate:'18 Nov 2024',status:'Active'},
  {id:'USR-1010',name:'Lia Anggraini',email:'lia@email.com',phone:'0813-4455-7788',joinDate:'14 Nov 2024',status:'Active'},
  {id:'USR-1011',name:'Yoga Prasetyo',email:'yoga@email.com',phone:'0818-3321-9900',joinDate:'10 Nov 2024',status:'Inactive'},
];
let usrSearch='', usrStatusFilter='all', usrSelected=new Set(), editingUserIdx=null;

// Facilities data
let facilities = [];
let editingFacId=null;

// Promotions data
let promotions = [];

// Gallery data
let galleryItems = [];

// Pricing data
let pricing = [];

let deleteTarget=null;

// ===================== TOAST =====================
function showToast(msg, type='success') {
  const c={success:'bg-emerald-500',error:'bg-rose-500',info:'bg-ocean'};
  const i={success:'lucide:check-circle',error:'lucide:alert-circle',info:'lucide:info'};
  const t=document.createElement('div');
  t.className=`toast show pointer-events-auto flex items-center gap-3 rounded-xl ${c[type]} px-5 py-3.5 text-sm font-semibold text-white shadow-lg`;
  const icon = document.createElement('iconify-icon');
  icon.setAttribute('icon', i[type]);
  icon.className = 'text-lg';
  const text = document.createElement('span');
  text.textContent = msg;
  t.append(icon, text);
  toastContainer.appendChild(t);
  setTimeout(()=>{t.style.animation='toastOut .3s ease both';setTimeout(()=>t.remove(),300)},2500);
}

// ===================== ROUTING =====================
function navigateTo(page) {
  document.querySelectorAll('.page-view').forEach(p=>p.classList.remove('active'));
  const target = document.getElementById('page-'+page);
  if(target) target.classList.add('active');
  else { document.getElementById('page-dashboard').classList.add('active'); page='dashboard'; }

  // Update sidebar
  document.querySelectorAll('.nav-link').forEach(l=>{
    l.classList.remove('bg-lagoon','text-ocean','font-bold');
    l.classList.add('text-slate-500','font-semibold');
  });
  const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
  if(activeLink){
    activeLink.classList.remove('text-slate-500','font-semibold');
    activeLink.classList.add('bg-lagoon','text-ocean','font-bold');
  }

  // Update breadcrumb
  const labels={dashboard:'Dashboard',bookings:'Booking Management',users:'User Management',content:'Content Management',analytics:'Analytics & Reports',settings:'Pengaturan',help:'Pusat Bantuan'};
  document.getElementById('breadcrumb-current').textContent = labels[page]||'Dashboard';

  // Close mobile sidebar
  root.classList.remove('sidebar-open');
  overlay.classList.add('hidden');

  // Re-render page-specific content
  if(page==='bookings') renderBookings();
  if(page==='users') renderUsers();
  if(page==='content'){ void loadContent(); renderHeatmap(); }
  if(page==='analytics') renderHeatmap();
}

// Hash routing
function handleHash() {
  const hash = window.location.hash.replace('#','') || 'dashboard';
  navigateTo(hash);
}
window.addEventListener('hashchange', handleHash);

// Nav link clicks
document.querySelectorAll('.nav-link').forEach(link=>{
  link.addEventListener('click', (e)=>{
    // hash change will trigger handleHash
  });
});

// Nav triggers (links inside content that navigate)
document.addEventListener('click', (e)=>{
  const trigger = e.target.closest('.nav-trigger');
  if(trigger){
    e.preventDefault();
    const page = trigger.dataset.page;
    window.location.hash = '#'+page;
  }
});

// ===================== SIDEBAR & HEADER =====================
document.getElementById('sidebar-collapse-button').addEventListener('click',()=>root.classList.toggle('sidebar-collapsed'));
document.getElementById('mobile-menu-button').addEventListener('click',()=>{root.classList.toggle('sidebar-open');overlay.classList.toggle('hidden')});
overlay.addEventListener('click',()=>{root.classList.remove('sidebar-open');overlay.classList.add('hidden')});

// Dropdowns
const notifBtn=document.getElementById('notification-button'), notifDD=document.getElementById('notification-dropdown');
const profileBtn=document.getElementById('profile-menu-button'), profileDD=document.getElementById('profile-dropdown');
function closeAllDD(){notifDD.classList.remove('show');profileDD.classList.remove('show')}
notifBtn.addEventListener('click',e=>{e.stopPropagation();const o=notifDD.classList.contains('show');closeAllDD();if(!o)notifDD.classList.add('show')});
profileBtn.addEventListener('click',e=>{e.stopPropagation();const o=profileDD.classList.contains('show');closeAllDD();if(!o)profileDD.classList.add('show')});
document.getElementById('profile-settings-link').addEventListener('click',()=>profileDD.classList.remove('show'));
document.addEventListener('click',()=>closeAllDD());
[notifDD,profileDD].forEach(d=>d.addEventListener('click',e=>e.stopPropagation()));
document.getElementById('admin-logout-btn')?.addEventListener('click',async ()=>{
  const result=await authService.logout();
  if(!result.success){showToast(result.error,'error');return}
  await onLogout();
});

Promise.all([authService.getUser(), authService.getAdminProfile()]).then(([userResult, profileResult])=>{
  if(!userResult.success||!userResult.user)return;
  const user=userResult.user;
  if(!profileResult.success){
    showToast(profileResult.error,'error');
    return;
  }
  const name=profileResult.admin.full_name||user.user_metadata?.full_name||user.email||'Administrator';
  document.getElementById('admin-display-name').textContent=name;
  document.getElementById('admin-dropdown-name').textContent=name;
  document.getElementById('admin-dropdown-email').textContent=user.email||'';
  document.getElementById('admin-avatar').textContent=name.split(/\s+/).slice(0,2).map((part)=>part[0]).join('').toUpperCase();
});

// Search modal
const searchModal=document.getElementById('search-modal');
document.getElementById('header-search-button').addEventListener('click',()=>{searchModal.classList.add('show');setTimeout(()=>document.getElementById('modal-search-input').focus(),100)});
document.getElementById('close-search-modal').addEventListener('click',()=>searchModal.classList.remove('show'));
searchModal.addEventListener('click',e=>{if(e.target===searchModal)searchModal.classList.remove('show')});
document.getElementById('modal-search-input')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('.search-result').forEach(i=>{i.style.display=i.textContent.toLowerCase().includes(q)?'flex':'none'})});

// Keyboard
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();searchModal.classList.add('show');setTimeout(()=>document.getElementById('modal-search-input').focus(),100)}
  if(e.key==='Escape'){searchModal.classList.remove('show');closeAllDD();document.querySelectorAll('.modal-overlay.show').forEach(m=>m.classList.remove('show'))}
});

// ===================== BOOKINGS PAGE =====================
const statusCfg={
  paid:{label:'Paid',bg:'bg-emerald-50',text:'text-emerald-600'},
  pending:{label:'Pending',bg:'bg-amber-50',text:'text-amber-600'},
  failed:{label:'Failed',bg:'bg-rose-50',text:'text-rose-600'},
  cancelled:{label:'Cancelled',bg:'bg-slate-100',text:'text-slate-600'},
  refunded:{label:'Refunded',bg:'bg-violet-50',text:'text-violet-600'},
};

function mapBooking(booking) {
  const ticket = Object.entries(booking.ticket_types ?? {})
    .map(([type, details]) => `${type === 'weekday' ? 'Weekdays' : 'Weekend'} × ${details.qty}`)
    .join(', ');
  const date = new Date(`${booking.visit_date}T00:00:00`)
    .toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  return {
    dbId: booking.booking_id,
    id: booking.booking_code,
    name: booking.user_name,
    email: booking.user_email,
    ticket,
    date,
    status: booking.payment_status,
    amount: `Rp${Number(booking.total_amount).toLocaleString('id-ID')}`,
    raw: booking,
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

async function loadBookings() {
  const result = await bookingService.getAllBookings({
    status: bkFilter,
    searchTerm: bkSearch,
    page: 1,
    pageSize: 1000,
  });
  if (!result.success) {
    showToast(result.error, 'error');
    return;
  }
  bookings = result.bookings.map(mapBooking);
  renderBookings();
}

async function loadDashboard() {
  const result = await bookingService.getDashboardStats();
  if (!result.success) {
    showToast(result.error, 'error');
    return;
  }
  const stats = result.stats;
  const cards = document.querySelectorAll('#page-dashboard .stat-card');
  if (cards[0]) cards[0].querySelector('.font-display.text-2xl').textContent =
    `Rp${Number(stats.total_revenue).toLocaleString('id-ID')}`;
  if (cards[1]) cards[1].querySelector('.font-display.text-2xl').textContent = stats.total_bookings;

  const donutTotal = document.querySelector('#page-dashboard .donut-chart span');
  if (donutTotal) donutTotal.textContent = stats.total_bookings;
  const distribution=stats.booking_status_distribution??{};
  const paid=Number(distribution.paid??0);
  const pending=Number(distribution.pending??0);
  const other=Math.max(0,Number(stats.total_bookings)-paid-pending);
  const total=Number(stats.total_bookings);
  const paidEnd=total?paid/total*100:0;
  const pendingEnd=total?(paid+pending)/total*100:0;
  const donut=document.querySelector('#page-dashboard .donut-chart');
  if(donut){
    donut.style.background=total
      ?`conic-gradient(#00BCD4 0 ${paidEnd}%,#94a3b8 ${paidEnd}% ${pendingEnd}%,#f43f5e ${pendingEnd}% 100%)`
      :'conic-gradient(#e2e8f0 0 100%)';
  }
  const statusLegend=document.querySelectorAll('#page-dashboard .donut-chart + div > p');
  for(const [index,label,value] of [
    [0,'Paid',paid],
    [1,'Pending',pending],
    [2,'Other',other],
  ]){
    const row=statusLegend[index];
    if(!row)continue;
    row.querySelector('span')?.replaceChildren(document.createTextNode(label));
    const count=row.querySelector('b');
    if(count)count.textContent=String(value);
  }
  const recentBody = document.querySelector('#page-dashboard table tbody');
  if (recentBody) {
    recentBody.replaceChildren();
    for (const rawBooking of stats.recent_bookings ?? []) {
      const booking = mapBooking(rawBooking);
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50';
      for (const [value, className] of [
        [booking.id, 'px-6 py-4 font-bold text-ocean'],
        [booking.name, 'px-4 py-4 font-semibold text-slate-700'],
        [booking.ticket, 'px-4 py-4 text-slate-500'],
        [booking.date, 'px-4 py-4 text-slate-500'],
        [statusCfg[booking.status]?.label ?? booking.status, 'px-4 py-4 text-slate-500'],
        [booking.amount, 'px-6 py-4 text-right font-bold text-slate-800'],
      ]) {
        const cell = document.createElement('td');
        cell.className = className;
        cell.textContent = value;
        row.appendChild(cell);
      }
      recentBody.appendChild(row);
    }
  }
}

function formatPromotionDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

async function loadContent() {
  const [pricingResult, facilitiesResult, promotionsResult, galleryResult] = await Promise.all([
    ticketPricingService.getAllPricing(),
    facilitiesService.getAllFacilities(),
    promotionService.getAllPromotions(),
    galleryService.getAllImages(),
  ])
  let failed = false
  for (const result of [pricingResult, facilitiesResult, promotionsResult, galleryResult]) {
    if (!result.success) {
      showToast(result.error, 'error')
      failed = true
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
      icon: item.ticket_type === 'weekend' ? 'lucide:calendar-days' : 'lucide:sun',
    }))
  }
  if (facilitiesResult.success) {
    facilities = facilitiesResult.facilities.map((item) => ({
      id: item.facility_id,
      name: item.facility_name,
      desc: item.description,
      icon: item.icon,
      status: item.status === 'active' ? 'Active' : 'Inactive',
      displayOrder: item.display_order,
    }))
  }
  if (promotionsResult.success) {
    promotions = promotionsResult.promotions.map((item) => ({
      id: item.promo_id,
      code: item.promo_code,
      discount: item.discount_type === 'percentage'
        ? `${Number(item.discount_amount)}% off`
        : `Rp${Number(item.discount_amount).toLocaleString('id-ID')} off`,
      period: `${formatPromotionDate(item.start_date)} – ${formatPromotionDate(item.end_date)}`,
      active: item.status === 'active',
    }))
  }
  if (galleryResult.success) {
    galleryItems = galleryResult.images.filter((item)=>item.status!=='archived').map((item) => ({
      id: item.image_id,
      title: item.caption || 'Foto waterpark',
      order: item.display_order,
      status: item.status,
      url: item.image_url,
    }))
  }
  if (pricingResult.success) renderPricing()
  if (facilitiesResult.success) renderFacilities()
  if (promotionsResult.success) renderPromotions()
  if (galleryResult.success) renderGallery()
  return !failed
}

function getFilteredBookings(){return bookings.filter(b=>{const ms=bkFilter==='all'||b.status===bkFilter;const mq=!bkSearch||b.id.toLowerCase().includes(bkSearch)||b.name.toLowerCase().includes(bkSearch)||b.email.toLowerCase().includes(bkSearch);return ms&&mq})}

function renderBookings(){
  const filtered=getFilteredBookings();
  const total=bookings.length;
  const counts={all:total,paid:0,pending:0,failed:0,cancelled:0,refunded:0};
  bookings.forEach(b=>{if(Object.hasOwn(counts,b.status))counts[b.status]++});
  document.getElementById('bk-c-all').textContent=counts.all;
  document.getElementById('bk-c-conf').textContent=counts.paid;
  document.getElementById('bk-c-comp').textContent=counts.pending;
  document.getElementById('bk-c-failed').textContent=counts.failed;
  document.getElementById('bk-c-canc').textContent=counts.cancelled;
  document.getElementById('bk-stat-total').textContent=counts.all;
  document.getElementById('bk-stat-confirmed').textContent=counts.paid;
  document.getElementById('bk-stat-cancelled').textContent=counts.cancelled;

  const totalPages=Math.max(1,Math.ceil(filtered.length/bkPerPage));
  if(bkPage>totalPages)bkPage=totalPages;
  const start=(bkPage-1)*bkPerPage;
  const pageData=filtered.slice(start,start+bkPerPage);

  document.getElementById('bk-result-count').textContent=`Menampilkan ${filtered.length} dari ${total} pemesanan`;
  document.getElementById('bk-page-range').textContent=filtered.length>0?`${start+1}–${Math.min(start+bkPerPage,filtered.length)}`:'0';
  document.getElementById('bk-page-total').textContent=filtered.length;

  const tbody=document.getElementById('bk-table-body');
  tbody.innerHTML='';
  if(!pageData.length){tbody.innerHTML='<tr><td colspan="7" class="px-6 py-16 text-center"><span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><iconify-icon icon="lucide:search-x" class="text-2xl"></iconify-icon></span><p class="mt-4 font-display font-bold text-slate-700">Tidak ada booking</p></td></tr>';return}

  pageData.forEach(b=>{
    const sc=statusCfg[b.status] ?? statusCfg.pending;
    const actions=b.status==='cancelled'
      ? '<span class="px-2 text-xs font-semibold text-slate-400">Riwayat</span>'
      : `<button class="delete-booking rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500" data-id="${escapeHtml(b.id)}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button>`;
    const tr=document.createElement('tr');
    tr.className='table-row hover:bg-slate-50';
    tr.innerHTML=`<td class="px-6 py-5 font-bold text-ocean">${escapeHtml(b.id)}</td><td class="px-4 py-5"><p class="font-semibold text-slate-700">${escapeHtml(b.name)}</p><p class="mt-1 text-xs text-slate-400">${escapeHtml(b.email)}</p></td><td class="px-4 py-5 text-slate-500">${escapeHtml(b.ticket)}</td><td class="px-4 py-5 text-slate-500">${escapeHtml(b.date)}</td><td class="px-4 py-5"><span class="rounded-full ${sc.bg} px-3 py-1.5 text-xs font-bold ${sc.text}">${sc.label}</span></td><td class="px-4 py-5 text-right font-bold text-slate-800">${escapeHtml(b.amount)}</td><td class="px-6 py-5"><div class="flex justify-center gap-1">${actions}</div></td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.delete-booking').forEach(button=>{
    button.addEventListener('click',()=>window.confirmDeleteBk(button.dataset.id));
  });

  // Pagination
  const pag=document.getElementById('bk-pagination');
  pag.innerHTML='';
  if(totalPages>1){
    const mkBtn=(label,pg,disabled=false,active=false)=>{const b=document.createElement('button');b.className=`page-btn flex h-9 w-9 items-center justify-center rounded-lg ${active?'bg-ocean text-sm font-bold text-white':'border border-slate-200 text-sm font-semibold text-slate-500 hover:border-aqua hover:text-ocean'} ${disabled?'opacity-40 cursor-not-allowed':''}`;b.innerHTML=label;b.disabled=disabled;b.addEventListener('click',()=>{if(!disabled){bkPage=pg;renderBookings()}});return b};
    pag.appendChild(mkBtn('<iconify-icon icon="lucide:chevron-left"></iconify-icon>',bkPage-1,bkPage===1));
    for(let i=1;i<=totalPages;i++) pag.appendChild(mkBtn(i,i,false,i===bkPage));
    pag.appendChild(mkBtn('<iconify-icon icon="lucide:chevron-right"></iconify-icon>',bkPage+1,bkPage===totalPages));
  }
}

window.confirmDeleteBk=function(id){
  const booking=bookings.find(item=>item.id===id);
  if(!booking){
    showToast('Booking tidak ditemukan.', 'error');
    return;
  }
  deleteTarget={type:'booking',id,dbId:booking.dbId};
  document.getElementById('delete-message').textContent=`Booking ${id} akan dihapus permanen.`;
  document.getElementById('delete-modal').classList.add('show');
};

document.querySelectorAll('.bk-filter').forEach(btn=>{btn.addEventListener('click',()=>{bkFilter=btn.dataset.status;bkPage=1;document.querySelectorAll('.bk-filter').forEach(x=>{x.className='bk-filter rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-lagoon hover:text-ocean'});btn.className='bk-filter rounded-xl bg-ocean px-4 py-2.5 text-sm font-bold text-white';loadBookings()})});
let bookingSearchTimer;
document.getElementById('bk-search').addEventListener('input',e=>{bkSearch=e.target.value.toLowerCase();bkPage=1;clearTimeout(bookingSearchTimer);bookingSearchTimer=setTimeout(loadBookings,250)});
function exportBookings() {
  const fields = [
    'booking_code', 'user_name', 'user_email', 'user_phone', 'visit_date',
    'ticket_types', 'total_amount', 'payment_status', 'payment_method',
    'midtrans_transaction_id', 'midtrans_payment_type', 'created_at',
  ];
  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const content = [
    fields.join(','),
    ...bookings.map((booking) => fields.map((field) => escapeCsv(
      typeof booking.raw[field] === 'object'
        ? JSON.stringify(booking.raw[field])
        : booking.raw[field],
    )).join(',')),
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `citraland-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById('export-bookings-btn').addEventListener('click',exportBookings);
document.getElementById('export-report-btn')?.addEventListener('click',exportBookings);

// ===================== USERS PAGE =====================
function getInitials(n){return n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()}
function getFilteredUsers(){return users.filter(u=>{const ms=usrStatusFilter==='all'||u.status===usrStatusFilter;const mq=!usrSearch||u.name.toLowerCase().includes(usrSearch)||u.email.toLowerCase().includes(usrSearch)||u.phone.includes(usrSearch)||u.id.toLowerCase().includes(usrSearch);return ms&&mq})}

function renderUsers(){
  const filtered=getFilteredUsers();
  const activeC=users.filter(u=>u.status==='Active').length;
  const inactiveC=users.filter(u=>u.status==='Inactive').length;
  document.getElementById('usr-stat-active').textContent=activeC;
  document.getElementById('usr-stat-inactive').textContent=inactiveC;
  document.getElementById('usr-result-count').textContent=`Menampilkan ${filtered.length} dari ${users.length} pengguna`;

  const tbody=document.getElementById('usr-table-body');
  tbody.innerHTML='';
  if(!filtered.length){tbody.innerHTML='<tr><td colspan="7" class="px-6 py-16 text-center"><p class="font-display font-bold text-slate-700">Tidak ada user</p></td></tr>';return}

  filtered.forEach(u=>{
    const idx=users.indexOf(u);
    const sc=`avatar-c${idx%8}`;
    const stBg=u.status==='Active'?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500';
    const tr=document.createElement('tr');
    tr.className='user-row hover:bg-slate-50';
    tr.innerHTML=`<td class="px-5 py-4"><input type="checkbox" class="usr-check h-4 w-4 rounded border-slate-300 accent-ocean cursor-pointer" data-idx="${idx}" ${usrSelected.has(idx)?'checked':''}></td><td class="px-4 py-4"><div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-full ${sc} text-xs font-bold">${getInitials(u.name)}</span><div><p class="font-bold text-slate-800">${u.name}</p><p class="text-xs text-slate-400">${u.id}</p></div></div></td><td class="px-4 py-4 text-slate-500">${u.email}</td><td class="px-4 py-4 text-slate-500">${u.phone}</td><td class="px-4 py-4 text-slate-500">${u.joinDate}</td><td class="px-4 py-4"><span class="rounded-full ${stBg} px-3 py-1.5 text-xs font-bold">${u.status}</span></td><td class="px-5 py-4"><div class="flex justify-end gap-1"><button class="edit-usr rounded-lg p-2 text-slate-400 hover:bg-lagoon hover:text-ocean" data-idx="${idx}"><iconify-icon icon="lucide:pencil"></iconify-icon></button><button class="toggle-usr rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600" data-idx="${idx}"><iconify-icon icon="${u.status==='Active'?'lucide:user-round-x':'lucide:user-check'}"></iconify-icon></button></div></td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.usr-check').forEach(cb=>{cb.addEventListener('change',e=>{const i=parseInt(e.target.dataset.idx);if(e.target.checked)usrSelected.add(i);else usrSelected.delete(i);updateUsrCount()})});
  tbody.querySelectorAll('.edit-usr').forEach(b=>{b.addEventListener('click',()=>openUserModal(users[parseInt(b.dataset.idx)]))});
  tbody.querySelectorAll('.toggle-usr').forEach(b=>{b.addEventListener('click',()=>{const i=parseInt(b.dataset.idx);users[i].status=users[i].status==='Active'?'Inactive':'Active';showToast(`${users[i].name} → ${users[i].status}`);renderUsers()})});
}

function updateUsrCount(){document.getElementById('usr-selected-count').textContent=`${usrSelected.size} user dipilih`}
document.getElementById('usr-select-all').addEventListener('change',e=>{document.querySelectorAll('.usr-check').forEach(c=>{c.checked=e.target.checked;const i=parseInt(c.dataset.idx);if(e.target.checked)usrSelected.add(i);else usrSelected.delete(i)});updateUsrCount()});
document.getElementById('usr-search').addEventListener('input',e=>{usrSearch=e.target.value.toLowerCase();renderUsers()});
document.getElementById('usr-status-filter').addEventListener('change',e=>{usrStatusFilter=e.target.value;renderUsers()});

// User modal
const userModal=document.getElementById('user-modal');
function openUserModal(u=null){
  editingUserIdx=u?users.indexOf(u):null;
  document.getElementById('user-modal-title').textContent=u?'Edit user':'Add new user';
  document.getElementById('um-name').value=u?.name||'';
  document.getElementById('um-email').value=u?.email||'';
  document.getElementById('um-phone').value=u?.phone||'';
  document.getElementById('um-status').value=u?.status||'Active';
  userModal.classList.add('show');
}
function closeUserModal(){userModal.classList.remove('show');editingUserIdx=null}
document.getElementById('add-user-btn').addEventListener('click',()=>openUserModal());
document.getElementById('close-user-modal').addEventListener('click',closeUserModal);
document.getElementById('cancel-user-modal').addEventListener('click',closeUserModal);
userModal.addEventListener('click',e=>{if(e.target===userModal)closeUserModal()});
document.getElementById('user-form').addEventListener('submit',e=>{
  e.preventDefault();
  const name=document.getElementById('um-name').value.trim();
  const email=document.getElementById('um-email').value.trim();
  const phone=document.getElementById('um-phone').value.trim();
  const status=document.getElementById('um-status').value;
  if(editingUserIdx!==null){users[editingUserIdx]={...users[editingUserIdx],name,email,phone,status};showToast(`User ${name} diperbarui`)}
  else{const nid='USR-'+(1000+users.length+1);const d=new Date();const m=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];users.unshift({id:nid,name,email,phone,joinDate:`${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`,status});showToast(`User ${name} ditambahkan`)}
  closeUserModal();renderUsers();
});

// Bulk actions
document.getElementById('usr-activate-btn').addEventListener('click',()=>{if(!usrSelected.size){showToast('Pilih user dulu','info');return}let c=0;usrSelected.forEach(i=>{if(users[i]&&users[i].status!=='Active'){users[i].status='Active';c++}});showToast(`${c} user diaktifkan`);usrSelected.clear();updateUsrCount();renderUsers()});
document.getElementById('usr-deactivate-btn').addEventListener('click',()=>{if(!usrSelected.size){showToast('Pilih user dulu','info');return}let c=0;usrSelected.forEach(i=>{if(users[i]&&users[i].status!=='Inactive'){users[i].status='Inactive';c++}});showToast(`${c} user dinonaktifkan`);usrSelected.clear();updateUsrCount();renderUsers()});
document.getElementById('export-users-btn').addEventListener('click',function(){const o=this.innerHTML;this.innerHTML='<iconify-icon icon="lucide:check"></iconify-icon> Export siap!';showToast('Data user diexport');setTimeout(()=>this.innerHTML=o,2000)});

// ===================== CONTENT PAGE =====================
// Content tabs
document.querySelectorAll('.ctab-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.ctab-btn').forEach(b=>{b.classList.remove('bg-ocean','text-white');b.classList.add('text-slate-500')});btn.classList.add('bg-ocean','text-white');btn.classList.remove('text-slate-500');document.querySelectorAll('#page-content .tab-panel').forEach(p=>p.classList.remove('active'));document.getElementById('ctab-'+btn.dataset.ctab).classList.add('active')})});

// Pricing
function renderPricing(){
  const container=document.getElementById('pricing-cards');
  container.innerHTML='';
  pricing.forEach(p=>{
    const card=document.createElement('article');
    card.className=`pricing-card rounded-2xl ${p.featured?'border-2 border-ocean ring-2 ring-cyan-50':'border border-slate-200'} bg-white p-6 shadow-sm`;
    const id=escapeHtml(p.id);
    card.innerHTML=`<div class="flex items-start justify-between"><div><span class="flex h-11 w-11 items-center justify-center rounded-xl ${p.featured?'bg-ocean text-white':'bg-lagoon text-ocean'}"><iconify-icon icon="${escapeHtml(p.icon)}" class="text-xl"></iconify-icon></span><h3 class="mt-5 font-display text-lg font-bold">${escapeHtml(p.name)}</h3><p class="mt-1 text-xs text-slate-400">${escapeHtml(p.desc)}</p></div><span class="rounded-full ${p.status==='active'?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'} px-3 py-1 text-xs font-bold">${p.status==='active'?'Published':'Unpublished'}</span></div><label class="mt-6 block text-sm font-bold text-slate-700">Harga tiket<input type="text" value="${p.price}" data-pid="${id}" class="price-field mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-semibold outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-100"></label><label class="mt-4 block text-sm font-bold text-slate-700">Deskripsi<textarea readonly class="mt-2 h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">${escapeHtml(p.desc)}</textarea></label><div class="mt-4 rounded-xl ${p.featured?'bg-lagoon':'bg-slate-50'} p-4"><div><p class="text-xs text-slate-400">Preview harga</p><p class="price-preview mt-1 font-display text-2xl font-extrabold text-ocean" data-pid="${id}">Rp${p.price.toLocaleString('id-ID')}</p></div></div><div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-5"><label class="flex items-center gap-2 text-xs font-bold text-slate-500"><input type="checkbox" ${p.status==='active'?'checked':''} data-pid="${id}" class="pricing-status h-4 w-4 accent-ocean"> Publish</label><button class="save-price-btn flex min-h-10 items-center gap-2 rounded-xl bg-ocean px-4 text-sm font-bold text-white hover:bg-ocean/90" data-pid="${id}"><iconify-icon icon="lucide:save"></iconify-icon> Simpan</button></div>`;
    container.appendChild(card);
  });
  container.querySelectorAll('.price-field').forEach(inp=>{
    inp.addEventListener('input',()=>{const pid=inp.dataset.pid;const v=parseInt(inp.value.replace(/\D/g,''))||0;const prev=container.querySelector(`.price-preview[data-pid="${pid}"]`);if(prev)prev.textContent='Rp'+v.toLocaleString('id-ID')});
    inp.addEventListener('focus',()=>{inp.value=inp.value.replace(/\D/g,'')});
  });
  container.querySelectorAll('.save-price-btn').forEach(btn=>{
    btn.addEventListener('click',async ()=>{
      const pid=btn.dataset.pid;
      const inp=container.querySelector(`.price-field[data-pid="${pid}"]`);
      const rawValue=inp?.value.replace(/\D/g,'')??'';
      const value=Number(rawValue);
      const current=pricing.find((item)=>item.id===pid);
      if(!current||!rawValue||!Number.isFinite(value)||value<0){showToast('Harga tiket tidak valid.','error');return}
      const result=await ticketPricingService.updatePrice(pid,value);
      if(!result.success){showToast(result.error,'error');return}
      current.price=value;
      showToast(`Harga ${current.name} disimpan`);
    });
  });
  container.querySelectorAll('.pricing-status').forEach((input)=>{
    input.addEventListener('change',async ()=>{
      const current=pricing.find((item)=>item.id===input.dataset.pid);
      if(!current)return;
      const status=input.checked?'active':'inactive';
      const result=await ticketPricingService.setPricingStatus(current.id,status);
      if(!result.success){
        input.checked=!input.checked;
        showToast(result.error,'error');
        return;
      }
      current.status=status;
      showToast(`${current.name} ${status==='active'?'dipublikasikan':'dinonaktifkan'}`);
      renderPricing();
    });
  });
}

// Facilities
function renderFacilities(){
  const tbody=document.getElementById('fac-table-body');
  tbody.innerHTML='';
  facilities.forEach(f=>{
    const stCls=f.status==='Active'?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500';
    const tr=document.createElement('tr');
    tr.className='facility-row hover:bg-slate-50';
    tr.innerHTML=`<td class="px-6 py-5 font-bold text-slate-800">${escapeHtml(f.name)}</td><td class="px-4 py-5 text-slate-500">${escapeHtml(f.desc)}</td><td class="px-4 py-5"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-lagoon text-ocean"><iconify-icon icon="${escapeHtml(f.icon)}"></iconify-icon></span></td><td class="px-4 py-5"><span class="rounded-full ${stCls} px-3 py-1.5 text-xs font-bold">${f.status}</span></td><td class="px-6 py-5 text-right"><div class="flex justify-end gap-1"><button class="edit-fac rounded-lg p-2 text-slate-400 hover:bg-lagoon hover:text-ocean" data-id="${escapeHtml(f.id)}"><iconify-icon icon="lucide:pencil"></iconify-icon></button><button class="del-fac rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500" data-id="${escapeHtml(f.id)}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button></div></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.edit-fac').forEach(b=>{b.addEventListener('click',()=>{const f=facilities.find(x=>x.id===b.dataset.id);if(f)openFacModal(f)})});
  tbody.querySelectorAll('.del-fac').forEach(b=>{b.addEventListener('click',()=>{const f=facilities.find(x=>x.id===b.dataset.id);if(f){deleteTarget={type:'facility',id:f.id};document.getElementById('delete-message').textContent=`Fasilitas ${f.name} akan dihapus.`;document.getElementById('delete-modal').classList.add('show')}})});
}

const facModal=document.getElementById('facility-modal');
function openFacModal(f=null){
  editingFacId=f?f.id:null;
  document.getElementById('fac-modal-title').textContent=f?'Edit fasilitas':'Tambah fasilitas';
  document.getElementById('fac-name').value=f?.name||'';
  document.getElementById('fac-desc').value=f?.desc||'';
  document.getElementById('fac-icon').value=f?.icon||'';
  document.getElementById('fac-status').value=f?.status||'Active';
  facModal.classList.add('show');
}
function closeFacModal(){facModal.classList.remove('show');editingFacId=null}
document.getElementById('add-facility-btn').addEventListener('click',()=>openFacModal());
document.getElementById('close-facility-modal').addEventListener('click',closeFacModal);
document.getElementById('cancel-facility-modal').addEventListener('click',closeFacModal);
facModal.addEventListener('click',e=>{if(e.target===facModal)closeFacModal()});
document.getElementById('save-facility-btn').addEventListener('click',async ()=>{
  const name=document.getElementById('fac-name').value.trim();
  const desc=document.getElementById('fac-desc').value.trim();
  const icon=document.getElementById('fac-icon').value.trim()||'lucide:building-2';
  const status=document.getElementById('fac-status').value;
  if(!name){showToast('Nama wajib diisi','error');return}
  let result;
  if(editingFacId){
    result=await facilitiesService.updateFacility(editingFacId,{
      facility_name:name,description:desc,icon,status:status.toLowerCase(),
    });
  }else{
    const displayOrder=Math.max(0,...facilities.map((facility)=>facility.displayOrder||0))+1;
    result=await facilitiesService.createFacility({
      facility_name:name,description:desc,icon,display_order:displayOrder,
    });
  }
  if(!result.success){showToast(result.error,'error');return}
  showToast(editingFacId?`"${name}" diperbarui`:`"${name}" ditambahkan`);
  closeFacModal();
  await loadContent();
});

// Promotions
function renderPromotions(){
  const list=document.getElementById('promo-list');
  const ac=promotions.filter(p=>p.active).length;
  document.getElementById('promo-active-count').textContent=`${ac} Active`;
  list.innerHTML='';
  if(!promotions.length){list.innerHTML='<div class="py-10 text-center"><p class="font-display font-bold text-slate-700">Belum ada promosi</p></div>';return}
  promotions.forEach(p=>{
    const d=document.createElement('div');
    d.className='promo-card flex items-center justify-between rounded-xl border border-slate-100 p-4';
    d.innerHTML=`<div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl ${p.active?'bg-lagoon text-ocean':'bg-slate-100 text-slate-400'}"><iconify-icon icon="lucide:ticket-percent"></iconify-icon></span><div><p class="font-bold ${p.active?'text-ocean':'text-slate-400'}">${escapeHtml(p.code)}</p><p class="mt-0.5 text-xs text-slate-500">${escapeHtml(p.discount)} · ${escapeHtml(p.period)}</p></div></div><div class="flex items-center gap-3"><div class="toggle-switch ${p.active?'active':''}" data-id="${escapeHtml(p.id)}"><span class="toggle-knob"></span></div><button class="del-promo rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500" data-id="${escapeHtml(p.id)}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button></div>`;
    list.appendChild(d);
  });
  list.querySelectorAll('.toggle-switch').forEach(t=>{t.addEventListener('click',async ()=>{
    const p=promotions.find(x=>x.id===t.dataset.id);if(!p)return;
    const result=await promotionService.updatePromotionStatus(p.id,p.active?'inactive':'active');
    if(!result.success){showToast(result.error,'error');return}
    await loadContent();
  })});
  list.querySelectorAll('.del-promo').forEach(b=>{b.addEventListener('click',()=>{
    const p=promotions.find(x=>x.id===b.dataset.id);
    if(p){deleteTarget={type:'promo',id:p.id};document.getElementById('delete-message').textContent=`Promo ${p.code} akan dinonaktifkan.`;document.getElementById('delete-modal').classList.add('show')}
  })});
}

document.getElementById('publish-promo-btn').addEventListener('click',async ()=>{
  const code=document.getElementById('promo-code').value.trim().toUpperCase();
  const type=document.getElementById('promo-type').value;
  const amount=document.getElementById('promo-amount').value;
  const start=document.getElementById('promo-start').value;
  const end=document.getElementById('promo-end').value;
  if(!code||!amount||!start||!end){showToast('Lengkapi semua field','error');return}
  const result=await promotionService.createPromotion({
    promo_code:code,
    discount_type:type==='Percentage (%)'?'percentage':'nominal',
    discount_amount:Number(amount),
    start_date:start,
    end_date:end,
    status:'active',
  });
  if(!result.success){showToast(result.error,'error');return}
  document.getElementById('promo-code').value='';
  document.getElementById('promo-amount').value='';
  document.getElementById('promo-start').value='';
  document.getElementById('promo-end').value='';
  await loadContent();
  showToast(`Promo "${code}" dipublikasikan!`);
});

// Gallery
function renderGallery(){
  const grid=document.getElementById('gallery-grid');
  const publishedCount=galleryItems.filter((item)=>item.status==='published').length;
  document.getElementById('gallery-count-badge').textContent=`${publishedCount} Published`;
  grid.innerHTML='';
  if(!galleryItems.length){grid.innerHTML='<div class="col-span-full py-10 text-center"><p class="font-display font-bold text-slate-700">Galeri kosong</p></div>';return}
  galleryItems.forEach((item)=>{
    const d=document.createElement('div');
    d.className='gallery-item group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100';
    d.draggable=true;
    d.dataset.id=item.id;
    const image=document.createElement('img');
    image.src=item.url;
    image.alt=item.title;
    image.className='h-44 w-full object-cover';
    const imageContainer=document.createElement('div');
    imageContainer.className='relative';
    imageContainer.appendChild(image);
    const overlayElement=document.createElement('div');
    overlayElement.className='gallery-overlay absolute inset-0 flex items-center justify-center bg-slate-900/40';
    overlayElement.innerHTML=`<button class="del-gallery flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-rose-500 hover:bg-white" data-id="${escapeHtml(item.id)}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button>`;
    imageContainer.appendChild(overlayElement);
    const details=document.createElement('div');
    details.className='flex items-center justify-between p-3';
    details.innerHTML=`<div><p class="text-sm font-bold">${escapeHtml(item.title)}</p><p class="text-xs text-slate-400">Order ${String(item.order).padStart(2,'0')} · ${escapeHtml(item.status)}</p></div>`;
    d.append(imageContainer,details);
    grid.appendChild(d);
  });
  grid.querySelectorAll('.del-gallery').forEach(b=>{b.addEventListener('click',()=>{
    const item=galleryItems.find((image)=>image.id===b.dataset.id);
    if(item){deleteTarget={type:'gallery',id:item.id};document.getElementById('delete-message').textContent=`Gambar ${item.title} akan diarsipkan.`;document.getElementById('delete-modal').classList.add('show')}
  })});
  let draggedGalleryId=null;
  grid.querySelectorAll('.gallery-item').forEach((card)=>{
    card.addEventListener('dragstart',(event)=>{
      draggedGalleryId=card.dataset.id;
      event.dataTransfer?.setData('text/plain',draggedGalleryId);
      if(event.dataTransfer)event.dataTransfer.effectAllowed='move';
    });
    card.addEventListener('dragover',(event)=>{
      event.preventDefault();
      if(event.dataTransfer)event.dataTransfer.dropEffect='move';
    });
    card.addEventListener('drop',async (event)=>{
      event.preventDefault();
      const sourceId=draggedGalleryId||event.dataTransfer?.getData('text/plain');
      const targetId=card.dataset.id;
      draggedGalleryId=null;
      if(!sourceId||sourceId===targetId)return;
      const reordered=[...galleryItems];
      const sourceIndex=reordered.findIndex((item)=>item.id===sourceId);
      const targetIndex=reordered.findIndex((item)=>item.id===targetId);
      if(sourceIndex<0||targetIndex<0)return;
      const [movedItem]=reordered.splice(sourceIndex,1);
      reordered.splice(targetIndex,0,movedItem);
      const results=await Promise.all(reordered.map((item,index)=>
        galleryService.updateImageOrder(item.id,index+1),
      ));
      const failedResult=results.find((result)=>!result.success);
      if(failedResult){
        showToast(failedResult.error,'error');
        await loadContent();
        return;
      }
      await loadContent();
      showToast('Urutan galeri diperbarui');
    });
    card.addEventListener('dragend',()=>{draggedGalleryId=null});
  });
}

// Gallery upload
const dropZone=document.getElementById('drop-zone');
const fileInput=document.getElementById('gallery-file-input');
document.getElementById('choose-gallery-btn').addEventListener('click',e=>{e.stopPropagation();fileInput.click()});
dropZone.addEventListener('click',e=>{if(e.target.id!=='choose-gallery-btn')fileInput.click()});
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('drag-over')});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop',e=>{e.preventDefault();dropZone.classList.remove('drag-over');handleGalleryFiles(e.dataTransfer.files)});
fileInput.addEventListener('change',()=>{handleGalleryFiles(fileInput.files);fileInput.value=''});

function handleGalleryFiles(files){
  if(!files.length)return;
  const selectedFiles=Array.from(files);
  void Promise.all(selectedFiles.map(async (file,index)=>{
    const caption=file.name.replace(/\.[^.]+$/,'').trim().slice(0,200);
    const result=await galleryService.uploadImage(file,caption,galleryItems.length+index+1);
    if(!result.success)showToast(`${file.name}: ${result.error}`,'error');
    return result.success;
  })).then(async (results)=>{
    const uploaded=results.filter(Boolean).length;
    if(uploaded){
      await loadContent();
      showToast(`${uploaded} gambar berhasil diunggah`);
    }
  });
}

document.getElementById('preview-site-btn')?.addEventListener('click',()=>showToast('Preview website dibuka','info'));

// ===================== ANALYTICS PAGE =====================
function renderHeatmap(){
  const grid=document.getElementById('heatmap-grid');
  if(!grid)return;
  const data=[{d:'Senin',v:[1,2,3,4,5,3,2,1]},{d:'Selasa',v:[1,2,3,5,4,3,2,1]},{d:'Rabu',v:[2,3,4,5,5,4,2,1]},{d:'Kamis',v:[1,2,3,4,4,3,2,1]},{d:'Jumat',v:[2,3,4,5,5,4,3,2]},{d:'Sabtu',v:[3,4,5,5,5,4,3,2]},{d:'Minggu',v:[3,4,5,5,5,4,3,2]}];
  const colors=['bg-cyan-50','bg-cyan-100','bg-aqua/40','bg-aqua/50','bg-aqua/70','bg-ocean'];
  grid.innerHTML='';
  data.forEach((row,ri)=>{
    const rd=document.createElement('div');
    rd.className='grid grid-cols-[70px_repeat(8,1fr)] items-center gap-1';
    rd.innerHTML=`<span class="text-slate-500 text-[11px]">${row.d}</span>`+row.v.map((val,ci)=>`<i class="heatmap-cell h-8 rounded ${colors[val-1]}" style="animation-delay:${(ri*8+ci)*.02}s"></i>`).join('')+`<span class="text-[10px] text-slate-400 text-center font-semibold">${row.v.reduce((a,b)=>a+b,0)}</span>`;
    grid.appendChild(rd);
  });
}

document.getElementById('analytics-export-btn')?.addEventListener('click',()=>showToast('Laporan sedang disiapkan...','info'));
document.getElementById('export-report-btn')?.addEventListener('click',function(){const o=this.innerHTML;this.innerHTML='<iconify-icon icon="lucide:check"></iconify-icon> Laporan siap!';showToast('Laporan berhasil diexport');setTimeout(()=>this.innerHTML=o,2000)});

// ===================== DELETE MODAL =====================
document.getElementById('delete-cancel-btn').addEventListener('click',()=>{document.getElementById('delete-modal').classList.remove('show');deleteTarget=null});
document.getElementById('delete-modal').addEventListener('click',e=>{if(e.target.id==='delete-modal'){document.getElementById('delete-modal').classList.remove('show');deleteTarget=null}});
document.getElementById('delete-confirm-btn').addEventListener('click',async ()=>{
  if(!deleteTarget)return;
  const target=deleteTarget;
  const confirmButton=document.getElementById('delete-confirm-btn');
  confirmButton.disabled=true;
  let result;
  try{
    if(target.type==='booking'){
      result=await bookingService.deleteBooking(target.dbId);
      if(result.success){showToast(`Booking ${target.id} dihapus`);await loadBookings();await loadDashboard()}
    }else if(target.type==='facility'){
      result=await facilitiesService.deleteFacility(target.id);
      if(result.success){await loadContent();showToast('Fasilitas dinonaktifkan')}
    }else if(target.type==='promo'){
      result=await promotionService.updatePromotionStatus(target.id,'inactive');
      if(result.success){await loadContent();showToast('Promo dinonaktifkan')}
    }else if(target.type==='gallery'){
      result=await galleryService.deleteImage(target.id);
      await loadContent();
      if(result.success)showToast('Gambar diarsipkan')
    }
    if(result&&!result.success)showToast(result.error,'error');
  }finally{
    confirmButton.disabled=false;
    document.getElementById('delete-modal').classList.remove('show');
    deleteTarget=null;
  }
});

// ===================== DESKTOP SEARCH =====================
document.getElementById('admin-search-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.trim();if(q)showToast(`Mencari: "${q}"`,'info')}});

// ===================== INIT =====================
handleHash();
void loadBookings();
void loadDashboard();
const unsubscribeBookings=realtimeManager.subscribeToBookings(()=>{
  void loadBookings();
  void loadDashboard();
});
const unsubscribePricing=realtimeManager.subscribeToTicketPricing(()=>void loadContent(),'admin_ticket_pricing_changes');
const unsubscribeFacilities=realtimeManager.subscribeToFacilities(()=>void loadContent());
const unsubscribePromotions=realtimeManager.subscribeToPromotions(()=>void loadContent());
const unsubscribeGallery=realtimeManager.subscribeToGallery(()=>void loadContent());
return ()=>{
  unsubscribeBookings();
  unsubscribePricing();
  unsubscribeFacilities();
  unsubscribePromotions();
  unsubscribeGallery();
};

}
