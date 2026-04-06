from models import db

class ForumTag(db.Model):
    __tablename__ = 'forum_tags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    color = db.Column(db.String(7), default='#6366f1')  # Hex color code
    description = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'description': self.description
        }

# Junction table for posts and tags
forum_post_tags = db.Table('forum_post_tags',
    db.Column('post_id', db.Integer, db.ForeignKey('forum_posts.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('forum_tags.id'), primary_key=True)
)
