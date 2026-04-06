from app import create_app
from models import db
from models.forum_post import ForumPost
from models.forum_answer import ForumAnswer
from models.forum_vote import ForumVote
from models.forum_tag import ForumTag
from models.forum_tag import forum_post_tags

def create_forum_tables():
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Forum tables created successfully!")
        
        # Check if tables exist
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        forum_tables = [table for table in tables if 'forum' in table]
        print(f"Forum tables found: {forum_tables}")

if __name__ == "__main__":
    create_forum_tables()
