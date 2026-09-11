from flask import Blueprint, jsonify, request
from database.mock_db import db
from utils.validators import validate_farmer_payload

farmers_bp = Blueprint("farmers", __name__)

@farmers_bp.route("/api/farmers", methods=["GET"])
def get_farmers():
    farmers = db.get_farmers()
    requests_map = {r["farmer_id"]: r for r in db.get_water_requests()}
    for f in farmers:
        fid = f["id"]
        if fid in requests_map:
            f["water_request"] = requests_map[fid]
    return jsonify({"success": True, "farmers": farmers}), 200

@farmers_bp.route("/api/farmers", methods=["POST"])
def create_farmer():
    data = request.get_json() or {}
    valid, err = validate_farmer_payload(data)
    if not valid:
        return jsonify({"success": False, "error": err}), 400

    new_farmer = db.add_farmer(data)

    # Optional auto-create request
    if "requested_water" in data:
        db.add_water_request({
            "farmer_id": new_farmer["id"],
            "requested_water": float(data.get("requested_water", 4000)),
            "minimum_water": float(data.get("minimum_water", 2500)),
            "urgency": int(data.get("urgency", 3)),
            "preferred_start": data.get("preferred_start", "06:00"),
            "preferred_end": data.get("preferred_end", "12:00")
        })

    return jsonify({"success": True, "farmer": new_farmer}), 201

@farmers_bp.route("/api/farmers/<farmer_id>", methods=["GET"])
def get_farmer_by_id(farmer_id):
    farmer = db.get_farmer(farmer_id)
    if not farmer:
        return jsonify({"success": False, "error": "Farmer not found"}), 404
    return jsonify({"success": True, "farmer": farmer}), 200
