from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .skill import Skill
from .skill_request import SkillRequest
from .mentorship_request import MentorshipRequest
from .mentorship_session import MentorshipSession
from .message import Message
from .job import Job
from .job_application import JobApplication
from .event import Event
from .event_registration import EventRegistration
from .user_interest import UserInterest
from .skill_endorsement import SkillEndorsement

