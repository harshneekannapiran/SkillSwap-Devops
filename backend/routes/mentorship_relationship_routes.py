from http import HTTPStatus

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from . import mentorship_bp
from models import db
from models.mentorship_request import MentorshipRequest
from models.user import User

@mentorship_bp.get("/my-mentor")
@jwt_required()
def get_my_mentor():
    """Get the mentor who accepted the student's request"""
    user_id = get_jwt_identity()
    print(f"DEBUG: My Mentor endpoint called by user_id: {user_id}")
    
    # Find accepted mentorship request for this student
    mentorship = MentorshipRequest.query.filter_by(
        student_id=user_id, 
        status='accepted'
    ).first()
    
    print(f"DEBUG: Found mentorship: {mentorship}")
    
    if not mentorship:
        print(f"DEBUG: No mentor found for student {user_id}")
        return jsonify({"message": "No mentor found"}), HTTPStatus.NOT_FOUND
    
    # Get mentor details
    mentor = User.query.get(mentorship.mentor_id)
    print(f"DEBUG: Found mentor: {mentor}")
    
    if not mentor:
        print(f"DEBUG: Mentor not found with ID {mentorship.mentor_id}")
        return jsonify({"message": "Mentor not found"}), HTTPStatus.NOT_FOUND
    
    # Safely get mentor attributes
    mentor_data = {
        "id": mentor.id,
        "name": mentor.name,
        "email": mentor.email,
        "role": mentor.role,
        "bio": mentor.bio if hasattr(mentor, 'bio') and mentor.bio else '',
        "experience": mentor.experience if hasattr(mentor, 'experience') and mentor.experience else '',
        "skills": [skill.name if hasattr(skill, 'name') else str(skill) for skill in mentor.skills] if hasattr(mentor, 'skills') and mentor.skills else [],
        "company": mentor.company if hasattr(mentor, 'company') and mentor.company else '',
        "position": mentor.position if hasattr(mentor, 'position') and mentor.position else '',
        "linkedin": mentor.linkedin if hasattr(mentor, 'linkedin') and mentor.linkedin else '',
        "created_at": mentor.created_at.isoformat() if mentor.created_at else None
    }
    
    print(f"DEBUG: Returning mentor data: {mentor_data['name']}")
    
    return jsonify({
        "mentorship": mentorship.to_dict(),
        "mentor": mentor_data
    })

@mentorship_bp.get("/my-students")
@jwt_required()
def get_my_students():
    """Get all students whose requests were accepted by this alumni"""
    user_id = get_jwt_identity()
    
    # Find all accepted mentorship requests for this mentor
    mentorships = MentorshipRequest.query.filter_by(
        mentor_id=user_id, 
        status='accepted'
    ).all()
    
    students_data = []
    for mentorship in mentorships:
        student = User.query.get(mentorship.student_id)
        if student:
            students_data.append({
                "mentorship": mentorship.to_dict(),
                "student": {
                    "id": student.id,
                    "name": student.name,
                    "email": student.email,
                    "role": student.role,
                    "bio": student.bio if hasattr(student, 'bio') and student.bio else '',
                    "skills": [skill.name if hasattr(skill, 'name') else str(skill) for skill in student.skills] if hasattr(student, 'skills') and student.skills else [],
                    "interests": [interest.name if hasattr(interest, 'name') else str(interest) for interest in student.interests] if hasattr(student, 'interests') and student.interests else [],
                    "education": student.education if hasattr(student, 'education') and student.education else '',
                    "graduation_year": student.graduation_year if hasattr(student, 'graduation_year') and student.graduation_year else '',
                    "created_at": student.created_at.isoformat() if student.created_at else None
                }
            })
    
    return jsonify({
        "students": students_data,
        "total": len(students_data)
    })
