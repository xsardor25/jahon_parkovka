const KEYS = {
  app: "smart_parking_v3"
};

const STATUS = {
  EMPTY: "empty",
  BOOKED: "booked",
  OCCUPIED: "occupied"
};

const LOCATIONS = [
  { name: "Tashkent City", lat: 41.3164, lng: 69.2489 },
  { name: "Chilonzor", lat: 41.2754, lng: 69.2035 },
  { name: "Yunusobod", lat: 41.3661, lng: 69.2888 },
  { name: "Sergeli", lat: 41.2265, lng: 69.2191 }
];

const defaultState = {
  selectedLocation: null,
  slots: [
    { id: "A1", image: "img/image1.png", status: STATUS.EMPTY, plate: "" },
    { id: "A2", image: "img/image2.png", status: STATUS.EMPTY, plate: "" },
    { id: "B1", image: "img/image3.png", status: STATUS.EMPTY, plate: "" },
    { id: "B2", image: "img/image4.png", status: STATUS.EMPTY, plate: "" }
  ],
  bookings: [],
  fines: []
};

const el = {
  slotsGrid: document.getElementById("slotsGrid"),
  slotSelect: document.getElementById("slotSelect"),
  bookingsList: document.getElementById("bookingsList"),
  finesList: document.getElementById("finesList"),
  selectedLocationText: document.getElementById("selectedLocationText"),
  mapPoints: document.getElementById("mapPoints"),
  searchInput: document.getElementById("searchInput"),
  kpiEmpty: document.getElementById("kpiEmpty"),
  kpiBooked: document.getElementById("kpiBooked"),
  kpiOccupied: document.getElementById("kpiOccupied"),
  kpiFines: document.getElementById("kpiFines")
};

function loadState() {
  try {
    const raw = localStorage.getItem(KEYS.app);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.slots) || parsed.slots.length !== 4) {
      return structuredClone(defaultState);
    }
    return parsed;
  } catch {
    return structuredClone(defaultState);
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(KEYS.app, JSON.stringify(state));
}

function statusView(status) {
  if (status === STATUS.EMPTY) {
    return { text: "Bo'sh", chip: "bg-green-100 text-green-700", dot: "bg-green-500" };
  }
  if (status === STATUS.BOOKED) {
    return { text: "Bron", chip: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" };
  }
  return { text: "Band", chip: "bg-red-100 text-red-700", dot: "bg-red-500" };
}

function addFine(slotId, plate, reason) {
  state.fines.push({
    id: Date.now(),
    slotId,
    plate: plate || "Noma'lum",
    reason,
    amount: 340000,
    time: new Date().toLocaleString("uz-UZ")
  });
}

function updateKpi() {
  el.kpiEmpty.textContent = state.slots.filter((x) => x.status === STATUS.EMPTY).length;
  el.kpiBooked.textContent = state.slots.filter((x) => x.status === STATUS.BOOKED).length;
  el.kpiOccupied.textContent = state.slots.filter((x) => x.status === STATUS.OCCUPIED).length;
  el.kpiFines.textContent = state.fines.length;
}

function renderSlots() {
  el.slotsGrid.innerHTML = state.slots
    .map((slot) => {
      const s = statusView(slot.status);
      return `
        <article class="border rounded-xl overflow-hidden bg-white">
          <img src="${slot.image}" alt="${slot.id}" class="w-full h-40 object-cover" />
          <div class="p-3 space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold">Joy ${slot.id}</h4>
              <span class="text-xs px-2 py-1 rounded ${s.chip}">${s.text}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-slate-600">
              <span class="w-3 h-3 rounded-full ${s.dot}"></span>
              LED holati
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs">
              <button class="px-2 py-1 rounded bg-green-600 text-white" data-id="${slot.id}" data-act="empty">Yashil</button>
              <button class="px-2 py-1 rounded bg-yellow-500 text-white" data-id="${slot.id}" data-act="booked">Sariq</button>
              <button class="px-2 py-1 rounded bg-red-600 text-white" data-id="${slot.id}" data-act="occupied">Qizil</button>
            </div>
            <button class="w-full px-2 py-1 rounded bg-slate-900 text-white text-xs" data-id="${slot.id}" data-act="unauth">Ruxsatsiz mashina -> Jarima</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderLocation() {
  const loc = state.selectedLocation;
  el.selectedLocationText.textContent = loc
    ? `Tanlangan joy: ${loc.name} (${loc.lat}, ${loc.lng})`
    : "Tanlangan joy: yo'q";
}

function renderSlotSelect() {
  const items = state.slots.filter((s) => s.status === STATUS.EMPTY);
  if (!items.length) {
    el.slotSelect.innerHTML = "<option value=''>Bo'sh joy yo'q</option>";
    return;
  }
  el.slotSelect.innerHTML = items
    .map((s) => `<option value="${s.id}">${s.id} - Bo'sh</option>`)
    .join("");
}

function renderBookings() {
  if (!state.bookings.length) {
    el.bookingsList.innerHTML = "<p class='text-xs text-slate-500'>Hozircha bron yo'q.</p>";
    return;
  }
  el.bookingsList.innerHTML = state.bookings
    .slice()
    .reverse()
    .map(
      (b) => `
      <div class="text-xs border rounded-lg p-2 bg-slate-50">
        <p class="font-medium">${b.driver} - ${b.plate}</p>
        <p>Joy: ${b.slotId} | Lokatsiya: ${b.location}</p>
        <p class="text-slate-500">${b.time}</p>
      </div>
    `
    )
    .join("");
}

function renderFines() {
  if (!state.fines.length) {
    el.finesList.innerHTML = "<p class='text-sm text-slate-500'>Jarimalar yo'q.</p>";
    return;
  }
  el.finesList.innerHTML = state.fines
    .slice()
    .reverse()
    .map(
      (f) => `
      <div class="border rounded-lg p-3 bg-red-50 text-sm">
        <p class="font-semibold text-red-700">Jarima #${f.id}</p>
        <p>Joy: ${f.slotId}</p>
        <p>Avto: ${f.plate}</p>
        <p>Sabab: ${f.reason}</p>
        <p>Summa: ${f.amount.toLocaleString()} so'm</p>
        <p class="text-slate-500">${f.time}</p>
      </div>
    `
    )
    .join("");
}

function renderMapPoints() {
  el.mapPoints.innerHTML = LOCATIONS.map(
    (p) => `<button class="border rounded-lg px-2 py-2 text-xs hover:bg-slate-100" data-name="${p.name}">${p.name}</button>`
  ).join("");
}

function selectLocationByName(name) {
  const found = LOCATIONS.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (!found) return false;
  state.selectedLocation = found;
  saveState();
  renderLocation();
  return true;
}

function bindEvents() {
  el.slotsGrid.addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;

    const slot = state.slots.find((s) => s.id === btn.dataset.id);
    if (!slot) return;

    const action = btn.dataset.act;
    if (action === "empty") {
      slot.status = STATUS.EMPTY;
      slot.plate = "";
    } else if (action === "booked") {
      slot.status = STATUS.BOOKED;
    } else if (action === "occupied") {
      slot.status = STATUS.OCCUPIED;
    } else if (action === "unauth") {
      slot.status = STATUS.OCCUPIED;
      addFine(slot.id, slot.plate, "Ruxsatsiz parkovka");
      alert("Ruxsatsiz mashina: jarima yozildi.");
    }

    saveState();
    renderAll();
  });

  document.getElementById("bookingForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const driver = document.getElementById("driverName").value.trim();
    const plate = document.getElementById("carNumber").value.trim().toUpperCase();
    const slotId = el.slotSelect.value;

    if (!state.selectedLocation) {
      alert("Avval joy tanlang.");
      return;
    }

    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot || slot.status !== STATUS.EMPTY) {
      alert("Bu joy bo'sh emas.");
      return;
    }

    const isActivePlate = state.bookings.some((b) => b.plate === plate && b.active);
    if (isActivePlate) {
      alert("Bu raqam uchun faol bron mavjud.");
      return;
    }

    state.bookings.push({
      id: Date.now(),
      driver,
      plate,
      slotId,
      location: state.selectedLocation.name,
      active: true,
      time: new Date().toLocaleString("uz-UZ")
    });

    slot.status = STATUS.BOOKED;
    slot.plate = plate;

    event.target.reset();
    saveState();
    renderAll();
    alert("Bron muvaffaqiyatli. Qurilmada sariq LED yondi.");
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    const q = el.searchInput.value.trim().toLowerCase();
    if (!q) return;
    const found = LOCATIONS.find((p) => p.name.toLowerCase().includes(q));
    if (!found) {
      alert("Lokatsiya topilmadi.");
      return;
    }
    state.selectedLocation = found;
    saveState();
    renderLocation();
  });

  el.mapPoints.addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    selectLocationByName(btn.dataset.name);
  });

  document.getElementById("resetAll").addEventListener("click", () => {
    if (!confirm("Barcha ma'lumotlar tozalansinmi?")) return;
    localStorage.removeItem(KEYS.app);
    state = structuredClone(defaultState);
    renderAll();
  });
}

function renderAll() {
  renderSlots();
  renderSlotSelect();
  renderBookings();
  renderFines();
  renderLocation();
  updateKpi();
}

renderMapPoints();
bindEvents();
renderAll();