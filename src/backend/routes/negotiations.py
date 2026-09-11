from flask import Blueprint, jsonify, request
from agents.mediator_agent import mediator_agent
from database.mock_db import db

negotiations_bp = Blueprint("negotiations", __name__)

@negotiations_bp.route("/api/negotiation/object", methods=["POST"])
def submit_objection():
    data = request.get_json() or {}
    negotiation_id = data.get("negotiation_id")
    farmer_id = data.get("farmer_id", "farmer-b")
    objection_message = data.get("objection_message", "I cannot irrigate after 2 PM because workers are unavailable.")

    if not negotiation_id:
        # Fallback to current or newest negotiation
        if db.negotiations:
            negotiation_id = list(db.negotiations.keys())[-1]
        else:
            return jsonify({"success": False, "error": "No active negotiation found"}), 400

    result = mediator_agent.process_objection_and_renegotiate(
        negotiation_id=negotiation_id,
        farmer_id=farmer_id,
        objection_text=objection_message
    )

    return jsonify({"success": True, "data": result}), 200

@negotiations_bp.route("/api/negotiation/accept", methods=["POST"])
def accept_proposal():
    data = request.get_json() or {}
    negotiation_id = data.get("negotiation_id")
    farmer_id = data.get("farmer_id")

    db.add_audit_log(
        negotiation_id=negotiation_id,
        event_type="FARMER_ACCEPTED",
        event_data={"farmer_id": farmer_id, "status": "Explicit farmer accept"}
    )
    return jsonify({"success": True, "message": "Proposal accepted by farmer"}), 200

@negotiations_bp.route("/api/negotiation/<negotiation_id>", methods=["GET"])
def get_negotiation_details(negotiation_id):
    neg = db.negotiations.get(negotiation_id)
    if not neg:
        return jsonify({"success": False, "error": "Negotiation not found"}), 404

    logs = db.get_audit_logs(negotiation_id)
    proposals = [p for p in db.proposals.values() if p.get("negotiation_id") == negotiation_id]
    agreement = db.agreements.get(negotiation_id)

    return jsonify({
        "success": True,
        "negotiation": neg,
        "proposals": proposals,
        "agreement": agreement,
        "audit_logs": logs
    }), 200
