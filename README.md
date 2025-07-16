# Flask SQLite Upload Template

This is a starter Flask project template designed for rapid prototyping of web apps that:
- Use **SQLite** for a lightweight database
- Include a file **upload endpoint**
- Support HTML rendering via **Jinja2 templates**
- Use the **app factory pattern** for scalable structure

---

## 🔧 Project Structure

```
flask_template/
├── app/
│   ├── __init__.py          # Initializes the Flask app and database
│   ├── routes.py            # Defines all HTTP endpoints and Blueprint
│   ├── models.py            # SQLAlchemy models (currently: Message)
│   ├── templates/
│   │   └── messages.html    # HTML template to render messages
│   └── uploads/             # Where uploaded files are stored
│
├── instance/
│   └── app.db               # SQLite database lives here (auto-created)
│
├── config.py                # App configuration (DB path, secret key, etc.)
├── install.py               # One-time setup script to create tables & test data
├── run.py                   # App entry point
├── requirements.txt         # Dependencies
└── README.md                # This file
```

---

## 🚀 Quickstart

### 1. Clone the Repo and Set Up Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run the Install Script
This creates the database, tables, and inserts sample data:
```bash
python install.py
```

### 3. Start the Server
```bash
python run.py
```

Now visit: [http://localhost:5000/messages](http://localhost:5000/messages)

---

## 📁 Upload Endpoint

POST `/upload`

**Form-Data:**
```
file=<your_file>
```

Allowed extensions: `png`, `jpg`, `jpeg`, `gif`, `pdf`, `txt`  
Uploads go to `app/uploads/`

---

## 🧱 Database Model

The template includes a simple example model:

```python
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
```

To inspect your SQLite DB, you can use:

- PyCharm (Professional) Database tab
- DB Browser for SQLite
- DBeaver or TablePlus

---

## 🧩 Notes

- Blueprint pattern used for modular routing
- Template rendering supported via `Jinja2`
- Upload limit: 16 MB
- Production deployment should use Gunicorn + Nginx

---

## 🧼 Reset the Database (Optional)

You can wipe the DB and re-run:

```bash
rm instance/app.db
python install.py
```

---

## 📬 Contributing

Feel free to fork or use this as a template repo on GitHub!
