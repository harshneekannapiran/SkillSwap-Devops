from datetime import datetime

from . import db


class UserInterest(db.Model):
    __tablename__ = "user_interests"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    interest_name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))  # technical, creative, business, etc.

    user = db.relationship("User", backref=db.backref("interests", lazy=True))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "interest_name": self.interest_name,
            "category": self.category,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
