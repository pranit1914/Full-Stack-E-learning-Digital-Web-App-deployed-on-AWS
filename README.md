# 🎓 E-Learning Platform

A full-stack **E-Learning Platform** built with the MERN stack, providing secure course management, video-based learning, online payments, OTP authentication, AI-powered tutoring, learning analytics, and an admin dashboard.

The platform uses **Amazon S3 for private media storage**, **Razorpay for payments**, **Redis for distributed rate limiting**, and an **OpenAI-compatible API for the AI tutor**.

---

## 🚀 Features

### 👤 Authentication & User Management

* User registration with email OTP verification
* JWT-based authentication
* Protected API routes
* Login and logout
* User profile management
* Profile picture uploads
* Certificate uploads
* Forgot-password functionality
* Secure password reset through email

### 📚 Course Management

* Browse available courses
* Course details and lecture information
* Admin course creation
* Course image uploads
* Lecture creation and video uploads
* Lecture deletion
* Course deletion
* Purchased-course dashboard
* Protected access to course lectures

### ☁️ Secure Media Storage

* Course images stored in Amazon S3
* Lecture videos stored in private S3 objects
* Profile pictures stored in S3
* Certificates stored in S3
* S3 public access blocked
* One-hour presigned URLs for secure media access
* S3 object deletion when courses/lectures are removed

### 💳 Online Payments

* Razorpay course checkout
* Server-side payment order creation
* Razorpay payment signature verification
* Course access after successful payment

### 🤖 AI Tutor

* AI-powered tutor for students
* JWT-protected AI API
* OpenAI Chat Completions API integration
* Configurable AI model
* Support for OpenAI-compatible API providers

### 📊 Learning Analytics

* Student learning dashboard
* Learning event tracking
* Course progress analytics
* User-specific analytics
* Platform statistics for administrators

### 🔐 Security

* JWT authentication
* bcrypt password hashing
* OTP-based registration
* Password reset flow
* Redis-backed rate limiting
* Private S3 objects
* Presigned URLs
* Admin role-based authorization
* Environment-based secret management
* Protected payment verification
* Sensitive credentials excluded from source control

### ⚡ Performance & Infrastructure

* Dockerized application
* Docker Compose deployment
* Nginx reverse proxy
* MongoDB persistent storage
* Redis-backed distributed rate limiting
* Production-oriented frontend build using Vite
* Backend health checks

---

# 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      React + Vite    │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                         /api requests
                               │
                               ▼
                    ┌──────────────────────┐
                    │        Nginx         │
                    │  Reverse Proxy       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │      REST API        │
                    └─────┬────┬────┬──────┘
                          │    │    │
              ┌───────────┘    │    └──────────────┐
              │                │                   │
              ▼                ▼                   ▼
       ┌─────────────┐  ┌─────────────┐   ┌──────────────┐
       │   MongoDB   │  │   Amazon S3  │   │   Upstash    │
       │  Database   │  │ Private Media│   │    Redis     │
       └─────────────┘  └─────────────┘   └──────────────┘
              │
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
┌─────────────┐  ┌─────────────┐
│  Razorpay   │  │ AI Provider │
│  Payments   │  │ OpenAI API  │
└─────────────┘  └─────────────┘

          ┌───────────────────┐
          │    Gmail SMTP     │
          │ OTP / Reset Email │
          └───────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

| Technology      | Purpose                            |
| --------------- | ---------------------------------- |
| React 19        | UI development                     |
| Vite            | Frontend build tool                |
| React Router    | Client-side routing                |
| Axios           | HTTP requests                      |
| React Icons     | UI icons                           |
| React Hot Toast | Notifications                      |
| Nginx           | Production serving & reverse proxy |

## Backend

| Technology  | Purpose                |
| ----------- | ---------------------- |
| Node.js 22+ | Runtime                |
| Express 5   | REST API               |
| MongoDB     | Database               |
| Mongoose    | MongoDB ODM            |
| JWT         | Authentication         |
| bcrypt      | Password hashing       |
| Nodemailer  | Email delivery         |
| Razorpay    | Payment processing     |
| OpenAI API  | AI tutor               |
| Multer      | Multipart file uploads |
| AWS SDK     | S3 integration         |

## Cloud & Infrastructure

* Amazon S3
* AWS IAM
* Upstash Redis
* Docker
* Docker Compose
* Nginx

---

# 📂 Project Structure

```text
.
├── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── server/
    ├── controllers/
    ├── database/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── utils/
    ├── Dockerfile
    ├── S3_SETUP.md
    └── package.json
```

---

# ⚙️ Prerequisites

Before running the project, make sure you have:

* Node.js 22 or later
* npm
* MongoDB or Docker Desktop
* AWS account with an S3 bucket
* AWS IAM permissions for S3
* Gmail account with an App Password or transactional email provider
* Razorpay account
* OpenAI API key
* Upstash Redis database

---

# 🔐 Environment Configuration

Create the backend environment file from the provided template.

### Windows PowerShell

```powershell
Copy-Item server/.env.example server/.env
```

### macOS / Linux

```bash
cp server/.env.example server/.env
```

Configure `server/.env`:

```env
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/Elearning

# JWT & Account Activation
Jwt_Sec=replace-with-a-long-random-jwt-secret
Activation_Secret=replace-with-a-long-random-activation-secret

# Frontend
FRONTEND_URL=http://localhost:5173

# Gmail SMTP
Gmail=your-gmail-address@example.com
Password=your-gmail-app-password

# Razorpay
Razorpay_Key=your-razorpay-key-id
Razorpay_Secret=your-razorpay-key-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Optional OpenAI-compatible endpoint
# OPENAI_API_URL=https://api.openai.com/v1/chat/completions

# AWS S3
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-unique-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

> ⚠️ Never commit `.env` files, AWS credentials, Redis tokens, SMTP passwords, Razorpay secrets, or API keys to GitHub.

---

# ☁️ AWS S3 Setup

The application stores course and user media in **private Amazon S3 objects**.

The following files can be stored in S3:

* Course images
* Lecture videos
* Profile pictures
* Certificates

The backend generates **presigned URLs** that allow temporary access to private objects.

### Recommended S3 configuration

1. Create an S3 bucket.
2. Keep the bucket private.
3. Enable **Block Public Access**.
4. Configure an IAM policy with only the required permissions.
5. Configure S3 CORS for your frontend domain.
6. Use IAM roles when deploying on AWS.
7. Use restricted credentials only when necessary for local development.

Example required permissions:

```text
s3:ListBucket
s3:PutObject
s3:GetObject
s3:DeleteObject
```

See the detailed S3 configuration guide:

```text
server/S3_SETUP.md
```

---

# 🔐 Redis Rate Limiting

The application uses **Upstash Redis** with `@upstash/ratelimit`.

Redis is used for distributed rate limiting of sensitive authentication operations.

Current limits:

```text
Login attempts:
3 requests / minute / client IP

Registration / OTP requests:
3 requests / minute / client IP
```

Redis credentials must be loaded through environment variables.

```env
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

If Redis credentials were ever committed to Git or exposed publicly, **rotate them immediately**.

---

# 🏃 Running Locally

## 1. Start MongoDB

You can use an existing MongoDB installation or Docker.

```bash
docker compose up -d db
```

---

## 2. Start the Backend

```bash
cd server
npm install
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

For a separately running backend, create:

```text
frontend/.env
```

and configure:

```env
VITE_API_URL=http://localhost:5000
```

> `VITE_API_URL` is compiled into the frontend during the Vite build process.

---

# 🐳 Running with Docker Compose

Create and configure:

```text
server/.env
```

Then run from the project root:

```bash
docker compose up --build
```

The application will start:

```text
Frontend + Nginx → http://localhost

Backend          → Internal port 5000

MongoDB          → Internal Docker network
```

Docker Compose provides:

* MongoDB container
* Node.js/Express backend
* React production build
* Nginx reverse proxy
* Persistent MongoDB volume
* Persistent upload volume

Open:

```text
http://localhost
```

---

## Stop the Application

```bash
docker compose down
```

To remove containers **and persistent volumes**:

```bash
docker compose down -v
```

> ⚠️ `docker compose down -v` removes the stored MongoDB and upload volumes.

---

# 🔌 API Reference

All APIs use the `/api` prefix.

Protected endpoints require a JWT in the request header:

```http
token: <JWT_TOKEN>
```

---

## 👤 Authentication & Profile

| Method | Endpoint                          | Auth   | Description                     |
| ------ | --------------------------------- | ------ | ------------------------------- |
| POST   | `/api/user/register`              | Public | Register user and send OTP      |
| POST   | `/api/user/verify`                | Public | Verify registration OTP         |
| POST   | `/api/user/login`                 | Public | Authenticate user               |
| POST   | `/api/user/forgot-password`       | Public | Send password reset email       |
| POST   | `/api/user/reset-password/:token` | Public | Reset password                  |
| GET    | `/api/user/me`                    | JWT    | Get current user                |
| PUT    | `/api/user/profile`               | JWT    | Update profile and upload files |

---

## 📚 Courses & Learning

| Method | Endpoint                     | Auth   | Description             |
| ------ | ---------------------------- | ------ | ----------------------- |
| GET    | `/api/course/all`            | Public | Get all courses         |
| GET    | `/api/course/:id`            | Public | Get course details      |
| GET    | `/api/lectures/:id`          | JWT    | Get course lectures     |
| GET    | `/api/lecture/:id`           | JWT    | Get lecture             |
| GET    | `/api/mycourse`              | JWT    | Get purchased courses   |
| GET    | `/api/course/:id/lectures`   | JWT    | Get course lectures     |
| POST   | `/api/course/checkout/:id`   | JWT    | Create Razorpay order   |
| POST   | `/api/verification/:id`      | JWT    | Verify Razorpay payment |
| GET    | `/api/user/analytics`        | JWT    | Get learning analytics  |
| POST   | `/api/user/analytics/events` | JWT    | Record learning event   |
| POST   | `/api/ai/ask`                | JWT    | Ask AI tutor            |

---

## 👨‍💼 Admin APIs

Admin endpoints require:

```text
Valid JWT
+
admin role
```

| Method | Endpoint           | Description                    |
| ------ | ------------------ | ------------------------------ |
| POST   | `/api/course/new`  | Create course and upload image |
| POST   | `/api/course/:id`  | Add lecture and upload video   |
| DELETE | `/api/lecture/:id` | Delete lecture                 |
| DELETE | `/api/course/:id`  | Delete course and media        |
| GET    | `/api/stats`       | Get platform statistics        |

---

# ❤️ Health Check

The backend exposes:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

When running through Docker Compose:

```bash
curl http://localhost/health
```

---

# 📜 Available Scripts

## Backend

```bash
npm start
```

Start the production server.

```bash
npm run dev
```

Start the development server using Nodemon.

## Frontend

```bash
npm run dev
```

Start the Vite development server.

```bash
npm run build
```

Create a production build.

```bash
npm run preview
```

Preview the production build.

```bash
npm run lint
```

Run ESLint.

---

# 🔒 Security Considerations

This project follows several security practices:

* Passwords are hashed using bcrypt.
* Authentication uses JWT.
* Admin APIs use role-based authorization.
* Registration uses email OTP verification.
* Password reset uses a token-based flow.
* Login and OTP endpoints use Redis rate limiting.
* S3 objects remain private.
* Media is accessed through temporary presigned URLs.
* MongoDB should not be publicly exposed.
* Redis credentials are stored in environment variables.
* Payment signatures are verified server-side.
* AWS IAM roles are preferred over long-lived access keys in production.
* Secrets should never be committed to GitHub.

### Never commit

```text
.env
AWS credentials
Razorpay secrets
OpenAI API keys
Redis tokens
SMTP passwords
JWT secrets
```

---

# 🌐 Production Deployment

For production deployment:

### Application

* Build the React frontend using Vite.
* Run the Express backend in production mode.
* Use Nginx as a reverse proxy.
* Keep backend services private where possible.

### AWS

Recommended architecture:

```text
                    Internet
                       │
                       ▼
                ┌─────────────┐
                │    Nginx    │
                │   Frontend  │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │   Express   │
                │   Backend   │
                └──────┬──────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     MongoDB          S3          Redis
                   Private       Upstash
```

For AWS deployments:

* Prefer IAM roles instead of access keys.
* Keep MongoDB and Redis private.
* Use HTTPS.
* Configure a production domain.
* Update `FRONTEND_URL`.
* Update S3 CORS configuration.
* Use Razorpay production credentials only in the production environment.
* Enable proper logging and monitoring.
* Back up MongoDB before major changes.

---

# 🧪 Example Application Flow

### Student Registration

```text
Student
   │
   ▼
React Registration Form
   │
   ▼
POST /api/user/register
   │
   ├── Validate input
   ├── Generate OTP
   ├── Store verification data
   ├── Apply Redis rate limit
   └── Send OTP through Gmail SMTP
            │
            ▼
       Student verifies OTP
            │
            ▼
POST /api/user/verify
            │
            ▼
       Account activated
```

### Course Purchase

```text
Student
   │
   ▼
Select Course
   │
   ▼
Create Razorpay Order
   │
   ▼
Razorpay Checkout
   │
   ▼
Payment Successful
   │
   ▼
Server-side Signature Verification
   │
   ▼
Course Added to Student Account
```

### Private Video Playback

```text
Student
   │
   ▼
Request Course Lecture
   │
   ▼
JWT Authentication
   │
   ▼
Check Course Access
   │
   ▼
Generate S3 Presigned URL
   │
   ▼
Temporary URL
   │
   ▼
Private S3 Video
```

---

# 📈 Future Improvements

Potential improvements for future versions:

* [ ] CI/CD pipeline using GitHub Actions
* [ ] AWS EC2/ECS deployment
* [ ] Infrastructure as Code using Terraform
* [ ] HTTPS with AWS Certificate Manager
* [ ] CloudFront CDN for media delivery
* [ ] MongoDB Atlas production deployment
* [ ] Centralized application logging
* [ ] CloudWatch monitoring and alerts
* [ ] Automated database backups
* [ ] Course reviews and ratings
* [ ] Advanced recommendation system
* [ ] AI-based course recommendations
* [ ] AI-generated course summaries
* [ ] Student progress notifications
* [ ] Instructor dashboard
* [ ] Advanced learning analytics
* [ ] Automated testing in CI/CD

---

# 📌 Project Highlights

This project demonstrates practical experience with:

```text
Full-Stack Development
        ↓
REST API Development
        ↓
JWT Authentication & RBAC
        ↓
Secure File Uploads
        ↓
AWS S3 & IAM
        ↓
Razorpay Payment Integration
        ↓
Redis Rate Limiting
        ↓
AI API Integration
        ↓
Docker & Docker Compose
        ↓
Nginx Reverse Proxy
        ↓
Production Deployment Concepts
```

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "Add your feature"
```

4. Push the branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---

# 📄 License

This project currently does not include a public open-source license.

If you plan to allow others to use, modify, or redistribute the project, add an appropriate `LICENSE` file.

---

# 👨‍💻 Author

**Pranit Pawar**

B.Tech Computer Science & Engineering

Interested in:

* Cloud Engineering
* DevOps
* Backend Development
* Distributed Systems
* AI-powered Applications

---

⭐ If you find this project useful, consider giving the repository a star!
