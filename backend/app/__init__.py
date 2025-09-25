from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Config for SQLite (change later if PostgreSQL/MySQL)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///timetable.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # Secrets (replace with env vars in production)
    app.config['SECRET_KEY'] = 'change-this-secret'
    app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']

    db.init_app(app)
    jwt.init_app(app)

    # Enable CORS for frontend (adjust origins if needed)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Import and register routes
    from .routes import timetable_bp
    from .auth.routes import auth_bp
    app.register_blueprint(timetable_bp, url_prefix="/timetable")
    app.register_blueprint(auth_bp, url_prefix="/auth")

    return app
