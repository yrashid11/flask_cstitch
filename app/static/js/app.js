
// === Constants and Initial State ===
const gridContainer = document.getElementById('grid-container');
let rows = 25;
let cols = 25;
let grid = [];
let activeSymbol = null;
let activePalette = JSON.parse(localStorage.getItem("active_palette") || "[]");
let toolMode = localStorage.getItem("tool_mode") || 'single';
const previewClass = 'cell-preview';

// === Restore Grid Size from Storage ===
const savedSize = localStorage.getItem("grid_size");
if (savedSize) {
  rows = cols = parseInt(savedSize);
  document.getElementById("grid-size-input").value = rows;
}

// === Restore Tool Selection UI ===
const toolRadio = document.querySelector(`input[name="tool"][value="${toolMode}"]`);
if (toolRadio) toolRadio.checked = true;

// === Handle Tool Mode Change ===
document.querySelectorAll('input[name="tool"]').forEach(input => {
  input.addEventListener('change', (e) => {
    toolMode = e.target.value;
    localStorage.setItem("tool_mode", toolMode);
  });
});

document.getElementById('open-palette').addEventListener('click', () => {
  document.getElementById('palette-modal').classList.remove('hidden');
});

document.getElementById('close-palette').addEventListener('click', () => {
  document.getElementById('palette-modal').classList.add('hidden');
});

document.getElementById('palette-modal').addEventListener('click', (e) => {
  if (e.target.id === 'palette-modal') {
    document.getElementById('palette-modal').classList.add('hidden');
  }
});
document.getElementById("clear-palette").addEventListener("click", () => {
  if (!confirm("Clear all selected colors from your active palette?")) return;

  // Clear data
  selectedPalette = [];
  localStorage.removeItem("active_palette");

  // Rerender all displays
  //renderColorList();       // rebuild DMC swatches
  renderActivePalette([]); // empty current working palette
});



// === Inject Dynamic Color Styles ===
const injectColor = (() => {
  const injected = new Set();
  const styleTag = document.createElement('style');
  document.head.appendChild(styleTag);

  return function (code, hex) {
    if (injected.has(code)) return;
    const safeHex = hex.startsWith('#') ? hex : `#${hex}`;
    styleTag.textContent += `.DMC_${code}.color-mode { background-color: ${safeHex}; }\n`;
    injected.add(code);
  };
})();

// === Grid Persistence ===
const savedGrid = JSON.parse(localStorage.getItem("cross_stitch_grid") || "[]");

// === Grid Utilities ===
function saveGridToLocalStorage() {
  localStorage.setItem("cross_stitch_grid", JSON.stringify(grid));
}

function getBlockCells(x, y) {
  const block = [];
  let size = toolMode === 'quad' ? 2 : toolMode === 'mega' ? 5 : 1;

  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const cx = x + dx, cy = y + dy;
      if (cx < cols && cy < rows) {
        const cell = document.querySelector(`.grid-cell[data-x="${cx}"][data-y="${cy}"]`);
        if (cell) block.push({ cell, x: cx, y: cy });
      }
    }
  }

  return block;
}

// === Grid Builder ===
function buildGrid() {
  gridContainer.innerHTML = "";
  for (let y = 0; y < rows; y++) {
    const row = document.createElement('div');
    row.className = 'grid-row';
    grid[y] = grid[y] || [];

    for (let x = 0; x < cols; x++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      const saved = savedGrid[y]?.[x];
      const symbol = typeof saved === 'object' ? saved.symbol : '.';
      const code = typeof saved === 'object' ? saved.code : null;

      grid[y][x] = { symbol, code };
      cell.textContent = symbol;

      if (code) {
        cell.classList.add(`DMC_${code}`);
        const entry = activePalette.find(c => c.code === code);
        if (entry) injectColor(code, entry.hex);
      }

      cell.addEventListener('mouseenter', () => {
        getBlockCells(x, y).forEach(({ cell }) => cell.classList.add(previewClass));
      });

      cell.addEventListener('mouseleave', () => {
        document.querySelectorAll(`.${previewClass}`).forEach(c => c.classList.remove(previewClass));
      });

      cell.addEventListener('click', () => {
        if (!activeSymbol) {
          alert("Select a symbol from your palette first.");
          return;
        }

        const entry = activePalette.find(c => c.symbol === activeSymbol);
        if (!entry) return;

        getBlockCells(x, y).forEach(({ cell, x, y }) => {
          cell.textContent = activeSymbol;
          grid[y][x] = { symbol: activeSymbol, code: entry.code };

          cell.classList.forEach(cls => {
            if (cls.startsWith('DMC_')) cell.classList.remove(cls);
          });

          cell.classList.add(`DMC_${entry.code}`);
          injectColor(entry.code, entry.hex);
        });

        saveGridToLocalStorage();
      });

      row.appendChild(cell);
    }

    gridContainer.appendChild(row);
    const colorModeEnabled = localStorage.getItem("color_mode_enabled") === "1";
        if (colorModeEnabled) {
          document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.add('color-mode');
          });
        }
  }
}

// === Resize Handler ===
document.getElementById("resize-grid-btn").addEventListener("click", () => {
  const newSize = parseInt(document.getElementById("grid-size-input").value);
  if (isNaN(newSize) || newSize < 5 || newSize > 100) {
    alert("Enter a size between 5 and 100.");
    return;
  }

  rows = cols = newSize;
  for (let y = 0; y < rows; y++) {
    if (!grid[y]) grid[y] = [];
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) grid[y][x] = { symbol: '.', code: null };
    }
    grid[y].length = cols;
  }
  grid.length = rows;

  localStorage.setItem("grid_size", newSize);
  saveGridToLocalStorage();
  buildGrid();
});

// === Color Mode Toggle ===
document.getElementById('toggle-view-mode').addEventListener('change', (e) => {
  const enabled = e.target.checked;
  localStorage.setItem("color_mode_enabled", enabled ? "1" : "0");
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.toggle('color-mode', enabled);
  });
});

// === Active Symbol Setter ===
function setActiveSymbol(symbol,hex) {
  activeSymbol = symbol;
  document.getElementById("active-symbol-display").textContent = symbol;
  document.getElementById("active-symbol-display").style.backgroundColor = hex;
  document.getElementById("active-symbol-display").style.color = getContrastTextColor(hex);

}

// === Clear Grid ===
function clearGrid() {
  if (!confirm("Are you sure you want to clear the entire grid?")) return;

  // Reset both grid and savedGrid in memory
  grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = { symbol: '.', code: null };
    }
  }

  // Remove saved data from localStorage
  localStorage.removeItem("cross_stitch_grid");

  // Re-render grid cleanly from memory
  buildGrid();
}


// === Initialize Grid ===
buildGrid();

// === Restore Color Mode on Load ===
if (localStorage.getItem("color_mode_enabled") === "1") {
  document.getElementById("toggle-view-mode").checked = true;
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.add('color-mode');
  });
}
