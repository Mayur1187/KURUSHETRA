from flask import Flask
from flask_cors import CORS

from app.config.settings import settings
from app.routes.domain import domain_bp
from app.routes.health import health_bp
from app.routes.processing import processing_bp
from app.routes.projects import projects_bp
from app.routes.results import results_bp
from app.utils.logger import log_error, new_request_id
from app.utils.responses import server_error


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = settings.SECRET_KEY

    CORS(app, resources={r"/api/*": {"origins": settings.FRONTEND_ORIGIN}}, supports_credentials=True)

    # Core routes
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(projects_bp)
    app.register_blueprint(processing_bp)
    app.register_blueprint(results_bp)

    # Domain-specific routes (safe to extend/replace)
    app.register_blueprint(domain_bp)

    @app.errorhandler(404)
    def not_found(_):
        from app.utils.responses import not_found_error
        return not_found_error("Endpoint not found")

    @app.errorhandler(Exception)
    def handle_uncaught(exc):
        req_id = new_request_id()
        log_error(req_id, "unhandled_exception", exc)
        return server_error("An unexpected error occurred")

    return app
