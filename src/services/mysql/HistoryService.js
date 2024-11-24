import dotenv from 'dotenv';
dotenv.config();
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  keyFilename: './src/serviceAccount.json', // Replace with your service account key file path
  projectId: 'chili-monitoring-2024' // Replace with your Google Cloud project ID
});
class HistoryService {
  constructor(options) {
    this.pool = options.db.pool;
    this.bucketName = options.bucketName || process.env.BUCKET_NAME;
    this.storage = storage; // Use the existing storage instance
    this.directory = options.directory || 'assets';

    

    // Bind methods to ensure correct context
    this.deleteHistory = this.deleteHistory.bind(this);
    this.getHistoryById = this.getHistoryById.bind(this);

    this.getAllHistory = this.getAllHistory.bind(this);
  }

  async getHistoryById(req, res) {
    try {
      const { uid } = req.body;
      // Early validation for authentication
      // if (!req.user?.uid) {
      //   return res.status(401).json({
      //     status: 'error',
      //     message: 'Unauthorized access'
      //   });
      // }
      // console.log(uid);
      // console.log(req.user.uid);

  
      const query = `
        SELECT 
          id,
          user_id,
          image_url,
          disease,
          created_at
        FROM historys
        WHERE user_id = ?
      `;
  
      const [result] = await this.pool.query(query, [uid]);
      console.log(result);
  
      // Check if the result is empty
      if (result.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'History not found',
        });
      }
  
      return res.status(200).json({
        status: 'success',
        message: 'History fetched successfully',
        data: {
          result: result
        }
      });
  
    } catch (error) {
      console.error('Error fetching image:', error);
      
      return res.status(500).json({
        status: 'error',
        message: error.message
        // ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
  async deleteHistory(req, res) {
    try {
        // Extract the ID from the request body
        const { id } = req.body; // Assuming the ID of the history record to delete is sent in the request body

        // Validate the input
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        console.log('ID:', id); // Log the ID for debugging

        // Fetch the history record from the database to get the image URL
        const [historyRecord] = await this.pool.query('SELECT image_url FROM historys WHERE id = ?', [id]);
        console.log('History Record:', historyRecord); // Log the result of the query

        // Check if the history record was found
        if (!historyRecord || historyRecord.length === 0 || !historyRecord[0].image_url) {
            return res.status(404).json({ error: 'History record not found or image URL is missing' });
        }

        const imageUrl = historyRecord[0].image_url; // Access the image_url from the first element of the array
        console.log('Image URL:', imageUrl); // Log the image URL for debugging

        // Extract the file path from the image URL
        // Assuming the URL format is consistent
        const filePath = imageUrl.replace('https://storage.googleapis.com/test2-db/', ''); // This will give you the correct path
        console.log('File Path:', filePath); // For debugging

        // Delete the file from Google Cloud Storage
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(filePath); // Use the extracted filePath
        await file.delete();

        // Delete the row from the historys table
        await this.pool.query('DELETE FROM historys WHERE id = ?', [id]);

        // Send a success response
        return res.status(200).json({ 
          status: 'success',
          message: 'History record and image deleted successfully' });
    } catch (error) {
        return res.status(500).json({ 
          status: 'error',
          error: error.message });
    }
}
  async getAllHistory(req, res) {
    try {
      // Validate and sanitize pagination parameters
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const offset = (page - 1) * limit;

      // Queries with parameterized input
      const query = `
        SELECT 
          id,
          user_id,
          image_url,
          disease,
          treatment_id,
          created_at
        FROM historys
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const countQuery = `SELECT COUNT(*) AS total FROM historys`;

      // Execute queries concurrently
      const [results, [countResult]] = await Promise.all([
        this.pool.query(query, [limit, offset]),
        this.pool.query(countQuery)
      ]);

      const totalItems = countResult.total;

      return res.status(200).json({
        status: 'success',
        message: 'History fetched successfully',
        data: {
          history: results[0],
          pagination: {
            currentPage: page,
            itemsPerPage: limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching history:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error fetching history',
        error: error,
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
}

export default HistoryService;