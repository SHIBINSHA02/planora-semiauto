from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # Config for SQLite (change later if PostgreSQL/MySQL)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///timetable.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Import and register routes
    from .routes import timetable_bp
    app.register_blueprint(timetable_bp, url_prefix="/timetable")

    return app
