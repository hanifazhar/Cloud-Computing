class BlogService {
  constructor({ db }) {
    this.pool = db.pool;

    this.getBlog = this.getBlog.bind(this);
  }
  async getBlog (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT
        id,
        image_url,
        title,
        description,
        created_at,
        category
      FROM 
        blog
      ORDER BY 
        created_at DESC
      LIMIT ? OFFSET ?;
    `;

    try {
      const [results] = await this.pool.query(query, [limit, offset]);
      res.status(200).json({
        status:'success',
        message: 'Blog fetched successfully',
        data: {
          results: results
        }
      })
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ 
        status: 'error',
        message: error.message });
    }
  }
}

export default BlogService;
