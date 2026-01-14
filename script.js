let lineChart, pieChart;
let mode = "savings";

const sliders = document.querySelectorAll("input[type=range]");
sliders.forEach(s => s.addEventListener("input", update));

function setMode(m) {
  mode = m;
  update();
}

function update() {
  const income = +incomeSlider.value;
  const rent = +rentSlider.value;
  const food = +foodSlider.value;
  const transport = +transportSlider.value;
  const savingsRate = +savingsSlider.value / 100;

  incomeVal.textContent = income;
  rentVal.textContent = rent;
  foodVal.textContent = food;
  transportVal.textContent = transport;
  saveVal.textContent = savingsRate * 100;

  const expenses = rent + food + transport;
  const savings = income * savingsRate;
  const leftover = income - expenses - savings;

  updateWarning(leftover);
  updateSummary(income, expenses, savings, leftover);
  buildLineChart(savings, leftover);
  buildPieChart(rent, food, transport, savings);
}

function updateWarning(leftover) {
  const warning = document.getElementById("warning");

  if (leftover < 0) {
    warning.style.background = "#fee2e2";
    warning.textContent = "⚠️ You are spending more than you earn.";
  } else if (leftover < 300) {
    warning.style.background = "#fef3c7";
    warning.textContent = "⚠️ Very little buffer for emergencies.";
  } else {
    warning.style.background = "#dcfce7";
    warning.textContent = "✅ Healthy monthly cash flow.";
  }
}

function updateSummary(income, expenses, savings, leftover) {
  summary.innerHTML = `
    Income: $${income}<br>
    Expenses: $${expenses}<br>
    Savings: $${savings.toFixed(0)}<br>
    Remaining Cash: $${leftover.toFixed(0)}
  `;
}

function buildLineChart(monthlySavings, leftover) {
  const years = Array.from({ length: 10 }, (_, i) => i + 1);
  let total = 0;

  const data = years.map(() => {
    total += mode === "savings"
      ? monthlySavings * 12
      : (monthlySavings * 12) + (leftover * 12);
    return total;
  });

  if (lineChart) lineChart.destroy();

  lineChart = new Chart(budgetChart, {
    type: "line",
    data: {
      labels: years,
      datasets: [{
        label: mode === "savings" ? "Total Savings ($)" : "Net Worth ($)",
        data: data,
        borderColor: "#16a34a",
        backgroundColor: "#16a34a33",
        fill: true,
        tension: 0.35,
        borderWidth: 3
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx =>
              `$${ctx.raw.toLocaleString()} after ${ctx.label} years`
          }
        }
      },
      scales: {
        x: { title: { display: true, text: "Years" } },
        y: { title: { display: true, text: "Total Dollars ($)" } }
      }
    }
  });
}

function buildPieChart(rent, food, transport, savings) {
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(expenseChart, {
    type: "doughnut",
    data: {
      labels: ["Rent", "Food", "Transport", "Savings"],
      datasets: [{
        data: [rent, food, transport, savings],
        backgroundColor: [
          "#ef4444",
          "#f59e0b",
          "#3b82f6",
          "#16a34a"
        ]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// DOM references
const incomeSlider = document.getElementById("income");
const rentSlider = document.getElementById("rent");
const foodSlider = document.getElementById("food");
const transportSlider = document.getElementById("transport");
const savingsSlider = document.getElementById("savings");

const incomeVal = document.getElementById("incomeVal");
const rentVal = document.getElementById("rentVal");
const foodVal = document.getElementById("foodVal");
const transportVal = document.getElementById("transportVal");
const saveVal = document.getElementById("saveVal");
const summary = document.getElementById("summary");

update();
