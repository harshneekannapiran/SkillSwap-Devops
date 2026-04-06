from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from . import endorsement_bp
from models import db
from models.skill_endorsement import SkillEndorsement


@endorsement_bp.get("/skill/<int:skill_id>")
@jwt_required()
def get_skill_endorsements(skill_id: int):
    endorsements = SkillEndorsement.query.filter_by(skill_id=skill_id).all()
    return jsonify([e.to_dict() for e in endorsements])


@endorsement_bp.post("/skill/<int:skill_id>")
@jwt_required()
def endorse_skill(skill_id: int):
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    # Check if already endorsed
    existing = SkillEndorsement.query.filter_by(
        skill_id=skill_id, endorser_id=user_id
    ).first()
    if existing:
        return jsonify({"message": "Already endorsed"}), HTTPStatus.CONFLICT

    endorsement = SkillEndorsement(
        skill_id=skill_id,
        endorser_id=user_id,
        endorsement_text=data.get("endorsement_text"),
        rating=data.get("rating"),
    )
    db.session.add(endorsement)
    db.session.commit()

    return jsonify(endorsement.to_dict()), HTTPStatus.CREATED


@endorsement_bp.delete("/<int:endorsement_id>")
@jwt_required()
def delete_endorsement(endorsement_id: int):
    user_id = get_jwt_identity()
    endorsement = SkillEndorsement.query.get_or_404(endorsement_id)
    
    if endorsement.endorser_id != user_id:
        return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN

    db.session.delete(endorsement)
    db.session.commit()
    return "", HTTPStatus.NO_CONTENT
