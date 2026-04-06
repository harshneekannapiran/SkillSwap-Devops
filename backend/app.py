from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_jwt_extended.exceptions import JWTExtendedException

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
    app = Flask(__name__)
    app.config.from_object(get_config())

    db.init_app(app)
    jwt = JWTManager(app)
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print("DEBUG: JWT token expired")
        return jsonify({"message": "Token has expired"}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"DEBUG: Invalid JWT token: {error}")
        return jsonify({"message": "Invalid token"}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        print(f"DEBUG: Missing JWT token: {error}")
        return jsonify({"message": "Authorization token is required"}), 401
    
    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        print("DEBUG: JWT token not fresh")
        return jsonify({"message": "Fresh token required"}), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        print("DEBUG: JWT token revoked")
        return jsonify({"message": "Token has been revoked"}), 401
    
    # General JWT error handler
    @app.errorhandler(JWTExtendedException)
    def jwt_extended_error_handler(error):
        print(f"DEBUG: JWT Extended Error: {error}")
        return jsonify({"message": "Token error"}), 401
    
    CORS(
        app,
        resources={r"/api/*": {
            "origins": [
                "http://localhost:5173", 
                "http://localhost:5174", 
                "http://127.0.0.1:5173", 
                "http://127.0.0.1:5174",
                "https://*.up.railway.app"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "supports_credentials": True,
        }},
        supports_credentials=True,
    )

    # Manual CORS preflight handler
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify()
            response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
            response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response

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

