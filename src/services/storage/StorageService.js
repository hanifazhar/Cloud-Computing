import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';

// Create a new storage instance
const storage = new Storage({
  keyFilename: './src/serviceAccount.json', // Replace with your service account key file path
  projectId: 'chili-monitoring-2024' // Replace with your Google Cloud project ID
});

// Define the Google Cloud Storage bucket name
// const bucketName = 'test2-db'; // Replace with your bucket name

class StorageService {
  constructor(options) {
    this.pool = options.db.pool;
    this.bucketName = options.bucketName || process.env.BUCKET_NAME;
    this.storage = storage; // Use the existing storage instance
    this.directory = options.directory || 'assets';
  }

  async uploadImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded.',
            });
        }
        console.log(JSON.parse(req.body.data));
        const { disease, treatment_id, confidence } = JSON.parse(req.body.data); // Use the parsed JSON data
        console.log(treatment_id);
        console.log(disease);

        const filePath = `${this.directory}/${Date.now()}${path.extname(req.file.originalname)}`;
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(filePath);

        await file.save(req.file.buffer, {
            contentType: req.file.mimetype,
            resumable: false,
        });

        const image_url = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
        const insertQuery = `
            INSERT INTO historys (user_id, image_url, disease, confidence)
            VALUES (?, ?, ?, ?);
        `;

        const values = [req.user.uid, image_url, disease || null, confidence || 0];
        await this.pool.query(insertQuery, values); // Execute the insert query

        // Optionally, retrieve the last inserted ID
        const [result] = await this.pool.query('SELECT LAST_INSERT_ID() AS id;');
        const lastInsertedId = result[0].id;

        res.status(200).json({
            status: 'success',
            message: 'File uploaded successfully.',
            data: {
                id: lastInsertedId, // Include the last inserted ID if needed
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


  async deleteImage(req, res) {
    try {
      const { filePath } = req.body; // Full file path should be provided in the request body

      if (!filePath) {
        return res.status(400).json({
          status: 'error',
          message: 'File path is required.',
        });
      }

      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filePath);

      // Delete the file from the bucket
      await file.delete();

      res.status(200).json({
        status: 'success',
        message: 'File deleted successfully.',
      });
    } catch (error) {
      if (error.code === 404) {
        res.status(404).json({
          status: 'error',
          message: 'File not found.',
        });
      } else {
        console.error('Error deleting file:', error);
        res.status(500).json({
          status: 'error',
          message: error.message,
        });
      }
    }
  }
}

export default StorageService;
