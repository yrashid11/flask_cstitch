const gridContainer = document.getElementById('grid-container');
const rows = 20;
const cols = 20;
let activeSymbol = null;

const grid = [];  // In-memory model
const savedGrid = JSON.parse(localStorage.getItem("cross_stitch_grid") || "[]");

// Create grid rows and cells
for (let y = 0; y < rows; y++) {
  const row = document.createElement('div');
  row.className = 'grid-row';
  grid[y] = [];

  for (let x = 0; x < cols; x++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.x = x;
    cell.dataset.y = y;

    // Load saved symbol or default
    const savedSymbol = savedGrid[y]?.[x] || '.';
    cell.textContent = savedSymbol;
    grid[y][x] = savedSymbol;

    cell.addEventListener('click', () => {
      if (activeSymbol) {
        cell.textContent = activeSymbol;
        grid[y][x] = activeSymbol;
        saveGridToLocalStorage();
      } else {
        alert("Select a symbol from your palette first.");
      }
    });

    row.appendChild(cell);
  }

  gridContainer.appendChild(row);
}

// Save grid to localStorage
function saveGridToLocalStorage() {
  localStorage.setItem("cross_stitch_grid", JSON.stringify(grid));
}

function setActiveSymbol(symbol) {
  activeSymbol = symbol;
  document.getElementById("active-symbol-display").textContent = `Selected Symbol: ${symbol}`;
}

function clearGrid(){
  if (!confirm("Are you sure you want to clear the entire grid?")) return;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid[y][x] = '.';

      const cell = document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
      if (cell) cell.textContent = '.';
    }
  }
  localStorage.removeItem("cross_stitch_grid");
}