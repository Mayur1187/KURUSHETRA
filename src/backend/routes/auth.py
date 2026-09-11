from flask import Blueprint, jsonify, request
from services.auth_service import auth_service
from utils.logger import logger

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    role = data.get("role", "farmer")
    village = data.get("village", "Ramgarh")

    if not email or not password or not full_name:
        return jsonify({"success": False, "error": "Email, password, and full name are required."}), 400

    try:
        res = auth_service.register_user(full_name, email, password, role, village)
        return jsonify({"success": True, "data": res}), 201
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required."}), 400

    try:
        res = auth_service.login_user(email, password)
        return jsonify({"success": True, "data": res}), 200
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@auth_bp.route("/api/auth/quick-login", methods=["POST"])
def quick_login():
    data = request.get_json() or {}
    preset = data.get("preset", "farmer-a")
    res = auth_service.get_quick_login(preset)
    return jsonify({"success": True, "data": res}), 200

@auth_bp.route("/api/auth/me", methods=["GET"])
def get_current_user():
    # Simple bearer token check
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"success": False, "error": "No token provided"}), 401
    
    token = auth_header.replace("Bearer ", "")
    if token.startswith("demo-token-"):
        preset = token.replace("demo-token-usr-", "")
        res = auth_service.get_quick_login(preset)
        return jsonify({"success": True, "user": res["user"]}), 200

    return jsonify({"success": True, "message": "Session valid"}), 200
