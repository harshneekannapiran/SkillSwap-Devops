from datetime import datetime

from . import db


class EventRegistration(db.Model):
    __tablename__ = "event_registrations"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    attendee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    status = db.Column(db.String(20), default="registered")  # registered, attended, cancelled
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    event = db.relationship("Event", backref=db.backref("registrations", lazy=True))
    attendee = db.relationship("User", backref=db.backref("event_registrations", lazy=True))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "event_id": self.event_id,
            "event_title": self.event.title if self.event else None,
            "event_time": self.event.event_time.isoformat() if self.event and self.event.event_time else None,
            "attendee_id": self.attendee_id,
            "attendee_name": self.attendee.name if self.attendee else None,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
