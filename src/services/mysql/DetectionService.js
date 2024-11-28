class DetectionService{
  constructor({ pool }) {
    this.pool = pool;
  }
  async postDetection(user_id, image_url, confidence, disease, treatment_id){
    const query = `
          INSERT INTO detection (user_id, image_url, confidence, disease, treatment_id)
          VALUES (?, ?, ?, ?, ?);
      `;
      try {
        const [results] = await this.pool.query(query, [user_id, image_url, confidence, disease, treatment_id]);
        // if (results.length === 0) {
        //   // Return an error object or throw an error to be handled by the caller
        //   throw new Error('Detection not found for ID: ' + treatment_id);
        // }
        return results;
      } catch (error) {
        // Handle or rethrow the error
        throw error;
      }
  }
  async getDetection(uid, limit, offset){
    const query = `
        SELECT 
          id,
          user_id,
          image_url,
          disease,
          confidence,
          created_at
        FROM detection
        WHERE user_id = ?
        LIMIT ? OFFSET ?
      `;
      try {
        const [results] = await this.pool.query(query, [uid, limit, offset]);
        if (results.length === 0) {
          // Return an error object or throw an error to be handled by the caller
          throw new Error(`Treatment not found for ID: ${uid}`);
        }
        return results;
      } catch (error) {
        // Handle or rethrow the error
        throw error;
      }
  }
  async deleteAllDetection(uid){
    try {
      const query = `SELECT image_url FROM detection WHERE user_id = ?`
      const [historyRecords] = await this.pool.query(query, [uid]);

      if (!historyRecords || historyRecords.length === 0) {
        throw new Error(`Treatment not found for ID: ${uid}`)
      }
      const deletePromises = historyRecords.map(async (record) => {
        const imageUrl = record.image_url;
        console.log('Image URL:', imageUrl); 

        const filePath = imageUrl.replace(`https://storage.googleapis.com/${this.bucketName}/`, ``); 
        console.log('File Path:', filePath);

        const file = this.bucket.file(filePath);
        await file.delete();

        await this.pool.query('DELETE FROM detection WHERE image_url = ?', [imageUrl]);
      });

      await Promise.all(deletePromises);
    } catch (error) {
      // Handle or rethrow the error
      throw error;
    }
  }
}

export default DetectionService;