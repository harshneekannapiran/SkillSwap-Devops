from http import HTTPStatus

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import select

from . import job_bp
from models import db
from models.job import Job
from models.job_application import JobApplication
from models.saved_job import SavedJob
from models.user import User


@job_bp.get("")
@jwt_required()
def list_jobs():
    jobs = Job.query.order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs])


@job_bp.get("/mine")
@jwt_required()
def list_my_jobs():
    user_id = get_jwt_identity()
    jobs = Job.query.filter_by(posted_by_id=user_id).order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs])


@job_bp.get("/applications")
@jwt_required()
def list_job_applications():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    if user.role == "alumni":
        # Get applications for jobs I posted
        applications = db.session.execute(
            select(JobApplication)
            .join(Job)
            .filter(Job.posted_by_id == user_id)
        ).scalars().all()
    else:
        # Get applications I made
        applications = JobApplication.query.filter_by(applicant_id=user_id).all()
    
    return jsonify([app.to_dict() for app in applications])


@job_bp.post("")
@jwt_required()
def create_job():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    if user.role != "alumni":
        return jsonify({"message": "Only alumni can post jobs"}), HTTPStatus.FORBIDDEN

    data = request.get_json() or {}
    title = data.get("title")
    if not title:
        return jsonify({"message": "title is required"}), HTTPStatus.BAD_REQUEST

    job = Job(
        title=title,
        company=data.get("company"),
        location=data.get("location"),
        description=data.get("description"),
        link=data.get("link"),
        posted_by_id=user_id,
    )
    db.session.add(job)
    db.session.commit()

    return jsonify(job.to_dict()), HTTPStatus.CREATED


@job_bp.get("/my-applications")
@jwt_required()
def list_my_job_applications():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    if user.role != "alumni":
        return jsonify({"message": "Only alumni can view applicants"}), HTTPStatus.FORBIDDEN
    
    # Get applications for jobs I posted
    applications = db.session.execute(
        select(JobApplication)
        .join(Job)
        .filter(Job.posted_by_id == user_id)
    ).scalars().all()
    
    return jsonify([app.to_dict() for app in applications])


@job_bp.put("/applications/<int:application_id>")
@jwt_required()
def update_job_application(application_id: int):
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    if user.role != "alumni":
        return jsonify({"message": "Only alumni can update applications"}), HTTPStatus.FORBIDDEN
    
    application = JobApplication.query.get_or_404(application_id)
    
    # Verify this application is for my job
    job = Job.query.get(application.job_id)
    if job.posted_by_id != user_id:
        return jsonify({"message": "Not authorized"}), HTTPStatus.FORBIDDEN
    
    data = request.get_json() or {}
    status = data.get("status")
    
    if status not in ["accepted", "rejected"]:
        return jsonify({"message": "Invalid status"}), HTTPStatus.BAD_REQUEST
    
    application.status = status
    db.session.commit()
    
    return jsonify(application.to_dict())


@job_bp.put("/<int:job_id>")
@jwt_required()
def update_job(job_id: int):
    user_id = get_jwt_identity()
    job = Job.query.get_or_404(job_id)
    
    if job.posted_by_id != user_id:
        return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN

    data = request.get_json() or {}
    
    for field in ["title", "company", "location", "description", "link"]:
        if field in data:
            setattr(job, field, data[field])

    db.session.commit()
    return jsonify(job.to_dict())


@job_bp.post("/apply")
@jwt_required()
def apply_job():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    if user.role != "student":
        return jsonify({"message": "Only students can apply to jobs"}), HTTPStatus.FORBIDDEN

    data = request.get_json() or {}
    job_id = data.get("job_id")
    if not job_id:
        return jsonify({"message": "job_id is required"}), HTTPStatus.BAD_REQUEST

    # Check if job exists
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"message": "Job not found"}), HTTPStatus.NOT_FOUND

    # Check if already applied
    existing_application = JobApplication.query.filter_by(
        job_id=job_id, 
        applicant_id=user_id
    ).first()
    
    if existing_application:
        return jsonify({"message": "Already applied to this job"}), HTTPStatus.CONFLICT

    # Create application
    application = JobApplication(
        job_id=job_id,
        applicant_id=user_id,
        cover_letter=data.get("cover_letter", ""),
        resume_url=data.get("resume_url", "")
    )
    
    db.session.add(application)
    db.session.commit()

    return jsonify(application.to_dict()), HTTPStatus.CREATED


@job_bp.put("/applications/<int:application_id>/status")
@jwt_required()
def update_application_status(application_id):
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    if user.role != "alumni":
        return jsonify({"message": "Only alumni can update application status"}), HTTPStatus.FORBIDDEN

    data = request.get_json() or {}
    status = data.get("status")
    
    if not status or status not in ["applied", "reviewed", "accepted", "rejected"]:
        return jsonify({"message": "Invalid status"}), HTTPStatus.BAD_REQUEST

    application = db.session.execute(
        select(JobApplication)
        .join(Job)
        .filter(
            JobApplication.id == application_id,
            Job.posted_by_id == user_id
        )
    ).scalar_one_or_none()

    if not application:
        return jsonify({"message": "Application not found"}), HTTPStatus.NOT_FOUND

    application.status = status
    db.session.commit()

    return jsonify(application.to_dict())


@job_bp.delete("/<int:job_id>")
@jwt_required()
def delete_job(job_id: int):
    try:
        user_id = get_jwt_identity()
        job = Job.query.get_or_404(job_id)
        
        print(f"Delete job - User ID: {user_id} (type: {type(user_id)}), Job ID: {job_id}")
        print(f"Job posted_by_id: {job.posted_by_id} (type: {type(job.posted_by_id)})")
        print(f"Job data: {job.to_dict()}")
        
        # Safe conversion with error handling
        try:
            user_id_int = int(user_id) if user_id else None
            posted_by_int = int(job.posted_by_id) if job.posted_by_id else None
        except (ValueError, TypeError) as e:
            print(f"Conversion error: {e}")
            return jsonify({"message": "Invalid user ID format"}), HTTPStatus.BAD_REQUEST
        
        # Convert both to integers for comparison
        if posted_by_int != user_id_int:
            print(f"Access denied: {posted_by_int} != {user_id_int}")
            return jsonify({"message": "Not allowed"}), HTTPStatus.FORBIDDEN

        # Delete related records first (job applications)
        related_applications = JobApplication.query.filter_by(job_id=job_id).all()
        print(f"Found {len(related_applications)} related applications to delete")
        
        for application in related_applications:
            db.session.delete(application)
        
        # Delete related saved jobs
        related_saved_jobs = SavedJob.query.filter_by(job_id=job_id).all()
        print(f"Found {len(related_saved_jobs)} related saved jobs to delete")
        
        for saved_job in related_saved_jobs:
            db.session.delete(saved_job)
        
        # Now delete the job
        db.session.delete(job)
        db.session.commit()
        print("Job deleted successfully")
        return "", HTTPStatus.NO_CONTENT
        
    except Exception as e:
        print(f"Error in delete_job: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Server error: {str(e)}"}), HTTPStatus.INTERNAL_SERVER_ERROR


@job_bp.get("/saved")
@jwt_required()
def list_saved_jobs():
    user_id = get_jwt_identity()
    saved_jobs = SavedJob.query.filter_by(user_id=user_id).order_by(SavedJob.created_at.desc()).all()
    return jsonify([saved.to_dict() for saved in saved_jobs])


@job_bp.post("/save")
@jwt_required()
def save_job():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    job_id = data.get("job_id")
    
    if not job_id:
        return jsonify({"message": "job_id is required"}), HTTPStatus.BAD_REQUEST

    # Check if job exists
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"message": "Job not found"}), HTTPStatus.NOT_FOUND

    # Check if already saved
    existing_saved = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing_saved:
        return jsonify({"message": "Job already saved"}), HTTPStatus.CONFLICT

    # Save job
    saved_job = SavedJob(user_id=user_id, job_id=job_id)
    db.session.add(saved_job)
    db.session.commit()

    return jsonify(saved_job.to_dict()), HTTPStatus.CREATED


@job_bp.delete("/save/<int:job_id>")
@jwt_required()
def unsave_job(job_id):
    user_id = get_jwt_identity()
    
    saved_job = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
    if not saved_job:
        return jsonify({"message": "Saved job not found"}), HTTPStatus.NOT_FOUND

    db.session.delete(saved_job)
    db.session.commit()

    return jsonify({"message": "Job unsaved successfully"})

