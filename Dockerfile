# Use Node 20 (required for Vite)
FROM node:20

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy all files
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
# BACKEND (Python)
# ----------------------
WORKDIR /app/backend

# Install Flask (fix for Python restriction)
RUN pip3 install flask flask-cors --break-system-packages

# Expose backend port
EXPOSE 5000

# Run backend
CMD ["python3", "app.py"]