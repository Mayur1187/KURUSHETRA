from flask import Blueprint, jsonify, request
from services.crop_evidence_service import crop_evidence_service
from agents.mediator_agent import mediator_agent
from database.sqlite_db import db_sqlite
from utils.logger import logger

crop_evidence_bp = Blueprint("crop_evidence", __name__)

@crop_evidence_bp.route("/api/crop-evidence/analyze", methods=["POST"])
def analyze_crop_evidence():
    farmer_id = request.form.get("farmer_id") or (request.json or {}).get("farmer_id", "farmer-c")
    crop_hint = request.form.get("crop_hint") or (request.json or {}).get("crop_hint")

    image_bytes = None
    filename = None

    if "image" in request.files:
        file = request.files["image"]
        filename = file.filename
        image_bytes = file.read()

    try:
        res = crop_evidence_service.analyze_and_store_evidence(
            farmer_id=farmer_id,
            image_bytes=image_bytes,
            filename=filename,
            crop_hint=crop_hint
        )
        return jsonify(res), 200
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 404
    except Exception as e:
        logger.error(f"Error analyzing crop evidence: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@crop_evidence_bp.route("/api/crop-evidence/farmer/<farmer_id>", methods=["GET"])
def get_farmer_crop_evidence(farmer_id):
    history = crop_evidence_service.get_farmer_evidence_history(farmer_id)
    active = db_sqlite.get_active_crop_evidence(farmer_id)
    return jsonify({"success": True, "active": active, "history": history}), 200

@crop_evidence_bp.route("/api/crop-evidence/reassess", methods=["POST"])
def reassess_mediation():
    data = request.get_json() or {}
    farmer_id = data.get("farmer_id", "farmer-c")
    negotiation_id = data.get("negotiation_id") or "neg-1"

    active_evidence = db_sqlite.get_active_crop_evidence(farmer_id)
    if not active_evidence:
        return jsonify({"success": False, "error": "No active crop evidence found for farmer"}), 400

    evidence_res = {
        "evidence": active_evidence,
        "priority_impact": data.get("priority_impact", {"previous_score": 0.78, "new_score": 0.91, "change": 0.13}),
        "trust_tier": "HIGH TRUST"
    }

    result = mediator_agent.reassess_mediation_with_evidence(
        negotiation_id=negotiation_id,
        farmer_id=farmer_id,
        evidence_result=evidence_res
    )

    return jsonify({"success": True, "data": result}), 200

@crop_evidence_bp.route("/api/crop-evidence/challenge", methods=["POST"])
def challenge_crop_evidence():
    data = request.get_json() or {}
    evidence_id = data.get("evidence_id")
    farmer_id = data.get("farmer_id", "farmer-c")

    if not evidence_id:
        active = db_sqlite.get_active_crop_evidence(farmer_id)
        evidence_id = active["id"] if active else "ev-1"

    res = crop_evidence_service.challenge_evidence(evidence_id, farmer_id)
    return jsonify({"success": True, "data": res}), 200
