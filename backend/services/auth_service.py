import hashlib
import os
from database.sqlite_db import db_sqlite
from utils.logger import logger

class AuthService:
    """
    Authentication Service for JalSangam AI.
    Handles user registration, login, password hashing, session tokens,
    and instant demo quick-logins.
    """

    SALT = "JalSangam_Secure_Salt_2026"

    def _hash_password(self, password):
        salted = f"{self.SALT}_{password}"
        return hashlib.sha256(salted.encode('utf-8')).hexdigest()

    def register_user(self, full_name, email, password, role="farmer", village="Ramgarh"):
        email_clean = email.lower().strip()
        existing = db_sqlite.get_user_by_email(email_clean)
        if existing:
            raise ValueError("An account with this email address already exists.")

        password_hash = self._hash_password(password)
        user_data = {
            "full_name": full_name,
            "email": email_clean,
            "password_hash": password_hash,
            "role": role if role in ['farmer', 'authority', 'mediator'] else 'farmer',
            "village": village or "Ramgarh"
        }

        user = db_sqlite.add_user(user_data)
        token = f"token-{user['id']}-{os.urandom(4).hex()}"

        logger.info(f"New user registered: {full_name} ({email_clean}) as {role}.")

        # Return user without password_hash
        user_info = {k: v for k, v in user.items() if k != "password_hash"}
        return {"user": user_info, "token": token}

    def login_user(self, email, password):
        email_clean = email.lower().strip()
        user = db_sqlite.get_user_by_email(email_clean)
        if not user:
            raise ValueError("Invalid email or password.")

        password_hash = self._hash_password(password)
        if user["password_hash"] != password_hash:
            raise ValueError("Invalid email or password.")

        token = f"token-{user['id']}-{os.urandom(4).hex()}"
        logger.info(f"User logged in: {user['full_name']} ({email_clean}).")

        user_info = {k: v for k, v in user.items() if k != "password_hash"}
        return {"user": user_info, "token": token}

    def get_quick_login(self, role_preset):
        """
        Instant Demo Login Presets for Hackathon Testing.
        """
        presets = {
            "farmer-a": {
                "id": "usr-farmer-a",
                "full_name": "Farmer A (Ramesh)",
                "email": "farmer.a@jalsangam.ai",
                "role": "farmer",
                "village": "Ramgarh",
                "farmer_id": "farmer-a",
                "crop_type": "Wheat"
            },
            "farmer-b": {
                "id": "usr-farmer-b",
                "full_name": "Farmer B (Suresh)",
                "email": "farmer.b@jalsangam.ai",
                "role": "farmer",
                "village": "Ramgarh",
                "farmer_id": "farmer-b",
                "crop_type": "Vegetables"
            },
            "farmer-c": {
                "id": "usr-farmer-c",
                "full_name": "Farmer C (Mahesh)",
                "email": "farmer.c@jalsangam.ai",
                "role": "farmer",
                "village": "Ramgarh",
                "farmer_id": "farmer-c",
                "crop_type": "Sugarcane"
            },
            "authority": {
                "id": "usr-authority",
                "full_name": "District Irrigation Authority",
                "email": "authority@jalsangam.ai",
                "role": "authority",
                "village": "Central Canal Office"
            },
            "mediator": {
                "id": "usr-mediator",
                "full_name": "JalNyay AI Mediator Administrator",
                "email": "mediator@jalsangam.ai",
                "role": "mediator",
                "village": "Digital Dispute Resolution Cell"
            }
        }

        user_info = presets.get(role_preset, presets["farmer-a"])
        token = f"demo-token-{user_info['id']}"
        logger.info(f"Quick login triggered for preset: {role_preset}.")
        return {"user": user_info, "token": token}

auth_service = AuthService()
