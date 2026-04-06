from app import create_app
from models import db
from models.mentorship_request import MentorshipRequest
from models.user import User

def test_mentor_logic():
    app = create_app()
    
    with app.app_context():
        # Test the logic directly (simulate student ID 1)
        student_id = 1
        
        # Find accepted mentorship request for this student
        mentorship = MentorshipRequest.query.filter_by(
            student_id=student_id, 
            status='accepted'
        ).first()
        
        print(f"Looking for mentorship for student {student_id}")
        
        if not mentorship:
            print("No mentor found")
        else:
            print("Found mentorship:")
            print(f"  ID: {mentorship.id}")
            print(f"  Student ID: {mentorship.student_id}")
            print(f"  Mentor ID: {mentorship.mentor_id}")
            print(f"  Status: {mentorship.status}")
            print(f"  Topic: {mentorship.topic}")
            
            # Get mentor details
            mentor = User.query.get(mentorship.mentor_id)
            if mentor:
                print(f"Mentor details:")
                print(f"  Name: {mentor.name}")
                print(f"  Email: {mentor.email}")
                print(f"  Role: {mentor.role}")
            else:
                print("Mentor not found")

if __name__ == "__main__":
    test_mentor_logic()
