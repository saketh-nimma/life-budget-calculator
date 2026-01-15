let currentScenario = "A";
let scenarios = {
  A: {},
  B: {}
};

let netChart, allocationChart;

window.onload = () => {
  ["income", "expense", "savings", "return"].forEach(id => {
    syncInputs(id);
  });

  setScenario("A");
};

function syncInputs(id) {
  const range = document.getElementById(id + "Range");
  const num = document.getElementById(id + "Num");

  range.value = num.value = getDefault(id);

  range.oninput = () => num.value = range.value;
  num.oninput = () => range.value = num.value;
}

function getDefault(id) {
  return { income: 4500, expense: 2500, savings: 20, return: 7 }[id];
}

function setScenario(s) {
  currentScenario = s;
  document.getElementById("btnA").classList.toggle("active", s === "A");
  document.getElementById("btnB").classList.toggle("active", s === "B");

  if (scenarios[s].income) loadScenario(s);
}

function saveScenario() {
  scenarios[currentScenario] = getInputs();
  updateCharts();
}

function getInputs() {
  return {
    income: +incomeNum.value,
    expense: +expenseNum.value,
    savings: +savingsNum.value,
    return: +returnNum.value
  };
}

function loadScenario(s) {
  const d = scenarios[s];
  incomeNum.value = incomeRange.value = d.income;
  expenseNum.value = expenseRange.value = d.expense;
  savingsNum.value = savingsRange.value = d.savings;
  returnNum.value = returnRange.value = d.return;
}

function calculateNetWorth(d) {
  let total = 0, arr = [];
  let yearly = (d.income * d.savings / 100) * 12;

  for (let i = 0; i < 30; i++) {
    total = total * (1 + d.return / 100) + yearly;
    arr.push(Math.round(total));
  }
  return arr;
}

function updateCharts() {
  const years = Array.from({ length: 30 }, (_, i) => i + 1);

  if (netChart) netChart.destroy();
  netChart = new Chart(netChartCanvas, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        scenarios.A.income && {
          label: "Scenario A",
          data: calculateNetWorth(scenarios.A),
          borderColor: "#2563eb"
        },
        scenarios.B.income && {
          label: "Scenario B",
          data: calculateNetWorth(scenarios.B),
          borderColor: "#16a34a"
        }
      ].filter(Boolean)
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  if (allocationChart) allocationChart.destroy();
  allocationChart = new Chart(allocationChartCanvas, {
    type: "doughnut",
    data: {
      labels: ["Expenses", "Savings"],
      datasets: [{
        data: [
          scenarios[currentScenario].expense,
          scenarios[currentScenario].income *
          scenarios[currentScenario].savings / 100
        ],
        backgroundColor: ["#ef4444", "#16a34a"]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function downloadCSV() {
  let csv = "Scenario,Income,Expenses,Savings %,Return %\n";
  ["A", "B"].forEach(s => {
    if (scenarios[s].income) {
      const d = scenarios[s];
      csv += `${s},${d.income},${d.expense},${d.savings},${d.return}\n`;
    }
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "finance_comparison.csv";
  a.click();
}
