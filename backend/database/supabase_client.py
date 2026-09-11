import os
from config import Config
from utils.logger import logger
from database.mock_db import db

supabase_client = None
is_supabase_connected = False

if Config.SUPABASE_URL and Config.SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        is_supabase_connected = True
        logger.info(f"Supabase client initialized for project URL: {Config.SUPABASE_URL}")
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to in-memory MockDatabase.")
        supabase_client = None
        is_supabase_connected = False
else:
    logger.info("Supabase credentials not configured or incomplete. Operating in local MockDatabase mode.")

class DatabaseService:
    """
    Unified database service wrapper that uses Supabase PostgreSQL when connected,
    or falls back to in-memory MockDatabase seamlessly.
    """

    def get_water_resource(self):
        if is_supabase_connected and supabase_client:
            try:
                res = supabase_client.table("water_resources").select("*").order("created_at", desc=True).limit(1).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase fetch water_resources error: {e}. Falling back to mock DB.")
        return db.get_water_resource()

    def update_water_resource(self, available_water, canal_capacity=None):
        if is_supabase_connected and supabase_client:
            try:
                payload = {
                    "total_available_water": float(available_water),
                    "canal_capacity": float(canal_capacity) if canal_capacity else 2500.0,
                    "allocation_date": "2026-09-11"
                }
                res = supabase_client.table("water_resources").insert(payload).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase insert water_resources error: {e}. Updating mock DB.")
        return db.update_water_resource(available_water, canal_capacity)

    def get_farmers(self):
        if is_supabase_connected and supabase_client:
            try:
                res = supabase_client.table("farmers").select("*").execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase fetch farmers error: {e}. Falling back to mock DB.")
        return db.get_farmers()

    def get_farmer(self, farmer_id):
        if is_supabase_connected and supabase_client:
            try:
                res = supabase_client.table("farmers").select("*").eq("id", farmer_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase fetch farmer {farmer_id} error: {e}.")
        return db.get_farmer(farmer_id)

    def add_farmer(self, farmer_data):
        if is_supabase_connected and supabase_client:
            try:
                res = supabase_client.table("farmers").insert(farmer_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase insert farmer error: {e}.")
        return db.add_farmer(farmer_data)

    def get_water_requests(self):
        if is_supabase_connected and supabase_client:
            try:
                res = supabase_client.table("water_requests").select("*").execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase fetch water_requests error: {e}.")
        return db.get_water_requests()

    def add_water_request(self, request_data):
        if is_supabase_connected and supabase_client:
            try:
                res = supabase_client.table("water_requests").insert(request_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase insert water_request error: {e}.")
        return db.add_water_request(request_data)

    def get_fairness_history(self, farmer_id=None):
        if is_supabase_connected and supabase_client:
            try:
                query = supabase_client.table("fairness_history").select("*")
                if farmer_id:
                    query = query.eq("farmer_id", farmer_id)
                res = query.execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase fetch fairness_history error: {e}.")
        return db.get_fairness_history(farmer_id)

    def add_audit_log(self, negotiation_id, event_type, event_data):
        if is_supabase_connected and supabase_client:
            try:
                log_item = {
                    "negotiation_id": negotiation_id,
                    "event_type": event_type,
                    "event_data": event_data
                }
                supabase_client.table("audit_logs").insert(log_item).execute()
            except Exception as e:
                logger.warning(f"Supabase insert audit_logs error: {e}.")
        return db.add_audit_log(negotiation_id, event_type, event_data)

    def get_audit_logs(self, negotiation_id=None):
        if is_supabase_connected and supabase_client:
            try:
                query = supabase_client.table("audit_logs").select("*").order("created_at", desc=False)
                if negotiation_id:
                    query = query.eq("negotiation_id", negotiation_id)
                res = query.execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase fetch audit_logs error: {e}.")
        return db.get_audit_logs(negotiation_id)

db_service = DatabaseService()

def get_db():
    return db_service
