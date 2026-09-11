from utils.logger import logger

class FairnessEngine:
    """
    Computes Temporal Fairness, Historical Disadvantage Scores,
    Sacrifice Credits, and System-Wide Equity Ratings across allocation cycles.
    """

    def calculate_farmer_fairness_metrics(self, farmer_id, history_records):
        """
        Calculates historical disadvantage and accumulated sacrifice credits for a given farmer.
        """
        farmer_records = [r for r in history_records if r.get("farmer_id") == farmer_id]
        if not farmer_records:
            return {
                "historical_disadvantage": 0.20, # Default baseline disadvantage
                "avg_satisfaction_ratio": 0.80,
                "fairness_credit": 0.0,
                "total_sacrificed_water": 0.0
            }

        ratios = [float(r.get("satisfaction_ratio", 0.8)) for r in farmer_records]
        avg_satisfaction = sum(ratios) / len(ratios)

        # Historical Disadvantage is inverse of average satisfaction
        disadvantage = max(0.0, 1.0 - avg_satisfaction)

        total_sacrificed = sum(float(r.get("sacrifice_amount", 0.0)) for r in farmer_records)

        # Accumulated fairness credits (1 L sacrifice = 0.3 credit points)
        fairness_credit = sum(float(r.get("fairness_credit", 0.0)) for r in farmer_records)
        if fairness_credit == 0 and total_sacrificed > 0:
            fairness_credit = round(total_sacrificed * 0.3, 2)

        return {
            "historical_disadvantage": round(disadvantage, 4),
            "avg_satisfaction_ratio": round(avg_satisfaction, 4),
            "fairness_credit": round(fairness_credit, 2),
            "total_sacrificed_water": round(total_sacrificed, 2)
        }

    def compute_system_fairness_score(self, allocations):
        """
        Calculates a system-wide fairness score (0 - 100%) based on the distribution
        and variance of satisfaction ratios among all participating farmers.
        """
        if not allocations:
            return 100.0

        ratios = [float(a.get("satisfaction_ratio", 1.0)) for a in allocations]
        mean_ratio = sum(ratios) / len(ratios)

        if mean_ratio == 0:
            return 0.0

        # Calculate Mean Absolute Difference for equity rating
        mad = sum(abs(r - mean_ratio) for r in ratios) / len(ratios)

        # Equity score percentage: 100% minus variance penalty, scaled
        fairness_score = max(0.0, min(100.0, (1.0 - mad) * 100.0))
        return round(fairness_score, 1)

fairness_engine = FairnessEngine()
