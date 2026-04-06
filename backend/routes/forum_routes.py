from http import HTTPStatus

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from . import forum_bp
from models import db
from models.forum_post import ForumPost
from models.forum_answer import ForumAnswer
from models.forum_vote import ForumVote
from models.forum_tag import ForumTag, forum_post_tags
from models.user import User

@forum_bp.get("")
def list_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'latest')  # latest, popular, unanswered
    tag_filter = request.args.get('tag', None, type=int)
    
    query = ForumPost.query
    
    # Apply tag filter
    if tag_filter:
        query = query.filter(ForumPost.tags.any(id=tag_filter))
    
    # Apply sorting
    if sort_by == 'popular':
        posts = query.all()
        # Sort by vote score (upvotes - downvotes)
        sorted_posts = sorted(posts, key=lambda p: (
            p.votes.filter_by(vote_type='upvote').count() - p.votes.filter_by(vote_type='downvote').count()
        ), reverse=True)
        # Apply pagination manually
        start = (page - 1) * per_page
        end = start + per_page
        paginated_posts = sorted_posts[start:end]
        total = len(sorted_posts)
        pages = (total + per_page - 1) // per_page
    elif sort_by == 'unanswered':
        posts = query.filter(ForumPost.best_answer_id.is_(None)).order_by(ForumPost.created_at.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        paginated_posts = posts.items
        total = posts.total
        pages = posts.pages
    else:  # latest
        posts = query.order_by(ForumPost.created_at.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        paginated_posts = posts.items
        total = posts.total
        pages = posts.pages
    
    return jsonify({
        'posts': [post.to_dict() for post in paginated_posts],
        'total': total,
        'pages': pages,
        'current_page': page,
        'has_next': page < pages,
        'has_prev': page > 1
    })

@forum_bp.get("/<int:post_id>")
def get_post(post_id):
    post = ForumPost.query.get_or_404(post_id)
    
    # Increment view count
    post.views += 1
    db.session.commit()
    
    # Get all answers with vote counts
    answers = ForumAnswer.query.filter_by(post_id=post_id).all()
    
    # Sort answers: best answer first, then by vote count, then by creation date
    sorted_answers = sorted(answers, key=lambda a: (
        -a.is_best_answer,  # Best answer first (True = 1, False = 0, so negative to reverse)
        -(a.votes.filter_by(vote_type='upvote').count() - a.votes.filter_by(vote_type='downvote').count()),  # Vote score descending
        a.created_at  # Creation date ascending
    ))
    
    # Get user's votes if authenticated
    user_votes = {}
    try:
        user_id = get_jwt_identity()
        if user_id:
            user_votes_query = ForumVote.query.filter_by(user_id=user_id).filter(
                (ForumVote.post_id == post_id) | (ForumVote.answer_id.in_([a.id for a in answers]))
            ).all()
            user_votes = {(v.post_id, v.answer_id): v.vote_type for v in user_votes_query}
    except:
        pass
    
    return jsonify({
        'post': post.to_dict(),
        'answers': [answer.to_dict() for answer in sorted_answers],
        'user_votes': user_votes
    })

@forum_bp.post("")
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    post = ForumPost(
        title=data['title'],
        content=data['content'],
        author_id=user_id
    )
    
    # Add tags if provided
    if 'tag_ids' in data and data['tag_ids']:
        tags = ForumTag.query.filter(ForumTag.id.in_(data['tag_ids'])).all()
        post.tags.extend(tags)
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify(post.to_dict()), HTTPStatus.CREATED

@forum_bp.put("/<int:post_id>")
@jwt_required()
def update_post(post_id):
    user_id = get_jwt_identity()
    post = ForumPost.query.get_or_404(post_id)
    
    if post.author_id != user_id:
        return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN
    
    data = request.get_json()
    
    if 'title' in data:
        post.title = data['title']
    if 'content' in data:
        post.content = data['content']
    if 'is_closed' in data:
        post.is_closed = data['is_closed']
    
    # Update tags if provided
    if 'tag_ids' in data:
        tags = ForumTag.query.filter(ForumTag.id.in_(data['tag_ids'])).all()
        post.tags = tags
    
    db.session.commit()
    return jsonify(post.to_dict())

@forum_bp.delete("/<int:post_id>")
@jwt_required()
def delete_post(post_id):
    user_id = get_jwt_identity()
    post = ForumPost.query.get_or_404(post_id)
    
    if post.author_id != user_id:
        return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN
    
    db.session.delete(post)
    db.session.commit()
    
    return "", HTTPStatus.NO_CONTENT
