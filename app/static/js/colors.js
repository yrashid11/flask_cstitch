const symbolPool = "!@#$%^&*ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split('');
let usedSymbols = [];
let selectedColors = [];
//let activePalette = [];  // Final palette used in grid
const toggleStored = localStorage.getItem("color_mode_enabled");
const colorModeOn = toggleStored === "1";

document.getElementById("toggle-view-mode").checked = colorModeOn;

if (colorModeOn) {
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.add('color-mode');
  });
}
function assignSymbol() {
  return symbolPool.find(s => !usedSymbols.includes(s));
}

function renderColorList(colors) {
  const listEl = document.getElementById('color-list');
  listEl.innerHTML = '';
  const sorted = sortColorsByRGB(colors);
  sorted.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.borderColor = `${color.hex}`;
    swatch.innerHTML = `
      <div style="background:${color.hex};width:40px;height:20px;border:1px solid #333;"></div>
      <small>${color.code}</small>
      <small>${color.name}</small>
    `;

    swatch.addEventListener('click', () => {
  if (activePalette.find(c => c.code === color.code)) return;

  const symbol = assignSymbol();
  if (!symbol) return alert('Out of symbols!');

  const newColor = { ...color, symbol };
  usedSymbols.push(symbol);
  activePalette.push(newColor);

  // Sort palette and persist
  activePalette.sort((a, b) => {
    if (a.r !== b.r) return a.r - b.r;
    if (a.g !== b.g) return a.g - b.g;
    return a.b - b.b;
  });

  localStorage.setItem("active_palette", JSON.stringify(activePalette));
  renderActivePalette(activePalette);
});

    listEl.appendChild(swatch);
  });
}

function renderSelectedPalette() {
  const container = document.getElementById('selected-palette');
  container.innerHTML = '';
  selectedColors.forEach(c => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch selected';
    swatch.innerHTML = `
      <div style="background:${c.hex};width:40px;height:20px;border:1px solid #333;"></div>
      <strong>${c.symbol}</strong>
      <small>${c.code}</small>
      <small>${c.name}</small>
    `;
    container.appendChild(swatch);
  });
}

function setupSearch(colors) {
  document.getElementById('color-search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = colors.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.hex.toLowerCase().includes(q)
    );
    renderColorList(filtered);
  });
}

function sortColorsByRGB(colors) {
  // Sort by R, then G, then B
  return colors.slice().sort((a, b) => {
    if (a.r !== b.r) return a.r - b.r;
    if (a.g !== b.g) return a.g - b.g;
    return a.b - b.b;
  });
}


async function initColorSelector() {
  const res = await fetch('/api/thread-colors');
  const colors = await res.json();
  renderColorList(colors);
  setupSearch(colors);
}

function renderSelectedPalette() {
  const container = document.getElementById('selected-palette');
  container.innerHTML = '';

  localStorage.setItem("dmc_palette", JSON.stringify(selectedColors));

  selectedColors.forEach(c => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch selected';
    swatch.innerHTML = `
      <div style="background:${c.hex};width:40px;height:20px;border:1px solid #333;"></div>
      <strong>${c.symbol}</strong>
      <small>${c.code}</small>
      <small>${c.name}</small>
    `;
    swatch.addEventListener('click', () => {
    if (swatch.classList.contains('selected')) {
    swatch.classList.remove('selected');
    selectedPalette = selectedPalette.filter(p => p.code !== c.code);
  } else {
    swatch.classList.add('selected');
    selectedPalette.push(c);
  }
      setActiveSymbol(c.symbol);
    });
    if (selectedPalette.some(p => p.code === c.code)) {
          swatch.classList.add('selected');
        }
    container.appendChild(swatch);
  });
}

function renderActivePalette(palette) {
  const container = document.getElementById('active-palette');
  container.innerHTML = '';

  palette.forEach(c => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch selected';

    // Color swatch
    const preview = document.createElement('div');
    preview.style.background = `${c.hex}`;
    preview.style.width = '40px';
    preview.style.height = '20px';
    preview.style.border = '1px solid #333';

    // Text elements
    const symbolEl = document.createElement('strong');
    symbolEl.textContent = c.symbol;

    const codeEl = document.createElement('small');
    codeEl.textContent = c.code;

    const nameEl = document.createElement('small');
    nameEl.textContent = c.name;

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-color';
    removeBtn.textContent = '🗑';
    removeBtn.title = 'Remove color';
    removeBtn.style.marginTop = '4px';

    // Prevent click from activating symbol
    removeBtn.addEventListener('click', (e) => {
  e.stopPropagation();

  // Remove the color from the palette and its symbol from usedSymbols
  const updatedPalette = activePalette.filter(item => item.code !== c.code);
  usedSymbols = usedSymbols.filter(sym => sym !== c.symbol);

  // ✅ Update the global state
  activePalette = updatedPalette;

  // Save and re-render
  localStorage.setItem("active_palette", JSON.stringify(activePalette));
  renderActivePalette(activePalette);
    });

    // Click to activate symbol
    swatch.addEventListener('click', () => {
      setActiveSymbol(c.symbol);
    });

    swatch.append(preview, symbolEl, codeEl, nameEl, removeBtn);
    container.appendChild(swatch);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem("active_palette");
  if (saved) {
    activePalette = JSON.parse(saved);
    usedSymbols = activePalette.map(c => c.symbol);
    renderActivePalette(activePalette);
  }

  initColorSelector(); // Fetch and render full DMC list
});

document.getElementById('confirm-palette').addEventListener('click', () => {
  if (selectedColors.length === 0) {
    alert("Your builder palette is empty.");
    return;
  }

  // Merge new colors without duplicates
  const existingCodes = new Set(activePalette.map(c => c.code));
  const toAdd = selectedColors.filter(c => !existingCodes.has(c.code));
  activePalette = [...activePalette, ...toAdd];

  // Sort the full active palette
  activePalette.sort((a, b) => {
    if (a.r !== b.r) return a.r - b.r;
    if (a.g !== b.g) return a.g - b.g;
    return a.b - b.b;
  });

  // Save and re-render
  localStorage.setItem("active_palette", JSON.stringify(activePalette));
  renderActivePalette(activePalette);

  // ✅ CLEAR the builder
  //selectedColors = [];
  usedSymbols = activePalette.map(c => c.symbol);  // only retain symbols in use
  localStorage.setItem("dmc_palette", JSON.stringify(selectedColors));
  //renderSelectedPalette();  // clear builder UI
});




