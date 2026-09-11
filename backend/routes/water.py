from flask import Blueprint, jsonify, request
from database.mock_db import db
from utils.validators import validate_water_resource_payload, validate_water_request_payload

water_bp = Blueprint("water", __name__)

@water_bp.route("/api/water-resource", methods=["GET"])
def get_water_resource():
    res = db.get_water_resource()
    return jsonify({"success": True, "water_resource": res}), 200

@water_bp.route("/api/water-resource", methods=["POST"])
def update_water_resource():
    data = request.get_json() or {}
    valid, err = validate_water_resource_payload(data)
    if not valid:
        return jsonify({"success": False, "error": err}), 400

    updated = db.update_water_resource(
        data["total_available_water"],
        data.get("canal_capacity")
    )
    return jsonify({"success": True, "water_resource": updated}), 200

@water_bp.route("/api/water-requests", methods=["GET"])
def get_water_requests():
    reqs = db.get_water_requests()
    return jsonify({"success": True, "water_requests": reqs}), 200

@water_bp.route("/api/water-request", methods=["POST"])
def create_water_request():
    data = request.get_json() or {}
    valid, err = validate_water_request_payload(data)
    if not valid:
        return jsonify({"success": False, "error": err}), 400

    req = db.add_water_request(data)
    return jsonify({"success": True, "water_request": req}), 201
