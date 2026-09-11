from utils.logger import logger

class FarmerAgent:
    """
    Digital Farmer Agent representing individual farmer preferences, limits, and flexibility.
    Evaluates proposals and enforces consent-based autonomous negotiation boundaries.
    """

    def __init__(self, farmer_id, farmer_data, preference_data):
        self.farmer_id = farmer_id
        self.farmer_name = farmer_data.get("farmer_name", farmer_id)
        self.min_water = float(preference_data.get("minimum_acceptable_water", farmer_data.get("minimum_water", 0)))
        self.pref_start = preference_data.get("preferred_start", "06:00")
        self.pref_end = preference_data.get("preferred_end", "18:00")
        self.max_delay = float(preference_data.get("maximum_delay", 4))
        self.allow_negotiation = preference_data.get("allow_agent_negotiation", True)

    def evaluate_proposal(self, allocation_item, custom_constraints=None):
        allocated_water = float(allocation_item.get("allocated_water", 0))

        # Check hard minimum water boundary
        if allocated_water < self.min_water:
            return {
                "decision": "REJECT",
                "reason": f"Allocated water ({allocated_water:,.0f} L) is below my strict minimum limit ({self.min_water:,.0f} L)."
            }

        # Check time availability violations from custom constraints
        if custom_constraints:
            for cc in custom_constraints:
                if cc.get("farmer_id") == self.farmer_id:
                    latest_end = cc.get("latest_end_time")
                    end_time = allocation_item.get("end_time")
                    if latest_end and end_time and end_time > latest_end:
                        return {
                            "decision": "REJECT",
                            "reason": f"Irrigation delivery end time ({end_time}) violates hard constraint (Must finish by {latest_end})."
                        }

        return {
            "decision": "ACCEPT",
            "reason": f"Allocated water ({allocated_water:,.0f} L) and schedule ({allocation_item.get('start_time')} - {allocation_item.get('end_time')}) satisfy negotiation boundaries."
        }
