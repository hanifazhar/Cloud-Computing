class Blog {
  constructor(options) {
    this.pool = options.db.pool;
    this.getBlog = options.getBlog;

    this.getBlogHandler = this.getBlogHandler.bind(this);
  }
  async getBlogHandler (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const [results] = await this.getBlog(limit, offset);
      
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

export default Blog;
