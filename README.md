# 💰 MoneyTrack — Income & Expense Calculator

A clean, modern, fully functional **Income & Expense Calculator** built with vanilla **HTML**, **CSS**, and **JavaScript**. Track your finances effortlessly — add, edit, and delete income/expense entries while monitoring your net balance, monthly trends, and expense breakdowns in real time.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard Layout** | Professional sidebar navigation with summary cards, charts, and transactions table |
| **CRUD Operations** | Create, Read, Update, and Delete income & expense entries via a slide-in panel |
| **Financial Summary** | Live-updating cards for Total Income, Total Expenses, and Net Balance |
| **Bar Chart** | Monthly Income vs Expenses visualization using Chart.js |
| **Doughnut Chart** | Expense breakdown by category (Food, Shopping, Transport, Bills, Others) |
| **Filter by Type** | Pill-button filters to view **All**, **Income**, or **Expense** transactions |
| **Search** | Real-time search by transaction description |
| **Auto-Categorization** | Automatically detects categories (Salary, Groceries, Freelance, etc.) from keywords |
| **Edit Entries** | Click the ✏️ icon to open the edit panel pre-filled with existing data |
| **Delete with Confirmation** | Click the 🗑️ icon — a modal asks for confirmation before deletion |
| **Date Support** | Each transaction has a date field for accurate tracking |
| **Local Storage** | All entries persist across browser sessions via `localStorage` |
| **Toast Notifications** | Animated success / error / info toasts for every action |
| **Responsive Design** | Fully responsive — desktop sidebar, tablet icons-only, mobile bottom nav |
| **Mobile Summary Hero** | On mobile, a blue hero card shows balance with income/expense breakdown |
| **Custom Icons** | All icons from the `moneytrack_all_png_assets/` folder |

---

## 🛠️ Tech Stack

- **HTML5** — Semantic, accessible markup with ARIA labels
- **CSS3** — Custom properties, grid/flexbox, animations, responsive breakpoints
- **JavaScript (ES6+)** — Modular, well-documented vanilla JS with no frameworks
- **Chart.js 4** — Bar and doughnut chart visualizations (CDN)

---

## 📂 Project Structure

```
├── index.html                    # Main HTML page
├── index.css                     # Complete stylesheet with design tokens
├── app.js                        # Application logic (CRUD, charts, responsive)
├── README.md                     # This file
└── moneytrack_all_png_assets/    # Icon assets
    ├── moneytrack_logo.png
    ├── dashboard_icon.png
    ├── transactions_icon.png
    ├── reports_icon.png
    ├── income_icon.png
    ├── expense_icon.png
    ├── balance_icon.png
    ├── salary_icon.png
    ├── groceries_icon.png
    ├── freelance_icon.png
    ├── subscription_icon.png
    ├── dining_icon.png
    ├── edit_icon.png
    ├── delete_icon.png
    ├── search_icon.png
    ├── calendar_icon.png
    ├── add_icon.png
    ├── empty_state_icon.png
    └── man on top.png
```

---

## 🚀 Getting Started

1. **Clone or download** this project.
2. **Open `index.html`** in any modern web browser.
3. Start adding your income and expense transactions!

> No build tools, frameworks, or server required — it runs entirely in the browser.

---

## 📖 How to Use

1. **Add a Transaction** — Click the blue **+ Add Transaction** button. Fill in description, amount, date, and select Income or Expense. Click **Add Transaction**.
2. **Edit a Transaction** — Click the ✏️ icon in the Actions column. The slide panel opens pre-filled. Make changes and click **Save Changes**.
3. **Delete a Transaction** — Click the 🗑️ icon. Confirm in the modal to permanently remove it.
4. **Filter Transactions** — Use the **All / Income / Expense** pill buttons above the table.
5. **Search** — Type in the search box to filter transactions by description.
6. **View Charts** — The bar chart shows monthly trends, and the doughnut shows expense categories.
7. **Data Persistence** — Entries are saved in `localStorage` and survive page reloads.

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| **≥ 1024px (Desktop)** | Full sidebar, 3-column summary, side-by-side charts, table view |
| **768–1023px (Tablet)** | Collapsed icon sidebar, stacked charts |
| **≤ 767px (Mobile)** | No sidebar, blue hero balance card, bottom nav with floating + button, card-style table |

---

## 🧑‍💻 Author

Built as a project task for Guvi.

---

## 📄 License

This project is open source and available for educational purposes.
