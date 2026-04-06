from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import select

from . import mentorship_bp
from models import db
from models.mentorship_request import MentorshipRequest
from models.mentorship_session import MentorshipSession
from models.user import User
from models.message import Message


@mentorship_bp.get("/mentors")
@jwt_required()
def list_mentors():
    try:
        mentors = User.query.filter_by(role="alumni").all()
        return jsonify([m.to_dict() for m in mentors])
    except Exception as e:
        print(f"Error in list_mentors: {e}")
        return jsonify({"message": "Failed to fetch mentors"}), 500


@mentorship_bp.get("/requests")
@jwt_required()
def list_requests():
    try:
        user_id = get_jwt_identity()
        # Simple query without relationships for now
        sent = db.session.execute(
            db.select(MentorshipRequest).where(MentorshipRequest.student_id == user_id)
        ).scalars().all()
        received = db.session.execute(
            db.select(MentorshipRequest).where(MentorshipRequest.mentor_id == user_id)
        ).scalars().all()
        
        # Get actual student names for received requests
        received_data = []
        for r in received:
            student = User.query.get(r.student_id)
            student_name = student.name if student else f"Student {r.student_id}"
            received_data.append({
                "id": r.id, 
                "topic": r.topic, 
                "status": r.status, 
                "created_at": r.created_at.isoformat() if r.created_at else None, 
                "student_name": student_name,
                "student_id": r.student_id
            })
        
        # Get actual mentor names for sent requests
        sent_data = []
        for r in sent:
            mentor = User.query.get(r.mentor_id)
            mentor_name = mentor.name if mentor else f"Mentor {r.mentor_id}"
            sent_data.append({
                "id": r.id, 
                "topic": r.topic, 
                "status": r.status, 
                "created_at": r.created_at.isoformat() if r.created_at else None, 
                "mentor_name": mentor_name,
                "mentor_id": r.mentor_id
            })
        
        return jsonify({
            "sent": sent_data,
            "received": received_data
        })
    except Exception as e:
        print(f"Error in list_requests: {e}")
        return jsonify({"message": "Failed to fetch requests"}), 500


@mentorship_bp.post("/requests")
@jwt_required()
def create_request():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        mentor_id = data["mentor_id"]
        
        # Check if already requested this mentor
        existing_request = MentorshipRequest.query.filter_by(
            student_id=user_id,
            mentor_id=mentor_id
        ).first()
        
        if existing_request:
            return jsonify({"message": "Already requested mentorship from this mentor"}), HTTPStatus.CONFLICT
        
        mentorship_request = MentorshipRequest(
            student_id=user_id,
            mentor_id=mentor_id,
            topic=data["topic"],
            message=data["message"]
        )
        
        db.session.add(mentorship_request)
        db.session.commit()
        
        return jsonify(mentorship_request.to_dict()), HTTPStatus.CREATED
    except Exception as e:
        print(f"Error in create_request: {e}")
        return jsonify({"message": "Failed to create request"}), 500


@mentorship_bp.put("/requests/<int:request_id>/accept")
@jwt_required()
def accept_request(request_id):
    try:
        user_id = get_jwt_identity()
        request_obj = MentorshipRequest.query.filter_by(id=request_id, mentor_id=user_id).first()
        
        if not request_obj:
            return jsonify({"message": "Request not found"}), HTTPStatus.NOT_FOUND
        
        request_obj.status = "accepted"
        db.session.commit()
        
        # Create initial chat message to start conversation
        welcome_msg = Message(
            sender_id=user_id,
            receiver_id=request_obj.student_id,
            content="Hi! I've accepted your mentorship request. I'm excited to help you with your goals. Let's start chatting!"
        )
        db.session.add(welcome_msg)
        db.session.commit()
        
        return jsonify(request_obj.to_dict())
    except Exception as e:
        print(f"Error in accept_request: {e}")
        return jsonify({"message": "Failed to accept request"}), 500


@mentorship_bp.put("/requests/<int:request_id>")
@jwt_required()
def update_request(request_id):
    try:
        user_id = get_jwt_identity()
        request_obj = MentorshipRequest.query.filter_by(id=request_id, mentor_id=user_id).first()
        
        if not request_obj:
            return jsonify({"message": "Request not found"}), HTTPStatus.NOT_FOUND
        
        data = request.get_json() or {}
        status = data.get("status")
        
        if status not in ["accepted", "rejected"]:
            return jsonify({"message": "Invalid status"}), HTTPStatus.BAD_REQUEST
        
        request_obj.status = status
        db.session.commit()
        
        return jsonify(request_obj.to_dict())
    except Exception as e:
        print(f"Error in update_request: {e}")
        return jsonify({"message": "Failed to update request"}), 500


@mentorship_bp.put("/requests/<int:request_id>/reject")
@jwt_required()
def reject_request(request_id):
    try:
        user_id = get_jwt_identity()
        request_obj = MentorshipRequest.query.filter_by(id=request_id, mentor_id=user_id).first()
        
        if not request_obj:
            return jsonify({"message": "Request not found"}), HTTPStatus.NOT_FOUND
        
        request_obj.status = "rejected"
        db.session.commit()
        
        return jsonify(request_obj.to_dict())
    except Exception as e:
        print(f"Error in reject_request: {e}")
        return jsonify({"message": "Failed to reject request"}), 500


@mentorship_bp.post("/sessions/<int:request_id>/complete")
@jwt_required()
def complete_session(request_id):
    try:
        user_id = get_jwt_identity()
        request_obj = MentorshipRequest.query.filter_by(id=request_id, mentor_id=user_id).first()
        
        if not request_obj:
            return jsonify({"message": "Request not found"}), HTTPStatus.NOT_FOUND
        
        if request_obj.status != "accepted":
            return jsonify({"message": "Only accepted requests can be completed"}), HTTPStatus.BAD_REQUEST
        
        request_obj.status = "completed"
        db.session.commit()
        
        return jsonify({"message": "Session marked as completed", "request": request_obj.to_dict()})
    except Exception as e:
        print(f"Error in complete_session: {e}")
        return jsonify({"message": "Failed to complete session"}), 500


# @mentorship_bp.post("/requests/<int:request_id>/schedule")
# @jwt_required()
# def schedule_session(request_id: int):
#     user_id = get_jwt_identity()
#     req = MentorshipRequest.query.get_or_404(request_id)

#     if req.mentor_id != user_id:
#         return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN

#     if req.status != "accepted":
#         return jsonify({"message": "Request must be accepted first"}), HTTPStatus.BAD_REQUEST

#     data = request.get_json() or {}
#     scheduled_time = data.get("scheduled_time")
#     if not scheduled_time:
#         return jsonify({"message": "scheduled_time is required"}), HTTPStatus.BAD_REQUEST

#     session = MentorshipSession(
#         mentorship_request_id=request_id,
#         scheduled_time=scheduled_time,
#         duration_minutes=data.get("duration_minutes", 60),
#         meeting_link=data.get("meeting_link"),
#         notes=data.get("notes"),
#     )
#     db.session.add(session)
#     db.session.commit()

#     return jsonify(session.to_dict()), HTTPStatus.CREATED

