# AWS S3 setup

This application uploads course images, course lecture videos, profile pictures, and certificates to private S3 objects. The API returns one-hour presigned URLs for reading them.

## 1. Create the bucket

1. Open the AWS Console and select **S3**.
2. Choose **Create bucket**.
3. Select the AWS Region you will use in production, for example `ap-south-1`.
4. Enter a globally unique bucket name, for example `my-elearning-media-prod`.
5. Keep **Object Ownership** as **Bucket owner enforced**.
6. Keep **Block all public access** enabled. Do not make the bucket public.
7. Keep the default server-side encryption enabled, preferably **SSE-S3**.
8. Create the bucket.

The bucket name and region must be used exactly in `AWS_S3_BUCKET` and `AWS_REGION`.

## 2. Create an IAM policy

Create a policy in IAM with this JSON. Replace `YOUR_BUCKET_NAME` with the exact bucket name:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListMediaBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
    },
    {
      "Sid": "ManageMediaObjects",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

For production on AWS, attach this policy to the server's IAM role instead of creating long-lived access keys. For local development, create an IAM user with this policy, enable access keys, and keep the secret out of Git.

## 3. Configure bucket CORS

In the bucket, open **Permissions > Cross-origin resource sharing (CORS)** and save this configuration. Replace the origins with your real frontend domains before production:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://your-frontend-domain.example"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 4. Configure the server

Copy `server/.env.example` to your local environment file and set:

```env
AWS_REGION=ap-south-1
AWS_S3_BUCKET=my-elearning-media-prod
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

The AWS SDK also supports the standard AWS credential chain. In production, prefer an IAM role and omit the access key variables.

Do not commit `.env`, access keys, or secrets. The existing environment file in this project contains credentials; rotate any credentials that have been exposed or committed before deploying.

## 5. Start the application

Local development:

```powershell
cd server
npm install
npm run dev
```

Docker Compose already loads `server/.env` through `env_file`. Restart the stack after changing environment variables:

```powershell
docker compose up --build
```

## 6. Test the upload

1. Log in as an admin.
2. Create a course with an image.
3. Add a lecture with a video.
4. Open the course and play the lecture.
5. In S3, confirm objects exist under `courses/images/` and `courses/videos/`.
6. Confirm the bucket still blocks public access. The application should work through presigned URLs only.

Existing database records containing paths such as `uploads/example.mp4` remain supported by the frontend. New uploads use `s3://...` references. Existing local files are not copied automatically; migrate them separately if they must be retained.

## 7. Deploy this application on an AWS EC2 instance

### Create the EC2 instance

1. Open **EC2 > Instances > Launch instance**.
2. Choose Ubuntu Server 24.04 LTS, or another supported Linux distribution.
3. Choose an instance size with enough memory for Docker and your expected traffic. `t3.small` is a reasonable starting point for testing; scale up for production traffic and video uploads.
4. Create or select an SSH key pair and download the `.pem` file once.
5. Attach an IAM role to the instance. The role must have the S3 policy from step 2. Do not put AWS access keys in the EC2 `.env` file when using this role.
6. Configure the security group with:
  - SSH TCP `22`: your own fixed IP only
  - HTTP TCP `80`: `0.0.0.0/0`
  - HTTPS TCP `443`: `0.0.0.0/0` when TLS is configured
  - Do not open ports `27017` or `5000` to the internet
7. Allocate and associate an Elastic IP so the server address does not change.

### Install Docker on Ubuntu

SSH into the instance, then run:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Log out and reconnect so the Docker group membership takes effect. Verify:

```bash
docker --version
docker compose version
```

### Copy the application to EC2

Use Git, or copy the project with a secure transfer method. For Git:

```bash
git clone YOUR_REPOSITORY_URL elearning-app
cd elearning-app
```

Create the production environment file. Do not commit it:

```bash
cp server/.env.example server/.env
nano server/.env
```

Set at least these values:

```env
PORT=5000
MONGODB_URI=mongodb://db:27017/Elearning
AWS_REGION=ap-south-1
AWS_S3_BUCKET=my-elearning-media-prod
```

When the EC2 IAM role is attached, leave `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` unset. Also set the existing application values for JWT, email, Razorpay, and OpenAI using production credentials. Never reuse credentials that were exposed in development.

### Start the production containers

From the project root:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

Only the frontend container publishes port 80. Nginx serves the React application and proxies `/api/*` to the private backend container. The frontend build uses same-origin `/api` requests, so no EC2 IP needs to be compiled into the React application.

Check the deployment:

```bash
curl http://127.0.0.1/health
curl http://YOUR_ELASTIC_IP/health
```

Both should return a JSON response containing `{"status":"ok"}`.

### Optional domain and HTTPS

1. Create an `A` record such as `app.example.com` pointing to the Elastic IP.
2. Confirm the domain resolves to the instance.
3. Install a TLS reverse proxy such as Caddy or Certbot/Nginx on the host, or place an AWS Application Load Balancer in front of the EC2 instance.
4. Add the HTTPS domain to the S3 CORS `AllowedOrigins` list.
5. Update `FRONTEND_URL` to the HTTPS frontend URL for password-reset links.
6. Allow TCP `443` in the security group and remove public HTTP after HTTPS redirection is working.

### Updating the deployment

```bash
cd ~/elearning-app
git pull
docker compose up -d --build
docker image prune -f
```

Back up the MongoDB volume before upgrades or instance changes. For production scale, use Amazon DocumentDB or MongoDB Atlas instead of relying on a database container on one EC2 instance.
