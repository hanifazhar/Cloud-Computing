class TreatmentService {
  constructor({ pool }) {
    this.pool = pool;
  }

  async getTreatment(treatment_id) {
    const query = `
      SELECT 
        id,
        treatment_id,
        disease,
        description,
        created_at
      FROM 
        treatments
      WHERE 
        treatment_id = ?;  -- Filter by specific treatment_id
    `;

    try {
      const [results] = await this.pool.query(query, [treatment_id]);
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

export default TreatmentService;
