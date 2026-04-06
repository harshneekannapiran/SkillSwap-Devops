from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from . import interest_bp
from models import db
from models.user_interest import UserInterest


@interest_bp.get("")
@jwt_required()
def get_interests():
    user_id = get_jwt_identity()
    interests = UserInterest.query.filter_by(user_id=user_id).all()
    return jsonify([i.to_dict() for i in interests])


@interest_bp.post("")
@jwt_required()
def add_interest():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    interest_name = data.get("interest_name")
    if not interest_name:
        return jsonify({"message": "interest_name is required"}), HTTPStatus.BAD_REQUEST

    interest = UserInterest(
        user_id=user_id,
        interest_name=interest_name,
        category=data.get("category"),
    )
    db.session.add(interest)
    db.session.commit()

    return jsonify(interest.to_dict()), HTTPStatus.CREATED


@interest_bp.delete("/<int:interest_id>")
@jwt_required()
def delete_interest(interest_id: int):
    user_id = get_jwt_identity()
    interest = UserInterest.query.get_or_404(interest_id)
    
    if interest.user_id != user_id:
        return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN

    db.session.delete(interest)
    db.session.commit()
    return "", HTTPStatus.NO_CONTENT
