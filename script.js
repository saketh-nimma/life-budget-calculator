let currentScenario = "A";
let scenarios = { A: null, B: null };
let netChart = null;
let allocationChart = null;

window.addEventListener("DOMContentLoaded", () => {
  // Grab canvas elements AFTER DOM is loaded
  const netChartCanvas = document.getElementById("netChart");
  const allocationChartCanvas = document.getElementById("allocationChart");

  // Sync inputs
  ["income", "expense", "savings", "return"].forEach(id => {
    syncInputs(id);
  });

  setScenario("A");

  function syncInputs(id) {
    const range = document.getElementById(id + "Range");
    const num = document.getElementById(id + "Num");
    const defaultVal = { income: 4500, expense: 2500, savings: 20, return: 7 }[id];
    range.value = num.value = defaultVal;

    range.addEventListener("input", () => {
      num.value = range.value;
      updateCharts();
    });

    num.addEventListener("input", () => {
      range.value = num.value;
      updateCharts();
    });
  }

  function setScenario(s) {
    currentScenario = s;
    document.getElementById("btnA").classList.toggle("active", s === "A");
    document.getElementById("btnB").classList.toggle("active", s === "B");

    if (scenarios[s]) loadScenario(s);
    updateCharts();
  }

  function saveScenario() {
    scenarios[currentScenario] = getInputs();
    alert(`Scenario ${currentScenario} saved!`);
    updateCharts();
  }

  function loadScenario(s) {
    const d = scenarios[s];
    incomeNum.value = incomeRange.value = d.income;
    expenseNum.value = expenseRange.value = d.expense;
    savingsNum.value = savingsRange.value = d.savings;
    returnNum.value = returnRange.value = d.return;
  }

  function getInputs() {
    return {
      income: +incomeNum.value,
      expense: +expenseNum.value,
      savings: +savingsNum.value,
      return: +returnNum.value
    };
  }

  function calculateNetWorth(d) {
    const yearlySavings = d.income * d.savings / 100 * 12;
    let total = 0;
    let arr = [];
    for (let i = 1; i <= 30; i++) {
      total = total * (1 + d.return / 100) + yearlySavings;
      arr.push(Math.round(total));
    }
    return arr;
  }

  function updateCharts() {
    const years = Array.from({ length: 30 }, (_, i) => i + 1);

    // Net Worth Chart
    if (netChart) netChart.destroy();
    netChart = new Chart(netChartCanvas, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          scenarios.A && {
            label: "Scenario A",
            data: calculateNetWorth(scenarios.A),
            borderColor: "#2563eb",
            fill: false
          },
          scenarios.B && {
            label: "Scenario B",
            data: calculateNetWorth(scenarios.B),
            borderColor: "#16a34a",
            fill: false
          }
        ].filter(Boolean)
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Allocation Chart
    if (allocationChart) allocationChart.destroy();
    if (scenarios[currentScenario]) {
      const d = scenarios[currentScenario];
      allocationChart = new Chart(allocationChartCanvas, {
        type: "doughnut",
        data: {
          labels: ["Expenses", "Savings"],
          datasets: [{
            data: [d.expense, d.income * d.savings / 100],
            backgroundColor: ["#ef4444", "#16a34a"]
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  window.saveScenario = saveScenario;
  window.setScenario = setScenario;
  window.downloadCSV = function() {
    let csv = "Scenario,Income,Expenses,Savings %,Return %\n";
    ["A","B"].forEach(s => {
      if (scenarios[s]) {
        const d = scenarios[s];
        csv += `${s},${d.income},${d.expense},${d.savings},${d.return}\n`;
      }
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "finance_comparison.csv";
    a.click();
  };
});
