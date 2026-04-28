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
    { id: "m_003", phoneOrNumber: "5510000001", name: "Carlos Méndez", category: "general", pin: "1111", balance: 300 },
    { id: "m_004", phoneOrNumber: "5510000002", name: "Mariana López", category: "vip", pin: "2222", balance: 1250 },
    { id: "m_005", phoneOrNumber: "5510000003", name: "Daniela Ruiz", category: "ahijado", pin: "3333", balance: 540 },
    { id: "m_006", phoneOrNumber: "5510000004", name: "Jorge Castillo", category: "colaborador", pin: "4444", balance: 980 },
    { id: "m_007", phoneOrNumber: "5510000005", name: "Valeria Soto", category: "general", pin: "5555", balance: 60 },
    { id: "m_008", phoneOrNumber: "5510000006", name: "Luis Navarro", category: "vip", pin: "6666", balance: 2100 },
    { id: "m_009", phoneOrNumber: "5510000007", name: "Fernanda Díaz", category: "general", pin: "7777", balance: 430 },
    { id: "m_010", phoneOrNumber: "5510000008", name: "Iván Romero", category: "ahijado", pin: "8888", balance: 720 },
    { id: "m_011", phoneOrNumber: "5510000009", name: "Paola Jiménez", category: "vip", pin: "9999", balance: 150 },
    { id: "m_012", phoneOrNumber: "5510000010", name: "Ricardo Torres", category: "general", pin: "1010", balance: 990 },
    { id: "m_013", phoneOrNumber: "5510000011", name: "Camila Vargas", category: "colaborador", pin: "1212", balance: 1850 },
    { id: "m_014", phoneOrNumber: "5510000012", name: "Héctor Luna", category: "general", pin: "1313", balance: 240 },
    { id: "m_015", phoneOrNumber: "5510000013", name: "Ximena Ríos", category: "vip", pin: "1414", balance: 460 },
    { id: "m_016", phoneOrNumber: "5510000014", name: "Emilio Herrera", category: "general", pin: "1515", balance: 80 },
    { id: "m_017", phoneOrNumber: "5510000015", name: "Regina Aguilar", category: "ahijado", pin: "1616", balance: 610 },
    { id: "m_018", phoneOrNumber: "5510000016", name: "Santiago Flores", category: "vip", pin: "1717", balance: 3050 },
    { id: "m_019", phoneOrNumber: "5510000017", name: "Andrea Ponce", category: "general", pin: "1818", balance: 355 },
    { id: "m_020", phoneOrNumber: "5510000018", name: "Diego Morales", category: "colaborador", pin: "1919", balance: 770 },
    { id: "m_021", phoneOrNumber: "5510000019", name: "Natalia Peña", category: "general", pin: "2020", balance: 510 },
    { id: "m_022", phoneOrNumber: "5510000020", name: "Óscar Guzmán", category: "vip", pin: "2121", balance: 640 },
  ],
  products: [
    { id: "a_001", name: "Natural", basePrice: 800, categories: ["general", "vip", "ahijado", "colaborador"] },
    { id: "a_002", name: "Energético", basePrice: 1400, categories: ["general", "vip", "ahijado", "colaborador"] },
    { id: "a_003", name: "Relajación", basePrice: 1600, categories: ["general", "vip", "ahijado", "colaborador"] },
    { id: "a_004", name: "Estimulante", basePrice: 1800, categories: ["general", "vip", "ahijado", "colaborador"] },
    { id: "b_001", name: "Salud", basePrice: 300, categories: ["general", "vip", "ahijado", "colaborador"] },
    { id: "b_002", name: "Dinero", basePrice: 300, categories: ["general", "vip", "ahijado", "colaborador"] },
    { id: "b_003", name: "Amor", basePrice: 300, categories: ["general", "vip", "ahijado", "colaborador"] },
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
  qs("#memberBalance").textContent = `SALDO: ${money(m.balance)}`;

  const menu = qs("#menu");
  menu.innerHTML = "";

  const allowed = db.products.filter((p) => p.categories.includes(m.category));
  const foods = allowed.filter((p) => p.id.startsWith("a_"));
  const drinks = allowed.filter((p) => p.id.startsWith("b_"));

  function renderSection(title, items) {
    const h = document.createElement("h3");
    h.textContent = title;
    menu.appendChild(h);

    const ul = document.createElement("ul");
    for (const p of items) {
      const li = document.createElement("li");
      const finalPrice = computePrice(p, m.category);
      li.textContent = `${p.name} — ${money(finalPrice)} (base ${money(p.basePrice)})`;
      ul.appendChild(li);
    }
    menu.appendChild(ul);
  }

  renderSection("Alimentos", foods);
  renderSection("Bebidas", drinks);
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

  logoutBtn.addEventListener("click", () => {
    state.member = null;
    qs("#idInput").value = "";
    qs("#pinInput").value = "";
    showLogin();
  });
}

boot();
