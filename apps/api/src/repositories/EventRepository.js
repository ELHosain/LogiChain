const { ObjectId } = require('mongodb');
class EventRepository {
  constructor(db) { this.collection = db.collection('events'); }
  async findAll() { return this.collection.find({}).sort({ startDate:1 }).toArray(); }
  async findById(id) { return this.collection.findOne({ _id: new ObjectId(id) }); }
  async create(doc) { const r = await this.collection.insertOne(doc); return r.insertedId; }
  async update(id, data) { return this.collection.findOneAndUpdate({ _id:new ObjectId(id) },{ $set:{ ...data, updatedAt:new Date() } },{ returnDocument:'after' }); }
  async deleteById(id) { return this.collection.deleteOne({ _id: new ObjectId(id) }); }
}
module.exports = EventRepository;
