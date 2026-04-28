const db = {
  members: [
    {
      id: "m_001",
      phoneOrNumber: "5512345678",
      name: "Alberto García",
      category: "vip",
      pin: "1234",
      balance: 850,
    },
    {
      id: "m_002",
      phoneOrNumber: "5587654321",
      name: "Sofía Hernández",
      category: "general",
      pin: "4321",
      balance: 120,
    },
  ],
  products: [
    { id: "p_001", name: "Agua", basePrice: 25, categories: ["general", "vip"] },
    { id: "p_002", name: "Cerveza", basePrice: 80, categories: ["general", "vip"] },
    { id: "p_003", name: "Energético", basePrice: 95, categories: ["vip"] },
    { id: "p_004", name: "Hamburguesa", basePrice: 160, categories: ["general", "vip"] },
  ],
  categoryDiscountPct: {
    general: 0,
    vip: 15,
    ahijado: 10,
    colaborador: 20,
  },
};

const state = {
  station: null,
  loc: null,
  staff: null,
  member: null,
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

function computePrice(product, category) {
  const pct = db.categoryDiscountPct[category] ?? 0;
  const discounted = product.basePrice * (1 - pct / 100);
  return Math.round(discounted * 100) / 100;
}

function show(el, v) {
  el.hidden = !v;
}

function setError(msg) {
  const el = qs("#loginError");
  if (!msg) {
    el.style.display = "none";
    el.textContent = "";
    return;
  }
  el.style.display = "block";
  el.textContent = msg;
}

function parseQuery() {
  const u = new URL(window.location.href);
  return {
    station: u.searchParams.get("station") || "station_demo",
    loc: u.searchParams.get("loc") || "sucursal_1",
    staff: u.searchParams.get("staff") || "mesero_01",
    tap: u.searchParams.get("tap"),
  };
}

function nowMs() {
  return Date.now();
}

function tokenKey({ station, loc, staff }) {
  return `duki_demo2_token:${station}:${loc}:${staff}`;
}

function issueDemoToken(ctx) {
  const expiresAt = nowMs() + 10 * 60 * 1000;
  const token = `${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
  const payload = { token, expiresAt };
  sessionStorage.setItem(tokenKey(ctx), JSON.stringify(payload));
  return payload;
}

function readDemoToken(ctx) {
  const raw = sessionStorage.getItem(tokenKey(ctx));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isTokenValid(payload) {
  if (!payload) return false;
  if (!payload.expiresAt) return false;
  return nowMs() < payload.expiresAt;
}

function renderMember() {
  const m = state.member;
  const disc = db.categoryDiscountPct[m.category] ?? 0;
  qs("#memberMeta").textContent = `${m.name} — categoría: ${m.category} — saldo: ${money(m.balance)} — descuento: ${disc}%`;

  const menu = qs("#menu");
  menu.innerHTML = "";

  const allowed = db.products.filter((p) => p.categories.includes(m.category));
  const ul = document.createElement("ul");

  for (const p of allowed) {
    const li = document.createElement("li");
    const finalPrice = computePrice(p, m.category);
    li.textContent = `${p.name} — ${money(finalPrice)} (base ${money(p.basePrice)})`;
    ul.appendChild(li);
  }

  menu.appendChild(ul);
}

function showNotAvailable(details) {
  show(qs("#notAvailable"), true);
  show(qs("#stationCard"), false);
  show(qs("#loginCard"), false);
  show(qs("#memberCard"), false);
  qs("#naDetails").textContent = details;
}

function showLogin() {
  show(qs("#notAvailable"), false);
  show(qs("#stationCard"), true);
  show(qs("#loginCard"), true);
  show(qs("#memberCard"), false);
  setError("");
  qs("#idInput").focus();
}

function showMember() {
  show(qs("#notAvailable"), false);
  show(qs("#stationCard"), true);
  show(qs("#loginCard"), false);
  show(qs("#memberCard"), true);
  renderMember();
}

function boot() {
  const ctx = parseQuery();
  state.station = ctx.station;
  state.loc = ctx.loc;
  state.staff = ctx.staff;

  const meta = `Ubicación: ${state.loc} — Staff: ${state.staff} — Estación: ${state.station}`;
  qs("#stationMeta").textContent = meta;

  // DEMO ONLY:
  // - Si viene `?tap=1`, emitimos un token temporal (simula “llegó por NFC”) y dejamos continuar.
  // - Si no viene `tap=1` y no hay token válido en sessionStorage, mostramos “No disponible”.
  if (ctx.tap === "1") {
    issueDemoToken(state);
  }

  const token = readDemoToken(state);
  if (!isTokenValid(token)) {
    showNotAvailable(`${meta}. Token expirado o inexistente.`);
    return;
  }

  showLogin();

  const loginForm = qs("#loginForm");
  const topupForm = qs("#topupForm");
  const logoutBtn = qs("#logoutBtn");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = qs("#idInput").value.trim();
    const pin = qs("#pinInput").value.trim();

    const member = db.members.find((m) => m.phoneOrNumber === id);
    if (!member) {
      setError("Socio no encontrado.");
      return;
    }

    if (pin !== member.pin) {
      setError("PIN incorrecto.");
      return;
    }

    state.member = member;
    showMember();
  });

  topupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!state.member) return;

    const raw = qs("#topupAmount").value.trim().replace(/,/g, ".");
    const amount = Number(raw);

    if (!Number.isFinite(amount) || amount <= 0) return;

    state.member.balance = Math.round((state.member.balance + amount) * 100) / 100;
    renderMember();

    const msg = qs("#topupMsg");
    msg.style.display = "block";
    msg.textContent = `Recarga aplicada: ${money(amount)}. (Demo sin persistencia)`;
  });

  logoutBtn.addEventListener("click", () => {
    state.member = null;
    qs("#idInput").value = "";
    qs("#pinInput").value = "";
    showLogin();
  });
}

boot();
