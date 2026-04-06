from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # "student" or "alumni"

    bio = db.Column(db.Text)
    headline = db.Column(db.String(255))
    university = db.Column(db.String(255))
    graduation_year = db.Column(db.Integer)
    location = db.Column(db.String(255))
    
    # Additional profile fields
    linkedin_url = db.Column(db.String(500))
    github_url = db.Column(db.String(500))
    profile_picture_url = db.Column(db.String(500))
    company = db.Column(db.String(255))
    experience = db.Column(db.Text)
    expertise = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "bio": self.bio,
            "headline": self.headline,
            "university": self.university,
            "graduation_year": self.graduation_year,
            "location": self.location,
            "linkedin_url": self.linkedin_url,
            "github_url": self.github_url,
            "profile_picture_url": self.profile_picture_url,
            "company": self.company,
            "experience": self.experience,
            "expertise": self.expertise,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

