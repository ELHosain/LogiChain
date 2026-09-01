const { ObjectId } = require('mongodb');
class AnomalyService {
  constructor(anomalyRepository) { this.anomalyRepository = anomalyRepository; }
  async createAnomaly({ eventId, itemId, itemName, description, location, agentId, agentName }) {
    if (!description || !description.trim()) throw new Error('Description obligatoire');
    const doc = {
      eventId: new ObjectId(eventId),
      itemId: itemId ? new ObjectId(itemId) : null,
      itemName: itemName || null,
      description: description.trim(),
      location: location || null,
      agentId, agentName,
      status: 'ouverte',
      createdAt: new Date(),
    };
    const id = await this.anomalyRepository.create(doc);
    return { _id: id, ...doc };
  }
  async getByEvent(eventId) { return this.anomalyRepository.findByEvent(eventId); }
  async resolveAnomaly(id) { return this.anomalyRepository.updateStatus(id, 'resolue'); }
  async deleteAnomaly(id) { return this.anomalyRepository.deleteById(id); }
}
module.exports = AnomalyService;
