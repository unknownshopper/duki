const db = {
  locations: [
    { id: "sucursal_1", name: "Sucursal 1" },
    { id: "sucursal_2", name: "Sucursal 2" },
    { id: "entrenamiento", name: "Entrenamiento" },
  ],
  payments: ["efectivo", "tarjeta", "transferencia", "wallet"],
  sales: [],
};

function qs(sel) {
  return document.querySelector(sel);
}

function money(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(n);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ymd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function seedMockSales() {
  const now = new Date();
  const days = 35;

  for (let i = 0; i < 260; i++) {
    const dayOffset = randInt(0, days);
    const when = new Date(now);
    when.setDate(now.getDate() - dayOffset);
    when.setHours(randInt(10, 23), randInt(0, 59), randInt(0, 59), 0);

    const locationId = pick(db.locations).id;
    const method = pick(db.payments);
    const amount = randInt(60, 850);

    db.sales.push({
      id: `sale_${i}`,
      at: when.getTime(),
      date: ymd(when),
      locationId,
      method,
      amount,
    });
  }

  db.sales.sort((a, b) => b.at - a.at);
}

function addLiveSale() {
  const now = new Date();
  const locationId = pick(db.locations).id;
  const method = pick(db.payments);
  const amount = randInt(45, 520);

  db.sales.unshift({
    id: `live_${Math.random().toString(16).slice(2)}`,
    at: now.getTime(),
    date: ymd(now),
    locationId,
    method,
    amount,
  });
}

function rangeToStart(range) {
  const now = new Date();
  const start = startOfDay(now);

  if (range === "today") return start.getTime();
  if (range === "week") {
    start.setDate(start.getDate() - 6);
    return start.getTime();
  }
  if (range === "month") {
    start.setDate(start.getDate() - 29);
    return start.getTime();
  }
  return start.getTime();
}

function filterSales({ range, locationId }) {
  const startAt = rangeToStart(range);
  return db.sales.filter((s) => {
    if (s.at < startAt) return false;
    if (locationId !== "all" && s.locationId !== locationId) return false;
    return true;
  });
}

function sum(arr) {
  return arr.reduce((acc, x) => acc + x, 0);
}

function groupBy(arr, keyFn) {
  const m = new Map();
  for (const x of arr) {
    const k = keyFn(x);
    const bucket = m.get(k);
    if (bucket) bucket.push(x);
    else m.set(k, [x]);
  }
  return m;
}

function fmtTime(ms) {
  const d = new Date(ms);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function renderKpis(sales) {
  const total = sum(sales.map((s) => s.amount));
  const count = sales.length;
  const avg = count ? total / count : 0;

  qs("#kpis").textContent = `Ventas: ${money(total)} — Tickets: ${count} — Ticket promedio: ${money(avg)}`;

  const byMethod = groupBy(sales, (s) => s.method);
  const methods = Array.from(byMethod.entries())
    .map(([method, rows]) => ({ method, total: sum(rows.map((r) => r.amount)) }))
    .sort((a, b) => b.total - a.total);

  const byLoc = groupBy(sales, (s) => s.locationId);
  const locs = Array.from(byLoc.entries())
    .map(([loc, rows]) => ({ loc, total: sum(rows.map((r) => r.amount)) }))
    .sort((a, b) => b.total - a.total);

  const locName = (id) => db.locations.find((l) => l.id === id)?.name ?? id;

  const methodLine = methods
    .map((m) => `${m.method}: ${money(m.total)}`)
    .join(" — ");

  const locLine = locs.map((l) => `${locName(l.loc)}: ${money(l.total)}`).join(" — ");

  qs("#breakdown").textContent = `${methodLine}\n${locLine}`;
}

function renderDailyReport(sales) {
  const byDay = groupBy(sales, (s) => s.date);
  const days = Array.from(byDay.entries())
    .map(([date, rows]) => ({
      date,
      total: sum(rows.map((r) => r.amount)),
      count: rows.length,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const ul = document.createElement("ul");
  for (const d of days) {
    const li = document.createElement("li");
    li.textContent = `${d.date} — ${money(d.total)} (${d.count} tickets)`;
    ul.appendChild(li);
  }

  const host = qs("#dailyReport");
  host.innerHTML = "";
  host.appendChild(ul);
}

function renderLiveFeed(sales) {
  const locName = (id) => db.locations.find((l) => l.id === id)?.name ?? id;

  const ul = document.createElement("ul");
  for (const s of sales.slice(0, 12)) {
    const li = document.createElement("li");
    li.textContent = `${fmtTime(s.at)} — ${locName(s.locationId)} — ${money(s.amount)} — ${s.method}`;
    ul.appendChild(li);
  }

  const host = qs("#liveFeed");
  host.innerHTML = "";
  host.appendChild(ul);
}

function renderAll() {
  const range = qs("#rangeSelect").value;
  const locationId = qs("#locationSelect").value;
  const sales = filterSales({ range, locationId });

  renderKpis(sales);
  renderDailyReport(sales);
  renderLiveFeed(sales);
}

function boot() {
  seedMockSales();
  renderAll();

  qs("#filtersForm").addEventListener("submit", (e) => {
    e.preventDefault();
    renderAll();
  });

  // Ventas en vivo (simulado)
  setInterval(() => {
    addLiveSale();
    renderAll();
  }, 5000);
}

boot();
