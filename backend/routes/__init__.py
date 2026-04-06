from flask import Blueprint

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
user_bp = Blueprint("users", __name__, url_prefix="/api/users")
skill_bp = Blueprint("skills", __name__, url_prefix="/api/skills")
mentorship_bp = Blueprint(
    "mentorship", __name__, url_prefix="/api/mentorship"
)
chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")
job_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")
event_bp = Blueprint("events", __name__, url_prefix="/api/events")
interest_bp = Blueprint("interests", __name__, url_prefix="/api/interests")
endorsement_bp = Blueprint("endorsements", __name__, url_prefix="/api/endorsements")
forum_bp = Blueprint("forum", __name__, url_prefix="/api/forum")

from . import auth_routes  # noqa: E402,F401
from . import user_routes  # noqa: E402,F401
from . import skill_routes  # noqa: E402,F401
from . import mentorship_routes  # noqa: E402,F401
from . import mentorship_relationship_routes  # noqa: E402,F401
from . import chat_routes  # noqa: E402,F401
from . import job_routes  # noqa: E402,F401
from . import event_routes  # noqa: E402,F401
from . import interest_routes  # noqa: E402,F401
from . import endorsement_routes  # noqa: E402,F401
from . import forum_routes  # noqa: E402,F401
from . import forum_answer_routes  # noqa: E402,F401
from . import forum_vote_routes  # noqa: E402,F401
from . import forum_tag_routes  # noqa: E402,F401

