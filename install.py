# install.py

from app import create_app, db

# Initialize app first
app = create_app()

# Now import models AFTER app is created
with app.app_context():
    from app.models import Message

    db.create_all()

    if Message.query.count() == 0:
        print("Inserting test messages...")
        db.session.add_all([
            Message(content="Hello, world!"),
            Message(content="Flask is working."),
            Message(content="SQLite + HTML rendering test."),
        ])
        db.session.commit()
        print("Sample data inserted.")
    else:
        print("Database already has messages. No new data inserted.")
