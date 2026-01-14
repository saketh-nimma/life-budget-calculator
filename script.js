let chart;

const sliders = document.querySelectorAll("input[type=range]");
sliders.forEach(slider => slider.addEventListener("input", update));

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

  const health =
    leftover > 500 ? "🟢 Excellent" :
    leftover > 0 ? "🟡 Stable" :
    "🔴 Risky";

  summary.innerHTML = `
    Monthly Expenses: $${expenses}<br>
    Monthly Savings: $${savings.toFixed(0)}<br>
    Leftover Cash: $${leftover.toFixed(0)}<br>
    Financial Health: <strong>${health}</strong>
  `;

  buildChart(savings);
}

function buildChart(monthlySavings) {
  const years = Array.from({ length: 10 }, (_, i) => i + 1);
  let total = 0;
  const savingsData = years.map(() => {
    total += monthlySavings * 12;
    return total;
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("budgetChart"), {
    type: "line",
    data: {
      labels: years,
      datasets: [{
        label: "Total Savings Over Time",
        data: savingsData,
        borderColor: "#16a34a",
        backgroundColor: "#16a34a33",
        fill: true,
        tension: 0.3,
        borderWidth: 3
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Element references
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
