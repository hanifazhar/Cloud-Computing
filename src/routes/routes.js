import multer from "multer";
import StorageService from "../services/storage/StorageService.js";
import TreatmentService from "../services/mysql/TreatmentService.js";
import BlogService from "../services/mysql/BlogService.js";
import DetectionService from "../services/mysql/DetectionService.js"
import ArticleService from "../services/mysql/ArticleService.js";

import Detection from "../api/Detection.js";
import Treatment from "../api/Treatment.js";
import Article from "../api/Article.js";
import Blog from "../api/Blog.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import Database from "../config/Database.js";
import express from 'express';
import path from "path"

const router = express.Router(); // Create a router instance

const uploader = multer({
  storage: multer.memoryStorage(), // Store file in memory
});

const db = new Database(); // Create a new database instance

const storageService = new StorageService({ bucketName: "cimon-bucket", db: db });
const treatmentService = new TreatmentService({ db: db });
const blogService = new BlogService({ db: db });
const detectionService = new DetectionService({ db: db });
const articleService = new ArticleService({ db: db });

const treatment = new Treatment({ db: db, getTreatment: treatmentService.getTreatment });
const article = new Article({ db: db, addImage: storageService.addImage, getArticle: articleService.getArticle, postArticle: articleService.postArticle, putArticle: articleService.putArticle, deleteArticle: articleService.deleteArticle});
const detection = new Detection({ db: db, addImage: storageService.addImage,  postDetection: detectionService.postDetection, getDetection: detectionService.getDetection, deleteAllDetection: detectionService.deleteAllDetection });
const blog = new Blog({ db: db, getBlog: blogService.getBlog});


// History Routes
router.get('/detection', verifyToken, detection.getDetectionByIdHandler);
router.delete('/detection',verifyToken,  detection.deleteAllDetectionHandler);
// router.delete('/detection',verifyToken,  (req, res) => {
//   detection.deleteDetection(req, res);
// });
router.post('/detection', verifyToken, uploader.single('file'), (req, res) => {
  detection.postDetectionHandler(req, res);
});

// Article Routes
router.get('/treatment/:id', verifyToken, (req, res) => {
  treatment.getTreatmentHandler(req, res);
});


// Image Upload Routes
router.post('/upload', verifyToken, uploader.single('file'), (req, res) => {
  storageService.uploadImage(req, res);
});
router.delete('/delete', verifyToken, (req, res) => {
  storageService.deleteImage(req, res);
});

// Article Routes
router.get('/articles',verifyToken,  article.getArticleHandler);
router.post('/articles', verifyToken, uploader.single('file'), article.postArticleHandler);
router.put('/articles/:id',verifyToken,uploader.single('file'), article.updateArticleHandler);
router.delete('/articles/:id',verifyToken, article.deleteArticleHandler);

router.get('/blog', blog.getBlogHandler);

export default router;
