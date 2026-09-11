from flask import Blueprint, jsonify
from database.mock_db import db
from services.conflict_detector import conflict_detector

conflicts_bp = Blueprint("conflicts", __name__)

@conflicts_bp.route("/api/conflicts/detect", methods=["POST"])
def detect_conflicts():
    water_resource = db.get_water_resource()
    water_requests = db.get_water_requests()
    farmers_dict = {f["id"]: f for f in db.get_farmers()}

    conflicts = conflict_detector.detect_conflicts(water_resource, water_requests, farmers_dict)
    return jsonify({"success": True, "conflicts": conflicts}), 200

@conflicts_bp.route("/api/conflicts", methods=["GET"])
def get_conflicts():
    water_resource = db.get_water_resource()
    water_requests = db.get_water_requests()
    farmers_dict = {f["id"]: f for f in db.get_farmers()}

    conflicts = conflict_detector.detect_conflicts(water_resource, water_requests, farmers_dict)
    return jsonify({"success": True, "conflicts": conflicts}), 200
