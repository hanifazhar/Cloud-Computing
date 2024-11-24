import multer from "multer";
import StorageService from "../services/storage/StorageService.js";
import HistoryService from "../services/mysql/HistoryService.js";
import TreatmentService from "../services/mysql/TreatmentService.js";
import ArticleService from "../services/mysql/ArticleService.js";
import BlogService from "../services/mysql/BlogService.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { signup, signin } from "../authentication/userHandler.js";
import Database from "../config/database.js";
import express from 'express';

const router = express.Router(); // Create a router instance

const uploader = multer({
  storage: multer.memoryStorage(), // Store file in memory
});

const db = new Database(); // Create a new database instance

const historyService = new HistoryService({  bucketName: "test2-db", directory: "assets", db: db });
const treatmentService = new TreatmentService({ db });
const articleService = new ArticleService({ db });
const storageService = new StorageService({ bucketName: "test2-db", directory: "assets", db: db });
const blogService = new BlogService({ db });

router.post('/signup', signup);
router.post('/signin', signin);

// History Routes
router.get('/history', verifyToken, historyService.getHistoryById);
router.delete('/history', historyService.deleteHistory);

// Article Routes
router.get('/treatment', verifyToken, (req, res) => {
  treatmentService.getTreatments(req, res); // Call getTreatments method
});


// Image Upload Routes
router.post('/upload', verifyToken, uploader.single('file'), (req, res) => {
  storageService.uploadImage(req, res);
});
router.delete('/delete', verifyToken, (req, res) => {
  storageService.deleteImage(req, res);
});

// Article Routes
router.get('/articles', articleService.getArticles);
router.post('/articles', articleService.postArticle);
router.put('/articles/:id', articleService.updateArticle);
router.delete('/articles/:id', articleService.deleteArticle);

router.get('/blog', blogService.getBlog);

export default router;
