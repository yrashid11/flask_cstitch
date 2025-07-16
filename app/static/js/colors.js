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

  // Persist selected color set
  localStorage.setItem("dmc_palette", JSON.stringify(selectedColors));

  selectedColors.forEach(c => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';

    swatch.innerHTML = `
      <div class="swatch-main">
        <div class="swatch-color" style="background-color: ${c.hex};"></div>
        <div class="swatch-symbol">${c.symbol}</div>
        <div class="swatch-code">${c.code}</div>
        <button class="remove-color" title="Remove color">✖</button>
      </div>
      <div class="swatch-name">${c.name}</div>
    `;

    // Remove color from selectedColors
    swatch.querySelector('.remove-color').addEventListener('click', (e) => {
      e.stopPropagation();
      selectedColors = selectedColors.filter(p => p.code !== c.code);
      renderSelectedPalette();
    });

    // Click to activate symbol
    swatch.addEventListener('click', () => {
      setActiveSymbol(c.symbol, c.hex);
    });

    container.appendChild(swatch);
  });
}


function renderActivePalette(palette) {
  const container = document.getElementById('active-palette');
  container.innerHTML = '';

  palette.forEach(c => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.title = c.name;
    // 1. Color box with symbol
    const colorBox = document.createElement('div');
    colorBox.className = 'swatch-color-box';
    colorBox.style.backgroundColor = c.hex;


    const symbol = document.createElement('div');
    symbol.className = 'swatch-symbol-inside';
    symbol.textContent = c.symbol;
    colorBox.appendChild(symbol);

    // 2. Code display
    const code = document.createElement('div');
    code.className = 'swatch-code-box';
    code.textContent = c.code;

    // 3. Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-color';
    removeBtn.textContent = '✖';
    removeBtn.title = 'Remove color';

    removeBtn.addEventListener('click', e => {
      e.stopPropagation();
      activePalette = activePalette.filter(item => item.code !== c.code);
      usedSymbols = usedSymbols.filter(sym => sym !== c.symbol);
      localStorage.setItem("active_palette", JSON.stringify(activePalette));
      renderActivePalette(activePalette);
    });

    // Hidden tooltip with name (for later enhancement)
    const tooltip = document.createElement('span');
    tooltip.className = 'button-help';
    tooltip.textContent = c.name;
    swatch.appendChild(tooltip);

    // Click to activate symbol
    swatch.addEventListener('click', () => {
      setActiveSymbol(c.symbol, c.hex);
    });

    // Append all parts to the swatch
    swatch.appendChild(colorBox);
    swatch.appendChild(code);
    swatch.appendChild(removeBtn);

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


//GET BLACK OR WHITE COLOR SELECTION
function getContrastTextColor(hexcolor) {
  // Remove '#' if present
  if (hexcolor.startsWith('#')) {
    hexcolor = hexcolor.slice(1);
  }

  // Handle shorthand hex codes (e.g., #F00 to #FF0000)
  if (hexcolor.length === 3) {
    hexcolor = hexcolor.split('').map(function (hex) {
      return hex + hex;
    }).join('');
  }

  // Convert hex to RGB values
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);

  // Calculate YIQ value (a measure of perceived brightness)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Return 'black' for light colors and 'white' for dark colors
  return (yiq >= 128) ? '#000' : '#fff';
}



