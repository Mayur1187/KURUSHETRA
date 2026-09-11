import sqlite3
import json
import os
from datetime import datetime
from utils.logger import logger

DB_FILE = os.path.join(os.path.dirname(__file__), "..", "jalsangam.db")

class SQLiteDatabase:
    """
    Self-contained local SQLite database manager for JalSangam AI.
    Auto-initializes PostgreSQL/SQLite schema and seeds default demo data.
    """
    def __init__(self, db_path=DB_FILE):
        self.db_path = os.path.abspath(db_path)
        self.init_db()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        logger.info(f"Initializing local SQLite database at: {self.db_path}")
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. profiles
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                role TEXT CHECK (role IN ('farmer', 'authority', 'mediator')),
                village TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 1b. users
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT CHECK (role IN ('farmer', 'authority', 'mediator')) DEFAULT 'farmer',
                village TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 2. farmers
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS farmers (
                id TEXT PRIMARY KEY,
                profile_id TEXT,
                farmer_name TEXT NOT NULL,
                land_area REAL NOT NULL,
                land_unit TEXT DEFAULT 'Acres',
                crop_type TEXT NOT NULL,
                crop_stage TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 3. water_resources
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS water_resources (
                id TEXT PRIMARY KEY,
                total_available_water REAL NOT NULL,
                unit TEXT DEFAULT 'Liters',
                canal_capacity REAL NOT NULL,
                allocation_date TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 4. water_requests
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS water_requests (
                id TEXT PRIMARY KEY,
                farmer_id TEXT NOT NULL,
                requested_water REAL NOT NULL,
                minimum_water REAL NOT NULL,
                urgency INTEGER CHECK (urgency BETWEEN 1 AND 5),
                preferred_start TEXT NOT NULL,
                preferred_end TEXT NOT NULL,
                max_delay_hours REAL DEFAULT 4,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 5. negotiation_preferences
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS negotiation_preferences (
                id TEXT PRIMARY KEY,
                farmer_id TEXT NOT NULL,
                minimum_acceptable_water REAL NOT NULL,
                preferred_start TEXT NOT NULL,
                preferred_end TEXT NOT NULL,
                maximum_delay REAL DEFAULT 4,
                priority_order INTEGER DEFAULT 1,
                allow_agent_negotiation INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 6. fairness_history
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS fairness_history (
                id TEXT PRIMARY KEY,
                farmer_id TEXT NOT NULL,
                requested_water REAL NOT NULL,
                allocated_water REAL NOT NULL,
                satisfaction_ratio REAL NOT NULL,
                sacrifice_amount REAL DEFAULT 0,
                fairness_credit REAL DEFAULT 0,
                allocation_cycle INTEGER NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 7. conflicts
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS conflicts (
                id TEXT PRIMARY KEY,
                conflict_type TEXT NOT NULL,
                severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
                description TEXT,
                affected_farmers TEXT, -- JSON string
                status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 8. negotiations
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS negotiations (
                id TEXT PRIMARY KEY,
                conflict_id TEXT,
                status TEXT DEFAULT 'in_progress',
                current_round INTEGER DEFAULT 1,
                mediator_status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 9. proposals
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS proposals (
                id TEXT PRIMARY KEY,
                negotiation_id TEXT NOT NULL,
                proposal_round INTEGER NOT NULL,
                allocation_data TEXT NOT NULL, -- JSON string
                fairness_score REAL DEFAULT 0,
                constraint_score REAL DEFAULT 0,
                agreement_score REAL DEFAULT 0,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 10. objections
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS objections (
                id TEXT PRIMARY KEY,
                proposal_id TEXT,
                farmer_id TEXT NOT NULL,
                objection_message TEXT NOT NULL,
                extracted_constraint TEXT, -- JSON string
                constraint_priority TEXT DEFAULT 'HIGH',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 11. agreements
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS agreements (
                id TEXT PRIMARY KEY,
                negotiation_id TEXT NOT NULL,
                final_allocation TEXT NOT NULL, -- JSON string
                final_fairness_score REAL NOT NULL,
                agreement_status TEXT DEFAULT 'FINALIZED',
                accepted_by TEXT, -- JSON string
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 12. audit_logs
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                negotiation_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                event_data TEXT, -- JSON string
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 13. crop_evidence
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS crop_evidence (
                id TEXT PRIMARY KEY,
                farmer_id TEXT NOT NULL,
                image_url TEXT,
                crop_type TEXT,
                crop_confidence REAL,
                growth_stage TEXT,
                growth_confidence REAL,
                water_stress TEXT,
                stress_confidence REAL,
                crop_criticality REAL,
                evidence_status TEXT DEFAULT 'active',
                analysis_summary TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            conn.commit()

        # Auto seed demo data if empty
        self.seed_demo_data()

    def seed_demo_data(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Check if water resource exists
            cursor.execute("SELECT COUNT(*) FROM water_resources")
            if cursor.fetchone()[0] == 0:
                logger.info("Seeding default demo dataset into SQLite database...")
                now_str = datetime.now().isoformat()

                # Water Resource
                cursor.execute("""
                INSERT INTO water_resources (id, total_available_water, unit, canal_capacity, allocation_date, created_at)
                VALUES ('res-101', 10000.0, 'Liters', 2500.0, '2026-09-11', ?)
                """, (now_str,))

                # Farmers
                farmers = [
                    ('farmer-a', 'Farmer A (Ramesh)', 5.0, 'Acres', 'Wheat', 'Flowering', now_str),
                    ('farmer-b', 'Farmer B (Suresh)', 3.5, 'Acres', 'Vegetables', 'Fruit Setting', now_str),
                    ('farmer-c', 'Farmer C (Mahesh)', 8.0, 'Acres', 'Sugarcane', 'Tillering', now_str)
                ]
                cursor.executemany("""
                INSERT INTO farmers (id, farmer_name, land_area, land_unit, crop_type, crop_stage, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, farmers)

                # Water Requests
                requests = [
                    ('req-a', 'farmer-a', 5000.0, 3000.0, 4, '06:00', '10:00', 4, 'pending', now_str),
                    ('req-b', 'farmer-b', 4000.0, 2500.0, 4, '06:00', '12:00', 3, 'pending', now_str),
                    ('req-c', 'farmer-c', 6000.0, 4000.0, 5, '10:00', '16:00', 2, 'pending', now_str)
                ]
                cursor.executemany("""
                INSERT INTO water_requests (id, farmer_id, requested_water, minimum_water, urgency, preferred_start, preferred_end, max_delay_hours, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, requests)

                # Negotiation Preferences
                prefs = [
                    ('pref-a', 'farmer-a', 3000.0, '06:00', '10:00', 4, 1, 1, now_str),
                    ('pref-b', 'farmer-b', 2500.0, '06:00', '12:00', 3, 2, 1, now_str),
                    ('pref-c', 'farmer-c', 4000.0, '10:00', '16:00', 2, 1, 1, now_str)
                ]
                cursor.executemany("""
                INSERT INTO negotiation_preferences (id, farmer_id, minimum_acceptable_water, preferred_start, preferred_end, maximum_delay, priority_order, allow_agent_negotiation, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, prefs)

                # Fairness History
                history = [
                    ('fh-a-1', 'farmer-a', 5000.0, 4500.0, 0.90, 500.0, 150.0, 1, '2026-09-01T10:00:00'),
                    ('fh-b-1', 'farmer-b', 4000.0, 3200.0, 0.80, 800.0, 240.0, 1, '2026-09-01T10:00:00'),
                    ('fh-c-1', 'farmer-c', 6000.0, 4200.0, 0.70, 1800.0, 540.0, 1, '2026-09-01T10:00:00')
                ]
                cursor.executemany("""
                INSERT INTO fairness_history (id, farmer_id, requested_water, allocated_water, satisfaction_ratio, sacrifice_amount, fairness_credit, allocation_cycle, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, history)

                conn.commit()

    # Query Helpers
    def get_water_resource(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM water_resources ORDER BY created_at DESC LIMIT 1")
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_water_resource(self, available_water, canal_capacity=None):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            res = self.get_water_resource()
            rid = res["id"] if res else "res-101"
            cap = float(canal_capacity) if canal_capacity else (res["canal_capacity"] if res else 2500.0)
            cursor.execute("""
            UPDATE water_resources
            SET total_available_water = ?, canal_capacity = ?
            WHERE id = ?
            """, (float(available_water), cap, rid))
            conn.commit()
            return self.get_water_resource()

    def get_farmers(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM farmers")
            return [dict(r) for r in cursor.fetchall()]

    def get_farmer(self, farmer_id):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM farmers WHERE id = ?", (farmer_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def add_farmer(self, farmer_data):
        fid = farmer_data.get("id", f"farmer-{os.urandom(3).hex()}")
        now_str = datetime.now().isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO farmers (id, farmer_name, land_area, land_unit, crop_type, crop_stage, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                fid,
                farmer_data["farmer_name"],
                float(farmer_data["land_area"]),
                farmer_data.get("land_unit", "Acres"),
                farmer_data["crop_type"],
                farmer_data["crop_stage"],
                now_str
            ))
            conn.commit()
            return self.get_farmer(fid)

    def get_water_requests(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM water_requests")
            return [dict(r) for r in cursor.fetchall()]

    def add_water_request(self, request_data):
        rid = request_data.get("id", f"req-{os.urandom(3).hex()}")
        now_str = datetime.now().isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO water_requests (id, farmer_id, requested_water, minimum_water, urgency, preferred_start, preferred_end, max_delay_hours, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rid,
                request_data["farmer_id"],
                float(request_data["requested_water"]),
                float(request_data["minimum_water"]),
                int(request_data["urgency"]),
                request_data.get("preferred_start", "06:00"),
                request_data.get("preferred_end", "12:00"),
                float(request_data.get("max_delay_hours", 4)),
                "pending",
                now_str
            ))
            conn.commit()
            return dict(cursor.execute("SELECT * FROM water_requests WHERE id = ?", (rid,)).fetchone())

    def get_negotiation_preferences(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM negotiation_preferences")
            return [dict(r) for r in cursor.fetchall()]

    def get_fairness_history(self, farmer_id=None):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if farmer_id:
                cursor.execute("SELECT * FROM fairness_history WHERE farmer_id = ?", (farmer_id,))
            else:
                cursor.execute("SELECT * FROM fairness_history")
            return [dict(r) for r in cursor.fetchall()]

    def add_audit_log(self, negotiation_id, event_type, event_data):
        lid = f"log-{os.urandom(3).hex()}"
        now_str = datetime.now().isoformat()
        timestamp_str = datetime.now().strftime("%H:%M:%S")
        payload = {"timestamp": timestamp_str}
        if isinstance(event_data, dict):
            payload.update(event_data)
        else:
            payload["message"] = str(event_data)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO audit_logs (id, negotiation_id, event_type, event_data, created_at)
            VALUES (?, ?, ?, ?, ?)
            """, (lid, negotiation_id, event_type, json.dumps(payload), now_str))
            conn.commit()
            return {
                "id": lid,
                "negotiation_id": negotiation_id,
                "event_type": event_type,
                "event_data": payload,
                "timestamp": timestamp_str,
                "created_at": now_str
            }

    def get_audit_logs(self, negotiation_id=None):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if negotiation_id:
                cursor.execute("SELECT * FROM audit_logs WHERE negotiation_id = ? ORDER BY created_at ASC", (negotiation_id,))
            else:
                cursor.execute("SELECT * FROM audit_logs ORDER BY created_at ASC")
            logs = []
            for r in cursor.fetchall():
                item = dict(r)
                if item.get("event_data"):
                    try:
                        item["event_data"] = json.loads(item["event_data"])
                        item["timestamp"] = item["event_data"].get("timestamp", "")
                    except Exception:
                        pass
                logs.append(item)
            return logs

    def add_crop_evidence(self, data):
        eid = data.get("id", f"ev-{os.urandom(3).hex()}")
        now_str = datetime.now().isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Mark previous active evidence for this farmer as superseded if new active evidence is added
            if data.get("evidence_status", "active") == "active":
                cursor.execute("""
                UPDATE crop_evidence SET evidence_status = 'superseded'
                WHERE farmer_id = ? AND evidence_status = 'active'
                """, (data["farmer_id"],))

            cursor.execute("""
            INSERT INTO crop_evidence (
                id, farmer_id, image_url, crop_type, crop_confidence, growth_stage,
                growth_confidence, water_stress, stress_confidence, crop_criticality,
                evidence_status, analysis_summary, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eid,
                data["farmer_id"],
                data.get("image_url", ""),
                data.get("crop_type", "UNKNOWN"),
                float(data.get("crop_confidence", 0.0)),
                data.get("growth_stage", "UNKNOWN"),
                float(data.get("growth_confidence", 0.0)),
                data.get("water_stress", "UNKNOWN"),
                float(data.get("stress_confidence", 0.0)),
                float(data.get("crop_criticality", 0.5)),
                data.get("evidence_status", "active"),
                data.get("analysis_summary", ""),
                now_str
            ))
            conn.commit()
            return dict(cursor.execute("SELECT * FROM crop_evidence WHERE id = ?", (eid,)).fetchone())

    def get_active_crop_evidence(self, farmer_id):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT * FROM crop_evidence WHERE farmer_id = ? AND evidence_status = 'active'
            ORDER BY created_at DESC LIMIT 1
            """, (farmer_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_crop_evidence_history(self, farmer_id):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT * FROM crop_evidence WHERE farmer_id = ? ORDER BY created_at DESC
            """, (farmer_id,))
            return [dict(r) for r in cursor.fetchall()]

    def update_crop_evidence_status(self, evidence_id, status):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE crop_evidence SET evidence_status = ? WHERE id = ?", (status, evidence_id))
            conn.commit()
            row = cursor.execute("SELECT * FROM crop_evidence WHERE id = ?", (evidence_id,)).fetchone()
            return dict(row) if row else None

    # User Auth Helpers
    def add_user(self, user_data):
        uid = user_data.get("id", f"user-{os.urandom(3).hex()}")
        now_str = datetime.now().isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO users (id, email, password_hash, full_name, role, village, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                uid,
                user_data["email"].lower().strip(),
                user_data["password_hash"],
                user_data["full_name"],
                user_data.get("role", "farmer"),
                user_data.get("village", "Ramgarh"),
                now_str
            ))
            conn.commit()
            return self.get_user_by_id(uid)

    def get_user_by_email(self, email):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_user_by_id(self, user_id):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def reset_demo_data(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            tables = ["profiles", "users", "farmers", "water_resources", "water_requests", "negotiation_preferences", "fairness_history", "conflicts", "negotiations", "proposals", "objections", "agreements", "audit_logs", "crop_evidence"]
            for t in tables:
                cursor.execute(f"DELETE FROM {t}")
            conn.commit()
        self.seed_demo_data()

db_sqlite = SQLiteDatabase()


