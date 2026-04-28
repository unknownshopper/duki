const db = {
  members: [
    {
      id: "m_001",
      uid: "04A224B19C",
      name: "Alberto García",
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
  uid: null,
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

function boot() {
  const scanForm = qs("#scanForm");
  const loginForm = qs("#loginForm");
  const topupForm = qs("#topupForm");

  scanForm.addEventListener("submit", (e) => {
    e.preventDefault();
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
