# Use Node image (has npm)
FROM node:20

# Install Python also
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

# Install frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Install backend
WORKDIR /app/backend
RUN pip3 install flask

EXPOSE 5000

CMD ["python3", "app.py"]