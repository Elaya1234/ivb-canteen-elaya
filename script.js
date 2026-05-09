/* =========================================================
   IVB College Canteen Billing App — Frontend Only
   Storage keys: ivb_session, ivb_theme, ivb_history,
                 ivb_favorites, ivb_sound
   IMPORTANT: success modal is NEVER auto-restored on load.
   ========================================================= */

const LS = {
  session:   'ivb_session',
  theme:     'ivb_theme',
  history:   'ivb_history',
  favorites: 'ivb_favorites',
  sound:     'ivb_sound',
};

const state = {
  menu: [],
  cart: [],            // {id, name, price, image, qty}
  filterCat: 'All',
  search: '',
  payment: 'Cash',
  discount: { code: null, pct: 0 },
  favorites: new Set(JSON.parse(localStorage.getItem(LS.favorites) || '[]')),
  lastOrder: null,     // only in-memory; never persisted as "active"
};

const EXACT_MENU = [
  { id: 1, name: 'Idli (2 pcs)', price: 25, category: 'Breakfast', image: 'assets/idli.jpg', rating: 4.5 },
  { id: 2, name: 'Masala Dosa', price: 60, category: 'Breakfast', image: 'assets/masala-dosa.jpg', rating: 4.7 },
  { id: 3, name: 'Plain Dosa', price: 45, category: 'Breakfast', image: 'assets/plain-dosa.jpg', rating: 4.3 },
  { id: 4, name: 'Pongal', price: 50, category: 'Breakfast', image: 'assets/pongal.jpg', rating: 4.4 },
  { id: 5, name: 'Poori Set', price: 55, category: 'Breakfast', image: 'assets/poori.jpg', rating: 4.2 },
  { id: 6, name: 'Veg Fried Rice', price: 90, category: 'Meals', image: 'assets/veg-fried-rice.jpg', rating: 4.4 },
  { id: 7, name: 'Chicken Fried Rice', price: 130, category: 'Meals', image: 'assets/chicken-fried-rice.jpg', rating: 4.6 },
  { id: 8, name: 'Veg Noodles', price: 85, category: 'Meals', image: 'assets/veg-noodles.jpg', rating: 4.3 },
  { id: 9, name: 'Chicken Noodles', price: 125, category: 'Meals', image: 'assets/chicken-noodles.jpg', rating: 4.5 },
  { id: 10, name: 'Paneer Butter Masala + Roti', price: 140, category: 'Meals', image: 'assets/paneer-roti.jpg', rating: 4.7 },
  { id: 11, name: 'Meals (South Indian Unlimited)', price: 120, category: 'Meals', image: 'assets/meals.jpg', rating: 4.8 },
  { id: 12, name: 'Mini Meals', price: 80, category: 'Meals', image: 'assets/mini-meals.jpg', rating: 4.4 },
  { id: 13, name: 'Chicken Briyani', price: 160, category: 'Meals', image: 'assets/chicken-biryani.jpg', rating: 4.9 },
  { id: 14, name: 'Veg Briyani', price: 110, category: 'Meals', image: 'assets/veg-biryani.jpg', rating: 4.5 },
  { id: 15, name: 'Burger + Fries Combo', price: 150, category: 'Snacks', image: 'assets/burger-fries.jpg', rating: 4.6 },
  { id: 16, name: 'Sandwich', price: 70, category: 'Snacks', image: 'assets/sandwich.jpg', rating: 4.2 },
  { id: 17, name: 'Fresh Lime Juice', price: 40, category: 'Beverages', image: 'assets/lime-juice.jpg', rating: 4.5 },
  { id: 18, name: 'Cold Coffee', price: 75, category: 'Beverages', image: 'assets/cold-coffee.jpg', rating: 4.7 },
  { id: 19, name: 'Tea / Coffee', price: 20, category: 'Beverages', image: 'assets/tea-coffee.jpg', rating: 4.3 },
  { id: 20, name: 'Ice Cream Cup', price: 50, category: 'Desserts', image: 'assets/ice-cream.jpg', rating: 4.6 },
];

function normalizeMenu(list) {
  const byNameImage = Object.fromEntries(EXACT_MENU.map(item => [item.name, item.image]));
  return list.map((item, idx) => ({
    id: item.id ?? idx + 1,
    name: item.name,
    price: item.price,
    category: item.category,
    image: item.image || byNameImage[item.name] || 'assets/logo.png',
    rating: item.rating ?? 4.5,
  }));
}

/* ---------- Theme ---------- */
function applyTheme() {
  const t = localStorage.getItem(LS.theme) || 'dark';
  document.documentElement.classList.toggle('dark', t === 'dark');
  document.getElementById('iconMoon').classList.toggle('hidden', t !== 'dark');
  document.getElementById('iconSun').classList.toggle('hidden', t === 'dark');
}
document.getElementById('themeToggle').addEventListener('click', () => {
  const cur = localStorage.getItem(LS.theme) || 'dark';
  localStorage.setItem(LS.theme, cur === 'dark' ? 'light' : 'dark');
  applyTheme();
});

/* ---------- Auth ---------- */
function getSession() { try { return JSON.parse(localStorage.getItem(LS.session)); } catch { return null; } }

function showApp(session) {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('welcomeName').textContent = session.name;
  document.getElementById('profileName').textContent = session.name;
  document.getElementById('profileId').textContent = session.id;
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('studentId').value.trim();
  const name = document.getElementById('studentName').value.trim();
  if (!id || !name) return;
  const session = { id, name, ts: Date.now() };
  localStorage.setItem(LS.session, JSON.stringify(session));
  showApp(session);
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem(LS.session);
  location.reload();
});

document.getElementById('profileBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('profileMenu').classList.toggle('hidden');
});
document.addEventListener('click', () => document.getElementById('profileMenu').classList.add('hidden'));

/* ---------- Menu ---------- */
async function loadMenu() {
  try {
    const res = await fetch('menu.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.menu = normalizeMenu(await res.json());
  } catch (err) {
    console.warn('Using built-in menu because menu.json could not be loaded.', err);
    state.menu = normalizeMenu(EXACT_MENU);
  }
  renderMenu();
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  const term = state.search.toLowerCase().trim();
  const items = state.menu.filter(i =>
    (state.filterCat === 'All' || i.category === state.filterCat) &&
    (!term || i.name.toLowerCase().includes(term))
  );
  document.getElementById('emptyState').classList.toggle('hidden', items.length > 0);
  grid.innerHTML = items.map(i => `
    <article class="dish-card">
      <div class="img-wrap">
        <img src="${i.image}" alt="${i.name}" loading="lazy" />
        <span class="badge">${i.category}</span>
        <button class="heart ${state.favorites.has(i.id) ? 'fav':''}" data-fav="${i.id}" title="Favorite">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${state.favorites.has(i.id)?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="body">
        <div class="flex items-center justify-between gap-2">
          <h3 class="font-semibold leading-snug">${i.name}</h3>
          <span class="text-xs text-amber-400 font-semibold whitespace-nowrap">★ ${i.rating}</span>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-xl font-bold text-brand-300">₹${i.price}</span>
          <button class="add-btn px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-sm font-semibold transition" data-add="${i.id}">+ Add</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => addToCart(+b.dataset.add)));
  grid.querySelectorAll('[data-fav]').forEach(b => b.addEventListener('click', () => toggleFav(+b.dataset.fav)));
}

function toggleFav(id) {
  if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
  localStorage.setItem(LS.favorites, JSON.stringify([...state.favorites]));
  renderMenu();
}

/* ---------- Search & Filter ---------- */
document.getElementById('searchInput').addEventListener('input', (e) => { state.search = e.target.value; renderMenu(); });
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.filterCat = btn.dataset.cat;
    renderMenu();
  });
});
document.getElementById('clearFilters').addEventListener('click', () => {
  state.filterCat = 'All'; state.search = '';
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === 'All'));
  renderMenu();
});

/* ---------- Cart ---------- */
function addToCart(id) {
  const item = state.menu.find(m => m.id === id);
  if (!item) return;
  const ex = state.cart.find(c => c.id === id);
  if (ex) ex.qty++; else state.cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
  renderCart();
  openCart();
}
function changeQty(id, delta) {
  const it = state.cart.find(c => c.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) state.cart = state.cart.filter(c => c.id !== id);
  renderCart();
}
function removeItem(id) { state.cart = state.cart.filter(c => c.id !== id); renderCart(); }

function totals() {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = +(subtotal * 0.05).toFixed(2);
  const discount = +(subtotal * (state.discount.pct / 100)).toFixed(2);
  const total = +(subtotal + gst - discount).toFixed(2);
  return { subtotal, gst, discount, total };
}

function renderCart() {
  const wrap = document.getElementById('cartItems');
  if (state.cart.length === 0) {
    wrap.innerHTML = `<div class="text-center text-white/50 py-10">Your cart is empty.<br/>Add something tasty!</div>`;
  } else {
    wrap.innerHTML = state.cart.map(i => `
      <div class="cart-row">
        <img src="${i.image}" alt="${i.name}" />
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm truncate">${i.name}</div>
          <div class="text-xs text-white/50">₹${i.price} × ${i.qty}</div>
          <div class="mt-2 flex items-center gap-2">
            <button class="qty-btn" data-dec="${i.id}">−</button>
            <span class="text-sm w-5 text-center">${i.qty}</span>
            <button class="qty-btn" data-inc="${i.id}">+</button>
            <button class="ml-auto text-xs text-red-400 hover:text-red-300" data-rm="${i.id}">Remove</button>
          </div>
        </div>
        <div class="font-bold text-brand-300 text-sm">₹${i.price * i.qty}</div>
      </div>
    `).join('');
    wrap.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => changeQty(+b.dataset.inc, +1));
    wrap.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => changeQty(+b.dataset.dec, -1));
    wrap.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => removeItem(+b.dataset.rm));
  }
  const t = totals();
  document.getElementById('sumSubtotal').textContent = '₹' + t.subtotal.toFixed(2);
  document.getElementById('sumGst').textContent = '₹' + t.gst.toFixed(2);
  document.getElementById('sumDiscount').textContent = '-₹' + t.discount.toFixed(2);
  document.getElementById('sumTotal').textContent = '₹' + t.total.toFixed(2);
  const count = state.cart.reduce((s,i)=>s+i.qty,0);
  const badge = document.getElementById('cartBadge');
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
  document.getElementById('placeOrderBtn').disabled = state.cart.length === 0;
}

/* Discount */
document.getElementById('applyDiscount').addEventListener('click', () => {
  const code = document.getElementById('discountCode').value.trim().toUpperCase();
  const msg = document.getElementById('discountMsg');
  const map = { 'IVB10': 10, 'FOOD20': 20 };
  if (map[code]) {
    state.discount = { code, pct: map[code] };
    msg.textContent = `✓ ${code} applied — ${map[code]}% off`;
    msg.className = 'text-xs text-emerald-400';
  } else {
    state.discount = { code: null, pct: 0 };
    msg.textContent = '✗ Invalid code';
    msg.className = 'text-xs text-red-400';
  }
  renderCart();
});

/* Cart open/close */
function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartBackdrop').classList.remove('hidden');
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartBackdrop').classList.add('hidden');
}
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('cartBackdrop').addEventListener('click', closeCart);

/* Payment */
document.querySelectorAll('.pay-btn').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.pay-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.payment = b.dataset.pay;
}));

/* ---------- Place order ---------- */
document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);

function placeOrder() {
  if (state.cart.length === 0) return;
  const btn = document.getElementById('placeOrderBtn');
  document.getElementById('placeOrderText').classList.add('hidden');
  document.getElementById('placeOrderSpinner').classList.remove('hidden');
  btn.disabled = true;
  setTimeout(() => {
    const session = getSession();
    const t = totals();
    const order = {
      id: 'IVB' + Date.now().toString().slice(-8),
      ts: new Date().toISOString(),
      student: session,
      items: JSON.parse(JSON.stringify(state.cart)),
      totals: t,
      payment: state.payment,
      discount: state.discount,
    };
    state.lastOrder = order;
    saveHistory(order);
    showSuccess(order);
    // reset cart
    state.cart = [];
    state.discount = { code: null, pct: 0 };
    document.getElementById('discountCode').value = '';
    document.getElementById('discountMsg').textContent = '';
    renderCart();
    closeCart();
    document.getElementById('placeOrderText').classList.remove('hidden');
    document.getElementById('placeOrderSpinner').classList.add('hidden');
    btn.disabled = false;
  }, 900);
}

/* ---------- Success modal ---------- */
function showSuccess(order) {
  document.getElementById('recOrderId').textContent = order.id;
  document.getElementById('recStudent').textContent = `${order.student.name} (${order.student.id})`;
  document.getElementById('recPay').textContent = order.payment;
  const qrEl = document.getElementById('qrcode');
  qrEl.innerHTML = '';
  new QRCode(qrEl, {
    text: JSON.stringify({ id: order.id, s: order.student.id, t: order.totals.total }),
    width: 140, height: 140, correctLevel: QRCode.CorrectLevel.M,
  });
  const m = document.getElementById('successModal');
  m.classList.remove('hidden');
  m.classList.add('flex');
}
function closeAnyModal() {
  document.getElementById('successModal').classList.add('hidden');
  document.getElementById('successModal').classList.remove('flex');
  document.getElementById('historyModal').classList.add('hidden');
  document.getElementById('historyModal').classList.remove('flex');
}
document.querySelectorAll('.closeModal').forEach(b => b.addEventListener('click', closeAnyModal));

/* ---------- PDF ---------- */
function downloadReceipt(order) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const date = new Date(order.ts).toLocaleString();
  doc.setFontSize(18); doc.setFont('helvetica','bold');
  doc.text('IVB College Canteen', 105, 18, { align: 'center' });
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('Billing App — Receipt', 105, 25, { align: 'center' });
  doc.line(15, 30, 195, 30);

  doc.setFontSize(11);
  doc.text(`Order ID: ${order.id}`, 15, 40);
  doc.text(`Date: ${date}`, 15, 47);
  doc.text(`Student: ${order.student.name}`, 15, 54);
  doc.text(`Student ID: ${order.student.id}`, 15, 61);
  doc.text(`Payment: ${order.payment}`, 15, 68);

  doc.setFont('helvetica','bold');
  doc.text('Item', 15, 82); doc.text('Qty', 130, 82); doc.text('Price', 150, 82); doc.text('Total', 175, 82);
  doc.line(15, 84, 195, 84);
  doc.setFont('helvetica','normal');
  let y = 92;
  order.items.forEach(it => {
    doc.text(it.name.substring(0,55), 15, y);
    doc.text(String(it.qty), 130, y);
    doc.text('Rs.' + it.price, 150, y);
    doc.text('Rs.' + (it.price * it.qty), 175, y);
    y += 7;
  });
  y += 4; doc.line(15, y, 195, y); y += 8;
  doc.text(`Subtotal: Rs.${order.totals.subtotal.toFixed(2)}`, 130, y); y += 7;
  doc.text(`GST (5%): Rs.${order.totals.gst.toFixed(2)}`, 130, y); y += 7;
  if (order.discount?.pct) { doc.text(`Discount (${order.discount.code}): -Rs.${order.totals.discount.toFixed(2)}`, 130, y); y += 7; }
  doc.setFont('helvetica','bold'); doc.setFontSize(13);
  doc.text(`TOTAL: Rs.${order.totals.total.toFixed(2)}`, 130, y);

  doc.setFont('helvetica','italic'); doc.setFontSize(9);
  doc.text('Thank you! Show your QR at the pickup counter.', 105, 280, { align:'center' });
  doc.save(`IVB-Receipt-${order.id}.pdf`);
}
document.getElementById('downloadPdf').addEventListener('click', () => state.lastOrder && downloadReceipt(state.lastOrder));
document.getElementById('printReceipt').addEventListener('click', () => window.print());

/* ---------- History ---------- */
function saveHistory(order) {
  const list = JSON.parse(localStorage.getItem(LS.history) || '[]');
  list.unshift(order);
  localStorage.setItem(LS.history, JSON.stringify(list.slice(0, 5)));
}
document.getElementById('historyBtn').addEventListener('click', () => {
  const list = JSON.parse(localStorage.getItem(LS.history) || '[]');
  const wrap = document.getElementById('historyList');
  wrap.innerHTML = list.length === 0
    ? `<div class="text-center text-white/50 py-10">No orders yet.</div>`
    : list.map((o, idx) => `
      <div class="bg-white/5 border border-white/10 rounded-xl p-4">
        <div class="flex justify-between items-start gap-3">
          <div class="min-w-0">
            <div class="font-semibold">${o.id}</div>
            <div class="text-xs text-white/50">${new Date(o.ts).toLocaleString()} · ${o.payment}</div>
            <div class="text-xs text-white/70 mt-1 truncate">${o.items.map(i=>`${i.name}×${i.qty}`).join(', ')}</div>
          </div>
          <div class="text-right">
            <div class="text-brand-300 font-bold">₹${o.totals.total.toFixed(2)}</div>
            <button class="mt-2 text-xs px-3 py-1 rounded-lg bg-brand-500 hover:bg-brand-600" data-hpdf="${idx}">PDF</button>
          </div>
        </div>
      </div>
    `).join('');
  wrap.querySelectorAll('[data-hpdf]').forEach(b => b.onclick = () => downloadReceipt(list[+b.dataset.hpdf]));
  const m = document.getElementById('historyModal');
  m.classList.remove('hidden'); m.classList.add('flex');
});

/* ---------- Init ---------- */
applyTheme();
const session = getSession();
if (session) showApp(session);
loadMenu();

/* Safety: success modal MUST start hidden — even if some bad CSS is cached */
document.getElementById('successModal').classList.add('hidden');
document.getElementById('successModal').classList.remove('flex');
