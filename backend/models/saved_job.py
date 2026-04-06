from datetime import datetime

from . import db


class SavedJob(db.Model):
    __tablename__ = "saved_jobs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", backref=db.backref("saved_jobs", lazy=True))
    job = db.relationship("Job", backref=db.backref("saved_by", lazy=True))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "job_id": self.job_id,
            "job_title": self.job.title if self.job else None,
            "company": self.job.company if self.job else None,
            "location": self.job.location if self.job else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
