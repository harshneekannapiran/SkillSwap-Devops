from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from . import user_bp
from models import db
from models.user import User


@user_bp.get("/me")
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@user_bp.put("/me")
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    data = request.get_json() or {}

    for field in [
        "name",
        "bio",
        "headline",
        "university",
        "graduation_year",
        "location",
        "linkedin_url",
        "github_url",
        "profile_picture_url",
        "company",
        "experience",
        "expertise",
    ]:
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()
    return jsonify(user.to_dict()), HTTPStatus.OK


@user_bp.get("/<int:user_id>")
def get_user(user_id: int):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@user_bp.get("")
@jwt_required()
def list_users():
    role = request.args.get("role")
    search = request.args.get("search", "")
    query = User.query
    
    if role:
        query = query.filter_by(role=role)
    
    if search:
        query = query.filter(
            db.or_(
                User.name.ilike(f"%{search}%"),
                User.headline.ilike(f"%{search}%"),
                User.bio.ilike(f"%{search}%"),
                User.university.ilike(f"%{search}%"),
                User.location.ilike(f"%{search}%")
            )
        )
    
    users = query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users])

