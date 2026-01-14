let netChart, allocationChart, projectionData = [];

const sliders = document.querySelectorAll("input[type=range]");
sliders.forEach(slider => slider.addEventListener("input", update));

function update() {
  const income = +incomeEl.value;
  const rent = +rentEl.value;
  const food = +foodEl.value;
  const transport = +transportEl.value;
  const savingsRate = +savingsEl.value / 100;
  const returnRate = +returnEl.value / 100;
  const inflation = +inflationEl.value / 100;

  incomeVal.textContent = income;
  rentVal.textContent = rent;
  foodVal.textContent = food;
  transportVal.textContent = transport;
  saveVal.textContent = savingsRate * 100;
  returnVal.textContent = returnRate * 100;
  inflationVal.textContent = inflation * 100;

  const expenses = rent + food + transport;
  const savings = income * savingsRate;
  const leftover = income - expenses - savings;

  updateHealth(leftover);
  updateEmergency(expenses, savings);
  updateSummary(income, expenses, savings, leftover);
  buildNetWorthChart(savings, returnRate, inflation);
  buildAllocationChart(rent, food, transport, savings);
  generateInsight(income, expenses, savings);
}

function updateHealth(leftover) {
  const score = Math.max(0, Math.min(100, 50 + leftover / 10));
  healthCard.style.background =
    score > 70 ? "#dcfce7" :
    score > 40 ? "#fef3c7" :
    "#fee2e2";
  healthCard.innerHTML = `Financial Health<br><strong>${Math.round(score)}/100</strong>`;
}

function updateEmergency(expenses, savings) {
  const months = (savings * 12) / expenses;
  emergencyCard.style.background =
    months >= 6 ? "#dcfce7" :
    months >= 3 ? "#fef3c7" :
    "#fee2e2";
  emergencyCard.innerHTML = `Emergency Fund<br>${months.toFixed(1)} months`;
}

function updateSummary(income, expenses, savings, leftover) {
  summaryCard.innerHTML = `
    Income: $${income}<br>
    Expenses: $${expenses}<br>
    Savings: $${savings.toFixed(0)}<br>
    Remaining: $${leftover.toFixed(0)}
  `;
}

function buildNetWorthChart(monthlySavings, r, inflation) {
  let total = 0;
  projectionData = [];
  const years = [];

  for (let i = 1; i <= 30; i++) {
    total = total * (1 + r - inflation) + monthlySavings * 12;
    years.push(i);
    projectionData.push(Math.round(total));
  }

  if (netChart) netChart.destroy();

  netChart = new Chart(netWorthChart, {
    type: "line",
    data: {
      labels: years,
      datasets: [{
        label: "Projected Net Worth",
        data: projectionData,
        borderColor: "#2563eb",
        backgroundColor: "#2563eb33",
        fill: true,
        tension: 0.35,
        borderWidth: 3
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `$${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: { title: { display: true, text: "Years" } },
        y: { title: { display: true, text: "Dollars ($)" } }
      }
    }
    options: {
  responsive: true,
  maintainAspectRatio: false
}
  });
}

function buildAllocationChart(rent, food, transport, savings) {
  if (allocationChart) allocationChart.destroy();

  allocationChart = new Chart(allocationChartCanvas, {
    type: "doughnut",
    data: {
      labels: ["Housing", "Food", "Transport", "Savings"],
      datasets: [{
        data: [rent, food, transport, savings],
        backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#16a34a"]
      }]
    }
  });
}

function generateInsight(income, expenses, savings) {
  if (expenses > income * 0.6) {
    insightText.textContent =
      "High fixed expenses are limiting growth. Reducing housing costs has the greatest long-term impact.";
  } else if (savings < income * 0.1) {
    insightText.textContent =
      "Increasing savings by just 5% dramatically accelerates long-term wealth due to compounding.";
  } else {
    insightText.textContent =
      "Your financial structure supports stability and long-term growth.";
  }
}

function downloadPlan() {
  const plan = {
    income: incomeEl.value,
    rent: rentEl.value,
    food: foodEl.value,
    transport: transportEl.value,
    savingsRate: savingsEl.value,
    returnRate: returnEl.value,
    inflation: inflationEl.value,
    projection: projectionData
  };

  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "financial_plan.json";
  link.click();
}

// DOM references
const incomeEl = document.getElementById("income");
const rentEl = document.getElementById("rent");
const foodEl = document.getElementById("food");
const transportEl = document.getElementById("transport");
const savingsEl = document.getElementById("savings");
const returnEl = document.getElementById("return");
const inflationEl = document.getElementById("inflation");

const incomeVal = document.getElementById("incomeVal");
const rentVal = document.getElementById("rentVal");
const foodVal = document.getElementById("foodVal");
const transportVal = document.getElementById("transportVal");
const saveVal = document.getElementById("saveVal");
const returnVal = document.getElementById("returnVal");
const inflationVal = document.getElementById("inflationVal");

const healthCard = document.getElementById("healthCard");
const emergencyCard = document.getElementById("emergencyCard");
const summaryCard = document.getElementById("summaryCard");
const insightText = document.getElementById("insightText");

const netWorthChart = document.getElementById("netWorthChart");
const allocationChartCanvas = document.getElementById("allocationChart");

update();
