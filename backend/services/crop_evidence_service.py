from database.sqlite_db import db_sqlite
from ai.crop_analyzer import crop_analyzer
from services.priority_engine import priority_engine
from services.fairness_engine import fairness_engine
from utils.logger import logger

class CropEvidenceService:

    def analyze_and_store_evidence(self, farmer_id, image_bytes=None, filename=None, crop_hint=None):
        farmer = db_sqlite.get_farmer(farmer_id)
        if not farmer:
            raise ValueError(f"Farmer with ID '{farmer_id}' not found.")

        requests = [r for r in db_sqlite.get_water_requests() if r["farmer_id"] == farmer_id]
        water_req = requests[0] if requests else {
            "farmer_id": farmer_id,
            "requested_water": 4000,
            "minimum_water": 2500,
            "urgency": 4
        }

        history = db_sqlite.get_fairness_history(farmer_id)
        fairness_info = fairness_engine.calculate_farmer_fairness_metrics(farmer_id, history)

        # 1. Previous priority before new evidence
        prev_active_evidence = db_sqlite.get_active_crop_evidence(farmer_id)
        prev_eval = priority_engine.calculate_priority(farmer, water_req, fairness_info, prev_active_evidence)
        previous_score = prev_eval["priority_score"]

        # 2. Analyze crop image via AI Vision / Demo Analyzer
        hint = crop_hint or farmer.get("crop_type", "Wheat")
        analysis = crop_analyzer.analyze_crop_image(farmer_id, farmer["farmer_name"], hint, image_bytes, filename)

        # 3. Store new active evidence
        evidence_data = {
            "farmer_id": farmer_id,
            "image_url": f"/uploads/{filename}" if filename else "/demo-crop.jpg",
            "crop_type": analysis.get("crop_type", "UNKNOWN"),
            "crop_confidence": float(analysis.get("crop_confidence", 0.0)),
            "growth_stage": analysis.get("growth_stage", "UNKNOWN"),
            "growth_confidence": float(analysis.get("growth_confidence", 0.0)),
            "water_stress": analysis.get("water_stress", "UNKNOWN"),
            "stress_confidence": float(analysis.get("stress_confidence", 0.0)),
            "crop_criticality": float(analysis.get("crop_criticality", 0.5)),
            "evidence_status": "active",
            "analysis_summary": analysis.get("analysis_summary", "")
        }
        stored_evidence = db_sqlite.add_crop_evidence(evidence_data)

        # 4. Calculate new priority after active evidence
        new_eval = priority_engine.calculate_priority(farmer, water_req, fairness_info, stored_evidence)
        new_score = new_eval["priority_score"]

        # 5. Evaluate priority impact & mediation trigger
        impact = priority_engine.evaluate_priority_impact(previous_score, new_score)

        # 6. Record Audit Logs
        neg_id = "neg-1"
        db_sqlite.add_audit_log(neg_id, "CROP_EVIDENCE_SUBMITTED", {
            "farmer_id": farmer_id,
            "farmer_name": farmer["farmer_name"],
            "crop_type": analysis["crop_type"],
            "filename": filename or "demo_crop_image.jpg"
        })

        db_sqlite.add_audit_log(neg_id, "CROP_EVIDENCE_ANALYZED", {
            "farmer_id": farmer_id,
            "water_stress": analysis["water_stress"],
            "crop_criticality": analysis["crop_criticality"],
            "trust_tier": new_eval["trust_tier"]
        })

        db_sqlite.add_audit_log(neg_id, "EVIDENCE_CONFIDENCE_EVALUATED", {
            "farmer_id": farmer_id,
            "crop_confidence": analysis["crop_confidence"],
            "stress_confidence": analysis["stress_confidence"],
            "trust_tier": new_eval["trust_tier"]
        })

        db_sqlite.add_audit_log(neg_id, "PRIORITY_UPDATED", {
            "farmer_id": farmer_id,
            "previous_score": previous_score,
            "new_score": new_score,
            "change": impact["change"]
        })

        if impact["mediation_required"]:
            db_sqlite.add_audit_log(neg_id, "MEDIATION_REASSESSMENT_TRIGGERED", {
                "farmer_id": farmer_id,
                "reason": f"Priority score changed by {impact['change']} (Exceeds threshold 0.10)."
            })

        logger.info(f"Crop evidence processed. Farmer: {farmer['farmer_name']}, Prev: {previous_score}, New: {new_score}, Impact: {impact['change']}, Reassessment: {impact['mediation_required']}")

        return {
            "success": True,
            "evidence": stored_evidence,
            "priority_impact": impact,
            "trust_tier": new_eval["trust_tier"],
            "mediation_required": impact["mediation_required"],
            "analysis_details": analysis
        }

    def challenge_evidence(self, evidence_id, farmer_id, new_image_bytes=None, filename=None):
        db_sqlite.update_crop_evidence_status(evidence_id, "challenged")

        db_sqlite.add_audit_log("neg-1", "EVIDENCE_CHALLENGED", {
            "evidence_id": evidence_id,
            "farmer_id": farmer_id,
            "message": "Farmer challenged existing crop evidence. Running re-analysis."
        })

        return self.analyze_and_store_evidence(farmer_id, new_image_bytes, filename)

    def get_farmer_evidence_history(self, farmer_id):
        return db_sqlite.get_crop_evidence_history(farmer_id)

crop_evidence_service = CropEvidenceService()
