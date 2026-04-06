from datetime import datetime

from . import db


class JobApplication(db.Model):
    __tablename__ = "job_applications"

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    applicant_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    status = db.Column(db.String(20), default="applied")  # applied, reviewed, accepted, rejected
    cover_letter = db.Column(db.Text)
    resume_url = db.Column(db.String(500))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    job = db.relationship("Job", backref=db.backref("applications", lazy=True))
    applicant = db.relationship("User", backref=db.backref("job_applications", lazy=True))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "job_id": self.job_id,
            "job_title": self.job.title if self.job else None,
            "company": self.job.company if self.job else None,
            "applicant_id": self.applicant_id,
            "applicant_name": self.applicant.name if self.applicant else None,
            "status": self.status,
            "cover_letter": self.cover_letter,
            "resume_url": self.resume_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
