let lineChart = null;
let pieChart = null;

document.getElementById("calculateBtn").addEventListener("click", calculate);

function calculate() {
  const income = Number(document.getElementById("income").value);
  const expenses = Number(document.getElementById("expenses").value);
  const savingsRate = Number(document.getElementById("savingsRate").value) / 100;
  const returnRate = Number(document.getElementById("returnRate").value) / 100;

  const monthlySavings = income * savingsRate;
  const yearlySavings = monthlySavings * 12;

  // Summary
  document.getElementById("summaryText").innerHTML = `
    Monthly Savings: $${monthlySavings.toFixed(0)}<br>
    Yearly Savings: $${yearlySavings.toFixed(0)}<br>
    Remaining After Expenses: $${(income - expenses - monthlySavings).toFixed(0)}
  `;

  buildLineChart(yearlySavings, returnRate);
  buildPieChart(expenses, monthlySavings);
}

function buildLineChart(yearlySavings, returnRate) {
  const years = [];
  const netWorth = [];

  let total = 0;
  for (let i = 1; i <= 30; i++) {
    total = total * (1 + returnRate) + yearlySavings;
    years.push(i);
    netWorth.push(Math.round(total));
  }

  if (lineChart) lineChart.destroy();

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: years,
      datasets: [{
        label: "Net Worth ($)",
        data: netWorth,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.25)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function buildPieChart(expenses, savings) {
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: {
      labels: ["Expenses", "Savings"],
      datasets: [{
        data: [expenses, savings],
        backgroundColor: ["#ef4444", "#16a34a"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// Initial render
calculate();
