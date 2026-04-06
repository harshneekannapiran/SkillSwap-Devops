from app import create_app
from models import db
from models.user import User

def check_user_credentials():
    app = create_app()
    
    with app.app_context():
        users = User.query.all()
        print("User credentials:")
        for user in users:
            print(f"  {user.name} - Email: {user.email} - Role: {user.role}")

if __name__ == "__main__":
    check_user_credentials()
