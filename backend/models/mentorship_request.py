from datetime import datetime

from . import db


class MentorshipRequest(db.Model):
    __tablename__ = "mentorship_requests"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    topic = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(
        db.String(20), nullable=False, default="pending"
    )  # pending, accepted, rejected

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    student = db.relationship(
        "User", foreign_keys=[student_id], backref=db.backref("sent_requests", lazy=True)
    )
    mentor = db.relationship(
        "User",
        foreign_keys=[mentor_id],
        backref=db.backref("received_requests", lazy=True),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "student_id": self.student_id,
            "mentor_id": self.mentor_id,
            "student_name": self.student.name if hasattr(self, 'student') and self.student else None,
            "mentor_name": self.mentor.name if hasattr(self, 'mentor') and self.mentor else None,
            "topic": self.topic,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

