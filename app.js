/**
 * ================================================================
 *  MoneyTrack — Income & Expense Calculator
 *  Full CRUD, Chart.js charts, localStorage, responsive layout.
 * ================================================================
 */

// ──────────────────────── State ─────────────────────────────────
const STORAGE_KEY = 'moneytrack_entries';

const state = {
  transactions: [],
  filter: 'all',       // 'all' | 'income' | 'expense'
  searchQuery: '',
  editingId: null,
  deleteTargetId: null,
  selectedType: 'income', // for slide panel form
  charts: { bar: null, doughnut: null }
};

// ──────────────────────── DOM Cache ──────────────────────────────
const $ = (id) => document.getElementById(id);

const dom = {
  // Views
  viewDashboard: $('view-dashboard'),
  viewTransactions: $('view-transactions'),

  // Sidebar
  sidebar: $('sidebar'),

  // Header
  greetingText: $('greeting-text'),
  currentMonth: $('current-month'),
  addBtn: $('add-transaction-btn'),

  // Desktop summary
  totalIncome: $('total-income'),
  totalExpenses: $('total-expenses'),
  netBalance: $('net-balance'),
  incomeSub: $('income-sub'),
  expenseSub: $('expense-sub'),
  balanceSub: $('balance-sub'),

  // Mobile summary
  mobileBalance: $('mobile-balance'),
  mobileIncome: $('mobile-income'),
  mobileExpense: $('mobile-expense'),

  // Charts
  barCanvas: $('bar-chart-canvas'),
  doughnutCanvas: $('doughnut-chart-canvas'),
  doughnutLegend: $('doughnut-legend'),

  // Transactions
  tbody: $('transactions-body'),
  table: $('transactions-table'),
  emptyState: $('empty-state'),
  emptyAddBtn: $('empty-add-btn'),

  // Dashboard Preview Transactions
  dashboardPreviewBody: $('dashboard-preview-body'),
  dashboardPreviewTable: $('dashboard-preview-table'),
  dashboardEmptyState: $('dashboard-empty-state'),
  dashboardEmptyAddBtn: $('dashboard-empty-add-btn'),

  // Filters & Search
  filterAll: $('filter-all'),
  filterIncome: $('filter-income'),
  filterExpense: $('filter-expense'),
  filterAllLabel: $('filter-all-label'),
  filterIncomeLabel: $('filter-income-label'),
  filterExpenseLabel: $('filter-expense-label'),
  searchInput: $('search-input'),

  // Slide Panel
  slidePanel: $('slide-panel'),
  slidePanelOverlay: $('slide-panel-overlay'),
  panelTitle: $('panel-title'),
  panelForm: $('panel-form'),
  panelTypeIncome: $('panel-type-income'),
  panelTypeExpense: $('panel-type-expense'),
  panelDescription: $('panel-description'),
  panelAmount: $('panel-amount'),
  panelDate: $('panel-date'),
  panelSubmitBtn: $('panel-submit-btn'),
  panelCancelBtn: $('panel-cancel-btn'),
  panelCloseBtn: $('panel-close-btn'),

  // Delete Modal
  deleteOverlay: $('delete-modal-overlay'),
  modalCancelBtn: $('modal-cancel-btn'),
  modalConfirmBtn: $('modal-confirm-btn'),

  // Toast & Mobile Nav
  toastContainer: $('toast-container'),
  bottomNav: $('bottom-nav'),
  mobileAddBtn: $('mobile-add-btn'),

  // Reset button
  panelResetBtn: $('panel-reset-btn'),

  // View All link
  viewAllLink: $('view-all-link')
};

// ──────────────────────── Category Detection ────────────────────
/**
 * Auto-detect category and icon from description keywords.
 * @param {string} desc  Transaction description
 * @param {string} type  'income' | 'expense'
 * @returns {{ category: string, icon: string }}
 */
function detectCategory(desc, type) {
  const d = desc.toLowerCase();
  if (/salary|paycheck|wages/.test(d))                    return { category: 'Salary',       icon: 'salary_icon.png' };
  if (/groceries|grocery|supermarket|food/.test(d))       return { category: 'Food',         icon: 'groceries_icon.png' };
  if (/freelance|contract|project|consulting/.test(d))    return { category: 'Freelance',    icon: 'freelance_icon.png' };
  if (/subscription|netflix|spotify|youtube|premium/.test(d)) return { category: 'Subscription', icon: 'subscription_icon.png' };
  if (/dining|restaurant|dinner|lunch|cafe|coffee/.test(d))   return { category: 'Dining',       icon: 'dining_icon.png' };
  if (/shop|shopping|mall|store/.test(d))                 return { category: 'Shopping',     icon: 'expense_icon.png' };
  if (/transport|fuel|uber|ola|bus|metro|train/.test(d))  return { category: 'Transport',    icon: 'expense_icon.png' };
  if (/bill|electric|water|internet|phone|rent/.test(d))  return { category: 'Bills',        icon: 'expense_icon.png' };
  return type === 'income'
    ? { category: 'Other Income', icon: 'income_icon.png' }
    : { category: 'Other Expense', icon: 'expense_icon.png' };
}

// ──────────────────────── Utilities ─────────────────────────────

/** Generate a unique ID */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/** Format amount as Indian Rupee */
function fmtCurrency(n) {
  return '₹ ' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** Format ISO date to human-readable (Sep 12, 2026) */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Escape HTML for XSS prevention */
function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}

// ──────────────────────── Local Storage ──────────────────────────

function loadData() {
  try {
    state.transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { state.transactions = []; }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
}

// ──────────────────────── Toast Notifications ───────────────────

/**
 * Show a brief toast notification.
 * @param {string} msg   Text to display
 * @param {'success'|'error'|'info'} type
 */
function showToast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = 'toast';
  const colors = { success: 'var(--income-green)', error: 'var(--expense-red)', info: 'var(--primary-blue)' };
  el.style.borderLeft = `4px solid ${colors[type] || colors.info}`;
  el.textContent = msg;
  dom.toastContainer.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
}

// ──────────────────────── Greeting & Month ──────────────────────

function updateGreeting() {
  const h = new Date().getHours();
  let g = 'Good Evening';
  if (h >= 5 && h < 12)  g = 'Good Morning';
  else if (h >= 12 && h < 17) g = 'Good Afternoon';
  if (dom.greetingText) dom.greetingText.textContent = `${g}, User! 👋`;

  if (dom.currentMonth) {
    dom.currentMonth.textContent = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

// ──────────────────────── Summary Cards ─────────────────────────

function updateSummary() {
  const totals = state.transactions.reduce((a, t) => {
    if (t.type === 'income') a.income += t.amount;
    else a.expense += t.amount;
    return a;
  }, { income: 0, expense: 0 });

  const balance = totals.income - totals.expense;

  // Desktop cards
  if (dom.totalIncome)   dom.totalIncome.textContent   = fmtCurrency(totals.income);
  if (dom.totalExpenses) dom.totalExpenses.textContent  = fmtCurrency(totals.expense);
  if (dom.netBalance)    dom.netBalance.textContent     = (balance < 0 ? '-' : '') + fmtCurrency(balance);

  // Balance subtitle
  if (dom.balanceSub) {
    dom.balanceSub.textContent = balance >= 0 ? "You're doing great!" : "DUDE, EITHER YOU ARE BROKE OR YOU SUCK AT MATHS";
  }

  // Mobile hero
  if (dom.mobileBalance) dom.mobileBalance.textContent = (balance < 0 ? '-' : '') + fmtCurrency(balance);
  if (dom.mobileIncome)  dom.mobileIncome.textContent  = fmtCurrency(totals.income);
  if (dom.mobileExpense) dom.mobileExpense.textContent  = fmtCurrency(totals.expense);
}

// ──────────────────────── Transactions Rendering ────────────────

function getFilteredTransactions() {
  let list = [...state.transactions];

  // Type filter
  if (state.filter !== 'all') {
    list = list.filter(t => t.type === state.filter);
  }
  // Search filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(t => t.description.toLowerCase().includes(q));
  }
  // Sort by date descending
  list.sort((a, b) => new Date(b.date) - new Date(a.date));
  return list;
}

function renderTransactions() {
  const filtered = getFilteredTransactions();

  // ── Render Dashboard Preview (Max 5) ──
  const previewList = filtered.slice(0, 5);
  
  if (previewList.length === 0) {
    if (dom.dashboardPreviewTable) dom.dashboardPreviewTable.style.display = 'none';
    if (dom.dashboardEmptyState)   dom.dashboardEmptyState.style.display = '';
  } else {
    if (dom.dashboardPreviewTable) dom.dashboardPreviewTable.style.display = '';
    if (dom.dashboardEmptyState)   dom.dashboardEmptyState.style.display = 'none';
    
    dom.dashboardPreviewBody.innerHTML = previewList.map((t, i) => {
      const { icon } = detectCategory(t.description, t.type);
      const sign  = t.type === 'income' ? '+' : '-';
      const badge = t.type === 'income' ? 'badge-income' : 'badge-expense';
      const amtCl = t.type === 'income' ? 'amount-income' : 'amount-expense';

      return `
        <tr style="animation-delay:${i * 0.04}s">
          <td data-label="#">${i + 1}</td>
          <td data-label="Description">
            <div class="desc-cell">
              <img src="moneytrack_all_png_assets/${icon}" alt="" width="28" height="28" style="border-radius:6px;" />
              ${esc(t.description)}
            </div>
          </td>
          <td data-label="Type"><span class="badge ${badge}">${t.type}</span></td>
          <td data-label="Amount" class="${amtCl}">${sign}${fmtCurrency(t.amount)}</td>
          <td data-label="Date">${fmtDate(t.date)}</td>
          <td data-label="Actions">
            <div class="action-icons">
              <span data-action="edit" data-id="${t.id}" title="Edit">
                <img src="moneytrack_all_png_assets/edit_icon.png" alt="Edit" width="18" height="18" />
              </span>
              <span data-action="delete" data-id="${t.id}" title="Delete">
                <img src="moneytrack_all_png_assets/delete_icon.png" alt="Delete" width="18" height="18" />
              </span>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  // ── Render Full Transactions Table ──
  if (filtered.length === 0) {
    if (dom.table)      dom.table.style.display = 'none';
    if (dom.emptyState) dom.emptyState.style.display = '';
    return;
  }
  if (dom.table)      dom.table.style.display = '';
  if (dom.emptyState) dom.emptyState.style.display = 'none';

  // Build table rows
  dom.tbody.innerHTML = filtered.map((t, i) => {
    const { icon } = detectCategory(t.description, t.type);
    const sign  = t.type === 'income' ? '+' : '-';
    const badge = t.type === 'income' ? 'badge-income' : 'badge-expense';
    const amtCl = t.type === 'income' ? 'amount-income' : 'amount-expense';

    return `
      <tr style="animation-delay:${i * 0.04}s">
        <td data-label="#">${i + 1}</td>
        <td data-label="Description">
          <div class="desc-cell">
            <img src="moneytrack_all_png_assets/${icon}" alt="" width="28" height="28" style="border-radius:6px;" />
            ${esc(t.description)}
          </div>
        </td>
        <td data-label="Type"><span class="badge ${badge}">${t.type}</span></td>
        <td data-label="Amount" class="${amtCl}">${sign}${fmtCurrency(t.amount)}</td>
        <td data-label="Date">${fmtDate(t.date)}</td>
        <td data-label="Actions">
          <div class="action-icons">
            <span data-action="edit" data-id="${t.id}" title="Edit">
              <img src="moneytrack_all_png_assets/edit_icon.png" alt="Edit" width="18" height="18" />
            </span>
            <span data-action="delete" data-id="${t.id}" title="Delete">
              <img src="moneytrack_all_png_assets/delete_icon.png" alt="Delete" width="18" height="18" />
            </span>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ──────────────────────── Charts ────────────────────────────────

function updateCharts() {
  if (typeof Chart === 'undefined') return;

  // —— Bar Chart: Monthly Income vs Expenses (current year) ——
  const year = new Date().getFullYear();
  const monthly = Array.from({ length: 12 }, () => ({ income: 0, expense: 0 }));
  state.transactions.forEach(t => {
    const d = new Date(t.date);
    if (d.getFullYear() === year) monthly[d.getMonth()][t.type] += t.amount;
  });

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (dom.barCanvas) {
    if (state.charts.bar) state.charts.bar.destroy();
    // Set a reasonable height
    dom.barCanvas.parentElement.style.height = '260px';
    state.charts.bar = new Chart(dom.barCanvas, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'Income',  data: monthly.map(m => m.income),  backgroundColor: '#22c55e', borderRadius: 4, barPercentage: 0.6 },
          { label: 'Expenses', data: monthly.map(m => m.expense), backgroundColor: '#ef4444', borderRadius: 4, barPercentage: 0.6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 20 } } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => '₹' + v.toLocaleString('en-IN') }, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // —— Doughnut Chart: Expense Breakdown ——
  const catMap = { Food: 0, Shopping: 0, Transport: 0, Bills: 0, Others: 0 };
  const catColors = { Food: '#ef4444', Shopping: '#f97316', Transport: '#eab308', Bills: '#3b82f6', Others: '#8b5cf6' };

  state.transactions.forEach(t => {
    if (t.type !== 'expense') return;
    const { category } = detectCategory(t.description, 'expense');
    if (category === 'Food' || category === 'Dining') catMap.Food += t.amount;
    else if (category === 'Subscription' || category === 'Bills') catMap.Bills += t.amount;
    else if (category === 'Shopping') catMap.Shopping += t.amount;
    else if (category === 'Transport') catMap.Transport += t.amount;
    else catMap.Others += t.amount;
  });

  const labels = [], data = [], colors = [];
  const totalExp = Object.values(catMap).reduce((a, b) => a + b, 0);
  for (const [k, v] of Object.entries(catMap)) {
    if (v > 0) { labels.push(k); data.push(v); colors.push(catColors[k]); }
  }
  if (data.length === 0) {
    labels.push('No Expenses'); data.push(1); colors.push('#e5e7eb');
  }

  if (dom.doughnutCanvas) {
    if (state.charts.doughnut) state.charts.doughnut.destroy();
    dom.doughnutCanvas.parentElement.style.height = '260px';
    state.charts.doughnut = new Chart(dom.doughnutCanvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => `${ctx.label}: ${fmtCurrency(ctx.raw)} (${totalExp ? Math.round(ctx.raw / totalExp * 100) : 0}%)` }
          }
        }
      }
    });

    // Custom legend
    if (dom.doughnutLegend) {
      if (totalExp === 0) {
        dom.doughnutLegend.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No expense data</p>';
      } else {
        dom.doughnutLegend.innerHTML = labels.map((l, i) => {
          const pct = Math.round(data[i] / totalExp * 100);
          return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${colors[i]};display:inline-block;"></span>
            <span style="font-size:0.8rem;color:var(--text-dark);font-weight:500;">${l}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);margin-left:auto;">${pct}%</span>
          </div>`;
        }).join('');
      }
    }
  }
}

// ──────────────────────── Slide Panel ────────────────────────────

function openPanel(editId) {
  const isEdit = !!editId;

  // Reset form
  dom.panelForm.reset();

  if (isEdit) {
    const tx = state.transactions.find(t => t.id === editId);
    if (!tx) return;
    state.editingId = editId;
    dom.panelTitle.textContent    = 'Edit Transaction';
    dom.panelSubmitBtn.textContent = 'Save Changes';
    dom.panelDescription.value = tx.description;
    dom.panelAmount.value      = tx.amount;
    dom.panelDate.value        = tx.date;
    setTypeToggle(tx.type);
  } else {
    state.editingId = null;
    dom.panelTitle.textContent    = 'Add Transaction';
    dom.panelSubmitBtn.textContent = 'Add Transaction';
    dom.panelDate.value = new Date().toISOString().split('T')[0];
    setTypeToggle('income');
  }

  dom.slidePanel.classList.add('open');
  dom.slidePanelOverlay.classList.add('active');
  dom.panelDescription.focus();
}

function closePanel() {
  dom.slidePanel.classList.remove('open');
  dom.slidePanelOverlay.classList.remove('active');
  state.editingId = null;
  dom.panelForm.reset();
}

function setTypeToggle(type) {
  state.selectedType = type;
  // Income button
  dom.panelTypeIncome.classList.toggle('active-income', type === 'income');
  // Expense button
  dom.panelTypeExpense.classList.toggle('active-expense', type === 'expense');
}

function handleSubmit() {
  const description = dom.panelDescription.value.trim();
  const amount      = parseFloat(dom.panelAmount.value);
  const date        = dom.panelDate.value;
  const type        = state.selectedType;

  if (!description) { showToast('Please enter a description.', 'error'); dom.panelDescription.focus(); return; }
  if (isNaN(amount) || amount <= 0) { showToast('Please enter a valid amount.', 'error'); dom.panelAmount.focus(); return; }
  if (!date) { showToast('Please select a date.', 'error'); dom.panelDate.focus(); return; }

  const { category } = detectCategory(description, type);

  if (state.editingId) {
    const idx = state.transactions.findIndex(t => t.id === state.editingId);
    if (idx > -1) {
      state.transactions[idx] = { ...state.transactions[idx], description, amount, type, date, category };
      showToast('Transaction updated!', 'success');
    }
  } else {
    state.transactions.push({ id: genId(), description, amount, type, date, category });
    showToast('Transaction added!', 'success');
  }

  saveData();
  refreshUI();
  closePanel();
}

// ──────────────────────── Delete Modal ───────────────────────────

function openDeleteModal(id) {
  state.deleteTargetId = id;
  dom.deleteOverlay.classList.add('active');
}

function closeDeleteModal() {
  state.deleteTargetId = null;
  dom.deleteOverlay.classList.remove('active');
}

function confirmDelete() {
  if (!state.deleteTargetId) return;
  state.transactions = state.transactions.filter(t => t.id !== state.deleteTargetId);
  saveData();
  refreshUI();
  closeDeleteModal();
  showToast('Transaction deleted.', 'info');
}

// ──────────────────────── Filters (Radio Buttons) ────────────────

/**
 * Set the active filter type and update radio pill styling.
 * @param {string} type  'all' | 'income' | 'expense'
 */
function setFilter(type) {
  state.filter = type;
  // Update label active classes
  [dom.filterAllLabel, dom.filterIncomeLabel, dom.filterExpenseLabel].forEach(l => l && l.classList.remove('active'));
  if (type === 'all')     dom.filterAllLabel && dom.filterAllLabel.classList.add('active');
  if (type === 'income')  dom.filterIncomeLabel && dom.filterIncomeLabel.classList.add('active');
  if (type === 'expense') dom.filterExpenseLabel && dom.filterExpenseLabel.classList.add('active');
  renderTransactions();
}

// ──────────────────────── View Switching ────────────────────────────

function switchView(viewName) {
  // Hide all views
  if (dom.viewDashboard) dom.viewDashboard.style.display = 'none';
  if (dom.viewTransactions) dom.viewTransactions.style.display = 'none';

  // Show requested view
  if (viewName === 'dashboard' && dom.viewDashboard) {
    dom.viewDashboard.style.display = 'block';
  } else if (viewName === 'transactions' && dom.viewTransactions) {
    dom.viewTransactions.style.display = 'block';
  }

  // Update sidebar active link
  document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === viewName);
  });

  // Update mobile bottom nav active link
  document.querySelectorAll('#bottom-nav a[data-nav]').forEach(link => {
    link.classList.toggle('active', link.dataset.nav === viewName);
  });
}

// ──────────────────────── Responsive ────────────────────────────

function handleResize() {
  const w = window.innerWidth;
  document.body.classList.remove('mobile-view', 'tablet-view');
  if (w < 768) {
    document.body.classList.add('mobile-view');
  } else if (w < 1024) {
    document.body.classList.add('tablet-view');
  }
}

// ──────────────────────── Master Refresh ─────────────────────────

function refreshUI() {
  renderTransactions();
  updateSummary();
  updateCharts();
}

// ──────────────────────── Event Delegation ───────────────────────

function handleTableAction(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action, id } = el.dataset;
  if (action === 'edit')   openPanel(id);
  if (action === 'delete') openDeleteModal(id);
}

// ──────────────────────── Init ──────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadData();

  // Greeting & month
  updateGreeting();

  // Responsive
  handleResize();
  window.addEventListener('resize', handleResize);

  // Summary, table, charts
  refreshUI();

  // Header add button
  if (dom.addBtn) dom.addBtn.addEventListener('click', () => openPanel());

  // Empty state add button
  if (dom.emptyAddBtn) dom.emptyAddBtn.addEventListener('click', () => openPanel());

  // Mobile add button
  if (dom.mobileAddBtn) dom.mobileAddBtn.addEventListener('click', () => openPanel());

  // Slide panel
  dom.panelTypeIncome.addEventListener('click', () => setTypeToggle('income'));
  dom.panelTypeExpense.addEventListener('click', () => setTypeToggle('expense'));
  dom.panelCloseBtn.addEventListener('click', closePanel);
  dom.panelCancelBtn.addEventListener('click', closePanel);
  dom.slidePanelOverlay.addEventListener('click', closePanel);

  // Reset button — clears the input fields without closing the panel
  if (dom.panelResetBtn) {
    dom.panelResetBtn.addEventListener('click', () => {
      dom.panelForm.reset();
      dom.panelDate.value = new Date().toISOString().split('T')[0];
      setTypeToggle('income');
      dom.panelDescription.focus();
      showToast('Form fields cleared.', 'info');
    });
  }

  // Submit (button is outside form, so we use click instead of submit)
  dom.panelSubmitBtn.addEventListener('click', handleSubmit);

  // Delete modal
  dom.modalCancelBtn.addEventListener('click', closeDeleteModal);
  dom.modalConfirmBtn.addEventListener('click', confirmDelete);
  dom.deleteOverlay.addEventListener('click', (e) => { if (e.target === dom.deleteOverlay) closeDeleteModal(); });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closePanel(); closeDeleteModal(); }
  });

  // Filters — radio button change events
  document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => setFilter(e.target.value));
  });

  // Search
  dom.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTransactions();
  });

  // Search
  dom.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTransactions();
  });

  // Table action delegation (edit/delete buttons)
  if (dom.tbody) dom.tbody.addEventListener('click', handleTableAction);
  if (dom.dashboardPreviewBody) dom.dashboardPreviewBody.addEventListener('click', handleTableAction);

  // ── Sidebar Navigation ──
  const navLinks = document.querySelectorAll('.nav-links a[data-page]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(link.dataset.page);
    });
  });

  // ── Mobile Bottom Navigation ──
  const mobileNavLinks = document.querySelectorAll('#bottom-nav a[data-nav]');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(link.dataset.nav);
    });
  });

  // View All link — switches to transactions view
  if (dom.viewAllLink) {
    dom.viewAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('transactions');
      window.scrollTo(0, 0);
      // Also set filter to 'all' and check the radio
      if (dom.filterAll) dom.filterAll.checked = true;
      setFilter('all');
    });
  }
  
  // Also hook up transactions page add button
  const txAddBtn = document.getElementById('tx-add-btn');
  if (txAddBtn) txAddBtn.addEventListener('click', () => openPanel());
  
  // Hook up dashboard empty state add button
  if (dom.dashboardEmptyAddBtn) dom.dashboardEmptyAddBtn.addEventListener('click', () => openPanel());
});
