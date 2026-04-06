from datetime import datetime
from models import db
from models.user import User
from models.forum_tag import forum_post_tags

class ForumPost(db.Model):
    __tablename__ = 'forum_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    views = db.Column(db.Integer, default=0)
    is_closed = db.Column(db.Boolean, default=False)
    best_answer_id = db.Column(db.Integer, db.ForeignKey('forum_answers.id'), nullable=True)
    
    # Relationships
    author = db.relationship('User', backref='forum_posts')
    answers = db.relationship('ForumAnswer', backref='post', lazy='dynamic', cascade='all, delete-orphan', foreign_keys='ForumAnswer.post_id')
    votes = db.relationship('ForumVote', backref='post', lazy='dynamic', cascade='all, delete-orphan', foreign_keys='ForumVote.post_id')
    best_answer = db.relationship('ForumAnswer', foreign_keys=[best_answer_id])
    tags = db.relationship('ForumTag', secondary=forum_post_tags, backref='posts')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author_id': self.author_id,
            'author_name': self.author.name if self.author else None,
            'author_role': self.author.role if self.author else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'views': self.views,
            'is_closed': self.is_closed,
            'best_answer_id': self.best_answer_id,
            'answer_count': self.answers.count(),
            'upvote_count': self.votes.filter_by(vote_type='upvote').count(),
            'downvote_count': self.votes.filter_by(vote_type='downvote').count(),
            'tags': [tag.to_dict() for tag in self.tags]
        }
