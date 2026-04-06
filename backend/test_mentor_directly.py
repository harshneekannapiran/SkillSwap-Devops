from app import create_app
from models import db
from models.mentorship_request import MentorshipRequest
from models.user import User

def test_mentor_endpoint_directly():
    app = create_app()
    
    with app.app_context():
        # Simulate student ID 1 (harini)
        user_id = 1
        
        print(f"Testing mentor lookup for student {user_id}")
        
        # Find accepted mentorship request for this student
        mentorship = MentorshipRequest.query.filter_by(
            student_id=user_id, 
            status='accepted'
        ).first()
        
        print(f"Found mentorship: {mentorship}")
        
        if not mentorship:
            print("No mentor found")
            return
        
        # Get mentor details
        mentor = User.query.get(mentorship.mentor_id)
        print(f"Found mentor: {mentor}")
        
        if not mentor:
            print("Mentor not found")
            return
        
        # Test the mentor data creation (this might be causing the 500 error)
        try:
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
            print(f"Successfully created mentor data: {mentor_data}")
            
            # Test JSON serialization
            import json
            json_str = json.dumps(mentor_data)
            print(f"Successfully serialized to JSON: {json_str}")
            
        except Exception as e:
            print(f"Error creating mentor data: {e}")
            import traceback
            traceback.print_exc()
        
        # Test the mentorship.to_dict() method
        try:
            mentorship_dict = mentorship.to_dict()
            print(f"Successfully created mentorship dict: {mentorship_dict}")
        except Exception as e:
            print(f"Error creating mentorship dict: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_mentor_endpoint_directly()
