import uuid
from datetime import datetime

class MockDatabase:
    """
    In-memory thread-safe mock database prepopulated with the demo scenario.
    Provides seamless zero-dependency runtime fallback when Supabase is not configured.
    """
    def __init__(self):
        self.reset_to_demo_data()

    def reset_to_demo_data(self):
        # Demo Water Resource
        self.water_resource = {
            "id": "res-101",
            "total_available_water": 10000.0,
            "unit": "Liters",
            "canal_capacity": 2500.0,  # 2500 L/hour
            "allocation_date": datetime.now().strftime("%Y-%m-%d"),
            "created_at": datetime.now().isoformat()
        }

        # Demo Farmers
        self.farmers = {
            "farmer-a": {
                "id": "farmer-a",
                "farmer_name": "Farmer A (Ramesh)",
                "land_area": 5.0,
                "land_unit": "Acres",
                "crop_type": "Wheat",
                "crop_stage": "Flowering",
                "created_at": datetime.now().isoformat()
            },
            "farmer-b": {
                "id": "farmer-b",
                "farmer_name": "Farmer B (Suresh)",
                "land_area": 3.5,
                "land_unit": "Acres",
                "crop_type": "Vegetables",
                "crop_stage": "Fruit Setting",
                "created_at": datetime.now().isoformat()
            },
            "farmer-c": {
                "id": "farmer-c",
                "farmer_name": "Farmer C (Mahesh)",
                "land_area": 8.0,
                "land_unit": "Acres",
                "crop_type": "Sugarcane",
                "crop_stage": "Tillering",
                "created_at": datetime.now().isoformat()
            }
        }

        # Demo Water Requests
        self.water_requests = {
            "req-a": {
                "id": "req-a",
                "farmer_id": "farmer-a",
                "requested_water": 5000.0,
                "minimum_water": 3000.0,
                "urgency": 4,
                "preferred_start": "06:00",
                "preferred_end": "10:00",
                "max_delay_hours": 4,
                "status": "pending",
                "created_at": datetime.now().isoformat()
            },
            "req-b": {
                "id": "req-b",
                "farmer_id": "farmer-b",
                "requested_water": 4000.0,
                "minimum_water": 2500.0,
                "urgency": 4,
                "preferred_start": "06:00",
                "preferred_end": "12:00",
                "max_delay_hours": 3,
                "status": "pending",
                "created_at": datetime.now().isoformat()
            },
            "req-c": {
                "id": "req-c",
                "farmer_id": "farmer-c",
                "requested_water": 6000.0,
                "minimum_water": 4000.0,
                "urgency": 5,
                "preferred_start": "10:00",
                "preferred_end": "16:00",
                "max_delay_hours": 2,
                "status": "pending",
                "created_at": datetime.now().isoformat()
            }
        }

        # Demo Negotiation Preferences / Agent Boundaries
        self.negotiation_preferences = {
            "pref-a": {
                "id": "pref-a",
                "farmer_id": "farmer-a",
                "minimum_acceptable_water": 3000.0,
                "preferred_start": "06:00",
                "preferred_end": "10:00",
                "maximum_delay": 4,
                "priority_order": 1,
                "allow_agent_negotiation": True
            },
            "pref-b": {
                "id": "pref-b",
                "farmer_id": "farmer-b",
                "minimum_acceptable_water": 2500.0,
                "preferred_start": "06:00",
                "preferred_end": "12:00",
                "maximum_delay": 3,
                "priority_order": 2,
                "allow_agent_negotiation": True
            },
            "pref-c": {
                "id": "pref-c",
                "farmer_id": "farmer-c",
                "minimum_acceptable_water": 4000.0,
                "preferred_start": "10:00",
                "preferred_end": "16:00",
                "maximum_delay": 2,
                "priority_order": 1,
                "allow_agent_negotiation": True
            }
        }

        # Demo Historical Fairness Data across previous allocation cycles
        self.fairness_history = [
            {
                "id": "fh-a-1",
                "farmer_id": "farmer-a",
                "requested_water": 5000.0,
                "allocated_water": 4500.0,
                "satisfaction_ratio": 0.90,
                "sacrifice_amount": 500.0,
                "fairness_credit": 150.0,
                "allocation_cycle": 1,
                "created_at": "2026-09-01T10:00:00"
            },
            {
                "id": "fh-b-1",
                "farmer_id": "farmer-b",
                "requested_water": 4000.0,
                "allocated_water": 3200.0,
                "satisfaction_ratio": 0.80,
                "sacrifice_amount": 800.0,
                "fairness_credit": 240.0,
                "allocation_cycle": 1,
                "created_at": "2026-09-01T10:00:00"
            },
            {
                "id": "fh-c-1",
                "farmer_id": "farmer-c",
                "requested_water": 6000.0,
                "allocated_water": 4200.0,
                "satisfaction_ratio": 0.70,
                "sacrifice_amount": 1800.0,
                "fairness_credit": 540.0,
                "allocation_cycle": 1,
                "created_at": "2026-09-01T10:00:00"
            }
        ]

        self.conflicts = {}
        self.negotiations = {}
        self.proposals = {}
        self.objections = {}
        self.agreements = {}
        self.audit_logs = []
        self.custom_constraints = []

    def get_water_resource(self):
        return self.water_resource

    def update_water_resource(self, available_water, canal_capacity=None):
        self.water_resource["total_available_water"] = float(available_water)
        if canal_capacity:
            self.water_resource["canal_capacity"] = float(canal_capacity)
        return self.water_resource

    def get_farmers(self):
        return list(self.farmers.values())

    def get_farmer(self, farmer_id):
        return self.farmers.get(farmer_id)

    def add_farmer(self, farmer_data):
        fid = farmer_data.get("id", f"farmer-{uuid.uuid4().hex[:6]}")
        farmer_data["id"] = fid
        farmer_data["created_at"] = datetime.now().isoformat()
        self.farmers[fid] = farmer_data
        return farmer_data

    def get_water_requests(self):
        return list(self.water_requests.values())

    def add_water_request(self, request_data):
        rid = request_data.get("id", f"req-{uuid.uuid4().hex[:6]}")
        request_data["id"] = rid
        request_data["created_at"] = datetime.now().isoformat()
        self.water_requests[rid] = request_data
        return request_data

    def get_fairness_history(self, farmer_id=None):
        if farmer_id:
            return [fh for fh in self.fairness_history if fh["farmer_id"] == farmer_id]
        return self.fairness_history

    def add_audit_log(self, negotiation_id, event_type, event_data):
        log = {
            "id": f"log-{uuid.uuid4().hex[:6]}",
            "negotiation_id": negotiation_id,
            "event_type": event_type,
            "event_data": event_data,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "created_at": datetime.now().isoformat()
        }
        self.audit_logs.append(log)
        return log

    def get_audit_logs(self, negotiation_id=None):
        if negotiation_id:
            return [l for l in self.audit_logs if l.get("negotiation_id") == negotiation_id]
        return self.audit_logs

db = MockDatabase()
