window.addEventListener("DOMContentLoaded", () => {
let netChart, allocationChart, projectionData = [];
let scenarios = [];

const inputs = ["income","rent","food","transport","savings","return","inflation"];
const inputEls = inputs.map(id => document.getElementById(id));
const inputNums = inputs.map(id => document.getElementById(id+"Num"));
const valSpans = inputs.map(id => document.getElementById(id+"Val"));

const healthCard = document.getElementById("healthCard");
const emergencyCard = document.getElementById("emergencyCard");
const summaryCard = document.getElementById("summaryCard");
const insightText = document.getElementById("insightText");

const netWorthChart = document.getElementById("netWorthChart");
const allocationChartCanvas = document.getElementById("allocationChart");
const scenarioList = document.getElementById("scenarioList");
const saveButton = document.getElementById("saveScenario");

// --- Sync sliders and number inputs ---
function syncSliderAndNumber(slider, numberInput) {
  slider.addEventListener("input", () => {
    numberInput.value = slider.value;
    update();
  });
  numberInput.addEventListener("input", () => {
    let val = Number(numberInput.value);
    if(val<Number(slider.min)) val=Number(slider.min);
    if(val>Number(slider.max)) val=Number(slider.max);
    numberInput.value=val;
    slider.value=val;
    update();
  });
}
for(let i=0;i<inputs.length;i++) syncSliderAndNumber(inputEls[i],inputNums[i]);

// --- Get current input values ---
function getCurrentValues(){
  let obj = {};
  for(let i=0;i<inputs.length;i++) obj[inputs[i]] = +inputEls[i].value;
  return obj;
}

// --- Update dashboard & charts ---
function update(){
  const {income,rent,food,transport,savings,return:ret, inflation} = getCurrentValues();
  const savingsRate = savings/100;
  const returnRate = ret/100;
  const inflationRate = inflation/100;

  valSpans.forEach((span,i)=> span.textContent=inputEls[i].value);

  const expenses = rent+food+transport;
  const saveAmount = income*savingsRate;
  const leftover = income-expenses-saveAmount;

  updateHealth(leftover);
  updateEmergency(expenses, saveAmount);
  updateSummary(income, expenses, saveAmount, leftover);

  buildNetWorthChart(saveAmount, returnRate, inflationRate);
  buildAllocationChart(rent, food, transport, saveAmount);
  generateInsight(income, expenses, saveAmount);
}

// --- Dashboard ---
function updateHealth(leftover){
  const score = Math.max(0, Math.min(100, 50+leftover/10));
  healthCard.style.background = score>70?"#dcfce7":score>40?"#fef3c7":"#fee2e2";
  healthCard.innerHTML=`Financial Health<br><strong>${Math.round(score)}/100</strong>`;
}
function updateEmergency(expenses,savings){
  const months = (savings*12)/expenses;
  emergencyCard.style.background = months>=6?"#dcfce7":months>=3?"#fef3c7":"#fee2e2";
  emergencyCard.innerHTML=`Emergency Fund<br>${months.toFixed(1)} months`;
}
function updateSummary(income,expenses,savings,leftover){
  summaryCard.innerHTML=`Income: $${income}<br>Expenses: $${expenses}<br>Savings: $${savings.toFixed(0)}<br>Remaining: $${leftover.toFixed(0)}`;
}

// --- Charts ---
function buildNetWorthChart(monthlySavings, r, inflation){
  let total=0;
  projectionData=[];
  const years=[];
  for(let i=1;i<=30;i++){
    total = total*(1+r-inflation)+monthlySavings*12;
    years.push(i);
    projectionData.push(Math.round(total));
  }
  if(netChart) netChart.destroy();

  const datasets = scenarios.length>0 ? scenarios.map(s=>({
    label: s.name,
    data: s.projection,
    borderColor: s.color,
    backgroundColor: s.color+"33",
    fill:true,
    tension:0.35,
    borderWidth:3
  })):[{
    label:"Current Plan",
    data: projectionData,
    borderColor:"#2563eb",
    backgroundColor:"#2563eb33",
    fill:true,
    tension:0.35,
    borderWidth:3
  }];

  netChart = new Chart(netWorthChart,{type:"line",data:{labels:years,datasets:datasets},options:{responsive:true,maintainAspectRatio:false}});
}

function buildAllocationChart(rent,food,transport,savings){
  if(allocationChart) allocationChart.destroy();
  allocationChart = new Chart(allocationChartCanvas,{
    type:"doughnut",
    data:{labels:["Housing","Food","Transport","Savings"],datasets:[{data:[rent,food,transport,savings],backgroundColor:["#ef4444","#f59e0b","#3b82f6","#16a34a"]}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}}
  });
}

// --- Insights ---
function generateInsight(income,expenses,savings){
  if(expenses>income*0.6){
    insightText.textContent="High fixed expenses limit growth. Reduce housing for biggest impact.";
  } else if(savings<income*0.1){
    insightText.textContent="Increase savings by 5% to dramatically grow wealth via compounding.";
  } else {
    insightText.textContent="Your financial structure supports stability and long-term growth.";
  }
}

// --- Save Scenario ---
saveButton.addEventListener("click",()=>{
  const values = getCurrentValues();
  const name = prompt("Enter scenario name:","Scenario "+(scenarios.length+1));
  if(!name) return;
  const color = "#"+Math.floor(Math.random()*16777215).toString(16);
  const projection=[];
  let total=0;
  const r = values.return/100;
  const inflationRate = values.inflation/100;
  const monthlySavings = values.income*values.savings/100;
  for(let i=1;i<=30;i++){total=total*(1+r-inflationRate)+monthlySavings*12; projection.push(Math.round(total));}
  scenarios.push({name,projection,color});
  updateScenarioList();
  update();
});

// --- Update Scenario List ---
function updateScenarioList(){
  scenarioList.innerHTML="";
  scenarios.forEach((s,i)=>{
    const li=document.createElement("li");
    li.textContent=s.name;
    li.style.borderLeft="6px solid "+s.color;
    li.addEventListener("click",()=>{
      netChart.data.datasets=[{label:s.name,data:s.projection,borderColor:s.color,backgroundColor:s.color+"33",fill:true,tension:0.35,borderWidth:3}];
      netChart.update();
    });
    scenarioList.appendChild(li);
  });
}

// --- Download ---
function downloadPlan(){
  const plan={current:getCurrentValues(),scenarios:scenarios};
  const blob=new Blob([JSON.stringify(plan,null,2)],{type:"application/json"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="financial_plan.json";
  link.click();
}

// --- Initialize ---
update();
});
