class ArticleService {
  constructor({ db }) {
    this.pool = db.pool;

    this.getArticles = this.getArticles.bind(this);
    this.postArticle = this.postArticle.bind(this);
    this.updateArticle = this.updateArticle.bind(this);
    this.deleteArticle = this.deleteArticle.bind(this);
  }


  async getArticles (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        id,
        user_id,
        title,
        description,
        created_at,
        updated_at,
        category
      FROM 
        articles
      ORDER BY 
        created_at DESC
      LIMIT ? OFFSET ?;
    `;

    try {
      const [results] = await this.pool.query(query, [limit, offset]);
      res.status(200).json({
        status:'success',
        message: 'Articles fetched successfully',
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

  async postArticle (req, res) {
    const { user_id, title, description, category } = req.body;
    // const user_id = req.user.id;

    const query = `
      INSERT INTO articles (user_id, title, description, category)
      VALUES (?, ?, ?, ?);
    `;

    try {
      const [result] = await this.pool.query(query, [user_id, title, description, category]);
      res.status(200).json({ 
        status: "success",
        message: 'Article created successfully',
        data: {
          id: user_id,
          title: title,
          description: description,
          category: category
        }
      });
    } catch (error) {
      console.error('Error posting article:', error);
      res.status(500).json({ 
        status: "error",
        message: error.message 
      });
    }
  }

  async updateArticle (req, res) {
    const { id } = req.params;
    const { title, description, category } = req.body;

    const query = `
      UPDATE articles
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;

    try {
      const [result] = await this.pool.query(query, [title, description, category, id]);
      if (result.affectedRows > 0) {
        res.status(201).json({ 
          status: "success",
          message: 'Article updated successfully',
          data: {
            id: id,
            title: result.title,
            description: result.description,
            category: result.category,
            updated_at: result.updated_at,
            created_at: result.created_at,
          }
        });
      } else {
        res.status(404).json({ 
          status: "error",
          message: 'Article not found' });
      }
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({
        status: "error",
        message: error.message });
    }
  }

  async deleteArticle (req, res) {
    const id = parseInt(req.params.id);

    const query = `
      DELETE FROM articles
      WHERE id = ?;
    `;

    try {
      const [result] = await this.pool.query(query, [id]);
      if (result.affectedRows > 0) {
        res.status(200).json({ 
          status: "success",
          message: 'Article deleted successfully',
          data: {
            id: id,
            // result: result,
          }
        });
      } else {
        res.status(404).json({ 
          status: "error",
          error: 'Article not found' });
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ 
        status: "error",
        message: error.message });
    }
  }
}

export default ArticleService;
