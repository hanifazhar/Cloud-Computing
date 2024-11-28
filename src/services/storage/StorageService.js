import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';

class StorageService {
  constructor(options) {
    const serviceAccount = './src/storageService.json'
    this.storage = new Storage({
      keyFilename: serviceAccount,
      projectId: 'chili-monitoring-2024'
    });
    this.bucket = this.storage.bucket('cimon-bucket');

    this.pool = options.db.pool;
    this.bucketName = "cimon-bucket";
    // this.addImage = this.addImage.bind(this);

    this.directory = 'uploads';
  }

  async addImageService(req, feature) {
    try {
      console.log('Full request object:', JSON.stringify(req, null, 2));
      console.log('Request body:', req.body);
      console.log('Request file:', req.file); 
      
      // Add multiple checks to ensure file exists
      if (!req) {
        throw new Error('Request object is undefined');
      }
  
      if (!req.file) {
        throw new Error('No file uploaded. Ensure multer middleware is correctly configured.');
      }
  
      // Validate file buffer
      if (!req.file.buffer) {
        throw new Error('File buffer is missing');
      }
  
      const filePath = `${feature}/${Date.now()}${path.extname(req.file.originalname)}`;
      const file = this.bucket.file(filePath);
      
      console.log('Uploading file:', filePath);
      console.log('File mimetype:', req.file.mimetype);
  
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        resumable: false,
      });
  
      const image_url = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
      console.log('Image URL:', image_url);
      
      return image_url;
    } catch (error) {
      console.error('Detailed error in addImageService:', {
        message: error.message,
        stack: error.stack,
        reqFile: req?.file,
      });
      throw error;
    }
  }

  async deleteImage(req, res) {
    try {
      const { filePath } = req.body;
      if (!filePath) {
        return res.status(400).json({
          status: 'error',
          message: 'File path is required.',
        });
      }
      const file = this.bucket.file(filePath);
      await file.delete();
      res.status(200).json({
        status: 'success',
        message: 'File deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async addImage(req, feature){
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded.',
        });
      }
      const filePath = `${feature}/${Date.now()}${path.extname(req.file.originalname)}`;
      const file = this.bucket.file(filePath);
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        resumable: false,
      });
      const image_url = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
      return image_url;
    } catch (error) {
      console.error('Detailed error in addImage:', {
        message: error.message,
        stack: error.stack,
        reqFile: req?.file,
      });
      throw error;
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded.',
        });
      }
      const { disease, treatment_id, confidence } = JSON.parse(req.body.data);
      const filePath = `${this.directory}/${Date.now()}${path.extname(req.file.originalname)}`;
      const file = this.bucket.file(filePath);
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        resumable: false,
      });
      const image_url = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
      const insertQuery = `
        INSERT INTO detection (user_id, image_url, disease, confidence)
        VALUES (?, ?, ?, ?);
      `;
      const values = [req.user.uid, image_url, disease || null, confidence || 0];
      await this.pool.query(insertQuery, values);
      const [result] = await this.pool.query('SELECT LAST_INSERT_ID() AS id;');
      const lastInsertedId = result[0].id;
      res.status(200).json({
        status: 'success',
        message: 'File uploaded successfully.',
        data: {
          id: lastInsertedId,
          filePath: filePath,
          userId: req.user.uid,
          disease: disease,
          confidence: confidence,
          url: image_url,
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

  async getFileStream(filePath) {
    try {
      const file = this.bucket.file(filePath);
      const [fileStream] = await file.createReadStream();
      return fileStream;
    } catch (error) {
      console.error('Error getting file stream:', error);
      throw error;
    }
  }

  async getFileMetadata(filePath) {
    try {
      const file = this.bucket.file(filePath);
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }
}

export default StorageService;