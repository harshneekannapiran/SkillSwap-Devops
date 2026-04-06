from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_jwt_extended.exceptions import JWTExtendedException
import os

from config import get_config
from models import db
from routes import (
    auth_bp,
    user_bp,
    skill_bp,
    mentorship_bp,
    chat_bp,
    job_bp,
    event_bp,
    interest_bp,
    endorsement_bp,
    forum_bp,
)


def create_app():
    # 🔥 IMPORTANT FIX
    app = Flask(__name__, static_folder="static", static_url_path="")
    app.config.from_object(get_config())

    db.init_app(app)
    jwt = JWTManager(app)

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"message": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"message": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"message": "Authorization token is required"}), 401

    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return jsonify({"message": "Fresh token required"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"message": "Token has been revoked"}), 401

    @app.errorhandler(JWTExtendedException)
    def jwt_extended_error_handler(error):
        return jsonify({"message": "Token error"}), 401

    # CORS
    CORS(
        app,
        resources={r"/api/*": {
            "origins": ["*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }},
        supports_credentials=True,
    )

    # 🔥 SERVE REACT FRONTEND (FINAL FIX)
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        full_path = os.path.join(app.static_folder, path)

        if path != "" and os.path.exists(full_path):
            return send_from_directory(app.static_folder, path)

        return send_from_directory(app.static_folder, "index.html")

    # API routes
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(skill_bp)
    app.register_blueprint(mentorship_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(event_bp)
    app.register_blueprint(interest_bp)
    app.register_blueprint(endorsement_bp)
    app.register_blueprint(forum_bp)

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"})

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=5000)