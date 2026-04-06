from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import or_, desc

from . import chat_bp
from models import db
from models.message import Message
from models.user import User


@chat_bp.post("/start/<int:other_user_id>")
@jwt_required()
def start_conversation(other_user_id: int):
    try:
        user_id = get_jwt_identity()
        other_user = User.query.get_or_404(other_user_id)
        
        # Check if conversation already exists
        existing_msg = Message.query.filter(
            or_(
                (Message.sender_id == user_id) & (Message.receiver_id == other_user_id),
                (Message.sender_id == other_user_id) & (Message.receiver_id == user_id)
            )
        ).first()
        
        if existing_msg:
            return jsonify({"message": "Conversation already exists"}), HTTPStatus.OK
        
        # Create initial message
        welcome_msg = Message(
            sender_id=user_id,
            receiver_id=other_user_id,
            content="Hi! I'd like to connect with you."
        )
        db.session.add(welcome_msg)
        db.session.commit()
        
        return jsonify({"message": "Conversation started successfully"}), HTTPStatus.CREATED
    except Exception as e:
        print(f"Error in start_conversation: {e}")
        return jsonify({"message": "Failed to start conversation"}), HTTPStatus.INTERNAL_SERVER_ERROR


@chat_bp.get("/conversations")
@jwt_required()
def list_conversations():
    user_id = get_jwt_identity()

    subquery = (
        db.session.query(
            Message.id,
            Message.sender_id,
            Message.receiver_id,
            Message.content,
            Message.created_at,
        )
        .filter(or_(Message.sender_id == user_id, Message.receiver_id == user_id))
        .order_by(desc(Message.created_at))
        .subquery()
    )

    conversations = {}
    for row in db.session.query(subquery).all():
        other_id = row.sender_id if row.sender_id != user_id else row.receiver_id
        if other_id not in conversations:
            conversations[other_id] = row

    users = User.query.filter(User.id.in_(conversations.keys())).all()
    user_map = {u.id: u for u in users}

    result = []
    for other_id, row in conversations.items():
        other = user_map.get(other_id)
        result.append(
            {
                "user_id": other_id,
                "user_name": other.name if other else None,
                "last_message": row.content,
                "last_message_at": row.created_at.isoformat()
                if row.created_at
                else None,
            }
        )

    return jsonify(sorted(result, key=lambda x: x["last_message_at"], reverse=True))


@chat_bp.get("/messages/<int:other_user_id>")
@jwt_required()
def list_messages(other_user_id: int):
    user_id = get_jwt_identity()
    messages = (
        Message.query.filter(
            or_(
                (Message.sender_id == user_id)
                & (Message.receiver_id == other_user_id),
                (Message.sender_id == other_user_id)
                & (Message.receiver_id == user_id),
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )
    return jsonify([m.to_dict() for m in messages])


@chat_bp.post("/messages/<int:other_user_id>")
@jwt_required()
def send_message(other_user_id: int):
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    content = data.get("content")

    if not content:
        return jsonify({"message": "content is required"}), HTTPStatus.BAD_REQUEST

    other = User.query.get_or_404(other_user_id)

    msg = Message(sender_id=user_id, receiver_id=other.id, content=content)
    db.session.add(msg)
    db.session.commit()

    return jsonify(msg.to_dict()), HTTPStatus.CREATED

