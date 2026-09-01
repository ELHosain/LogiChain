const { ObjectId } = require('mongodb');
class AnomalyRepository {
  constructor(db) { this.collection = db.collection('anomalies'); }
  async create(doc) { const r = await this.collection.insertOne(doc); return r.insertedId; }
  async findByEvent(eventId) {
    return this.collection.find({ eventId: new ObjectId(eventId) }).sort({ createdAt: -1 }).toArray();
  }
  async findById(id) { return this.collection.findOne({ _id: new ObjectId(id) }); }
  async deleteById(id) { return this.collection.deleteOne({ _id: new ObjectId(id) }); }
  async updateStatus(id, status) {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, resolvedAt: new Date() } },
      { returnDocument: 'after' }
    );
  }
}
module.exports = AnomalyRepository;
