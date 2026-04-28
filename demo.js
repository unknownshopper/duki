const db = {
  members: [
    {
      id: "m_001",
      uid: "04A224B19C",
      name: "Francisco Fernández",
      category: "vip",
      pin: "1234",
      balance: 850,
    },
    {
      id: "m_002",
      uid: "04FF1100AA",
      name: "Sofía Hernández",
      category: "general",
      pin: "4321",
      balance: 120,
    },
    { id: "m_003", uid: "04AA00000001", name: "Carlos Méndez", category: "general", pin: "1111", balance: 300 },
    { id: "m_004", uid: "04AA00000002", name: "Mariana López", category: "vip", pin: "2222", balance: 1250 },
    { id: "m_005", uid: "04AA00000003", name: "Daniela Ruiz", category: "ahijado", pin: "3333", balance: 540 },
    { id: "m_006", uid: "04AA00000004", name: "Jorge Castillo", category: "colaborador", pin: "4444", balance: 980 },
    { id: "m_007", uid: "04AA00000005", name: "Valeria Soto", category: "general", pin: "5555", balance: 60 },
    { id: "m_008", uid: "04AA00000006", name: "Luis Navarro", category: "vip", pin: "6666", balance: 2100 },
    { id: "m_009", uid: "04AA00000007", name: "Fernanda Díaz", category: "general", pin: "7777", balance: 430 },
    { id: "m_010", uid: "04AA00000008", name: "Iván Romero", category: "ahijado", pin: "8888", balance: 720 },
    { id: "m_011", uid: "04AA00000009", name: "Paola Jiménez", category: "vip", pin: "9999", balance: 150 },
    { id: "m_012", uid: "04AA00000010", name: "Ricardo Torres", category: "general", pin: "1010", balance: 990 },
    { id: "m_013", uid: "04AA00000011", name: "Camila Vargas", category: "colaborador", pin: "1212", balance: 1850 },
    { id: "m_014", uid: "04AA00000012", name: "Héctor Luna", category: "general", pin: "1313", balance: 240 },
    { id: "m_015", uid: "04AA00000013", name: "Ximena Ríos", category: "vip", pin: "1414", balance: 460 },
    { id: "m_016", uid: "04AA00000014", name: "Emilio Herrera", category: "general", pin: "1515", balance: 80 },
    { id: "m_017", uid: "04AA00000015", name: "Regina Aguilar", category: "ahijado", pin: "1616", balance: 610 },
    { id: "m_018", uid: "04AA00000016", name: "Santiago Flores", category: "vip", pin: "1717", balance: 3050 },
    { id: "m_019", uid: "04AA00000017", name: "Andrea Ponce", category: "general", pin: "1818", balance: 355 },
    { id: "m_020", uid: "04AA00000018", name: "Diego Morales", category: "colaborador", pin: "1919", balance: 770 },
    { id: "m_021", uid: "04AA00000019", name: "Natalia Peña", category: "general", pin: "2020", balance: 510 },
    { id: "m_022", uid: "04AA00000020", name: "Óscar Guzmán", category: "vip", pin: "2121", balance: 640 },
  ],
  productsByLocation: {
    lapetro: [
      { id: "a_001", name: "Natural", basePrice: 800, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "a_002", name: "Energético", basePrice: 1400, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "a_003", name: "Relajación", basePrice: 1600, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "a_004", name: "Estimulante", basePrice: 1800, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "b_001", name: "Salud", basePrice: 300, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "b_002", name: "Dinero", basePrice: 300, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "b_003", name: "Amor", basePrice: 300, categories: ["general", "vip", "ahijado", "colaborador"] },
    ],
    atasta: [
      { id: "a_001", name: "Natural", basePrice: 800, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "a_002", name: "Energético", basePrice: 1400, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "a_003", name: "Relajación", basePrice: 1600, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "b_001", name: "Salud", basePrice: 300, categories: ["general", "vip", "ahijado", "colaborador"] },
      { id: "b_002", name: "Dinero", basePrice: 300, categories: ["general", "vip", "ahijado", "colaborador"] },
    ],
  },
  categoryDiscountPct: {
    general: 0,
    vip: 15,
    ahijado: 10,
    colaborador: 20,
  },
};

const state = {
  uid: null,
  member: null,
  locationId: "lapetro",
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

function renderMember() {
  const m = state.member;
  const disc = db.categoryDiscountPct[m.category] ?? 0;
  qs("#memberMeta").textContent = `${m.name} — categoría: ${m.category} — saldo: ${money(m.balance)} — descuento: ${disc}%`;

  const menu = qs("#menu");
  menu.innerHTML = "";

  const inventory = db.productsByLocation[state.locationId] ?? [];
  const allowed = inventory.filter((p) => p.categories.includes(m.category));
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

function boot() {
  const scanForm = qs("#scanForm");
  const loginForm = qs("#loginForm");
  const topupForm = qs("#topupForm");

  scanForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.locationId = qs("#locationSelect").value;
    const uid = qs("#uidInput").value.trim();
    if (!uid) return;

    const member = db.members.find((m) => m.uid.toLowerCase() === uid.toLowerCase());
    state.uid = uid;
    state.member = member ?? null;

    show(qs("#loginCard"), true);
    setError("");

    if (!member) {
      qs("#loginHint").textContent = "UID no encontrado. En el sistema real se registraría/ligaría primero.";
    } else {
      qs("#loginHint").textContent = `Socio detectado: ${member.name}. Ingresa el PIN para continuar.`;
    }

    qs("#pinInput").value = "";
    qs("#pinInput").focus();
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pin = qs("#pinInput").value.trim();

    if (!state.member) {
      setError("No existe un socio asociado a este UID.");
      return;
    }

    if (pin !== state.member.pin) {
      setError("PIN incorrecto.");
      return;
    }

    setError("");
    show(qs("#scanCard"), false);
    show(qs("#loginCard"), false);
    show(qs("#memberCard"), true);
    renderMember();
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
}

boot();
