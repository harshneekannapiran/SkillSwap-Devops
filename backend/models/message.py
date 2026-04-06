from datetime import datetime

from . import db


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    sender = db.relationship(
        "User", foreign_keys=[sender_id], backref=db.backref("sent_messages", lazy=True)
    )
    receiver = db.relationship(
        "User",
        foreign_keys=[receiver_id],
        backref=db.backref("received_messages", lazy=True),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "sender_name": self.sender.name if self.sender else None,
            "receiver_name": self.receiver.name if self.receiver else None,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

