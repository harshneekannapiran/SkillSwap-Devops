from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from . import forum_bp
from models import db
from models.forum_vote import ForumVote
from models.forum_post import ForumPost
from models.forum_answer import ForumAnswer

@forum_bp.post("/<int:post_id>/vote")
@jwt_required()
def vote_post(post_id):
    user_id = get_jwt_identity()
    post = ForumPost.query.get_or_404(post_id)
    
    data = request.get_json()
    vote_type = data.get('vote_type')  # 'upvote' or 'downvote'
    
    if vote_type not in ['upvote', 'downvote']:
        return jsonify({"message": "Invalid vote type"}), HTTPStatus.BAD_REQUEST
    
    # Check if user already voted
    existing_vote = ForumVote.query.filter_by(
        user_id=user_id,
        post_id=post_id
    ).first()
    
    if existing_vote:
        if existing_vote.vote_type == vote_type:
            # Remove vote if same type
            db.session.delete(existing_vote)
        else:
            # Change vote type
            existing_vote.vote_type = vote_type
    else:
        # Create new vote
        vote = ForumVote(
            user_id=user_id,
            post_id=post_id,
            vote_type=vote_type
        )
        db.session.add(vote)
    
    db.session.commit()
    
    return jsonify({
        'upvote_count': post.votes.filter_by(vote_type='upvote').count(),
        'downvote_count': post.votes.filter_by(vote_type='downvote').count()
    })

@forum_bp.post("/answers/<int:answer_id>/vote")
@jwt_required()
def vote_answer(answer_id):
    user_id = get_jwt_identity()
    answer = ForumAnswer.query.get_or_404(answer_id)
    
    data = request.get_json()
    vote_type = data.get('vote_type')  # 'upvote' or 'downvote'
    
    if vote_type not in ['upvote', 'downvote']:
        return jsonify({"message": "Invalid vote type"}), HTTPStatus.BAD_REQUEST
    
    # Check if user already voted
    existing_vote = ForumVote.query.filter_by(
        user_id=user_id,
        answer_id=answer_id
    ).first()
    
    if existing_vote:
        if existing_vote.vote_type == vote_type:
            # Remove vote if same type
            db.session.delete(existing_vote)
        else:
            # Change vote type
            existing_vote.vote_type = vote_type
    else:
        # Create new vote
        vote = ForumVote(
            user_id=user_id,
            answer_id=answer_id,
            vote_type=vote_type
        )
        db.session.add(vote)
    
    db.session.commit()
    
    return jsonify({
        'upvote_count': answer.votes.filter_by(vote_type='upvote').count(),
        'downvote_count': answer.votes.filter_by(vote_type='downvote').count()
    })
