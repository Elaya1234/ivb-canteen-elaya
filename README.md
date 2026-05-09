# 🍽️ IVB College Canteen Billing App

A modern, frontend-only canteen ordering and billing system for students at IVB College.
Browse the menu, build your order, pay, and walk away with a QR-coded PDF receipt — all in your browser.

> No backend. No database. No accounts. 100% client-side using `localStorage`.

---

## ✨ Features

- 🔐 **Student login** — Student ID + Name, session saved locally
- 📋 **20-item menu** loaded from `menu.json` with images, ratings & categories
- 🔍 **Live search** + category filters + clear-filters button
- ❤️ **Favorites** persisted across sessions
- 🛒 **Smart cart** — quantities, GST (5%), discount codes (`IVB10` 10% off, `FOOD20` 20% off)
- 💳 **Payment options** — Cash / Card / UPI / Wallet
- ✅ **Order confirmation** — animated success modal with QR pickup code
- 📄 **PDF receipt** — generated with jsPDF, downloadable & printable
- 📜 **Order history** — last 5 orders, re-download any receipt
- 🌗 **Dark / Light mode** with persistent preference
- 📱 **Fully responsive** — cart becomes a bottom drawer on mobile
- 🎨 **Glassmorphism** UI with dark-orange × black gradient theme

---

## 🧰 Tech Stack

| Layer | Tech |
|------|------|
| Markup | HTML5 |
| Styling | Tailwind CSS (CDN) + custom `style.css` |
| Logic | Vanilla JavaScript (ES modules-free) |
| Data | `menu.json` + `localStorage` |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) |
| QR | [qrcode.js](https://github.com/davidshimjs/qrcodejs) |

---

## 🚀 How to Run

Because the app fetches `menu.json`, you need a tiny local server (opening `index.html` directly via `file://` will block the fetch).

### Option 1 — Python
```bash
cd ivb-canteen
python3 -m http.server 8000
# open http://localhost:8000
```

### Option 2 — Node
```bash
npx serve ivb-canteen
```

### Option 3 — VS Code
Install the **Live Server** extension → right-click `index.html` → *Open with Live Server*.

---

## 📂 Project Structure

```
ivb-canteen/
├── index.html      # Markup + Tailwind CDN
├── style.css       # Glassmorphism, animations, theme
├── script.js       # All app logic
├── menu.json       # 20 dishes
├── assets/         # Food images + logo
└── README.md
```

---

## 🔒 LocalStorage Keys

Only these keys are written:

| Key             | Purpose                |
|-----------------|------------------------|
| `ivb_session`   | Logged-in student      |
| `ivb_theme`     | dark / light           |
| `ivb_history`   | Last 5 orders          |
| `ivb_favorites` | Favorited item IDs     |
| `ivb_sound`     | Reserved for sounds    |

> The success popup state is **never** persisted, so refreshing the page never re-opens a confirmation.

---

## 💸 Discount Codes

| Code     | Off     |
|----------|---------|
| `IVB10`  | 10% off |
| `FOOD20` | 20% off |

---

## 📸 Screenshots

_Drop your own screenshots into a `screenshots/` folder and reference them here._

```
![Login](screenshots/login.png)
![Menu](screenshots/menu.png)
![Cart](screenshots/cart.png)
![Success](screenshots/success.png)
```

---

## 🌐 Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "IVB Canteen App"
git branch -M main
git remote add origin https://github.com/<your-user>/ivb-canteen.git
git push -u origin main
```

Then in your GitHub repo → **Settings → Pages → Source: `main` / root** → Save.
Your app will be live at `https://<your-user>.github.io/ivb-canteen/`.

---

## 🐛 Bug-Prevention Notes

- ✅ Success modal starts hidden and only opens on **Place Order**
- ✅ Refreshing the page never auto-opens any popup
- ✅ Cart is cleared after each successful order
- ✅ All 20 items load from `menu.json` immediately
- ✅ Search & filters never wipe the menu permanently — clear filters restores everything

---

Made with ♥ for hungry students.
