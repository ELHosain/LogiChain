const { MongoClient } = require('mongodb');
class Database {
  constructor() { this.client = null; this.db = null; }
  async connect() {
    if (this.db) return this.db;
    this.client = new MongoClient(process.env.MONGODB_URI);
    await this.client.connect();
    this.db = this.client.db(process.env.DB_NAME);
    await this._createIndexes();
    console.log(`✅ MongoDB connecté : ${process.env.DB_NAME}`);
    return this.db;
  }
  async _createIndexes() {
    await this.db.collection('items').createIndex({ location: '2dsphere' });
    await this.db.collection('items').createIndex({ eventId: 1, status: 1 });
    await this.db.collection('items').createIndex(
      { assignedZone: 1 },
      { partialFilterExpression: { status: { $in: ['stocké','en_transit','livré','en_maintenance'] } } }
    );
    await this.db.collection('events').createIndex({ startDate: 1 });
    await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('📌 Index créés');
  }
  async disconnect() { if (this.client) await this.client.close(); }
  getDb() { if (!this.db) throw new Error('Non connecté'); return this.db; }
}
module.exports = new Database();
