# E-Learning Platform

Full-stack e-learning platform with course management, video lectures, secure media uploads, OTP-based registration, password recovery, online payments, an AI tutor, learning analytics, and an admin dashboard.

## Features

- User registration with email OTP verification
- JWT authentication and protected routes
- Login, logout, profile management, profile pictures, and certificates
- Forgot-password and reset-password email flow
- Course browsing and course detail pages
- Admin course creation, lecture uploads, course deletion, and lecture deletion
- Private course images and lecture videos stored in Amazon S3
- One-hour presigned S3 URLs for private media playback
- Razorpay course checkout and payment signature verification
- AI tutor powered by the OpenAI Chat Completions API
- Student dashboard with learning analytics and event tracking
- Redis-backed rate limiting for login and OTP registration requests
- MongoDB persistence with Mongoose
- Docker Compose deployment with MongoDB, Express, and Nginx
- Responsive React frontend with React Router and toast notifications

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- React Icons
- React Hot Toast
- Nginx for production serving and API reverse proxying

### Backend

- Node.js 22+
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens
- bcrypt password hashing
- Nodemailer with Gmail SMTP
- Razorpay payments
- OpenAI-compatible AI API
- Upstash Redis and `@upstash/ratelimit`
- AWS SDK for S3 uploads and presigned URLs
- Multer for multipart file uploads

## Architecture

```text
React/Vite frontend
        |
        | /api and /uploads
        v
Nginx reverse proxy (Docker)
        |
        v
Express API ------ MongoDB
   |   |  |  \
   |   |  |   \-- OpenAI-compatible AI API
   |   |  \------ Razorpay
   |   \--------- Gmail SMTP
   \------------- AWS S3 private media
          \
           \---- Upstash Redis rate limiting
```

## Project Structure

```text
.
├── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── server/
    ├── controllers/
    ├── database/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── utils/
    ├── Dockerfile
    └── package.json
```

## Prerequisites

- Node.js 22 or later
- npm
- MongoDB, or Docker Desktop
- An SMTP email account for OTP and reset emails
- AWS S3 bucket for private media uploads
- Razorpay account for payments
- OpenAI API key for the AI tutor
- Upstash Redis database for distributed rate limiting

## Environment Configuration

Copy the server template:

### PowerShell

```powershell
Copy-Item server/.env.example server/.env
```

### macOS/Linux

```bash
cp server/.env.example server/.env
```

Configure `server/.env` with values for your environment:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/Elearning

# JWT and email activation
Jwt_Sec=replace-with-a-long-random-jwt-secret
Activation_Secret=replace-with-a-long-random-activation-secret
FRONTEND_URL=http://localhost:5173

# Gmail SMTP
Gmail=your-gmail-address@example.com
Password=your-gmail-app-password

# Razorpay
Razorpay_Key=your-razorpay-key-id
Razorpay_Secret=your-razorpay-key-secret

# OpenAI-compatible AI provider
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
# Optional: use another OpenAI-compatible endpoint
# OPENAI_API_URL=https://api.openai.com/v1/chat/completions

# AWS S3
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-unique-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

The frontend uses same-origin `/api` requests by default. For a separately running backend, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is compiled into the frontend at build time.

## Redis and Rate Limiting

The server uses Upstash Redis with sliding-window limits for login attempts and registration/OTP requests. Configure Redis through environment variables in production and never commit a Redis URL or token.

Before publishing this repository, rotate any Redis credential that may have been exposed and update `server/utils/rateLimiter.js` to read the connection details from environment variables, for example:

```env
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

The current rate limits are three requests per minute per client IP for login and registration attempts.

## AWS S3 Media Storage

Course images, lecture videos, profile pictures, and certificates are uploaded to private S3 objects. The API returns presigned URLs that expire after one hour.

Use the detailed [S3 setup guide](server/S3_SETUP.md) to configure:

1. A private bucket with public access blocked.
2. An IAM policy allowing `ListBucket`, `PutObject`, `GetObject`, and `DeleteObject`.
3. CORS for the frontend origin.
4. An IAM role in production, or restricted access keys for local development.

Never commit `server/.env`, AWS keys, SMTP credentials, payment secrets, or API keys.

## Run Locally

### 1. Start MongoDB

Use a local MongoDB installation, or start only MongoDB with Docker:

```bash
docker compose up -d db
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Run with Docker Compose

Create and configure `server/.env`, then from the project root run:

```bash
docker compose up --build
```

Open `http://localhost`. Docker Compose starts:

- MongoDB on the internal Docker network
- The backend on internal port `5000`
- Nginx/frontend on port `80`

Persistent Docker volumes store MongoDB data and uploaded files. Stop the stack with:

```bash
docker compose down
```

To remove the stored database and upload volumes as well:

```bash
docker compose down -v
```

## API Reference

All API routes are prefixed with `/api`. Protected routes require the JWT in the `token` request header.

### Authentication and Profile

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| POST | `/api/user/register` | Public | Register and send an OTP |
| POST | `/api/user/verify` | Public | Verify the registration OTP |
| POST | `/api/user/login` | Public | Log in and receive a JWT |
| POST | `/api/user/forgot-password` | Public | Send a password reset email |
| POST | `/api/user/reset-password/:token` | Public | Set a new password |
| GET | `/api/user/me` | JWT | Get the current user |
| PUT | `/api/user/profile` | JWT | Update profile and upload files |

### Courses and Learning

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| GET | `/api/course/all` | Public | List all courses |
| GET | `/api/course/:id` | Public | Get a course |
| GET | `/api/lectures/:id` | JWT | Get course lectures |
| GET | `/api/lecture/:id` | JWT | Get a lecture |
| GET | `/api/mycourse` | JWT | Get purchased courses |
| GET | `/api/course/:id/lectures` | JWT | Get lectures for a course |
| POST | `/api/course/checkout/:id` | JWT | Create a Razorpay order |
| POST | `/api/verification/:id` | JWT | Verify a Razorpay payment |
| GET | `/api/user/analytics` | JWT | Get learning analytics |
| POST | `/api/user/analytics/events` | JWT | Record a learning event |
| POST | `/api/ai/ask` | JWT | Ask the AI tutor a question |

### Admin

Admin routes require both a valid JWT and an account with the `admin` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/course/new` | Create a course and upload its image |
| POST | `/api/course/:id` | Add lectures and video files |
| DELETE | `/api/lecture/:id` | Delete a lecture |
| DELETE | `/api/course/:id` | Delete a course and its media |
| GET | `/api/stats` | View platform statistics |

## Health Checks

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{"status":"ok"}
```

When using Docker Compose, the frontend Nginx proxy exposes the same check at `http://localhost/health`.

## Kubernetes Deployment

The `k8s/` directory contains manifests for MongoDB, the backend API, the frontend/Nginx service, persistent storage, configuration, and an Nginx Ingress.

### Build and publish images

Replace `YOUR_GITHUB_USERNAME` in `k8s/backend.yaml` and `k8s/frontend.yaml` with your GitHub Container Registry namespace, then build and push both images:

```bash
docker login ghcr.io
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/elearning-backend:latest ./server
docker build --build-arg VITE_API_URL= ./frontend -t ghcr.io/YOUR_GITHUB_USERNAME/elearning-frontend:latest
docker push ghcr.io/YOUR_GITHUB_USERNAME/elearning-backend:latest
docker push ghcr.io/YOUR_GITHUB_USERNAME/elearning-frontend:latest
```

For private GHCR images, create an image pull secret and reference it from both Deployments.

### Configure secrets

Copy the template, replace every placeholder with a real value, and keep the resulting file out of Git:

```bash
cp k8s/secret.example.yaml k8s/secret.yaml
# Edit k8s/secret.yaml
kubectl apply -f k8s/secret.yaml
```

The Redis URL and token are read from `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Existing environments must also add these variables to `server/.env`.

### Apply the stack

An Nginx Ingress Controller and a default StorageClass must already be installed in the cluster. Update the host in `k8s/ingress.yaml`, then run:

```bash
kubectl apply -k k8s/
kubectl -n elearning get pods,services,ingress
kubectl -n elearning rollout status statefulset/mongodb
kubectl -n elearning rollout status deployment/backend
kubectl -n elearning rollout status deployment/frontend
```

The frontend Ingress proxies `/api`, `/uploads`, and `/health` through the Nginx configuration already included in the frontend image. Configure TLS before using the deployment for production traffic.

Remove the Kubernetes stack with:

```bash
kubectl delete -k k8s/
```

## Useful Scripts

### Backend

```bash
npm start       # Start the production server
npm run dev     # Start with nodemon
```

### Frontend

```bash
npm run dev     # Start Vite development server
npm run build   # Create a production build
npm run preview # Preview the production build
npm run lint    # Run ESLint
```

## Production Notes

- Use strong, unique JWT and activation secrets.
- Use Gmail app passwords or a transactional email provider; do not use a normal Gmail password.
- Keep MongoDB, port `5000`, and Redis private.
- Prefer AWS IAM roles over long-lived AWS access keys.
- Keep S3 public access blocked and serve files through presigned URLs.
- Use Razorpay production credentials only in a protected deployment environment.
- Configure HTTPS and update `FRONTEND_URL` and S3 CORS origins for the production domain.
- Back up MongoDB before upgrades or destructive maintenance.
- Rotate credentials if they were ever committed, logged, or shared.

## License

This project currently does not declare a public open-source license. Add a license file before accepting external contributions or redistributing the project.
