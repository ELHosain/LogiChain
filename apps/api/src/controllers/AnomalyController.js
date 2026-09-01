class AnomalyController {
  constructor(anomalyService) { this.anomalyService = anomalyService; }
  async create(req, res) {
    try {
      const anomaly = await this.anomalyService.createAnomaly({
        ...req.body, eventId: req.params.eventId,
        agentId: req.user.id, agentName: req.user.name,
      });
      return res.status(201).json({ success: true, data: anomaly });
    } catch (e) { return res.status(422).json({ error: e.message }); }
  }
  async getByEvent(req, res) {
    try {
      const anomalies = await this.anomalyService.getByEvent(req.params.eventId);
      return res.status(200).json({ success: true, data: anomalies, count: anomalies.length });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  async resolve(req, res) {
    try {
      const result = await this.anomalyService.resolveAnomaly(req.params.anomalyId);
      return res.status(200).json({ success: true, data: result });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  async delete(req, res) {
    try {
      await this.anomalyService.deleteAnomaly(req.params.anomalyId);
      return res.status(200).json({ success: true, message: 'Anomalie supprimée' });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
}
module.exports = AnomalyController;
