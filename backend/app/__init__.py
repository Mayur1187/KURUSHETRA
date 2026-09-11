from flask import Flask
from flask_cors import CORS
from config import Config

from routes.farmers import farmers_bp
from routes.water import water_bp
from routes.conflicts import conflicts_bp
from routes.mediation import mediation_bp
from routes.negotiations import negotiations_bp
from routes.agreements import agreements_bp
from routes.crop_evidence import crop_evidence_bp
from routes.auth import auth_bp

def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

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
        return {
            "status": "healthy",
            "service": "JalSangam AI Backend",
            "version": "1.0.0",
            "database": "Local SQLite (jalsangam.db)",
            "database_status": "Active & Self-Contained"
        }, 200

    @app.errorhandler(404)
    def not_found(_):
        return {"success": False, "error": "Endpoint not found"}, 404

    @app.errorhandler(Exception)
    def handle_uncaught(exc):
        return {"success": False, "error": str(exc)}, 500

    return app
