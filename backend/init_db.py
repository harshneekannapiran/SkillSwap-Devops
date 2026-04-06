#!/usr/bin/env python3
"""
Database initialization script for Railways deployment
"""
import os
import sys
from app import create_app
from models import db

def init_db():
    """Initialize database tables"""
    app = create_app()
    
    with app.app_context():
        try:
            print("Creating database tables...")
            db.create_all()
            print("Database tables created successfully!")
        except Exception as e:
            print(f"Error creating database tables: {e}")
            sys.exit(1)

if __name__ == "__main__":
    init_db()
