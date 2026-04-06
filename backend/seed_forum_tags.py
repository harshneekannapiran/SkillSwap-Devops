from app import create_app
from models import db
from models.forum_tag import ForumTag

def create_default_tags():
    app = create_app()
    
    with app.app_context():
        default_tags = [
            {"name": "General", "color": "#6366f1", "description": "General questions and discussions"},
            {"name": "Career", "color": "#10b981", "description": "Career advice and opportunities"},
            {"name": "Technical", "color": "#f59e0b", "description": "Technical questions and programming"},
            {"name": "Study Tips", "color": "#ef4444", "description": "Study strategies and learning tips"},
            {"name": "Projects", "color": "#8b5cf6", "description": "Project ideas and collaboration"},
            {"name": "Interview", "color": "#06b6d4", "description": "Interview preparation and experiences"},
            {"name": "Mentorship", "color": "#84cc16", "description": "Mentorship related questions"},
            {"name": "Resources", "color": "#f97316", "description": "Learning resources and materials"}
        ]
        
        for tag_data in default_tags:
            existing_tag = ForumTag.query.filter_by(name=tag_data["name"]).first()
            if not existing_tag:
                tag = ForumTag(**tag_data)
                db.session.add(tag)
        
        db.session.commit()
        print("Default forum tags created successfully!")

if __name__ == "__main__":
    create_default_tags()
