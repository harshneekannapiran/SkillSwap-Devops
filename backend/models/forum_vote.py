from datetime import datetime
from models import db

class ForumVote(db.Model):
    __tablename__ = 'forum_votes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('forum_posts.id'), nullable=True)
    answer_id = db.Column(db.Integer, db.ForeignKey('forum_answers.id'), nullable=True)
    vote_type = db.Column(db.String(10), nullable=False)  # 'upvote' or 'downvote'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='forum_votes')
    
    # Ensure user can only vote once per post/answer
    __table_args__ = (
        db.UniqueConstraint('user_id', 'post_id', name='unique_post_vote'),
        db.UniqueConstraint('user_id', 'answer_id', name='unique_answer_vote'),
        db.CheckConstraint('(post_id IS NOT NULL) OR (answer_id IS NOT NULL)', name='vote_target_check')
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'post_id': self.post_id,
            'answer_id': self.answer_id,
            'vote_type': self.vote_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
