import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from utils.logger import logger

from routes.farmers import farmers_bp
from routes.water import water_bp
from routes.conflicts import conflicts_bp
from routes.mediation import mediation_bp
from routes.negotiations import negotiations_bp
from routes.agreements import agreements_bp
from routes.crop_evidence import crop_evidence_bp
from routes.auth import auth_bp
from database.sqlite_db import db_sqlite

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable Cross-Origin Resource Sharing for React Frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register JalSangam AI Blueprints
    app.register_blueprint(farmers_bp)
    app.register_blueprint(water_bp)
    app.register_blueprint(conflicts_bp)
    app.register_blueprint(mediation_bp)
    app.register_blueprint(negotiations_bp)
    app.register_blueprint(agreements_bp)
    app.register_blueprint(crop_evidence_bp)
    app.register_blueprint(auth_bp)

    @app.route("/", methods=["GET"])
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "JalSangam AI Backend",
            "version": "1.0.0",
            "database": "Local SQLite (jalsangam.db)",
            "database_status": "Active & Self-Contained"
        }), 200

    @app.errorhandler(404)
    def not_found_error(e):
        return jsonify({"success": False, "error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal Server Error: {e}")
        return jsonify({"success": False, "error": "Internal server error"}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    logger.info(f"Starting JalSangam AI Flask Server on port {Config.PORT}...")
    app.run(host="0.0.0.0", port=Config.PORT, debug=True)
