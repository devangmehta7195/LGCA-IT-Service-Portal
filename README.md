# LGCA IT Service Portal

A containerized IT service request portal built as a cloud and DevOps capstone project. The application consists of a React/Vite frontend and a Node.js/Express backend, packaged with Docker and deployed on Amazon ECS/Fargate with an Application Load Balancer. CI/CD is implemented with Jenkins, GitHub, AWS CodeBuild, AWS CodePipeline, and Docker Hub.

## Project Structure

```text
LGCA-IT-Service-Portal/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   ├── .dockerignore
│   └── buildspec.yml
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   ├── .dockerignore
│   └── buildspec.yml
├── screenshots/
└── .gitignore
```

## Application

The portal provides:

- Demo employee sign-in UI
- IT service dashboard
- Ticket creation
- Ticket listing
- Ticket status and priority display
- Categories such as VPN, Cloud PC, software, network, account/access, printer, and general IT support
- REST API integration between the React frontend and Node.js backend

## Local Development

### Backend

```powershell
cd backend
npm install
npm start
```

The backend listens on port `5000`.

Health endpoint:

```text
http://localhost:5000/api/health
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Vite serves the frontend on the default development port, normally `5173`.

Set the API endpoint through the Vite environment variable:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Do not commit `.env` files containing environment-specific endpoints or credentials.

## Docker

### Build backend

```powershell
docker build -t lgca-it-backend:1.0 ./backend
```

Run:

```powershell
docker run -d --name lgca-it-backend-container -p 5000:5000 lgca-it-backend:1.0
```

### Build frontend

```powershell
docker build -t lgca-it-frontend:1.0 ./frontend
```

Run:

```powershell
docker run -d --name lgca-it-frontend-container -p 8081:80 lgca-it-frontend:1.0
```

The frontend is served by Nginx from the production Vite build.

## Docker Hub

The capstone images are published under the Docker Hub account used for the project:

```text
devangmehta7195/lgca-it-backend
devangmehta7195/lgca-it-frontend
```

For a reusable copy of the project, replace the Docker Hub namespace and image tags with your own account.

## AWS Architecture

The deployed architecture uses:

```text
GitHub
   │
   ├── Backend Pipeline
   │      └── CodeBuild → Docker Hub → ECS/Fargate Backend
   │                                      │
   │                                      └── Application Load Balancer
   │
   └── Frontend Pipeline
          └── CodeBuild → Docker Hub → ECS/Fargate Frontend

Browser → Frontend Fargate/Nginx → Backend ALB → Backend Fargate/Node.js
```

AWS region used for the capstone:

```text
ap-south-1 (Asia Pacific - Mumbai)
```

Core AWS resources:

- Amazon ECS cluster
- ECS/Fargate backend service
- ECS/Fargate frontend service
- Task definitions for frontend and backend
- Application Load Balancer for the backend
- Target group for the backend service
- Security groups for frontend, backend, and load balancer
- AWS Secrets Manager for Docker Hub credentials
- AWS CodeBuild projects
- AWS CodePipeline pipelines

## CI/CD

### Jenkins

Jenkins is used for local CI validation. The Jenkins job validates the application by installing dependencies, checking the backend Node.js syntax, and running the frontend production build.

### AWS CodeBuild

Two CodeBuild projects build and push Docker images:

```text
LGCA-IT-Backend-CodeBuild
LGCA-IT-Frontend-CodeBuild
```

Each build:

1. Reads the source from GitHub.
2. Authenticates to Docker Hub using AWS Secrets Manager.
3. Builds the Docker image.
4. Tags the image with the source commit hash.
5. Pushes the image to Docker Hub.
6. Generates `imagedefinitions.json` for ECS deployment.

Docker builds require CodeBuild privileged mode.

### AWS CodePipeline

Two V2 pipelines deploy the two services independently:

```text
LGCA-IT-Backend-Pipeline
LGCA-IT-Frontend-Pipeline
```

Each pipeline follows:

```text
GitHub → Source → CodeBuild → ECS Deploy
```

The ECS deploy stage consumes `imagedefinitions.json` to deploy the image created by CodeBuild.

## Environment Configuration

The frontend uses:

```env
VITE_API_BASE_URL=<backend-api-base-url>
```

For AWS, the value should point to the backend Application Load Balancer URL rather than `localhost`.

The backend and frontend build specifications are stored at:

```text
backend/buildspec.yml
frontend/buildspec.yml
```

Do not store Docker Hub passwords, access tokens, AWS access keys, or other secrets in GitHub.

## Recreating the Project

For a future identical project:

1. Clone this repository.
2. Update the Docker Hub namespace in the build specifications.
3. Create a Docker Hub repository for the backend and frontend images.
4. Create an AWS Secrets Manager entry for the Docker Hub credentials.
5. Create or reuse the required ECS/Fargate and IAM resources.
6. Update the frontend API endpoint to the new backend ALB endpoint.
7. Configure CodeBuild projects using the included buildspec files.
8. Configure CodePipeline source, build, and ECS deploy stages.
9. Run Jenkins locally for CI validation.

## Important Project Limitation

The current application stores ticket data in backend process memory. Therefore, tickets created in a running task are not durable across backend container replacement or redeployment.

For a production-grade implementation, replace the in-memory ticket store with persistent storage such as Amazon DynamoDB or Amazon RDS and update the backend accordingly.

## Security Notes

- Keep `.env` files out of source control.
- Use AWS Secrets Manager for Docker Hub credentials.
- Use IAM roles rather than hard-coded AWS credentials.
- Restrict security-group ingress in production.
- Prefer HTTPS for public production endpoints.
- For production, place the frontend behind a load balancer/CDN and restrict direct task public access.

## Project Evidence

The `screenshots/` directory contains evidence captured during the capstone implementation, including:

- Local frontend and Docker validation
- Docker Hub images
- Jenkins CI
- ECS/Fargate task and service deployment
- ALB health checks
- CodeBuild success
- CodePipeline success
- Final live application testing

## Repository

GitHub:

```text
https://github.com/devangmehta7195/LGCA-IT-Service-Portal
```
