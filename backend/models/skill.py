from datetime import datetime

from . import db


class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    level = db.Column(db.String(50))
    category = db.Column(db.String(120))
    description = db.Column(db.Text)

    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    owner = db.relationship("User", backref=db.backref("skills", lazy=True))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "level": self.level,
            "category": self.category,
            "description": self.description,
            "owner_id": self.owner_id,
            "owner_name": self.owner.name if self.owner else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

