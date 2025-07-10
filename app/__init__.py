from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    # Set up custom extensions if needed later
    app.extensions['sqlalchemy'] = db

    with app.app_context():
        from . import routes  # Import AFTER app is created
        app.register_blueprint(routes.bp)

        # Create upload directory if not present
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        # Ensure all tables are created
        db.create_all()

    return app