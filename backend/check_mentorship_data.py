from app import create_app
from models import db
from models.mentorship_request import MentorshipRequest
from models.user import User

def check_mentorship_data():
    app = create_app()
    
    with app.app_context():
        # Check all mentorship requests
        all_requests = MentorshipRequest.query.all()
        print(f"Total mentorship requests: {len(all_requests)}")
        
        for req in all_requests:
            student = User.query.get(req.student_id)
            mentor = User.query.get(req.mentor_id)
            print(f"Request {req.id}:")
            print(f"  Student: {student.name if student else 'Unknown'} (ID: {req.student_id})")
            print(f"  Mentor: {mentor.name if mentor else 'Unknown'} (ID: {req.mentor_id})")
            print(f"  Status: {req.status}")
            print(f"  Topic: {req.topic}")
            print(f"  Created: {req.created_at}")
            print("---")
        
        # Check specifically for accepted requests
        accepted_requests = MentorshipRequest.query.filter_by(status='accepted').all()
        print(f"\nAccepted requests: {len(accepted_requests)}")
        
        for req in accepted_requests:
            student = User.query.get(req.student_id)
            mentor = User.query.get(req.mentor_id)
            print(f"Accepted: {student.name if student else 'Unknown'} -> {mentor.name if mentor else 'Unknown'}")

if __name__ == "__main__":
    check_mentorship_data()
