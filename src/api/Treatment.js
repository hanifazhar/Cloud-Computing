class Treatment {
  constructor(options) {
    this.pool = options.db.pool;
    this.getTreatment = options.getTreatment;
    this.getTreatmentHandler = this.getTreatmentHandler.bind(this);
  }

  async getTreatmentHandler(req, res) {
    try {
      // HEALTHY, ANTHRACNOSE, MOZAIC, DOTTED, TRIPS
      const treatment_id = req.params.id;
      console.log(treatment_id);
      const [results] = await this.getTreatment(treatment_id)
      console.log(results);
      // const [results] = await this.pool.query(query, [treatment_id]);
      if (results.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Treatment not found for ID: ' + treatment_id,
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Treatment successfully fetched for id: ' + treatment_id,
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

export default Treatment;
