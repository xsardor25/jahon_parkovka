const STORAGE_KEY = "smart-parking-demo-v3";

const IMAGES = ["img/image1.png", "img/image2.png", "img/image3.png", "img/image4.png"];

function withImage(spots) {
  return spots.map((spot, i) => ({ ...spot, image: IMAGES[i % IMAGES.length] }));
}

const defaultState = {
  selectedLocationId: "loc-1",
  selectedSpotId: null,
  fines: [],
  bookings: [],
  locations: [
    {
      id: "loc-1",
      name: "Toshkent City Parking",
      search: ["toshkent", "city", "markaz"],
      spots: withImage([
        { id: "A1", label: "A1", status: "empty", bookedBy: "", plate: "", device: "Qurilma #01" },
        { id: "A2", label: "A2", status: "reserved", bookedBy: "Ali", plate: "01A111AA", device: "Qurilma #02" },
        { id: "A3", label: "A3", status: "occupied", bookedBy: "Malika", plate: "01A222BB", device: "Qurilma #03" },
        { id: "B1", label: "B1", status: "empty", bookedBy: "", plate: "", device: "Qurilma #04" },
        { id: "B2", label: "B2", status: "illegal", bookedBy: "", plate: "", device: "Qurilma #05" },
        { id: "B3", label: "B3", status: "empty", bookedBy: "", plate: "", device: "Qurilma #06" }
      ])
    },
    {
      id: "loc-2",
      name: "Samarqand Darvoza Parking",
      search: ["samarqand", "darvoza", "chilonzor"],
      spots: withImage([
        { id: "C1", label: "C1", status: "empty", bookedBy: "", plate: "", device: "Qurilma #07" },
        { id: "C2", label: "C2", status: "occupied", bookedBy: "Bekzod", plate: "10B345CD", device: "Qurilma #08" },
        { id: "C3", label: "C3", status: "reserved", bookedBy: "Aziza", plate: "70D432EF", device: "Qurilma #09" },
        { id: "D1", label: "D1", status: "empty", bookedBy: "", plate: "", device: "Qurilma #10" },
        { id: "D2", label: "D2", status: "empty", bookedBy: "", plate: "", device: "Qurilma #11" },
        { id: "D3", label: "D3", status: "illegal", bookedBy: "", plate: "", device: "Qurilma #12" }
      ])
    },
    {
      id: "loc-3",
      name: "Airport Parking",
      search: ["airport", "aeroport", "terminal"],
      spots: withImage([
        { id: "E1", label: "E1", status: "empty", bookedBy: "", plate: "", device: "Qurilma #13" },
        { id: "E2", label: "E2", status: "empty", bookedBy: "", plate: "", device: "Qurilma #14" },
        { id: "E3", label: "E3", status: "reserved", bookedBy: "Murod", plate: "01U786GH", device: "Qurilma #15" },
        { id: "F1", label: "F1", status: "occupied", bookedBy: "Shahzod", plate: "90A111XY", device: "Qurilma #16" },
        { id: "F2", label: "F2", status: "empty", bookedBy: "", plate: "", device: "Qurilma #17" },
        { id: "F3", label: "F3", status: "empty", bookedBy: "", plate: "", device: "Qurilma #18" }
      ])
    }
  ]
};

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function normalizeState(raw) {
  const base = deepCopy(defaultState);
  if (!raw || !Array.isArray(raw.locations)) return base;

  const fixed = {
    selectedLocationId: raw.selectedLocationId || base.selectedLocationId,
    selectedSpotId: raw.selectedSpotId || null,
    fines: Array.isArray(raw.fines) ? raw.fines : [],
    bookings: Array.isArray(raw.bookings) ? raw.bookings : [],
    locations: raw.locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      search: Array.isArray(loc.search) ? loc.search : [],
      spots: withImage(
        (Array.isArray(loc.spots) ? loc.spots : []).map((spot) => ({
          id: spot.id,
          label: spot.label,
          status: spot.status || "empty",
          bookedBy: spot.bookedBy || "",
          plate: spot.plate || "",
          device: spot.device || "Qurilma"
        }))
      )
    }))
  };

  if (!fixed.locations.length) return base;
  if (!fixed.locations.some((loc) => loc.id === fixed.selectedLocationId)) {
    fixed.selectedLocationId = fixed.locations[0].id;
  }
  return fixed;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepCopy(defaultState);
    return normalizeState(JSON.parse(raw));
  } catch {
    return deepCopy(defaultState);
  }
}

let state = loadState();
let filter = "all";

const el = {
  parkingMap: document.getElementById("parkingMap"),
  miniMapGrid: document.querySelector("#miniMap > div"),
  selectedInfo: document.getElementById("selectedInfo"),
  appInfo: document.getElementById("appInfo"),
  statusBadge: document.getElementById("statusBadge"),
  locationTitle: document.getElementById("locationTitle"),
  fineList: document.getElementById("fineList"),
  clock: document.getElementById("clock"),
  searchInput: document.getElementById("searchInput"),
  kpiEmpty: document.getElementById("kpiEmpty"),
  kpiReserved: document.getElementById("kpiReserved"),
  kpiOccupied: document.getElementById("kpiOccupied"),
  kpiIllegal: document.getElementById("kpiIllegal"),
  driverInput: document.getElementById("driverInput"),
  plateInput: document.getElementById("plateInput")
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentLocation() {
  return state.locations.find((x) => x.id === state.selectedLocationId) || state.locations[0];
}

function selectedSpot() {
  const loc = currentLocation();
  return loc.spots.find((x) => x.id === state.selectedSpotId) || null;
}

function statusMeta(status) {
  if (status === "empty") {
    return {
      title: "Bo'sh",
      desc: "Yashil: joy bo'sh, bron qilish mumkin",
      badge: "bg-green-500/15 text-green-400 border border-green-500/20",
      dot: "bg-green-400",
      led: "bg-green-400 shadow-[0_0_28px_rgba(74,222,128,.92)]",
      glow: "status-glow-green",
      cardBg: "from-green-500/18 to-emerald-500/8"
    };
  }
  if (status === "reserved") {
    return {
      title: "Bron qilingan",
      desc: "Sariq: bron qilingan, lekin mashina hali kelmagan",
      badge: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/20",
      dot: "bg-yellow-400",
      led: "bg-yellow-400 shadow-[0_0_28px_rgba(250,204,21,.92)]",
      glow: "status-glow-yellow",
      cardBg: "from-yellow-400/18 to-amber-500/8"
    };
  }
  if (status === "occupied") {
    return {
      title: "Band",
      desc: "Qizil: joyda mashina bor, band holat",
      badge: "bg-red-500/15 text-red-400 border border-red-500/20",
      dot: "bg-red-500",
      led: "bg-red-500 shadow-[0_0_28px_rgba(239,68,68,.94)]",
      glow: "status-glow-red",
      cardBg: "from-red-500/18 to-rose-500/8"
    };
  }
  return {
    title: "Ruxsatsiz park",
    desc: "Oq: ruxsatsiz park aniqlandi, jarima yoziladi",
    badge: "bg-slate-100/10 text-slate-100 border border-slate-100/20",
    dot: "bg-slate-100",
    led: "bg-slate-100 shadow-[0_0_24px_rgba(255,255,255,.75)]",
    glow: "status-glow-white",
    cardBg: "from-slate-300/10 to-slate-100/5"
  };
}

function setButtonsDisabled(disabled) {
  ["reserveBtn", "occupyBtn", "freeBtn", "illegalBtn"].forEach((id) => {
    document.getElementById(id).disabled = disabled;
  });
}

function renderClock() {
  const d = new Date();
  el.clock.textContent = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

function renderKpi() {
  const spots = state.locations.flatMap((loc) => loc.spots);
  el.kpiEmpty.textContent = spots.filter((s) => s.status === "empty").length;
  el.kpiReserved.textContent = spots.filter((s) => s.status === "reserved").length;
  el.kpiOccupied.textContent = spots.filter((s) => s.status === "occupied").length;
  el.kpiIllegal.textContent = state.fines.length;
}

function renderFilterState() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.dataset.filter === filter) {
      btn.classList.remove("bg-slate-800", "border-slate-700");
      btn.classList.add("bg-cyan-500/20", "text-cyan-300", "border-cyan-400/30");
    } else {
      btn.classList.remove("bg-cyan-500/20", "text-cyan-300", "border-cyan-400/30");
      btn.classList.add("bg-slate-800", "border-slate-700");
    }
  });
}

function renderMap() {
  const loc = currentLocation();
  el.parkingMap.innerHTML = "";

  const spots = loc.spots.filter((spot) => (filter === "all" ? true : spot.status === filter));

  if (!spots.length) {
    el.parkingMap.innerHTML = '<div class="col-span-full rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-400">Bu filter bo\'yicha joy topilmadi.</div>';
    return;
  }

  spots.forEach((spot) => {
    const meta = statusMeta(spot.status);
    const active = state.selectedSpotId === spot.id;

    const card = document.createElement("button");
    card.className = `spot-outline relative rounded-[28px] min-h-[240px] border border-slate-700 bg-gradient-to-br ${meta.cardBg} p-5 text-left transition hover:border-cyan-400/50 ${meta.glow} ${active ? "ring-2 ring-cyan-400" : ""}`;

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3 relative z-10">
        <div>
          <div class="text-sm text-slate-400">${loc.name}</div>
          <div class="text-3xl font-black mt-1">${spot.label}</div>
        </div>
        <span class="px-3 py-2 rounded-xl text-sm font-semibold ${meta.badge}">${meta.title}</span>
      </div>

      <img src="${spot.image}" alt="${spot.label}" class="mt-4 w-full h-44 object-cover rounded-2xl border border-slate-700" />

      <div class="mt-3 rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full ${meta.dot}"></span>
        <span>${meta.desc}</span>
      </div>

      <div class="relative z-10 mt-4 flex items-center justify-between gap-3 text-sm text-slate-300">
        <span>${spot.device}</span>
        <span>${spot.bookedBy ? `Buyurtmachi: ${spot.bookedBy}` : "Buyurtmachi yo'q"}</span>
      </div>
    `;

    card.onclick = () => {
      state.selectedSpotId = spot.id;
      saveState();
      renderAll();
    };

    el.parkingMap.appendChild(card);
  });
}

function renderMiniMap() {
  const loc = currentLocation();
  el.locationTitle.textContent = loc.name;
  el.miniMapGrid.innerHTML = "";

  loc.spots.forEach((spot) => {
    const meta = statusMeta(spot.status);
    const item = document.createElement("button");
    item.className = `rounded-2xl border ${state.selectedSpotId === spot.id ? "border-cyan-400 ring-2 ring-cyan-400/60" : "border-slate-700"} bg-slate-900 hover:border-cyan-400/50 p-3 transition`;
    item.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-black">${spot.label}</span>
        <span class="w-3 h-3 rounded-full ${meta.dot}"></span>
      </div>
      <div class="mt-3 h-9 rounded-xl ${meta.led}"></div>
      <div class="text-xs text-slate-400 mt-2">${meta.title}</div>
    `;
    item.onclick = () => {
      state.selectedSpotId = spot.id;
      saveState();
      renderAll();
    };
    el.miniMapGrid.appendChild(item);
  });
}

function renderSelected() {
  const spot = selectedSpot();

  if (!spot) {
    el.selectedInfo.innerHTML = "Xaritadan yoki mini-ilovadan bitta joyni tanlang.";
    el.appInfo.innerHTML = "Avval xaritadan yoki mini-xaritadan bitta joyni tanlang.";
    el.statusBadge.className = "px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm";
    el.statusBadge.textContent = "Tanlanmagan";
    setButtonsDisabled(true);
    return;
  }

  const loc = currentLocation();
  const meta = statusMeta(spot.status);
  el.statusBadge.className = `px-3 py-2 rounded-xl text-sm ${meta.badge}`;
  el.statusBadge.textContent = meta.title;

  el.selectedInfo.innerHTML = `
    <div class="grid md:grid-cols-2 gap-4">
      <div class="rounded-2xl bg-slate-950 border border-slate-800 p-4">
        <div class="text-slate-400 text-sm">Joy raqami</div>
        <div class="text-3xl font-black mt-1">${spot.label}</div>
      </div>
      <div class="rounded-2xl bg-slate-950 border border-slate-800 p-4">
        <div class="text-slate-400 text-sm">Joylashuv</div>
        <div class="text-2xl font-bold mt-1">${loc.name}</div>
      </div>
      <div class="rounded-2xl bg-slate-950 border border-slate-800 p-4">
        <div class="text-slate-400 text-sm">Holat</div>
        <div class="text-2xl font-bold mt-1">${meta.title}</div>
        <div class="text-xs text-slate-400 mt-2">${meta.desc}</div>
      </div>
      <div class="rounded-2xl bg-slate-950 border border-slate-800 p-4">
        <div class="text-slate-400 text-sm">Qurilma</div>
        <div class="text-2xl font-bold mt-1">${spot.device}</div>
      </div>
    </div>
  `;

  el.appInfo.innerHTML = `
    <div class="text-sm text-slate-300 space-y-1">
      <p><span class="text-slate-500">Joy:</span> ${spot.label}</p>
      <p><span class="text-slate-500">Hudud:</span> ${loc.name}</p>
      <p><span class="text-slate-500">Holat:</span> ${meta.title}</p>
      <p><span class="text-slate-500">Izoh:</span> ${meta.desc}</p>
      <p><span class="text-slate-500">Raqam:</span> ${spot.plate || "Kiritilmagan"}</p>
    </div>
  `;

  setButtonsDisabled(false);
}

function renderFines() {
  if (!state.fines.length) {
    el.fineList.innerHTML = '<p class="text-sm text-slate-400">Jarimalar hali yo\'q.</p>';
    return;
  }

  el.fineList.innerHTML = state.fines
    .slice()
    .reverse()
    .map(
      (fine) => `
      <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm">
        <p class="font-bold text-red-300">Jarima #${fine.id}</p>
        <p class="text-slate-200">${fine.location} - ${fine.spot}</p>
        <p class="text-slate-300">Sabab: ${fine.reason}</p>
        <p class="text-slate-400">${fine.time}</p>
      </div>
    `
    )
    .join("");
}

function recordFine(spot, reason) {
  state.fines.push({
    id: Date.now(),
    location: currentLocation().name,
    spot: spot.label,
    reason,
    plate: spot.plate || "Noma'lum",
    time: new Date().toLocaleString("uz-UZ"),
    amount: 340000
  });
}

function reserveSpot() {
  const spot = selectedSpot();
  if (!spot) return;
  if (spot.status !== "empty") {
    alert("Faqat bo'sh joy bron qilinadi.");
    return;
  }

  const driver = el.driverInput.value.trim();
  const plate = el.plateInput.value.trim().toUpperCase();
  if (!driver || !plate) {
    alert("Haydovchi va avto raqamni kiriting.");
    return;
  }

  spot.status = "reserved";
  spot.bookedBy = driver;
  spot.plate = plate;
  state.bookings.push({
    id: Date.now(),
    location: currentLocation().name,
    spot: spot.label,
    driver,
    plate,
    status: "reserved",
    time: new Date().toLocaleString("uz-UZ")
  });
  saveState();
  renderAll();
}

function occupySpot() {
  const spot = selectedSpot();
  if (!spot) return;
  if (spot.status === "occupied") return;

  if (spot.status === "empty") {
    const driver = el.driverInput.value.trim() || "Noma'lum";
    const plate = el.plateInput.value.trim().toUpperCase() || "Noma'lum";
    spot.bookedBy = driver;
    spot.plate = plate;
  }

  spot.status = "occupied";
  saveState();
  renderAll();
}

function freeSpot() {
  const spot = selectedSpot();
  if (!spot) return;

  spot.status = "empty";
  spot.bookedBy = "";
  spot.plate = "";
  saveState();
  renderAll();
}

function illegalSpot() {
  const spot = selectedSpot();
  if (!spot) return;
  spot.status = "illegal";
  recordFine(spot, "Ruxsatsiz park aniqlandi");
  saveState();
  renderAll();
}

function handleSearch() {
  const q = el.searchInput.value.trim().toLowerCase();
  if (!q) return;

  const found = state.locations.find(
    (loc) => loc.name.toLowerCase().includes(q) || loc.search.some((token) => token.includes(q))
  );

  if (!found) {
    alert("Lokatsiya topilmadi.");
    return;
  }

  state.selectedLocationId = found.id;
  state.selectedSpotId = null;
  saveState();
  renderAll();
}

function bindEvents() {
  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document.getElementById("reserveBtn").addEventListener("click", reserveSpot);
  document.getElementById("occupyBtn").addEventListener("click", occupySpot);
  document.getElementById("freeBtn").addEventListener("click", freeSpot);
  document.getElementById("illegalBtn").addEventListener("click", illegalSpot);

  document.getElementById("resetDemo").addEventListener("click", () => {
    if (!confirm("Barcha demo ma'lumotlar tozalansinmi?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = deepCopy(defaultState);
    filter = "all";
    renderAll();
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      renderFilterState();
      renderMap();
    });
  });
}

function renderAll() {
  renderClock();
  renderKpi();
  renderFilterState();
  renderMap();
  renderMiniMap();
  renderSelected();
  renderFines();
}

bindEvents();
renderAll();
setInterval(renderClock, 30000);