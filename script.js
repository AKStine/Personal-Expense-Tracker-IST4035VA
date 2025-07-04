// script.js
let expenses = [];

const form = document.getElementById('expenseForm');
const nameInput = document.getElementById('expenseName');
const amountInput = document.getElementById('expenseAmount');
const expenseList = document.getElementById('expenseList');
const totalDisplay = document.getElementById('totalDisplay');
const feedback = document.getElementById('expenseFeedback');
const startTracker = document.getElementById('startTracker');
const trackerPage = document.getElementById('tracker');
const landingPage = document.getElementById('landing');
const reportChartCtx = document.getElementById('reportChart').getContext('2d');
const lineChartCtx = document.getElementById('lineChart').getContext('2d');
const pieChartCtx = document.getElementById('pieChart').getContext('2d');
const selectedCard = document.getElementById('selectedExpenseCard');
const recommendationsDiv = document.getElementById('recommendations');

let reportChart, lineChart, pieChart;

startTracker?.addEventListener('click', () => {
  landingPage.classList.add('hidden');
  trackerPage.classList.remove('hidden');
});

form?.addEventListener('submit', function (e) {
  e.preventDefault();
  addExpense();
});

document.getElementById('generateReport')?.addEventListener('click', generateReport);

function addExpense() {
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = new Date().toISOString().split('T')[0];

  if (!name || isNaN(amount) || amount <= 0) {
    alert('Please enter valid expense name and positive amount.');
    return;
  }

  const expense = { name, amount, date };
  expenses.push(expense);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  nameInput.value = '';
  amountInput.value = '';
  renderExpenses();
}

function renderExpenses() {
  expenseList.innerHTML = '';
  feedback.innerHTML = '';
  let total = 0;

  expenses.forEach((expense, index) => {
    total += expense.amount;

    const li = document.createElement('li');
    li.innerHTML = `
      ${expense.name} - KES ${expense.amount.toLocaleString()} 
      <button onclick="deleteExpense(${index})">Delete</button>
    `;
    expenseList.appendChild(li);

    // Feedback comment
    const rating = getSpendingRating(expense.amount);
    const comment = document.createElement('div');
    comment.innerHTML = `💬 <strong>${expense.name}</strong>: ${rating}`;
    feedback.appendChild(comment);
  });

  totalDisplay.textContent = `Total: KES ${total.toLocaleString()}`;
}

function getSpendingRating(amount) {
  if (amount > 10000) return '💸 Whoa! That’s some heavy spending! Watch your wallet!';
  if (amount > 5000) return '🧾 That’s reasonable, but keep an eye on the pattern.';
  return '🟢 Frugal move! Smart spending champ!';
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
}

function generateReport() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  const filtered = expenses.filter(e => (!start || e.date >= start) && (!end || e.date <= end));

  const totalsByName = {};
  const totalsByDate = {};

  filtered.forEach(e => {
    totalsByName[e.name] = (totalsByName[e.name] || 0) + e.amount;
    totalsByDate[e.date] = (totalsByDate[e.date] || 0) + e.amount;
  });

  const labels = Object.keys(totalsByName);
  const data = Object.values(totalsByName);

  if (reportChart) reportChart.destroy();
  reportChart = new Chart(reportChartCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ label: 'KES Spent', data: data, backgroundColor: '#1e3a8a' }]
    },
    options: { responsive: true }
  });

  // Line Chart by Date
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(lineChartCtx, {
    type: 'line',
    data: {
      labels: Object.keys(totalsByDate),
      datasets: [{ label: 'KES Spent Per Day', data: Object.values(totalsByDate), borderColor: '#d97706', fill: false }]
    }
  });

  // Pie Chart by Category
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieChartCtx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{ data: data, backgroundColor: ['#1e3a8a', '#065f46', '#d97706', '#ef4444', '#f59e0b'] }]
    }
  });

  const total = data.reduce((a, b) => a + b, 0);
  const average = total / (new Set(filtered.map(e => e.date)).size || 1);

  recommendationsDiv.innerHTML = `
    <h4>Recommendations</h4>
    <p>You spent an average of KES ${average.toLocaleString()} per day in this period.</p>
    ${average > 5000 ? '<p>📉 Try setting a tighter daily spending goal.</p>' : '<p>📈 Keep it up! Your spending is in control.</p>'}
  `;

  // Example interaction card
  selectedCard.innerHTML = `
    <h4>Spending Insight</h4>
    <p>Top Category: <strong>${labels[0] || 'N/A'}</strong> — KES ${data[0]?.toLocaleString() || 0}</p>
  `;
}

window.onload = () => {
  const saved = localStorage.getItem('expenses');
  if (saved) expenses = JSON.parse(saved);
  renderExpenses();
};
