# Use Node (for React frontend)
FROM node:20-bullseye

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# ----------------------
# FRONTEND (React)
# ----------------------
WORKDIR /app/frontend

# Install dependencies
RUN npm install

# Build React app
RUN npm run build

# ----------------------
# BACKEND (Flask)
# ----------------------
WORKDIR /app/backend

# Install ALL required Python libraries
RUN pip3 install flask flask-cors flask-jwt-extended flask-sqlalchemy pymysql

# Expose backend port
EXPOSE 5000

# Run backend
CMD ["python3", "app.py"]