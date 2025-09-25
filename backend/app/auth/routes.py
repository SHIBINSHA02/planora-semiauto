from flask import Blueprint, request, jsonify
from ..models import User
from .. import db
from flask_bcrypt import generate_password_hash, check_password_hash
from .utils import create_access_token

auth_bp = Blueprint("auth", __name__)

# ===========================
#  REGISTER NEW USER
# ===========================
# Endpoint: POST /auth/signup
# Input (JSON body):
# {
#     "name": "Alice",
#     "email": "alice@example.com",
#     "password": "123456"
# }
# Output (JSON):
# {
#     "message": "User registered successfully",
#     "access_token": "<JWT access token>"
# }
# ---------- Register ----------
@auth_bp.route("/signup", methods=["POST"])
def register():
    data = request.json
    name = data["name"]
    email = data["email"]
    password = data["password"]

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(name=name, email=email)
    user.password_hash = generate_password_hash(password).decode('utf-8')
    db.session.add(user)
    db.session.commit()
    access_token = create_access_token(identity={"email": user.email})

    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token
    }), 201
# ===========================
#  LOGIN USER
# ===========================
# Endpoint: POST /auth/login
# Input (JSON body):
# {
#     "email": "alice@example.com",
#     "password": "123456"
# }
# Output (JSON):
# {
#     "access_token": "<JWT access token>"
# }
# ---------- Login ----------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data["email"]
    password = data["password"]

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity={"email": user.email})
    return jsonify({"access_token": access_token})
