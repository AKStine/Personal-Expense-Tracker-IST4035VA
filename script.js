// script.js
let expenses = [];

const form = document.getElementById('expenseForm');
const nameInput = document.getElementById('expenseName');
const amountInput = document.getElementById('expenseAmount');
const expenseList = document.getElementById('expenseList');
const totalDisplay = document.getElementById('totalDisplay');
const landingPage = document.getElementById('landing');
const trackerPage = document.getElementById('tracker');
const startTracker = document.getElementById('startTracker');
const reportChartCtx = document.getElementById('reportChart').getContext('2d');
const recommendationsDiv = document.getElementById('recommendations');

let reportChart;

startTracker.addEventListener('click', () => {
  landingPage.classList.add('hidden');
  trackerPage.classList.remove('hidden');
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  addExpense();
});

document.getElementById('generateReport').addEventListener('click', generateReport);

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
  let total = 0;

  expenses.forEach((expense, index) => {
    total += expense.amount;

    const li = document.createElement('li');
    li.innerHTML = `
      ${expense.name} - KES ${expense.amount.toLocaleString()} 
      <button onclick="deleteExpense(${index})">Delete</button>
    `;
    expenseList.appendChild(li);
  });

  totalDisplay.textContent = `Total: KES ${total.toLocaleString()}`;
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
  filtered.forEach(e => {
    totalsByName[e.name] = (totalsByName[e.name] || 0) + e.amount;
  });

  const labels = Object.keys(totalsByName);
  const data = Object.values(totalsByName);

  if (reportChart) reportChart.destroy();

  reportChart = new Chart(reportChartCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'KES Spent',
        data: data,
        backgroundColor: '#1e3a8a',
      }]
    },
    options: {
      responsive: true,
    }
  });

  // Simple recommendation logic
  const total = data.reduce((a, b) => a + b, 0);
  const average = total / (new Set(filtered.map(e => e.date)).size || 1);
  recommendationsDiv.innerHTML = `
    <h4>Recommendations</h4>
    <p>You spent an average of KES ${average.toLocaleString()} per day in this period.</p>
    ${average > 5000 ? '<p>Consider setting a tighter daily spending goal.</p>' : '<p>Great job managing your expenses!</p>'}
  `;
}

// Load from local storage on page load
window.onload = () => {
  const saved = localStorage.getItem('expenses');
  if (saved) expenses = JSON.parse(saved);
  renderExpenses();
};
