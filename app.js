const STORAGE_KEY = "mapaSocialCafeAter.demo.v1";
let records = [];
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function loadRecords() {
  try { records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { records = []; }
}
function saveRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    showToast("Não foi possível salvar neste navegador. Verifique o armazenamento disponível.");
    return false;
  }
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}
function scoreOf(r) {
  return Number(r.urgency || 0) + Number(r.impact || 0) + Number(r.barrier || 0) + Number(r.persistence || 0);
}
function priorityOf(r) {
  const score = scoreOf(r);
  if (Number(r.urgency) === 2 || score >= 6) return { label: "Revisão prioritária", cls: "priority-high" };
  if (score >= 3) return { label: "Acompanhamento programado", cls: "priority-mid" };
  return { label: "Monitoramento", cls: "priority-low" };
}
function switchView(view) {
  $$(".view").forEach(el => el.classList.toggle("hidden", el.id !== `view-${view}`));
  $$(".tab").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  if (view === "dashboard") renderDashboard();
  if (view === "families") renderFamilies();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$$(".tab").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));

$("#diagnosticForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const code = data.familyCode.trim().toUpperCase();
  if (records.some(r => r.familyCode === code)) {
    showToast("Esse código já existe neste dispositivo. Use o cadastro existente ou informe outro código de teste.");
    return;
  }
  if (records.length >= 50) {
    showToast("Este protótipo foi configurado para até 50 registros. Exporte os dados fictícios ou remova registros de teste.");
    return;
  }
  data.familyCode = code;
  data.id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  data.createdAt = new Date().toISOString();
  data.updatedAt = data.createdAt;
  data.score = scoreOf(data);
  data.priority = priorityOf(data).label;
  records.unshift(data);
  if (saveRecords()) {
    form.reset();
    renderDashboard();
    showToast("Registro demonstrativo salvo somente neste navegador.");
    switchView("families");
  }
});

function renderDashboard() {
  $("#metricFamilies").textContent = records.length;
  $("#metricComplete").textContent = records.filter(r => r.familyCode && r.category && r.demand).length;
  $("#metricPriority").textContent = records.filter(r => priorityOf(r).cls === "priority-high" && r.review === "Pendente de revisão").length;
  $("#metricOpen").textContent = records.filter(r => r.status !== "Concluída").length;

  const categories = ["Social e acesso a direitos","Produção e processamento","Comercialização","Organização coletiva","Infraestrutura","Formação e assistência técnica"];
  const counts = categories.map(category => ({ category, count: records.filter(r => r.category === category).length }));
  const max = Math.max(1, ...counts.map(x => x.count));
  $("#categoryBars").innerHTML = counts.some(x => x.count) ? counts.map(x => `
    <div class="bar-row"><div class="bar-label"><span>${escapeHTML(x.category)}</span><strong>${x.count}</strong></div>
    <div class="bar-track"><div class="bar-fill" style="width:${(x.count/max)*100}%"></div></div></div>`).join("") : '<p class="empty">Ainda não há registros neste dispositivo. Cadastre um diagnóstico ou carregue exemplos fictícios.</p>';

  const actions = [...records].filter(r => r.status !== "Concluída").sort((a,b) => scoreOf(b)-scoreOf(a)).slice(0,4);
  $("#nextActions").innerHTML = actions.length ? actions.map(r => `
    <div class="action-item"><strong>${escapeHTML(r.familyCode)} · ${escapeHTML(r.category)}</strong>
    <small>${escapeHTML(r.deadline || "Prazo a definir")} · ${escapeHTML(r.review || "Pendente de revisão")}</small>
    <small>${escapeHTML(r.demand)}</small></div>`).join("") : '<p class="empty">Cadastre um diagnóstico para começar.</p>';
}
function renderFamilies() {
  const query = ($("#searchInput").value || "").toLowerCase().trim();
  const status = $("#statusFilter").value;
  const filtered = records.filter(r => {
    const hay = [r.familyCode,r.reference,r.community,r.category,r.demand].join(" ").toLowerCase();
    return (!query || hay.includes(query)) && (!status || r.status === status);
  });
  $("#familyList").innerHTML = filtered.length ? filtered.map(r => {
    const priority = priorityOf(r);
    return `<article class="family-card">
      <div class="family-top"><div><h3>${escapeHTML(r.familyCode)} · ${escapeHTML(r.reference)}</h3><p>${escapeHTML(r.community || "Comunidade não informada")} · preenchido por ${escapeHTML(r.respondent)}</p></div><span class="priority-badge ${priority.cls}">${priority.label}</span></div>
      <div class="family-details">
        <div class="detail"><small>Categoria</small><strong>${escapeHTML(r.category)}</strong></div>
        <div class="detail"><small>Pontuação indicativa</small><strong>${scoreOf(r)} / 8 · revisar</strong></div>
        <div class="detail"><small>Status</small><strong>${escapeHTML(r.status)}</strong></div>
      </div>
      <p class="family-demand"><strong>Demanda:</strong> ${escapeHTML(r.demand)}</p>
      <p class="family-demand"><strong>Ação inicial:</strong> ${escapeHTML(r.action || "A definir com a família")}</p>
      <p class="family-demand"><strong>Revisão técnica:</strong> ${escapeHTML(r.review || "Pendente de revisão")}</p>
      <div class="family-actions">
        <label class="muted">Atualizar status <select data-status-id="${r.id}"><option ${r.status==="Aberta"?"selected":""}>Aberta</option><option ${r.status==="Em acompanhamento"?"selected":""}>Em acompanhamento</option><option ${r.status==="Encaminhada"?"selected":""}>Encaminhada</option><option ${r.status==="Concluída"?"selected":""}>Concluída</option></select></label>
        <label class="muted">Revisão <select data-review-id="${r.id}"><option ${r.review==="Pendente de revisão"?"selected":""}>Pendente de revisão</option><option ${r.review==="Revisada — manter prioridade"?"selected":""}>Revisada — manter prioridade</option><option ${r.review==="Revisada — ajustar prioridade"?"selected":""}>Revisada — ajustar prioridade</option><option ${r.review==="Encaminhada para avaliação específica"?"selected":""}>Encaminhada para avaliação específica</option></select></label>
        <button class="button button-quiet" data-delete-id="${r.id}" type="button">Excluir registro de teste</button>
      </div>
    </article>`;
  }).join("") : '<p class="empty">Nenhum registro corresponde à busca.</p>';

  $$("[data-status-id]").forEach(el => el.addEventListener("change", () => updateRecord(el.dataset.statusId, { status: el.value })));
  $$("[data-review-id]").forEach(el => el.addEventListener("change", () => updateRecord(el.dataset.reviewId, { review: el.value })));
  $$("[data-delete-id]").forEach(el => el.addEventListener("click", () => {
    if (confirm("Excluir este registro fictício deste navegador?")) {
      records = records.filter(r => r.id !== el.dataset.deleteId);
      saveRecords(); renderFamilies(); renderDashboard(); showToast("Registro excluído deste navegador.");
    }
  }));
}
function updateRecord(id, changes) {
  const record = records.find(r => r.id === id);
  if (!record) return;
  Object.assign(record, changes, { updatedAt: new Date().toISOString() });
  record.score = scoreOf(record);
  record.priority = priorityOf(record).label;
  saveRecords(); renderFamilies(); renderDashboard(); showToast("Registro atualizado neste dispositivo.");
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
$("#searchInput").addEventListener("input", renderFamilies);
$("#statusFilter").addEventListener("change", renderFamilies);

$("#demoBtn").addEventListener("click", () => {
  if (records.length && !confirm("Adicionar exemplos fictícios aos registros já existentes?")) return;
  const examples = [
    {familyCode:"DEMO-001",reference:"Família Exemplo A",community:"Comunidade Fictícia Norte",respondent:"Técnica",householdSize:"3",workers:"2",food:"Não relatada dificuldade",services:"Alguma dificuldade",rights:"Precisa de orientação",infrastructure:"Requer melhoria",coffeeArea:"1.2",productionKg:"900",processing:"Coletiva",sales:"Venda direta",productionChallenges:"Exemplo fictício: melhorar a estrutura de secagem.",category:"Produção e processamento",urgency:"1",impact:"2",barrier:"1",persistence:"1",deadline:"Até 30 dias",demand:"Exemplo fictício: avaliar estrutura compartilhada de secagem.",action:"Conversar com o grupo e levantar alternativas.",review:"Pendente de revisão",status:"Aberta",technicalNote:"Dado inteiramente fictício."},
    {familyCode:"DEMO-002",reference:"Família Exemplo B",community:"Comunidade Fictícia Sul",respondent:"Produtor(a)",householdSize:"2",workers:"1",food:"Não relatada dificuldade",services:"Sem barreira relatada",rights:"Sem demanda identificada",infrastructure:"Adequadas segundo relato",coffeeArea:"0.8",productionKg:"500",processing:"Terceirizada",sales:"Cooperativa/associação",productionChallenges:"Exemplo fictício: ampliar canais de comercialização.",category:"Comercialização",urgency:"0",impact:"1",barrier:"1",persistence:"1",deadline:"Até 90 dias",demand:"Exemplo fictício: conhecer opções de comercialização coletiva.",action:"Incluir tema em encontro técnico.",review:"Pendente de revisão",status:"Em acompanhamento",technicalNote:"Dado inteiramente fictício."},
    {familyCode:"DEMO-003",reference:"Família Exemplo C",community:"Comunidade Fictícia Central",respondent:"Técnica",householdSize:"4",workers:"2",food:"Dificuldade ocasional",services:"Barreira importante",rights:"Barreira importante",infrastructure:"Requer melhoria",coffeeArea:"1.5",productionKg:"700",processing:"Ainda não possui",sales:"Intermediário",productionChallenges:"Exemplo fictício: dificuldade de acesso a serviços e infraestrutura.",category:"Social e acesso a direitos",urgency:"2",impact:"2",barrier:"2",persistence:"2",deadline:"Avaliar imediatamente",demand:"Exemplo fictício: demanda que requer avaliação profissional prioritária.",action:"Validar a situação e definir encaminhamento adequado.",review:"Pendente de revisão",status:"Aberta",technicalNote:"Exemplo de teste. Não descreve uma família real."}
  ];
  let added = 0;
  for (const ex of examples) {
    if (records.length >= 50) break;
    if (!records.some(r => r.familyCode === ex.familyCode)) {
      ex.id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      ex.createdAt = new Date().toISOString(); ex.updatedAt = ex.createdAt;
      ex.score = scoreOf(ex); ex.priority = priorityOf(ex).label;
      records.push(ex); added++;
    }
  }
  saveRecords(); renderDashboard(); renderFamilies();
  showToast(added ? `${added} exemplos fictícios adicionados.` : "Os exemplos já existem ou o limite de 50 registros foi atingido.");
});

$("#exportBtn").addEventListener("click", () => {
  if (!records.length) { showToast("Não há registros locais para exportar."); return; }
  const columns = ["familyCode","reference","community","respondent","householdSize","workers","food","services","rights","infrastructure","coffeeArea","productionKg","processing","sales","productionChallenges","category","urgency","impact","barrier","persistence","score","priority","deadline","demand","action","review","status","technicalNote","createdAt","updatedAt"];
  const csvCell = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
  const csv = [columns.join(","), ...records.map(r => columns.map(c => csvCell(r[c])).join(","))].join("\r\n");
  const blob = new Blob(["\ufeff" + csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "mapa-social-cafe-dados-de-teste.csv"; a.click();
  URL.revokeObjectURL(url);
  showToast("CSV exportado. Lembre-se: os registros são locais e, neste protótipo, devem ser fictícios.");
});

function setConnectionStatus() {
  const el = $("#connectionStatus");
  el.textContent = navigator.onLine ? "● Online" : "● Offline";
  el.style.background = navigator.onLine ? "#e6f0e8" : "#fff1d8";
  el.style.color = navigator.onLine ? "#326847" : "#94620c";
}
window.addEventListener("online", setConnectionStatus);
window.addEventListener("offline", setConnectionStatus);
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
loadRecords(); setConnectionStatus(); renderDashboard();
