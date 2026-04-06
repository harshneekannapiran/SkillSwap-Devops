from datetime import datetime

from . import db


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255))
    location = db.Column(db.String(255))
    description = db.Column(db.Text)
    link = db.Column(db.String(500))

    posted_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    posted_by = db.relationship(
        "User", backref=db.backref("jobs_posted", lazy=True), foreign_keys=[posted_by_id]
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "description": self.description,
            "link": self.link,
            "posted_by_id": self.posted_by_id,
            "posted_by_name": self.posted_by.name if self.posted_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

