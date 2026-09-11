from services.fairness_engine import fairness_engine

class FairnessAgent:
    """
    Monitors system-wide fairness indices, credit balances, and historical satisfaction trends.
    """

    def analyze_fairness_state(self, farmers, history_records):
        analysis = {}
        for f in farmers:
            fid = f["id"]
            metrics = fairness_engine.calculate_farmer_fairness_metrics(fid, history_records)
            analysis[fid] = {
                "farmer_name": f["farmer_name"],
                "historical_disadvantage": metrics["historical_disadvantage"],
                "avg_satisfaction_ratio": metrics["avg_satisfaction_ratio"],
                "fairness_credit": metrics["fairness_credit"]
            }
        return analysis

fairness_agent = FairnessAgent()
