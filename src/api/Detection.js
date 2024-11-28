import { Storage } from '@google-cloud/storage';
import path from 'path';

class Detection {
  constructor(options) {
    this.pool = options.db.pool;
    this.testDB = options.db.testConnection();
    this.addImage = options.addImage;

    this.postDetection = options.postDetection;
    this.getDetection = options.getDetection;
    this.deleteAllDetection = options.deleteAllDetection;
    

    this.deleteAllDetectionHandler = this.deleteAllDetectionHandler.bind(this);
    this.getDetectionByIdHandler = this.getDetectionByIdHandler.bind(this);
    this.postDetectionHandler = this.postDetectionHandler.bind(this)

    const serviceAccount = './src/storageService.json'
    this.storage = new Storage({
      keyFilename: serviceAccount,
      projectId: 'chili-monitoring-2024'
    });
    this.bucket = this.storage.bucket('cimon-bucket');
  }

  async postDetectionHandler(req, res) {
    try {
      const { uid } = req.user;
      const { disease, treatment_id, confidence } = req.body

      // const image_url = await this.addImage(req, "detection");
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded.',
        });
      }
      const filePath = `detection/${Date.now()}${path.extname(req.file.originalname)}`;
      const file = this.bucket.file(filePath);
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        resumable: false,
      });
      const image_url = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
      
      console.log('Image URL:', image_url);
      console.log("file path:", filePath);
      console.log('file:', file);
      const results = await this.postDetection(uid, image_url, confidence, disease, treatment_id);
      console.log(results)
      res.status(200).json({
        status: 'success',
        message: 'Detection uploaded successfully.',
        data: {
          user_id: uid,
          image_url: image_url,
          confidence: confidence,
          disease: disease,
          treatment_id: treatment_id,
        },
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getDetectionByIdHandler(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const offset = (page - 1) * limit;
      const { uid } = req.user;

      const results = await this.getDetection(uid, limit, offset)

      if (results.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'History not found',
        });
      }
      console.log(results)
      return res.status(200).json({
        status: 'success',
        message: 'History fetched successfully',
        data: {
          result: results
        }
      });

    } catch (error) {
      console.error('Error fetching image:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async deleteAllDetectionHandler(req, res) {
    try {
      const { uid } = req.user;
      await this.deleteAllDetection(uid)

      return res.status(200).json({ 
        status: 'success',
        message: `History record and image deleted successfully for user: ${uid}`
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        error: error.message
      });
    }
  }
}

export default Detection;