from flask import Blueprint, jsonify
from agents.mediator_agent import mediator_agent
from database.mock_db import db

mediation_bp = Blueprint("mediation", __name__)

@mediation_bp.route("/api/mediation/start", methods=["POST"])
def start_mediation():
    result = mediator_agent.start_mediation()
    return jsonify({"success": True, "data": result}), 200

@mediation_bp.route("/api/mediation/reset", methods=["POST"])
def reset_mediation():
    db.reset_to_demo_data()
    return jsonify({"success": True, "message": "Mediation environment reset to default demo scenario."}), 200
