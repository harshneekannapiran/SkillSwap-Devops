from datetime import datetime

from . import db


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    event_type = db.Column(db.String(50), nullable=False, default="workshop")  # workshop, webinar, career_talk
    location = db.Column(db.String(255))
    event_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60)
    meeting_link = db.Column(db.String(500))
    max_participants = db.Column(db.Integer)

    host_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    host = db.relationship(
        "User", backref=db.backref("events_hosted", lazy=True), foreign_keys=[host_id]
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "event_type": self.event_type,
            "location": self.location,
            "event_time": self.event_time.isoformat() if self.event_time else None,
            "duration_minutes": self.duration_minutes,
            "meeting_link": self.meeting_link,
            "max_participants": self.max_participants,
            "host_id": self.host_id,
            "host_name": self.host.name if self.host else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

