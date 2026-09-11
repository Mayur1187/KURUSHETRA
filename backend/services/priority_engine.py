from utils.logger import logger

class PriorityEngine:
    """
    AgriEvidence Confidence-Weighted Priority Engine.
    Combines AI vision crop evidence, water stress detection, declared urgency,
    historical disadvantage ratios, fairness credits, and water deficits.
    """

    WATER_STRESS_MAP = {
        "LOW": 0.25,
        "MEDIUM": 0.50,
        "HIGH": 0.75,
        "CRITICAL": 1.00,
        "UNKNOWN": 0.50  # Neutral fallback value
    }

    def get_water_stress_value(self, stress_label):
        if not stress_label:
            return self.WATER_STRESS_MAP["UNKNOWN"]
        return self.WATER_STRESS_MAP.get(str(stress_label).upper(), self.WATER_STRESS_MAP["UNKNOWN"])

    def evaluate_trust_tier(self, confidence):
        try:
            conf = float(confidence)
        except (ValueError, TypeError):
            conf = 0.5

        if conf >= 0.80:
            return "HIGH TRUST"
        elif conf >= 0.60:
            return "MEDIUM TRUST"
        else:
            return "LOW TRUST"

    def calculate_priority(self, farmer, water_request, fairness_metrics, crop_evidence=None):
        """
        Calculates normalized farmer priority score (0.0 to 1.0).
        If crop evidence is active, uses confidence-weighted AI crop criticality and water stress.
        Otherwise, uses baseline agricultural parameters.
        """
        urgency_norm = float(water_request.get("urgency", 3)) / 5.0
        historical_disadvantage = float(fairness_metrics.get("historical_disadvantage", 0.20))
        fairness_credit_norm = min(1.0, float(fairness_metrics.get("fairness_credit", 0.0)) / 1000.0)

        req_w = float(water_request.get("requested_water", 1))
        min_w = float(water_request.get("minimum_water", 0))
        water_deficit = (req_w - min_w) / req_w if req_w > 0 else 0.0

        if crop_evidence and crop_evidence.get("evidence_status") == "active":
            crop_crit = float(crop_evidence.get("crop_criticality", 0.75))
            crop_conf = float(crop_evidence.get("crop_confidence", 0.80))
            effective_crop_criticality = crop_crit * crop_conf

            stress_label = crop_evidence.get("water_stress", "HIGH")
            stress_val = self.get_water_stress_value(stress_label)
            stress_conf = float(crop_evidence.get("stress_confidence", 0.80))
            effective_water_stress = stress_val * stress_conf

            # Upgraded 6-Factor Evidence Formula
            final_score = (
                (urgency_norm * 0.20) +
                (effective_crop_criticality * 0.30) +
                (effective_water_stress * 0.20) +
                (historical_disadvantage * 0.15) +
                (fairness_credit_norm * 0.10) +
                (water_deficit * 0.05)
            )

            trust_tier = self.evaluate_trust_tier(min(crop_conf, stress_conf))

            return {
                "priority_score": round(final_score, 4),
                "is_evidence_based": True,
                "trust_tier": trust_tier,
                "effective_crop_criticality": round(effective_crop_criticality, 4),
                "effective_water_stress": round(effective_water_stress, 4),
                "water_stress_label": stress_label
            }

        else:
            # Baseline Formula (when no crop evidence exists)
            baseline_score = (
                (urgency_norm * 0.30) +
                (0.80 * 0.25) +
                (historical_disadvantage * 0.20) +
                (fairness_credit_norm * 0.15) +
                (water_deficit * 0.10)
            )

            return {
                "priority_score": round(baseline_score, 4),
                "is_evidence_based": False,
                "trust_tier": "BASELINE",
                "effective_crop_criticality": 0.80,
                "effective_water_stress": 0.50,
                "water_stress_label": "N/A"
            }

    def evaluate_priority_impact(self, previous_score, new_score):
        """
        Calculates priority impact delta and determines if mediation reassessment is required.
        Threshold: change >= 0.10 -> mediation_required = True
        """
        prev = float(previous_score)
        curr = float(new_score)
        change = round(abs(curr - prev), 4)
        mediation_required = change >= 0.10

        return {
            "previous_score": prev,
            "new_score": curr,
            "change": change,
            "mediation_required": mediation_required
        }

priority_engine = PriorityEngine()
