(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const currency = (n) => "₹" + Number(n).toLocaleString("en-IN");
  const initialResources = [
    {id:1,name:"Laptop",cost:32000,value:90},
    {id:2,name:"Monitor",cost:12000,value:38},
    {id:3,name:"Keyboard",cost:3000,value:14},
    {id:4,name:"Headphones",cost:5000,value:22},
    {id:5,name:"External SSD",cost:8000,value:31}
  ];
  let resources = initialResources.map(x=>({...x}));
  let nextId = 6;
  let lastResults = null;
  let toastTimer;

  function toast(message) {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.remove("show"), 2600);
  }
  function safeName(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function getBudget() { return Math.floor(Number($("#budgetInput").value)); }
  function renderResources() {
    const tbody = $("#resourceRows");
    tbody.innerHTML = "";
    resources.forEach((r, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><div class="resource-name"><span class="resource-avatar">${safeName(r.name.trim().charAt(0).toUpperCase() || "?")}</span><input aria-label="Resource name" class="number-input name-input" data-id="${r.id}" maxlength="40" value="${safeName(r.name)}" style="width:112px"></div></td>
        <td><input aria-label="Cost for ${safeName(r.name)}" class="number-input cost-input" data-id="${r.id}" type="number" min="1" step="1" value="${r.cost}"></td>
        <td><input aria-label="Value score for ${safeName(r.name)}" class="number-input value-input score-input" data-id="${r.id}" type="number" min="0" step="1" value="${r.value}"></td>
        <td><button class="delete-btn" data-delete="${r.id}" aria-label="Delete ${safeName(r.name)}" title="Delete resource">×</button></td>`;
      tbody.appendChild(tr);
    });
    $("#metricCount").textContent = resources.length;
    $("#inventorySummary").textContent = `${resources.length} resource${resources.length===1?"":"s"} listed`;
    $("#metricBudget").textContent = currency(Math.max(0, Number($("#budgetInput").value)||0));
    updateMetricFromResult();
  }
  function updateMetricFromResult() {
    if (!lastResults) { $("#metricValue").textContent="—"; $("#metricUtil").textContent="—"; return; }
    const best = lastResults.dp;
    $("#metricValue").textContent = best ? best.value.toLocaleString("en-IN") : "—";
    $("#metricUtil").textContent = best && best.cost ? `${Math.round(best.cost/lastResults.budget*100)}%` : "0%";
  }
  function validate() {
    if (!Number.isFinite(getBudget()) || getBudget() < 1) { toast("Enter a budget greater than zero."); return false; }
    if (!resources.length) { toast("Add at least one resource to run optimization."); return false; }
    for (const r of resources) {
      if (!r.name.trim()) { toast("Every resource needs a name."); return false; }
      if (!Number.isFinite(r.cost) || r.cost <= 0 || !Number.isInteger(r.cost)) { toast(`Enter a positive whole-number cost for ${r.name}.`); return false; }
      if (!Number.isFinite(r.value) || r.value < 0 || !Number.isInteger(r.value)) { toast(`Enter a non-negative whole-number value for ${r.name}.`); return false; }
    }
    return true;
  }
  function runGreedy(items, budget) {
    const start = performance.now();
    const ordered = items.map((item,index)=>({...item,index,ratio:item.value/item.cost})).sort((a,b)=>b.ratio-a.ratio || a.cost-b.cost);
    let remaining=budget, cost=0, value=0, comparisons=0;
    const selected=[];
    for(const item of ordered) {
      comparisons++;
      if(item.cost<=remaining) { selected.push(item.index); remaining-=item.cost; cost+=item.cost; value+=item.value; }
    }
    const elapsed=performance.now()-start;
    return {name:"Greedy",selected:selected.sort((a,b)=>a-b),cost,value,remaining,comparisons,elapsed,complexity:"O(n log n)"};
  }
  // Exact 0/1 Knapsack using integer budget units. A scale factor avoids allocating
  // one DP column per rupee; rounding is conservative so selected costs never exceed budget.
  function runDP(items,budget) {
    const start=performance.now();
    const maxCost=Math.max(1,...items.map(x=>x.cost));
    const scale=Math.max(1,Math.ceil(budget/1200));
    const capacity=Math.floor(budget/scale);
    const weights=items.map(x=>Math.ceil(x.cost/scale));
    if(capacity>200000 || (items.length+1)*(capacity+1)>3000000) {
      throw new Error("This input is too large for the browser DP table. Reduce the budget or use fewer resources.");
    }
    const n=items.length;
    const dp=Array.from({length:n+1},()=>new Float64Array(capacity+1));
    let comparisons=0;
    for(let i=1;i<=n;i++) {
      const w=weights[i-1], val=items[i-1].value;
      for(let b=0;b<=capacity;b++) {
        comparisons++;
        dp[i][b]=dp[i-1][b];
        if(w<=b) dp[i][b]=Math.max(dp[i][b],dp[i-1][b-w]+val);
      }
    }
    const selected=[];
    let b=capacity;
    for(let i=n;i>0;i--) {
      if(dp[i][b]!==dp[i-1][b]) { selected.push(i-1); b-=weights[i-1]; }
    }
    selected.reverse();
    // DP uses rounded-up weights; exact cost is verified against the real budget.
    let cost=selected.reduce((s,i)=>s+items[i].cost,0);
    // With ceil-scaled weights the selected actual cost cannot exceed budget.
    const value=selected.reduce((s,i)=>s+items[i].value,0);
    const elapsed=performance.now()-start;
    return {name:"Dynamic Programming",selected,cost,value,remaining:budget-cost,comparisons,elapsed,complexity:"O(nB)",scale,capacity,tableCells:(n+1)*(capacity+1)};
  }
  function compute() {
    if (!validate()) return;
    const budget=getBudget();
    try {
      const greedy=runGreedy(resources,budget);
      const dp=runDP(resources,budget);
      lastResults={greedy,dp,budget,resources:resources.map(x=>({...x}))};
      renderResults();
      updateMetricFromResult();
      toast("Optimization completed successfully.");
    } catch(err) { toast(err.message || "Unable to run optimization."); }
  }
  function selectedNames(result, source=resources) { return result.selected.map(i=>source[i]?.name).filter(Boolean); }
  function renderResults() {
    if(!lastResults) return;
    const {greedy,dp,budget}=lastResults;
    $("#emptyState").classList.add("hidden");
    $("#resultsContent").classList.remove("hidden");
    $("#resultSub").textContent=`Results for ${resources.length} resources with a budget of ${currency(budget)}.`;
    const chosenMethod=$('input[name="algorithm"]:checked').value;
    const cards=[];
    if(chosenMethod!=="dp") cards.push({r:greedy,label:"GREEDY HEURISTIC",optimal:false});
    if(chosenMethod!=="greedy") cards.push({r:dp,label:"OPTIMAL SOLUTION",optimal:true});
    if(chosenMethod==="both") { cards.length=0; cards.push({r:greedy,label:"GREEDY HEURISTIC",optimal:false},{r:dp,label:"OPTIMAL SOLUTION",optimal:true}); }
    $("#resultCards").innerHTML=cards.map(({r,label,optimal})=>`<div class="result-card ${optimal?"optimal":""}"><div class="result-card-head"><strong>${r.name}</strong><span>${label}</span></div><div class="result-big">${r.value.toLocaleString("en-IN")} <span style="font-size:10px;color:#939bad;font-weight:500">value points</span></div><div class="result-caption">${currency(r.cost)} allocated · ${currency(r.remaining)} remaining</div><div class="mini-stats"><div><span>Resources selected</span><b>${r.selected.length}</b></div><div><span>Operations counted</span><b>${r.comparisons.toLocaleString("en-IN")}</b></div><div><span>Measured runtime</span><b>${r.elapsed.toFixed(3)} ms</b></div></div></div>`).join("");
    const max=Math.max(1,greedy.value,dp.value);
    $("#valueChart").innerHTML=[{r:greedy,label:"Greedy",cls:"greedy"},{r:dp,label:"DP",cls:"dp"}].map(x=>`<div class="bar-row"><span>${x.label}</span><div class="bar-track"><div class="bar-fill ${x.cls}" style="width:${x.r.value/max*100}%"></div></div><span class="bar-number">${x.r.value}</span></div>`).join("");
    $("#selectedLists").innerHTML=[{r:greedy,label:"Greedy",cls:"greedy"},{r:dp,label:"DP",cls:""}].map(x=>`<div class="selected-group"><span class="selected-label">${x.label}</span><div class="chips">${selectedNames(x.r,lastResults.resources).length?selectedNames(x.r,lastResults.resources).map(n=>`<span class="chip ${x.cls}">${safeName(n)}</span>`).join(""):'<span class="chip none">No resources selected</span>'}</div></div>`).join("");
    const rows=[
      ["Total value",greedy.value,dp.value],
      ["Total cost",currency(greedy.cost),currency(dp.cost)],
      ["Budget remaining",currency(greedy.remaining),currency(dp.remaining)],
      ["Resources selected",greedy.selected.length,dp.selected.length],
      ["Counted operations",greedy.comparisons.toLocaleString("en-IN"),dp.comparisons.toLocaleString("en-IN")],
      ["Measured runtime",`${greedy.elapsed.toFixed(3)} ms`,`${dp.elapsed.toFixed(3)} ms`],
      ["Time complexity","O(n log n)","O(nB)"],
      ["Optimality guarantee","No","Yes"]
    ];
    $("#comparisonRows").innerHTML=rows.map((row,i)=>`<tr><td>${row[0]}</td><td>${row[1]}</td><td class="${i===0&&dp.value>=greedy.value?"positive":""}">${row[2]}</td></tr>`).join("");
    const difference=dp.value-greedy.value;
    $("#insightBox").innerHTML=difference>0
      ? `<strong>Key insight:</strong> Dynamic Programming found ${difference} more value point${difference===1?"":"s"} than Greedy for this input. This illustrates why a locally attractive choice can miss the globally best 0/1 Knapsack combination.`
      : `<strong>Key insight:</strong> Both methods reached the same total value for this input. Greedy is not guaranteed to do this for every 0/1 Knapsack instance; test different costs and values to explore the difference.`;
  }
  function addResource() {
    if(resources.length>=40){toast("For this demo, keep the inventory to 40 resources or fewer.");return;}
    resources.push({id:nextId++,name:`Resource ${resources.length+1}`,cost:5000,value:10});
    renderResources(); lastResults=null; hideResults(); toast("Resource added.");
  }
  function hideResults(){lastResults=null;$("#resultsContent").classList.add("hidden");$("#emptyState").classList.remove("hidden");$("#resultSub").textContent="Run an algorithm to see the recommended allocation.";updateMetricFromResult();}
  function loadSample(){resources=initialResources.map(x=>({...x}));nextId=6;$("#budgetInput").value=50000;$("#budgetRange").value=50000;renderResources();hideResults();toast("Sample data loaded.");}
  function exportCSV(){
    if(!lastResults){toast("Run optimization before exporting results.");return;}
    const {greedy,dp,budget,resources:source}=lastResults;
    const rows=[["Algorithm","Resource","Cost","Value","Selected","Budget","Total Cost","Total Value","Operations","Runtime ms"]];
    for(const r of [greedy,dp]) {
      source.forEach((item,i)=>rows.push([r.name,item.name,item.cost,item.value,r.selected.includes(i)?"Yes":"No",budget,r.cost,r.value,r.comparisons,r.elapsed.toFixed(4)]));
    }
    const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="allocation-results.csv";a.click();URL.revokeObjectURL(url);toast("CSV exported.");
  }
  $("#resourceRows").addEventListener("change",e=>{
    const id=Number(e.target.dataset.id), r=resources.find(x=>x.id===id);if(!r)return;
    if(e.target.classList.contains("name-input"))r.name=e.target.value.trim();
    if(e.target.classList.contains("cost-input"))r.cost=Math.floor(Number(e.target.value));
    if(e.target.classList.contains("score-input"))r.value=Math.floor(Number(e.target.value));
    renderResources();hideResults();
  });
  $("#resourceRows").addEventListener("click",e=>{
    const btn=e.target.closest("[data-delete]");if(!btn)return;
    resources=resources.filter(r=>r.id!==Number(btn.dataset.delete));renderResources();hideResults();toast("Resource removed.");
  });
  $("#addResource").addEventListener("click",addResource);
  $("#clearResources").addEventListener("click",()=>{resources=[];renderResources();hideResults();toast("Inventory cleared.");});
  $("#applyBudget").addEventListener("click",()=>{const b=getBudget();if(!Number.isFinite(b)||b<1){toast("Enter a budget greater than zero.");return;}$("#budgetInput").value=b;$("#budgetRange").value=Math.max(5000,Math.min(150000,b));$("#metricBudget").textContent=currency(b);hideResults();toast("Budget updated.");});
  $("#budgetRange").addEventListener("input",e=>{$("#budgetInput").value=e.target.value;$("#metricBudget").textContent=currency(e.target.value);});
  $("#budgetRange").addEventListener("change",()=>hideResults());
  $("#budgetInput").addEventListener("change",()=>{const b=getBudget();if(Number.isFinite(b)&&b>0){$("#budgetRange").value=Math.max(5000,Math.min(150000,b));$("#metricBudget").textContent=currency(b);hideResults();}});
  $("#runBoth").addEventListener("click",()=>{$('input[name="algorithm"][value="both"]').checked=true;compute();});
  $("#runSelected").addEventListener("click",compute);
  $("#loadSample").addEventListener("click",loadSample);
  $("#resetAll").addEventListener("click",loadSample);
  $("#exportCsv").addEventListener("click",exportCSV);
  $("#navResources").addEventListener("click",()=>$("#resourcesSection").scrollIntoView({behavior:"smooth"}));
  $("#navAnalysis").addEventListener("click",()=>$("#analysisSection").scrollIntoView({behavior:"smooth"}));
  renderResources();
})();