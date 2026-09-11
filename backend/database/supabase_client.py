import os
from config import Config
from utils.logger import logger
from database.mock_db import db

supabase_client = None

if Config.SUPABASE_URL and Config.SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to in-memory MockDatabase.")
else:
        logger.info("Supabase credentials not configured. Using in-memory MockDatabase.")

def get_db():
    return db
