from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from . import forum_bp
from models import db
from models.forum_tag import ForumTag

@forum_bp.get("/tags")
def list_tags():
    tags = ForumTag.query.order_by(ForumTag.name).all()
    return jsonify([tag.to_dict() for tag in tags])

@forum_bp.post("/tags")
@jwt_required()
def create_tag():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Check if tag already exists
    existing_tag = ForumTag.query.filter_by(name=data['name']).first()
    if existing_tag:
        return jsonify({"message": "Tag already exists"}), HTTPStatus.BAD_REQUEST
    
    tag = ForumTag(
        name=data['name'],
        color=data.get('color', '#6366f1'),
        description=data.get('description', '')
    )
    
    db.session.add(tag)
    db.session.commit()
    
    return jsonify(tag.to_dict()), HTTPStatus.CREATED
