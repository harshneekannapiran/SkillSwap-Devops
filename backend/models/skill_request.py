from datetime import datetime

from . import db


class SkillRequest(db.Model):
    __tablename__ = "skill_requests"

    id = db.Column(db.Integer, primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id"), nullable=False)
    requester_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    status = db.Column(db.String(20), default="pending")  # pending, accepted, rejected
    message = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    skill = db.relationship("Skill", backref=db.backref("requests", lazy=True))
    requester = db.relationship("User", backref=db.backref("skill_requests", lazy=True))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "skill_id": self.skill_id,
            "skill_name": self.skill.name if self.skill else None,
            "requester_id": self.requester_id,
            "requester_name": self.requester.name if self.requester else None,
            "owner_id": self.skill.owner_id if self.skill else None,
            "status": self.status,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
