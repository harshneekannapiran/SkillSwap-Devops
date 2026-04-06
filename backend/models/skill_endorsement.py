from datetime import datetime

from . import db


class SkillEndorsement(db.Model):
    __tablename__ = "skill_endorsements"

    id = db.Column(db.Integer, primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id"), nullable=False)
    endorser_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    endorsement_text = db.Column(db.Text)
    rating = db.Column(db.Integer)  # 1-5 stars

    skill = db.relationship("Skill", backref=db.backref("endorsements", lazy=True))
    endorser = db.relationship("User", backref=db.backref("given_endorsements", lazy=True))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "skill_id": self.skill_id,
            "endorser_id": self.endorser_id,
            "endorser_name": self.endorser.name if self.endorser else None,
            "endorsement_text": self.endorsement_text,
            "rating": self.rating,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
