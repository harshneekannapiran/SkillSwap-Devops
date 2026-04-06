# Use Node (for frontend build)
FROM node:20-bullseye

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

# ----------------------
# FRONTEND BUILD
# ----------------------
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# ----------------------
# BACKEND
# ----------------------
WORKDIR /app/backend

RUN pip3 install flask flask-cors flask-jwt-extended flask-sqlalchemy pymysql

# Copy built frontend into backend
RUN mkdir -p /app/backend/static
RUN cp -r /app/frontend/dist/* /app/backend/static/

EXPOSE 5000

CMD ["python3", "app.py"]