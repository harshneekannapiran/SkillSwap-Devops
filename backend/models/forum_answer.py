from datetime import datetime
from models import db
from models.user import User

class ForumAnswer(db.Model):
    __tablename__ = 'forum_answers'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('forum_posts.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_best_answer = db.Column(db.Boolean, default=False)
    
    # Relationships
    author = db.relationship('User', backref='forum_answers')
    votes = db.relationship('ForumVote', backref='answer', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'post_id': self.post_id,
            'author_id': self.author_id,
            'author_name': self.author.name if self.author else None,
            'author_role': self.author.role if self.author else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_best_answer': self.is_best_answer,
            'upvote_count': self.votes.filter_by(vote_type='upvote').count(),
            'downvote_count': self.votes.filter_by(vote_type='downvote').count()
        }
