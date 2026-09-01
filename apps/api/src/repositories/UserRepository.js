const { ObjectId } = require('mongodb');
class UserRepository {
  constructor(db) { this.collection = db.collection('users'); }
  async findByEmail(email) { return this.collection.findOne({ email: email.toLowerCase() }); }
  async findById(id) { return this.collection.findOne({ _id:new ObjectId(id) },{ projection:{ password:0 } }); }
  async create(doc) { const r = await this.collection.insertOne(doc); return r.insertedId; }
}
module.exports = UserRepository;
