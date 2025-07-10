import json
import os
from app import create_app, db

# Initialize Flask app
app = create_app()

with app.app_context():
    from app.models import Message, ThreadColor

    db.create_all()

    # Insert test messages if Message table is empty
    if Message.query.count() == 0:
        print("Inserting test messages...")
        db.session.add_all([
            Message(content="Hello, world!"),
            Message(content="Flask is working."),
            Message(content="SQLite + HTML rendering test.")
        ])
        db.session.commit()
        print("Sample messages inserted.")
    else:
        print("Messages already exist. Skipping.")

    # Load and insert thread colors
    json_path = os.path.join('data', 'dmc_colors.json')
    if not os.path.exists(json_path):
        print(f"❌ Could not find: {json_path}")
    else:
        with open(json_path, 'r') as f:
            colors = json.load(f)

        inserted = 0
        for c in colors:
            if not ThreadColor.query.filter_by(code=str(c['id'])).first():
                db.session.add(ThreadColor(
                    code=str(c['id']),
                    name=c['name'],
                    r=int(c['r']),
                    g=int(c['g']),
                    b=int(c['b']),
                    hex=f"#{c['hex']}"
                ))
                inserted += 1

        db.session.commit()
        print(f"✅ {inserted} DMC thread colors inserted.")