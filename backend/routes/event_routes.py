from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import select

from . import event_bp
from models import db
from models.event import Event
from models.event_registration import EventRegistration
from models.user import User


@event_bp.get("")
@jwt_required()
def list_events():
    event_type = request.args.get("event_type", "")
    search = request.args.get("search", "")
    query = Event.query
    
    if event_type:
        query = query.filter(Event.event_type == event_type)
    
    if search:
        query = query.filter(
            db.or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%")
            )
        )
    
    events = query.order_by(Event.event_time.asc()).all()
    return jsonify([e.to_dict() for e in events])


@event_bp.get("/mine")
@jwt_required()
def list_my_events():
    user_id = get_jwt_identity()
    events = Event.query.filter_by(host_id=user_id).order_by(Event.event_time.desc()).all()
    return jsonify([e.to_dict() for e in events])


@event_bp.get("/registrations")
@jwt_required()
def list_event_registrations():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    if user.role == "alumni":
        # Get registrations for events I host
        registrations = db.session.execute(
            select(EventRegistration)
            .join(Event)
            .filter(Event.host_id == user_id)
        ).scalars().all()
    else:
        # Get registrations I made
        registrations = EventRegistration.query.filter_by(attendee_id=user_id).all()
    
    return jsonify([reg.to_dict() for reg in registrations])


@event_bp.get("/my-registrations")
@jwt_required()
def list_my_event_registrations():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    if user.role != "alumni":
        return jsonify({"message": "Only alumni can view registrations"}), HTTPStatus.FORBIDDEN
    
    # Get registrations for events I host
    registrations = db.session.execute(
        select(EventRegistration)
        .join(Event)
        .filter(Event.host_id == user_id)
    ).scalars().all()
    
    return jsonify([reg.to_dict() for reg in registrations])


@event_bp.post("")
@jwt_required()
def create_event():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    if user.role != "alumni":
        return jsonify({"message": "Only alumni can create events"}), HTTPStatus.FORBIDDEN

    data = request.get_json() or {}
    
    title = data.get("title")
    if not title:
        return jsonify({"message": "title is required"}), HTTPStatus.BAD_REQUEST

    event = Event(
        title=title,
        description=data.get("description"),
        event_type=data.get("event_type", "workshop"),
        location=data.get("location"),
        event_time=data.get("event_time"),
        duration_minutes=data.get("duration_minutes", 60),
        meeting_link=data.get("meeting_link"),
        max_participants=data.get("max_participants"),
        host_id=user_id,
    )
    db.session.add(event)
    db.session.commit()

    return jsonify(event.to_dict()), HTTPStatus.CREATED


@event_bp.put("/<int:event_id>")
@jwt_required()
def update_event(event_id: int):
    user_id = get_jwt_identity()
    event = Event.query.get_or_404(event_id)
    
    if event.host_id != user_id:
        return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN

    data = request.get_json() or {}
    
    for field in ["title", "description", "event_type", "location", "event_time", "duration_minutes", "meeting_link", "max_participants"]:
        if field in data:
            setattr(event, field, data[field])

    db.session.commit()
    return jsonify(event.to_dict())


@event_bp.post("/register")
@jwt_required()
def register_event():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    if user.role != "student":
        return jsonify({"message": "Only students can register for events"}), HTTPStatus.FORBIDDEN

    data = request.get_json() or {}
    event_id = data.get("event_id")
    if not event_id:
        return jsonify({"message": "event_id is required"}), HTTPStatus.BAD_REQUEST

    # Check if event exists
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), HTTPStatus.NOT_FOUND

    # Check if already registered
    existing_registration = EventRegistration.query.filter_by(
        event_id=event_id, 
        attendee_id=user_id
    ).first()
    
    if existing_registration:
        return jsonify({"message": "Already registered for this event"}), HTTPStatus.CONFLICT

    # Check if event is full
    if event.max_participants:
        current_registrations = EventRegistration.query.filter_by(event_id=event_id).count()
        if current_registrations >= event.max_participants:
            return jsonify({"message": "Event is full"}), HTTPStatus.CONFLICT

    # Create registration
    registration = EventRegistration(
        event_id=event_id,
        attendee_id=user_id,
        notes=data.get("notes", "")
    )
    
    db.session.add(registration)
    db.session.commit()

    return jsonify(registration.to_dict()), HTTPStatus.CREATED


@event_bp.put("/registrations/<int:registration_id>/status")
@jwt_required()
def update_registration_status(registration_id):
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    if user.role != "alumni":
        return jsonify({"message": "Only alumni can update registration status"}), HTTPStatus.FORBIDDEN

    data = request.get_json() or {}
    status = data.get("status")
    
    if not status or status not in ["registered", "attended", "cancelled"]:
        return jsonify({"message": "Invalid status"}), HTTPStatus.BAD_REQUEST

    registration = db.session.execute(
        select(EventRegistration)
        .join(Event)
        .filter(
            EventRegistration.id == registration_id,
            Event.host_id == user_id
        )
    ).scalar_one_or_none()

    if not registration:
        return jsonify({"message": "Registration not found"}), HTTPStatus.NOT_FOUND

    registration.status = status
    db.session.commit()

    return jsonify(registration.to_dict())


@event_bp.delete("/<int:event_id>")
@jwt_required()
def delete_event(event_id: int):
    try:
        user_id = get_jwt_identity()
        event = Event.query.get_or_404(event_id)
        
        print(f"Delete event - User ID: {user_id} (type: {type(user_id)}), Event ID: {event_id}")
        print(f"Event host_id: {event.host_id} (type: {type(event.host_id)})")
        print(f"Event data: {event.to_dict()}")
        
        # Safe conversion with error handling
        try:
            user_id_int = int(user_id) if user_id else None
            host_id_int = int(event.host_id) if event.host_id else None
        except (ValueError, TypeError) as e:
            print(f"Conversion error: {e}")
            return jsonify({"message": "Invalid user ID format"}), HTTPStatus.BAD_REQUEST
        
        # Convert both to integers for comparison
        if host_id_int != user_id_int:
            print(f"Access denied: {host_id_int} != {user_id_int}")
            return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN

        # Delete related records first (event registrations)
        related_registrations = EventRegistration.query.filter_by(event_id=event_id).all()
        print(f"Found {len(related_registrations)} related event registrations to delete")
        
        for registration in related_registrations:
            db.session.delete(registration)
        
        # Now delete the event
        db.session.delete(event)
        db.session.commit()
        print("Event deleted successfully")
        return "", HTTPStatus.NO_CONTENT
        
    except Exception as e:
        print(f"Error in delete_event: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Server error: {str(e)}"}), HTTPStatus.INTERNAL_SERVER_ERROR

