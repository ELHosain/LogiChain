const { ObjectId } = require('mongodb');
class ItemRepository {
  constructor(db) { this.collection = db.collection('items'); }
  async findById(id) { return this.collection.findOne({ _id: new ObjectId(id) }); }
  async findByEvent(eventId, filters = {}) { return this.collection.find({ eventId: new ObjectId(eventId), ...filters }).toArray(); }
  async create(doc) { const r = await this.collection.insertOne(doc); return r.insertedId; }
  async updateWithOptimisticLock(id, ver, updateData) {
    const r = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), version: ver },
      { $set: { status: updateData.status, updatedAt: new Date(), version: ver+1 }, $push: { history: updateData.historyEntry } },
      { returnDocument: 'after' }
    );
    if (!r) throw new Error('Conflit de version détecté');
    return r;
  }
  async getCarbonAggregation(eventId) { return this.collection.aggregate([{ $match:{ eventId:new ObjectId(eventId) } },{ $group:{ _id:'$category', totalCarbon:{ $sum:'$carbonKg' }, count:{ $sum:1 } } },{ $sort:{ totalCarbon:-1 } }]).toArray(); }
    // Total carbon + item count grouped by event (all events at once)
    async getCarbonByAllEvents() { return this.collection.aggregate([{ $group:{ _id:'$eventId', totalCarbon:{ $sum:'$carbonKg' }, itemCount:{ $sum:1 } } }]).toArray(); }
  async getStockSummary(eventId) { return this.collection.aggregate([{ $match:{ eventId:new ObjectId(eventId) } },{ $group:{ _id:'$status', count:{ $sum:1 } } }]).toArray(); }
  async deleteById(id) { return this.collection.deleteOne({ _id: new ObjectId(id) }); }
}
module.exports = ItemRepository;
