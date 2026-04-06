from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import create_access_token

from . import auth_bp
from models import db
from models.user import User


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([name, email, password, role]):
        return (
            jsonify({"message": "name, email, password and role are required"}),
            HTTPStatus.BAD_REQUEST,
        )

    if role not in {"student", "alumni"}:
        return (
            jsonify({"message": "role must be 'student' or 'alumni'"}),
            HTTPStatus.BAD_REQUEST,
        )

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message": "Email already registered"}), HTTPStatus.CONFLICT

    user = User(name=name, email=email, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))

    return (
        jsonify(
            {
                "access_token": access_token,
                "user": user.to_dict(),
            }
        ),
        HTTPStatus.CREATED,
    )


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return (
            jsonify({"message": "email and password are required"}),
            HTTPStatus.BAD_REQUEST,
        )

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), HTTPStatus.UNAUTHORIZED

    access_token = create_access_token(identity=str(user.id))

    return jsonify({"access_token": access_token, "user": user.to_dict()})

