class BlogService{
  constructor({ pool }) {
    this.pool = pool;
  }
  async getBlog(limit = 10, offset){
    const query = `
      SELECT
        id,
        image_url,
        title,
        description,
        category
        created_at
      FROM 
        blog
      ORDER BY 
        created_at DESC
      LIMIT ? OFFSET ?;
    `;
  try {
    const [results] = await this.pool.query(query, [limit, offset]);
    if (results.length === 0) {
      // Return an error object or throw an error to be handled by the caller
      throw new Error('Treatment not found for ID: ' + treatment_id);
    }
    return results;
  } catch (error) {
    // Handle or rethrow the error
    throw error;
  }
}
}

export default BlogService;