# Cross-Stitch Pattern Generator

🧵 A browser-based cross-stitch pattern editor with DMC thread color integration, grid editing, and local storage persistence.

## ✨ Features

- 🎨 Select DMC thread colors and auto-assign symbols
- 🧺 Active color palette with removable swatches
- 🧱 Editable 20x20 stitch grid using chosen symbols
- 💾 Persistent state via localStorage for grid and palette
- 🗑 Clear grid button with confirmation
- 🔍 Search/filter DMC threads by code, name, or hex

## 🗂 Project Structure

```
flask_cstitch/
├── app/
│   ├── __init__.py
│   ├── routes.py
│   ├── models.py
│   ├── templates/
│   │   └── index.html
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       ├── app.js
│   │       └── colors.js
│   └── uploads/
├── data/
│   └── dmc_colors.json
├── instance/
│   └── app.db
├── install.py
├── run.py
└── config.py
```

## 🧪 Local Development

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Initialize the database and load DMC colors:
   ```bash
   python install.py
   ```

4. Run the app:
   ```bash
   python run.py
   ```

5. Open in your browser: `http://localhost:5000`

## 🗃 Data Sources

- DMC Color Data: Converted from Wolfram's symbolic JSON export
- Stored in `data/dmc_colors.json`

## 📦 Dependencies

- Flask
- Flask-SQLAlchemy
- SQLite (via SQLAlchemy)

## 🔒 Notes

- All grid and palette data is stored client-side in localStorage.
- Symbols are limited to a predefined set and reused only when freed.

---

Made with 🧡 for creative stitchers and developers alike.
