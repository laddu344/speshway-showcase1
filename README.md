# 🚀 Speshway Showcase

![React](https://img.shields.io/badge/React-Frontend-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Docker](https://img.shields.io/badge/Docker-Container-blue)
![AWS](https://img.shields.io/badge/AWS-Cloud-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 📌 Overview

Speshway Showcase is a full-stack web application developed using React, TypeScript, Node.js, Express.js and MongoDB.

The project demonstrates modern web development practices and can be deployed using Docker, AWS, Jenkins, GitHub Actions, and CI/CD automation.

---

# ✨ Features

- Modern Responsive UI
- REST API Integration
- Backend Services
- Secure Authentication (if implemented)
- Database Integration
- Production Ready Architecture
- Scalable Application Structure

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- HTML5
- CSS3

## Backend

- Node.js
- Express.js

## Database

- MongoDB

## DevOps

- Docker
- AWS EC2
- Jenkins
- GitHub Actions
- Nginx
- PM2

---

# 📂 Project Structure

```
speshway-showcase/

├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# 🏗 System Architecture

```
             Users
                │
                ▼
       React Frontend
                │
                ▼
         Nginx Reverse Proxy
                │
                ▼
       Node.js + Express API
                │
                ▼
         MongoDB Database
```

---

# ☁ AWS Deployment Architecture

```
             Internet
                 │
                 ▼
        AWS Security Group
                 │
                 ▼
         Amazon EC2 Instance
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼                   ▼
     Nginx           Docker Container
                              │
                              ▼
                     Node.js Application
                              │
                              ▼
                        MongoDB Atlas
```

---

# 🚀 Local Installation

Clone Repository

```bash
git clone https://github.com/varaprasad-h/speshway-showcase1.git

cd speshway-showcase1
```

Backend

```bash
cd backend
npm install
npm start
```

Frontend

```bash
cd frontend
npm install
npm start
```

---

# 🐳 Docker Deployment

Build

```bash
docker build -t speshway-showcase .
```

Run

```bash
docker run -d -p 3000:3000 speshway-showcase
```

---

# ☁ AWS Deployment

Deployment Services

- AWS EC2
- Docker
- Nginx
- Jenkins
- GitHub Actions

Deployment Flow

```
GitHub

↓

GitHub Actions

↓

Jenkins

↓

Docker Build

↓

AWS EC2

↓

Nginx

↓

Users
```

---

# ⚙ CI/CD Pipeline

```
Developer

↓

GitHub Repository

↓

GitHub Actions

↓

Jenkins Pipeline

↓

Docker Build

↓

Deploy to AWS EC2

↓

Application Live
```

---

# 📊 Monitoring

Recommended

- Prometheus
- Grafana
- Node Exporter

---

# 🔐 Security

- Environment Variables
- Secure REST APIs
- HTTPS Ready
- Nginx Reverse Proxy
- JWT Authentication (if implemented)

---

# 🚀 Future Enhancements

- Kubernetes Deployment
- Helm Charts
- Terraform Infrastructure
- AWS EKS
- Prometheus & Grafana
- GitOps with Argo CD

---

# 👨‍💻 Contributors

- Vara Prasad Renati
- Ramanakulam Charan Teja
- Samyou02

---

# ⭐ Support

If you like this project,

⭐ Star this repository.

---

# 📜 License

MIT License
