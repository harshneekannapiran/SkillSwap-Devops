from datetime import datetime

from . import db


class MentorshipSession(db.Model):
    __tablename__ = "mentorship_sessions"

    id = db.Column(db.Integer, primary_key=True)
    mentorship_request_id = db.Column(db.Integer, db.ForeignKey("mentorship_requests.id"), nullable=False)
    scheduled_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60)
    meeting_link = db.Column(db.String(500))
    notes = db.Column(db.Text)
    status = db.Column(db.String(20), default="scheduled")  # scheduled, completed, cancelled

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    mentorship_request = db.relationship("MentorshipRequest", backref=db.backref("sessions", lazy=True))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "mentorship_request_id": self.mentorship_request_id,
            "scheduled_time": self.scheduled_time.isoformat() if self.scheduled_time else None,
            "duration_minutes": self.duration_minutes,
            "meeting_link": self.meeting_link,
            "notes": self.notes,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
