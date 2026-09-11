from flask import Blueprint, jsonify
from database.mock_db import db

agreements_bp = Blueprint("agreements", __name__)

@agreements_bp.route("/api/agreement/<negotiation_id>", methods=["GET"])
def get_agreement(negotiation_id):
    ag = db.agreements.get(negotiation_id)
    if not ag:
        # Check if there is any agreement at all
        if db.agreements:
            ag = list(db.agreements.values())[-1]
        else:
            return jsonify({"success": False, "error": "No agreement found for negotiation"}), 404
    return jsonify({"success": True, "agreement": ag}), 200

@agreements_bp.route("/api/audit-logs/<negotiation_id>", methods=["GET"])
def get_audit_logs(negotiation_id):
    logs = db.get_audit_logs(negotiation_id)
    return jsonify({"success": True, "audit_logs": logs}), 200
