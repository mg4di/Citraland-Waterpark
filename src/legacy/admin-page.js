export function initializeAdminPage() {

// ===================== GLOBAL STATE & DATA =====================
const root = document.getElementById('admin-root');
const overlay = document.getElementById('mobile-overlay');
const toastContainer = document.getElementById('toast-container');

// Bookings data
let bookings = [
  {id:'BH-7K4P9X',name:'Dimas Pratama',email:'dimas@email.com',ticket:'Dewasa × 1',date:'28 Des 2024',status:'confirmed',amount:'Rp52.500'},
  {id:'BH-8A2M1Q',name:'Rina Pratiwi',email:'rina@email.com',ticket:'Keluarga × 1',date:'29 Des 2024',status:'confirmed',amount:'Rp152.500'},
  {id:'BH-5D8L3C',name:'Andi Saputra',email:'andi@email.com',ticket:'Dewasa × 2',date:'30 Des 2024',status:'completed',amount:'Rp102.500'},
  {id:'BH-9P6R2V',name:'Maya Lestari',email:'maya@email.com',ticket:'Anak × 2',date:'31 Des 2024',status:'cancelled',amount:'Rp72.500'},
  {id:'BH-3T7N5K',name:'Fajar Nugraha',email:'fajar@email.com',ticket:'Keluarga × 2',date:'02 Jan 2025',status:'confirmed',amount:'Rp302.500'},
  {id:'BH-4W8J2H',name:'Siti Nurhaliza',email:'siti@email.com',ticket:'Dewasa × 3',date:'03 Jan 2025',status:'confirmed',amount:'Rp157.500'},
  {id:'BH-6Q1R9M',name:'Budi Santoso',email:'budi@email.com',ticket:'Anak × 1',date:'04 Jan 2025',status:'confirmed',amount:'Rp35.000'},
  {id:'BH-2F5G7K',name:'Linda Wijaya',email:'linda@email.com',ticket:'Dewasa × 1',date:'05 Jan 2025',status:'completed',amount:'Rp52.500'},
  {id:'BH-8N3P6T',name:'Agus Hermawan',email:'agus@email.com',ticket:'Keluarga × 1',date:'06 Jan 2025',status:'confirmed',amount:'Rp152.500'},
  {id:'BH-1X4V8B',name:'Dewi Anggraini',email:'dewi@email.com',ticket:'Dewasa × 2',date:'07 Jan 2025',status:'confirmed',amount:'Rp105.000'},
];
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
let facilities = [
  {id:1,name:'Kolam Utama',desc:'Air jernih dengan area dewasa.',icon:'lucide:waves',status:'Active'},
  {id:2,name:'Area Bermain Anak',desc:'Wahana air aman untuk si kecil.',icon:'lucide:castle',status:'Active'},
  {id:3,name:'Restoran',desc:'Hidangan lezat dan minuman segar.',icon:'lucide:utensils',status:'Inactive'},
  {id:4,name:'Gazebo VIP',desc:'Tempat istirahat eksklusif.',icon:'lucide:tent',status:'Active'},
  {id:5,name:'Musholla',desc:'Tempat ibadah bersih dan nyaman.',icon:'lucide:heart',status:'Active'},
];
let editingFacId=null, nextFacId=6;

// Promotions data
let promotions = [
  {id:1,code:'BLUEHAVEN10',discount:'10% off',period:'01–31 Des 2024',active:true},
  {id:2,code:'FAMILY20',discount:'20% off',period:'15–25 Des 2024',active:true},
];
let nextPromoId=3;

// Gallery data
let galleryItems = [
  {id:1,title:'Kolam utama',order:1,status:'Published',url:'https://images.unsplash.com/photo-1654756306479-c0bc0011f7a4?auto=format&fit=crop&w=800&q=80',color:'#00BCD4'},
  {id:2,title:'Family splash',order:2,status:'Published',url:'https://images.unsplash.com/photo-1706843540922-5682f3ad5b98?auto=format&fit=crop&w=800&q=80',color:'#0097A7'},
  {id:3,title:'Wahana seluncur',order:3,status:'Draft',url:'https://images.unsplash.com/photo-1701361650313-9b20b1d76820?auto=format&fit=crop&w=800&q=80',color:'#26C6DA'},
  {id:4,title:'Bermain bersama',order:4,status:'Published',url:'https://images.unsplash.com/photo-1706843540931-64db8ea7abad?auto=format&fit=crop&w=800&q=80',color:'#00838F'},
];
let nextGalleryId=5;

// Pricing data
let pricing = [
  {id:1,name:'Tiket Anak',sub:'Usia 3–12 tahun',icon:'lucide:accessibility',price:35000,desc:'Akses kolam anak & playground.',featured:false},
  {id:2,name:'Tiket Dewasa',sub:'13 tahun ke atas',icon:'lucide:user-round',price:50000,desc:'Akses seluruh area kolam & gratis minuman.',featured:true},
  {id:3,name:'Tiket Keluarga',sub:'2 dewasa + 2 anak',icon:'lucide:users-round',price:150000,desc:'Paket hemat untuk 2 dewasa dan 2 anak.',featured:false},
];

let deleteTarget=null;

// ===================== TOAST =====================
function showToast(msg, type='success') {
  const c={success:'bg-emerald-500',error:'bg-rose-500',info:'bg-ocean'};
  const i={success:'lucide:check-circle',error:'lucide:alert-circle',info:'lucide:info'};
  const t=document.createElement('div');
  t.className=`toast show pointer-events-auto flex items-center gap-3 rounded-xl ${c[type]} px-5 py-3.5 text-sm font-semibold text-white shadow-lg`;
  t.innerHTML=`<iconify-icon icon="${i[type]}" class="text-lg"></iconify-icon> ${msg}`;
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
  if(page==='content'){ renderPricing(); renderFacilities(); renderPromotions(); renderGallery(); renderHeatmap(); }
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
const statusCfg={confirmed:{label:'Confirmed',bg:'bg-emerald-50',text:'text-emerald-600'},completed:{label:'Completed',bg:'bg-slate-100',text:'text-slate-600'},cancelled:{label:'Cancelled',bg:'bg-rose-50',text:'text-rose-600'}};

function getFilteredBookings(){return bookings.filter(b=>{const ms=bkFilter==='all'||b.status===bkFilter;const mq=!bkSearch||b.id.toLowerCase().includes(bkSearch)||b.name.toLowerCase().includes(bkSearch)||b.email.toLowerCase().includes(bkSearch);return ms&&mq})}

function renderBookings(){
  const filtered=getFilteredBookings();
  const total=bookings.length;
  const counts={all:total,confirmed:0,completed:0,cancelled:0};
  bookings.forEach(b=>counts[b.status]++);
  document.getElementById('bk-c-all').textContent=counts.all;
  document.getElementById('bk-c-conf').textContent=counts.confirmed;
  document.getElementById('bk-c-comp').textContent=counts.completed;
  document.getElementById('bk-c-canc').textContent=counts.cancelled;
  document.getElementById('bk-stat-total').textContent=counts.all;
  document.getElementById('bk-stat-confirmed').textContent=counts.confirmed;
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
    const sc=statusCfg[b.status];
    const actions=b.status==='cancelled'
      ? '<span class="px-2 text-xs font-semibold text-slate-400">Riwayat</span>'
      : `<button class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500" onclick="confirmDeleteBk('${b.id}')"><iconify-icon icon="lucide:trash-2"></iconify-icon></button>`;
    const tr=document.createElement('tr');
    tr.className='table-row hover:bg-slate-50';
    tr.innerHTML=`<td class="px-6 py-5 font-bold text-ocean">${b.id}</td><td class="px-4 py-5"><p class="font-semibold text-slate-700">${b.name}</p><p class="mt-1 text-xs text-slate-400">${b.email}</p></td><td class="px-4 py-5 text-slate-500">${b.ticket}</td><td class="px-4 py-5 text-slate-500">${b.date}</td><td class="px-4 py-5"><span class="rounded-full ${sc.bg} px-3 py-1.5 text-xs font-bold ${sc.text}">${sc.label}</span></td><td class="px-4 py-5 text-right font-bold text-slate-800">${b.amount}</td><td class="px-6 py-5"><div class="flex justify-center gap-1">${actions}</div></td>`;
    tbody.appendChild(tr);
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
  if(booking?.status==='cancelled'){
    showToast('Booking Cancelled disimpan sebagai riwayat dan tidak dapat dihapus.','info');
    return;
  }
  deleteTarget={type:'booking',id};
  document.getElementById('delete-message').innerHTML=`Booking <b>${id}</b> akan dihapus permanen.`;
  document.getElementById('delete-modal').classList.add('show');
};

document.querySelectorAll('.bk-filter').forEach(btn=>{btn.addEventListener('click',()=>{bkFilter=btn.dataset.status;bkPage=1;document.querySelectorAll('.bk-filter').forEach(x=>{x.className='bk-filter rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-lagoon hover:text-ocean'});btn.className='bk-filter rounded-xl bg-ocean px-4 py-2.5 text-sm font-bold text-white';renderBookings()})});
document.getElementById('bk-search').addEventListener('input',e=>{bkSearch=e.target.value.toLowerCase();bkPage=1;renderBookings()});
document.getElementById('export-bookings-btn').addEventListener('click',function(){const o=this.innerHTML;this.innerHTML='<iconify-icon icon="lucide:check"></iconify-icon> Export siap!';showToast('Data booking berhasil diexport');setTimeout(()=>this.innerHTML=o,2000)});

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
    card.innerHTML=`<div class="flex items-start justify-between"><div><span class="flex h-11 w-11 items-center justify-center rounded-xl ${p.featured?'bg-ocean text-white':'bg-lagoon text-ocean'}"><iconify-icon icon="${p.icon}" class="text-xl"></iconify-icon></span><h3 class="mt-5 font-display text-lg font-bold">${p.name}</h3><p class="mt-1 text-xs text-slate-400">${p.sub}</p></div><span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">Published</span></div><label class="mt-6 block text-sm font-bold text-slate-700">Harga tiket<input type="text" value="${p.price}" data-pid="${p.id}" class="price-field mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-semibold outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-100"></label><label class="mt-4 block text-sm font-bold text-slate-700">Deskripsi<textarea class="mt-2 h-24 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-aqua focus:ring-4 focus:ring-cyan-100">${p.desc}</textarea></label><div class="mt-4 rounded-xl ${p.featured?'bg-lagoon':'bg-slate-50'} p-4"><div><p class="text-xs text-slate-400">Preview harga</p><p class="price-preview mt-1 font-display text-2xl font-extrabold text-ocean" data-pid="${p.id}">Rp${p.price.toLocaleString('id-ID')}</p></div></div><div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-5"><label class="flex items-center gap-2 text-xs font-bold text-slate-500"><input type="checkbox" checked class="h-4 w-4 accent-ocean"> Publish</label><button class="save-price-btn flex min-h-10 items-center gap-2 rounded-xl bg-ocean px-4 text-sm font-bold text-white hover:bg-ocean/90" data-pid="${p.id}"><iconify-icon icon="lucide:save"></iconify-icon> Simpan</button></div>`;
    container.appendChild(card);
  });
  container.querySelectorAll('.price-field').forEach(inp=>{
    inp.addEventListener('input',()=>{const pid=parseInt(inp.dataset.pid);const v=parseInt(inp.value.replace(/\D/g,''))||0;const prev=container.querySelector(`.price-preview[data-pid="${pid}"]`);if(prev)prev.textContent='Rp'+v.toLocaleString('id-ID')});
    inp.addEventListener('focus',()=>{inp.value=inp.value.replace(/\D/g,'')});
  });
  container.querySelectorAll('.save-price-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{const pid=parseInt(btn.dataset.pid);const inp=container.querySelector(`.price-field[data-pid="${pid}"]`);const v=parseInt(inp?.value.replace(/\D/g,''))||0;const p=pricing.find(x=>x.id===pid);if(p)p.price=v;const o=btn.innerHTML;btn.innerHTML='<iconify-icon icon="lucide:check"></iconify-icon> Tersimpan!';showToast(`Harga ${p?.name} disimpan`);setTimeout(()=>btn.innerHTML=o,1800)});
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
    tr.innerHTML=`<td class="px-6 py-5 font-bold text-slate-800">${f.name}</td><td class="px-4 py-5 text-slate-500">${f.desc}</td><td class="px-4 py-5"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-lagoon text-ocean"><iconify-icon icon="${f.icon}"></iconify-icon></span></td><td class="px-4 py-5"><span class="rounded-full ${stCls} px-3 py-1.5 text-xs font-bold">${f.status}</span></td><td class="px-6 py-5 text-right"><div class="flex justify-end gap-1"><button class="edit-fac rounded-lg p-2 text-slate-400 hover:bg-lagoon hover:text-ocean" data-id="${f.id}"><iconify-icon icon="lucide:pencil"></iconify-icon></button><button class="del-fac rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500" data-id="${f.id}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button></div></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.edit-fac').forEach(b=>{b.addEventListener('click',()=>{const f=facilities.find(x=>x.id===parseInt(b.dataset.id));if(f)openFacModal(f)})});
  tbody.querySelectorAll('.del-fac').forEach(b=>{b.addEventListener('click',()=>{const f=facilities.find(x=>x.id===parseInt(b.dataset.id));if(f){deleteTarget={type:'facility',id:f.id};document.getElementById('delete-message').innerHTML=`Fasilitas <b>${f.name}</b> akan dihapus.`;document.getElementById('delete-modal').classList.add('show')}})});
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
document.getElementById('save-facility-btn').addEventListener('click',()=>{
  const name=document.getElementById('fac-name').value.trim();
  const desc=document.getElementById('fac-desc').value.trim();
  const icon=document.getElementById('fac-icon').value.trim()||'lucide:building-2';
  const status=document.getElementById('fac-status').value;
  if(!name){showToast('Nama wajib diisi','error');return}
  if(editingFacId){const f=facilities.find(x=>x.id===editingFacId);if(f){f.name=name;f.desc=desc;f.icon=icon;f.status=status}showToast(`"${name}" diperbarui`)}
  else{facilities.push({id:nextFacId++,name,desc,icon,status});showToast(`"${name}" ditambahkan`)}
  closeFacModal();renderFacilities();
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
    d.innerHTML=`<div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl ${p.active?'bg-lagoon text-ocean':'bg-slate-100 text-slate-400'}"><iconify-icon icon="lucide:ticket-percent"></iconify-icon></span><div><p class="font-bold ${p.active?'text-ocean':'text-slate-400'}">${p.code}</p><p class="mt-0.5 text-xs text-slate-500">${p.discount} · ${p.period}</p></div></div><div class="flex items-center gap-3"><div class="toggle-switch ${p.active?'active':''}" data-id="${p.id}"><span class="toggle-knob"></span></div><button class="del-promo rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500" data-id="${p.id}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button></div>`;
    list.appendChild(d);
  });
  list.querySelectorAll('.toggle-switch').forEach(t=>{t.addEventListener('click',()=>{const p=promotions.find(x=>x.id===parseInt(t.dataset.id));if(p){p.active=!p.active;showToast(`${p.code} ${p.active?'diaktifkan':'dinonaktifkan'}`,'info');renderPromotions()}})});
  list.querySelectorAll('.del-promo').forEach(b=>{b.addEventListener('click',()=>{const p=promotions.find(x=>x.id===parseInt(b.dataset.id));if(p){deleteTarget={type:'promo',id:p.id};document.getElementById('delete-message').innerHTML=`Promo <b>${p.code}</b> akan dihapus.`;document.getElementById('delete-modal').classList.add('show')}})});
}

document.getElementById('publish-promo-btn').addEventListener('click',()=>{
  const code=document.getElementById('promo-code').value.trim().toUpperCase();
  const type=document.getElementById('promo-type').value;
  const amount=document.getElementById('promo-amount').value;
  const start=document.getElementById('promo-start').value;
  const end=document.getElementById('promo-end').value;
  if(!code||!amount){showToast('Lengkapi semua field','error');return}
  const fd=d=>{const dt=new Date(d);return dt.getDate().toString().padStart(2,'0')+' '+['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'][dt.getMonth()]+' '+dt.getFullYear()};
  const disc=type==='Percentage (%)'?`${amount}% off`:`Rp${parseInt(amount).toLocaleString('id-ID')} off`;
  promotions.push({id:nextPromoId++,code,discount:disc,period:`${fd(start)} – ${fd(end)}`,active:true});
  renderPromotions();showToast(`Promo "${code}" dipublikasikan!`);
});

// Gallery
function renderGallery(){
  const grid=document.getElementById('gallery-grid');
  document.getElementById('gallery-count-badge').textContent=`${galleryItems.length} Published`;
  grid.innerHTML='';
  if(!galleryItems.length){grid.innerHTML='<div class="col-span-full py-10 text-center"><p class="font-display font-bold text-slate-700">Galeri kosong</p></div>';return}
  galleryItems.forEach((item,idx)=>{
    const d=document.createElement('div');
    d.className='gallery-item group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100';
    if(item.url){
      d.innerHTML=`<div class="relative"><img src="${item.url}" alt="${item.title}" class="h-44 w-full object-cover"><div class="gallery-overlay absolute inset-0 bg-slate-900/40 flex items-center justify-center"><button class="del-gallery flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-rose-500 hover:bg-white" data-id="${item.id}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button></div></div><div class="flex items-center justify-between p-3"><div><p class="text-sm font-bold">${item.title}</p><p class="text-xs text-slate-400">Order ${String(item.order).padStart(2,'0')} · ${item.status}</p></div></div>`;
    } else {
      const svgs=[`<svg viewBox="0 0 400 200" class="h-44 w-full"><rect width="400" height="200" fill="${item.color}"/><circle cx="200" cy="80" r="40" fill="white" opacity=".2"/><path d="M0 140Q100 100 200 130Q300 160 400 120L400 200L0 200Z" fill="white" opacity=".15"/></svg>`,`<svg viewBox="0 0 400 200" class="h-44 w-full"><rect width="400" height="200" fill="${item.color}"/><rect x="50" y="40" width="80" height="80" rx="10" fill="white" opacity=".15"/><rect x="270" y="30" width="80" height="90" rx="10" fill="white" opacity=".12"/></svg>`,`<svg viewBox="0 0 400 200" class="h-44 w-full"><rect width="400" height="200" fill="${item.color}"/><circle cx="100" cy="60" r="25" fill="white" opacity=".2"/><circle cx="300" cy="100" r="35" fill="white" opacity=".12"/></svg>`,`<svg viewBox="0 0 400 200" class="h-44 w-full"><rect width="400" height="200" fill="${item.color}"/><path d="M0 100Q50 60 100 90Q150 120 200 80Q250 40 300 70Q350 100 400 60L400 200L0 200Z" fill="white" opacity=".1"/></svg>`];
      d.innerHTML=`<div class="relative">${svgs[idx%4]}<div class="gallery-overlay absolute inset-0 bg-slate-900/40 flex items-center justify-center"><button class="del-gallery flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-rose-500 hover:bg-white" data-id="${item.id}"><iconify-icon icon="lucide:trash-2"></iconify-icon></button></div></div><div class="flex items-center justify-between p-3"><div><p class="text-sm font-bold">${item.title}</p><p class="text-xs text-slate-400">Order ${String(item.order).padStart(2,'0')} · ${item.status}</p></div></div>`;
    }
    grid.appendChild(d);
  });
  grid.querySelectorAll('.del-gallery').forEach(b=>{b.addEventListener('click',()=>{const item=galleryItems.find(x=>x.id===parseInt(b.dataset.id));if(item){deleteTarget={type:'gallery',id:item.id};document.getElementById('delete-message').innerHTML=`Gambar <b>${item.title}</b> akan dihapus.`;document.getElementById('delete-modal').classList.add('show')}})});
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
  let c=0;
  Array.from(files).forEach(file=>{
    if(!file.type.startsWith('image/')||file.size>5*1024*1024)return;
    c++;
    const reader=new FileReader();
    reader.onload=e=>{
      galleryItems.push({id:nextGalleryId++,title:file.name.replace(/\.[^.]+$/,'').substring(0,20),order:galleryItems.length+1,status:'Published',url:e.target.result,color:'#00BCD4'});
      renderGallery();
    };
    reader.readAsDataURL(file);
  });
  if(c)showToast(`${c} gambar diunggah`);
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
document.getElementById('delete-confirm-btn').addEventListener('click',()=>{
  if(!deleteTarget)return;
  if(deleteTarget.type==='booking'){
    const booking=bookings.find(item=>item.id===deleteTarget.id);
    if(booking?.status==='cancelled'){
      showToast('Booking Cancelled disimpan sebagai riwayat dan tidak dapat dihapus.','info');
    }else{
      bookings=bookings.filter(item=>item.id!==deleteTarget.id);
      renderBookings();
      showToast(`Booking ${deleteTarget.id} dihapus`,'error');
    }
  }
  else if(deleteTarget.type==='facility'){const f=facilities.find(x=>x.id===deleteTarget.id);facilities=facilities.filter(x=>x.id!==deleteTarget.id);renderFacilities();showToast(`"${f?.name}" dihapus`,'error')}
  else if(deleteTarget.type==='promo'){const p=promotions.find(x=>x.id===deleteTarget.id);promotions=promotions.filter(x=>x.id!==deleteTarget.id);renderPromotions();showToast(`"${p?.code}" dihapus`,'error')}
  else if(deleteTarget.type==='gallery'){const g=galleryItems.find(x=>x.id===deleteTarget.id);galleryItems=galleryItems.filter(x=>x.id!==deleteTarget.id);renderGallery();showToast(`"${g?.title}" dihapus`,'error')}
  document.getElementById('delete-modal').classList.remove('show');deleteTarget=null;
});

// ===================== DESKTOP SEARCH =====================
document.getElementById('admin-search-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.trim();if(q)showToast(`Mencari: "${q}"`,'info')}});

// ===================== INIT =====================
handleHash();


}
