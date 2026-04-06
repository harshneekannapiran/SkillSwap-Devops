from app import create_app
from models import db
from models.user import User

def check_user_ids():
    app = create_app()
    
    with app.app_context():
        users = User.query.all()
        print("All users:")
        for user in users:
            print(f"  {user.name} (ID: {user.id}) - Role: {user.role}")

if __name__ == "__main__":
    check_user_ids()
