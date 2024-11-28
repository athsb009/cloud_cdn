# Scalable Web Application with CDN and Image Resizing

This project demonstrates a scalable web application for uploading, processing, and delivering images. It leverages AWS services such as S3, Lambda, and CloudFront for image storage, resizing, and content delivery, with a React frontend and Node.js/Express backend. The application is deployed on AWS EC2, ensuring seamless performance and global accessibility.

---

## Features
- **React Frontend**: User-friendly interface for uploading and managing images.
- **Node.js/Express Backend**: API for handling image uploads, database interactions, and communication with AWS services.
- **Image Processing**: Serverless resizing using AWS Lambda and Sharp.
- **AWS S3 Integration**: Secure storage for original and processed images.
- **CloudFront CDN**: Global content delivery with reduced latency.
- **AWS EC2 Deployment**: Hosted on a scalable EC2 instance with Nginx reverse proxy.
- **PostgreSQL Database**: Stores image metadata and captions.

---

## Architecture

```plaintext
Client (React) --> EC2/Nginx --> Express API --> S3 Bucket (Storage)
                                      |
                               PostgreSQL (Database)
                                      |
                               AWS Lambda (Image Resizing)
                                      |
                                CloudFront (CDN)
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js and npm/yarn installed.
- AWS account with access to S3, Lambda, and CloudFront.
- PostgreSQL database set up.

---

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/your-repository.git
cd your-repository
```

---

### 3. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd express
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file with the following:
   ```plaintext
   DATABASE_URL=your_postgres_url
   BUCKET_NAME=your_s3_bucket_name
   BUCKET_REGION=your_s3_region
   ACCESS_KEY=your_s3_access_key
   SECRET_ACCESS_KEY=your_s3_secret_key
   CLOUDFRONT_URL=your_cloudfront_url
   ```
4. Start the server:
   ```bash
   node server.js
   ```

---

### 4. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd react
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the frontend:
   ```bash
   npm run build
   ```
4. Move the `dist` folder to the backend's static file directory:
   ```bash
   mv dist ../express/public
   ```

---

### 5. Deploy on EC2
1. **Transfer Files to EC2**:
   Use `scp` to copy the project to your EC2 instance:
   ```bash
   scp -i your-key.pem -r /path/to/project ubuntu@your-ec2-ip:~/project
   ```
2. **Install Dependencies**:
   SSH into your EC2 instance and navigate to the project directory. Install dependencies:
   ```bash
   cd ~/project/express
   npm install
   ```
3. **Run the Backend**:
   ```bash
   node server.js
   ```
4. **Configure Nginx**:
   - Install Nginx:
     ```bash
     sudo apt update
     sudo apt install nginx -y
     ```
   - Configure Nginx to reverse proxy requests:
     ```bash
     sudo nano /etc/nginx/sites-available/default
     ```
     Update with:
     ```nginx
     server {
         listen 80;
         server_name your-domain.com;

         location / {
             proxy_pass http://localhost:8080;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
         }
     }
     ```
   - Restart Nginx:
     ```bash
     sudo systemctl restart nginx
     ```

---

### 6. Test the Application
- Access your application using the public IP or domain name of your EC2 instance.
- Verify that the frontend connects to the backend and images are correctly uploaded, processed, and served via CloudFront.

---

## Technologies Used
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express, Prisma
- **Database**: PostgreSQL
- **Cloud**: AWS S3, Lambda, CloudFront, EC2
- **Web Server**: Nginx

---

## Future Improvements
- Add user authentication (e.g., AWS Cognito).
- Implement additional image processing features (e.g., filters, cropping).
- Automate deployment with CI/CD pipelines.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Acknowledgments
- AWS Documentation
- Prisma Documentation
- Tailwind CSS for styling
