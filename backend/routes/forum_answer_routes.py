from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from . import forum_bp
from models import db
from models.forum_answer import ForumAnswer
from models.forum_post import ForumPost
from models.forum_vote import ForumVote

@forum_bp.post("/<int:post_id>/answers")
@jwt_required()
def create_answer(post_id):
    user_id = get_jwt_identity()
    post = ForumPost.query.get_or_404(post_id)
    
    if post.is_closed:
        return jsonify({"message": "Post is closed"}), HTTPStatus.BAD_REQUEST
    
    data = request.get_json()
    
    answer = ForumAnswer(
        content=data['content'],
        post_id=post_id,
        author_id=user_id
    )
    
    db.session.add(answer)
    db.session.commit()
    
    return jsonify(answer.to_dict()), HTTPStatus.CREATED

@forum_bp.put("/answers/<int:answer_id>")
@jwt_required()
def update_answer(answer_id):
    user_id = get_jwt_identity()
    answer = ForumAnswer.query.get_or_404(answer_id)
    
    if answer.author_id != user_id:
        return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN
    
    data = request.get_json()
    
    if 'content' in data:
        answer.content = data['content']
    
    db.session.commit()
    return jsonify(answer.to_dict())

@forum_bp.delete("/answers/<int:answer_id>")
@jwt_required()
def delete_answer(answer_id):
    user_id = get_jwt_identity()
    answer = ForumAnswer.query.get_or_404(answer_id)
    
    if answer.author_id != user_id and answer.post.author_id != user_id:
        return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN
    
    db.session.delete(answer)
    db.session.commit()
    
    return "", HTTPStatus.NO_CONTENT

@forum_bp.post("/answers/<int:answer_id>/best")
@jwt_required()
def mark_best_answer(answer_id):
    user_id = get_jwt_identity()
    answer = ForumAnswer.query.get_or_404(answer_id)
    post = answer.post
    
    if post.author_id != user_id:
        return jsonify({"message": "Only post author can mark best answer"}), HTTPStatus.FORBIDDEN
    
    # Unmark previous best answer if exists
    if post.best_answer_id:
        previous_best = ForumAnswer.query.get(post.best_answer_id)
        if previous_best:
            previous_best.is_best_answer = False
    
    # Mark new best answer
    answer.is_best_answer = True
    post.best_answer_id = answer_id
    
    db.session.commit()
    
    return jsonify(answer.to_dict())

@forum_bp.delete("/answers/<int:answer_id>/best")
@jwt_required()
def unmark_best_answer(answer_id):
    user_id = get_jwt_identity()
    answer = ForumAnswer.query.get_or_404(answer_id)
    post = answer.post
    
    if post.author_id != user_id:
        return jsonify({"message": "Only post author can unmark best answer"}), HTTPStatus.FORBIDDEN
    
    answer.is_best_answer = False
    post.best_answer_id = None
    
    db.session.commit()
    
    return jsonify(answer.to_dict())
