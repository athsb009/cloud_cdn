import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile } from './s3.js';
import path  from 'path';
import { fileURLToPath } from 'url';

const app = express();
const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../react/dist')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../react/dist/index.html'), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Error loading the page");
    }
  });
});




// Serve static files from the React app's build directory
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// CloudFront URL pointing directly to images in the bucket (no "processed" folder)
const CLOUDFRONT_URL = "https://d2o8zv9cbtpyte.cloudfront.net";

// API route to get all posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.posts.findMany({ orderBy: [{ created: 'desc' }] });
    for (let post of posts) {
      // Construct the CloudFront URL directly for each image
      post.imageUrl = `${CLOUDFRONT_URL}/${post.imageName}`;
    }
    res.send(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send({ error: "Failed to fetch posts" });
  }
});

// API route to create a new post with image upload
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const caption = req.body.caption;
    const imageName = generateFileName();

    // Process the image with sharp before uploading it to S3
    const fileBuffer = await sharp(file.buffer)
      .resize({ height: 1920, width: 1080, fit: 'contain' })
      .toBuffer();

    // Upload the processed file directly to S3
    await uploadFile(fileBuffer, imageName, file.mimetype);

    // Save the reference to the image location in the database
    const post = await prisma.posts.create({
      data: {
        imageName, // Save only the image name; CloudFront URL is constructed in /api/posts
        caption,
      }
    });

    res.status(201).send(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).send({ error: "Failed to create post" });
  }
});

// API route to delete a post by ID
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10); // Ensure the ID is an integer
    const post = await prisma.posts.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    // Delete the image directly from S3 using the image name
    await deleteFile(post.imageName);

    // Delete the post record from the database
    await prisma.posts.delete({ where: { id: post.id } });
    res.send(post);
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send({ error: "Failed to delete post" });
  }
});


app.listen(8080, () => console.log("Listening on port 8080"));
