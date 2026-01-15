let netChart = null;
let pieChart = null;

// Wait until page + Chart.js load
window.onload = () => {
  syncInputs("incomeRange", "incomeNum");
  syncInputs("expenseRange", "expenseNum");
  syncInputs("savingsRange", "savingsNum");
  syncInputs("returnRange", "returnNum");

  updateSimulation();
};

// Sync slider <-> number input
function syncInputs(rangeId, numId) {
  const range = document.getElementById(rangeId);
  const num = document.getElementById(numId);

  range.addEventListener("input", () => {
    num.value = range.value;
    updateSimulation();
  });

  num.addEventListener("input", () => {
    range.value = num.value;
    updateSimulation();
  });
}

function updateSimulation() {
  const income = Number(document.getElementById("incomeNum").value);
  const expenses = Number(document.getElementById("expenseNum").value);
  const savingsRate = Number(document.getElementById("savingsNum").value) / 100;
  const returnRate = Number(document.getElementById("returnNum").value) / 100;

  const monthlySavings = income * savingsRate;
  const yearlySavings = monthlySavings * 12;

  document.getElementById("summaryText").innerHTML = `
    Monthly Savings: <strong>$${monthlySavings.toFixed(0)}</strong><br>
    Yearly Savings: <strong>$${yearlySavings.toFixed(0)}</strong><br>
    Remaining Income: <strong>$${(income - expenses - monthlySavings).toFixed(0)}</strong>
  `;

  drawNetWorthChart(yearlySavings, returnRate);
  drawAllocationChart(expenses, monthlySavings);
}

function drawNetWorthChart(yearlySavings, returnRate) {
  let years = [];
  let values = [];
  let total = 0;

  for (let i = 1; i <= 30; i++) {
    total = total * (1 + returnRate) + yearlySavings;
    years.push(i);
    values.push(Math.round(total));
  }

  if (netChart) netChart.destroy();

  netChart = new Chart(document.getElementById("netWorthChart"), {
    type: "line",
    data: {
      labels: years,
      datasets: [{
        label: "Net Worth ($)",
        data: values,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.25)",
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      }
    }
  });
}

function drawAllocationChart(expenses, savings) {
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(document.getElementById("allocationChart"), {
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
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}
