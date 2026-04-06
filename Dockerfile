FROM node:20

RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

# FRONTEND
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# BACKEND
WORKDIR /app/backend

# ✅ INSTALL ALL DEPENDENCIES HERE
RUN pip3 install flask flask-cors flask-jwt-extended --break-system-packages

EXPOSE 5000

CMD ["python3", "app.py"]