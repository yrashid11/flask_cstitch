const symbolPool = "♚☄❈⚒♜☌✺☯✻⚛♠❂♬✶⚖⚗☢✽✪♞❁♛⚅✬☘♟❣⚯☃❖❀⚘❆♝⚗☍♣♩✯⚬⚭☤✷☥❇✧♣☁☂♛⚀♠☊✰✩☠✦✿☉☾⚔♞❃❋♟✫✶☚❅❢♜❊♝⚒❂⚃✮❁⚗♩☄❃☌☍☘☤".split('');
const usedSymbols = [];
//let activePalette = JSON.parse(localStorage.getItem("active_palette") || "[]");

const colorModeOn = localStorage.getItem("color_mode_enabled") === "1";
document.getElementById("toggle-view-mode").checked = colorModeOn;
if (colorModeOn) {
  document.querySelectorAll('.grid-cell').forEach(cell => cell.classList.add('color-mode'));
}

function assignSymbol() {
  return symbolPool.find(s => !usedSymbols.includes(s));
}

function sortColorsByRGB(colors) {
  return colors.slice().sort((a, b) => a.r - b.r || a.g - b.g || a.b - b.b);
}

function renderColorList(colors) {
  const listEl = document.getElementById('color-list');
  listEl.innerHTML = '';
  sortColorsByRGB(colors).forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.borderColor = color.hex;
    swatch.innerHTML = `
      <div class="swatch-top-row">
      <div class="swatch-color-box" style="background:${color.hex};width:40px;height:20px;border:1px solid #333;"></div>
      <div class="swatch-code-box">${color.code}</div>
      </div>
      <div class="swatch-name-box">${color.name}</div>
    `;

    swatch.addEventListener('click', () => {
      if (activePalette.find(c => c.code === color.code)) return;

      const symbol = assignSymbol();
      if (!symbol) return alert('Out of symbols!');

      const newColor = { ...color, symbol };
      usedSymbols.push(symbol);
      activePalette.push(newColor);

      activePalette = sortColorsByRGB(activePalette);
      localStorage.setItem("active_palette", JSON.stringify(activePalette));
      renderActivePalette(activePalette);
    });

    listEl.appendChild(swatch);
  });
}

function setupSearch(colors) {
  const searchInput = document.getElementById('color-search');
  searchInput.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = colors.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.hex.toLowerCase().includes(q)
    );
    renderColorList(filtered);
  });
}

async function initColorSelector() {
  const res = await fetch('/api/thread-colors');
  const colors = await res.json();
  renderColorList(colors);
  setupSearch(colors);
}

function renderActivePalette(palette) {
  const container = document.getElementById('active-palette');
  container.innerHTML = '';

  palette.forEach(c => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.title = c.name;

    const colorBox = document.createElement('div');
    colorBox.className = 'swatch-color-box';
    colorBox.style.backgroundColor = c.hex;
    colorBox.style.color = getContrastTextColor(c.hex);

    const symbol = document.createElement('div');
    symbol.className = 'swatch-symbol-inside';
    symbol.textContent = c.symbol;
    colorBox.appendChild(symbol);

    const code = document.createElement('div');
    code.className = 'swatch-code-box';
    code.textContent = c.code;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-color';
    removeBtn.textContent = '✖';
    removeBtn.title = 'Remove color';
    removeBtn.addEventListener('click', e => {
      e.stopPropagation();
      activePalette = activePalette.filter(item => item.code !== c.code);
      usedSymbols.splice(usedSymbols.indexOf(c.symbol), 1);
      localStorage.setItem("active_palette", JSON.stringify(activePalette));
      renderActivePalette(activePalette);
    });

    const tooltip = document.createElement('span');
    tooltip.className = 'button-help';
    tooltip.textContent = c.name;
    swatch.appendChild(tooltip);

    swatch.addEventListener('click', () => {
      setActiveSymbol(c.symbol, c.hex);
    });

    swatch.appendChild(colorBox);
    swatch.appendChild(code);
    swatch.appendChild(removeBtn);

    container.appendChild(swatch);
  });
}

function getContrastTextColor(hexcolor) {
  hexcolor = hexcolor.replace('#', '');
  if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(h => h + h).join('');
  const r = parseInt(hexcolor.slice(0, 2), 16);
  const g = parseInt(hexcolor.slice(2, 4), 16);
  const b = parseInt(hexcolor.slice(4, 6), 16);
  return ((r * 299 + g * 587 + b * 114) / 1000 >= 128) ? '#000' : '#fff';
}

// === Initialize ===
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem("active_palette");
  if (saved) {
    activePalette = JSON.parse(saved);
    usedSymbols.push(...activePalette.map(c => c.symbol));
    renderActivePalette(activePalette);
  }

  initColorSelector();
});