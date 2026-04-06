from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import select

from . import skill_bp
from models import db
from models.skill import Skill
from models.skill_request import SkillRequest


@skill_bp.get("")
@jwt_required()
def list_skills():
  search = request.args.get("search", "")
  category = request.args.get("category", "")
  level = request.args.get("level", "")
  query = Skill.query
  
  if search:
    query = query.filter(
      db.or_(
        Skill.name.ilike(f"%{search}%"),
        Skill.description.ilike(f"%{search}%"),
        Skill.category.ilike(f"%{search}%")
      )
    )
  
  if category:
    query = query.filter(Skill.category.ilike(f"%{category}%"))
    
  if level:
    query = query.filter(Skill.level == level)
  
  skills = query.order_by(Skill.created_at.desc()).all()
  return jsonify([s.to_dict() for s in skills])


@skill_bp.get("/mine")
@jwt_required()
def list_my_skills():
  print("DEBUG: /mine endpoint reached")
  try:
    user_id = get_jwt_identity()
    print(f"DEBUG: user_id = {user_id}")
    
    # Check if user exists
    from models.user import User
    user = User.query.get(user_id)
    print(f"DEBUG: user = {user}")
    
    skills = Skill.query.filter_by(owner_id=user_id).order_by(Skill.created_at.desc()).all()
    print(f"DEBUG: skills count = {len(skills)}")
    
    result = [s.to_dict() for s in skills]
    print(f"DEBUG: result = {result}")
    
    return jsonify(result)
  except Exception as e:
    print(f"DEBUG: Error in list_my_skills: {str(e)}")
    import traceback
    traceback.print_exc()
    return jsonify({"error": str(e)}), 500


@skill_bp.get("/requests")
@jwt_required()
def list_skill_requests():
  print("DEBUG: /requests endpoint reached")
  try:
    user_id = get_jwt_identity()
    print(f"DEBUG: skill_requests - user_id = {user_id}")
    
    # Get requests for skills I own (as alumni)
    received_requests = db.session.execute(
      select(SkillRequest)
      .join(Skill)
      .filter(Skill.owner_id == user_id)
    ).scalars().all()
    print(f"DEBUG: received_requests count = {len(received_requests)}")
    
    # Get requests I made (as student)
    sent_requests = SkillRequest.query.filter_by(requester_id=user_id).all()
    print(f"DEBUG: sent_requests count = {len(sent_requests)}")
    
    result = {
      "received": [req.to_dict() for req in received_requests],
      "sent": [req.to_dict() for req in sent_requests]
    }
    print(f"DEBUG: skill_requests result = {result}")
    
    return jsonify(result)
  except Exception as e:
    print(f"DEBUG: Error in list_skill_requests: {str(e)}")
    import traceback
    traceback.print_exc()
    return jsonify({"error": str(e)}), 500


@skill_bp.post("/requests")
@jwt_required()
def create_skill_request():
  user_id = get_jwt_identity()
  data = request.get_json() or {}
  
  skill_id = data.get("skill_id")
  message = data.get("message", "")
  
  if not skill_id:
    return jsonify({"message": "skill_id is required"}), HTTPStatus.BAD_REQUEST
  
  # Check if skill exists
  skill = Skill.query.get(skill_id)
  if not skill:
    return jsonify({"message": "Skill not found"}), HTTPStatus.NOT_FOUND
  
  # Check if user already requested this skill
  existing_request = SkillRequest.query.filter_by(
    skill_id=skill_id, 
    requester_id=user_id
  ).first()
  
  if existing_request:
    return jsonify({"message": "Skill already requested"}), HTTPStatus.CONFLICT
  
  # Create skill request
  skill_request = SkillRequest(
    skill_id=skill_id,
    requester_id=user_id,
    message=message
  )
  
  db.session.add(skill_request)
  db.session.commit()
  
  return jsonify(skill_request.to_dict()), HTTPStatus.CREATED


@skill_bp.put("/requests/<int:request_id>/accept")
@jwt_required()
def accept_skill_request(request_id):
    user_id = get_jwt_identity()
    
    request_obj = SkillRequest.query.get_or_404(request_id)
    
    print(f"Accept request - User ID: {user_id}, Request ID: {request_id}")
    print(f"Request skill owner_id: {request_obj.skill.owner_id}")
    print(f"Request skill: {request_obj.skill.to_dict() if request_obj.skill else 'None'}")
    
    # Convert both to integers for comparison
    if int(request_obj.skill.owner_id) != int(user_id):
        print(f"Access denied: {request_obj.skill.owner_id} != {user_id}")
        return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN
    
    request_obj.status = "accepted"
    db.session.commit()
    
    return jsonify(request_obj.to_dict())


@skill_bp.put("/requests/<int:request_id>/reject")
@jwt_required()
def reject_skill_request(request_id):
  user_id = get_jwt_identity()
  
  request_obj = SkillRequest.query.get_or_404(request_id)
  
  # Check if user owns the skill
  if request_obj.skill.owner_id != user_id:
    return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN
  
  request_obj.status = "rejected"
  db.session.commit()
  
  return jsonify(request_obj.to_dict())


@skill_bp.post("")
@jwt_required()
def create_skill():
  print("DEBUG: POST /skills endpoint reached")
  user_id = get_jwt_identity()
  data = request.get_json() or {}
  
  print("DEBUG: POST /api/skills received data:", data)
  print("DEBUG: user_id:", user_id)

  name = data.get("name")
  print("DEBUG: name:", name)
  if not name:
    print("DEBUG: Name is missing!")
    return jsonify({"message": "name is required"}), HTTPStatus.BAD_REQUEST

  skill = Skill(
    name=name,
    level=data.get("level"),
    category=data.get("category"),
    description=data.get("description"),
    owner_id=user_id,
  )
  print("DEBUG: Created skill object:", skill.to_dict())
  
  db.session.add(skill)
  db.session.commit()
  print("DEBUG: Skill committed to database")

  return jsonify(skill.to_dict()), HTTPStatus.CREATED


@skill_bp.put("/<int:skill_id>")
@jwt_required()
def update_skill(skill_id: int):
  user_id = get_jwt_identity()
  skill = Skill.query.get_or_404(skill_id)
  
  if skill.owner_id != user_id:
    return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN

  data = request.get_json() or {}
  
  for field in ["name", "level", "category", "description"]:
    if field in data:
      setattr(skill, field, data[field])

  db.session.commit()
  return jsonify(skill.to_dict())


@skill_bp.delete("/<int:skill_id>")
@jwt_required()
def delete_skill(skill_id: int):
    try:
        user_id = get_jwt_identity()
        skill = Skill.query.get_or_404(skill_id)
        
        print(f"Delete skill - User ID: {user_id} (type: {type(user_id)}), Skill ID: {skill_id}")
        print(f"Skill owner_id: {skill.owner_id} (type: {type(skill.owner_id)})")
        print(f"Skill data: {skill.to_dict()}")
        
        # Safe conversion with error handling
        try:
            user_id_int = int(user_id) if user_id else None
            owner_id_int = int(skill.owner_id) if skill.owner_id else None
        except (ValueError, TypeError) as e:
            print(f"Conversion error: {e}")
            return jsonify({"message": "Invalid user ID format"}), HTTPStatus.BAD_REQUEST
        
        # Convert both to integers for comparison
        if owner_id_int != user_id_int:
            print(f"Access denied: {owner_id_int} != {user_id_int}")
            return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN

        # Delete related records first (skill requests)
        related_requests = SkillRequest.query.filter_by(skill_id=skill_id).all()
        print(f"Found {len(related_requests)} related skill requests to delete")
        
        for request in related_requests:
            db.session.delete(request)
        
        # Now delete the skill
        db.session.delete(skill)
        db.session.commit()
        print("Skill deleted successfully")
        return "", HTTPStatus.NO_CONTENT
        
    except Exception as e:
        print(f"Error in delete_skill: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Server error: {str(e)}"}), HTTPStatus.INTERNAL_SERVER_ERROR
