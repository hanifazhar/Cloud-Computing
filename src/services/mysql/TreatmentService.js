class TreatmentService {
  constructor({ db }) {
    this.pool = db.pool;
  }

  async getTreatments(req, res) {
    const query = `
      SELECT 
        id AS treatment_id,
        disease,
        description AS treatment_description,
        created_at AS treatment_created_at
      FROM 
        treatments
      WHERE 
        disease = ?;  -- Filter by specific treatment_id
    `;

    try {
      // HEALTHY, ANTHRACNOSE, MOZAIC, DOTTED, TRIPS
      const { disease } = req.body; 
      const [results] = await this.pool.query(query, [disease]);
      if (results.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Treatment not found for ID ' + id,
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Treatment successfully fetched for ' + disease,
        data: {
          treatments: results
        }
      });
    } catch (error) {
      console.error('Error fetching treatments:', error);
      return res.status(500).json({ 
        status: 'error',
        message: error.message });
    }
  }
}

export default TreatmentService;
