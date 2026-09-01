const VALID_STATUSES = ['stocké','en_transit','livré','en_maintenance','archivé'];
const VALID_CATEGORIES = ['energie','scene','son','lumiere','securite','sanitaire','autre'];
class Item {
  constructor({ name, category, eventId, assignedZone, location, carbonKg = 0 }) {
    this._validate({ name, category, eventId });
    this.name = name; this.category = category; this.eventId = eventId;
    this.assignedZone = assignedZone || null; this.location = location || null;
    this.carbonKg = carbonKg; this.status = 'stocké'; this.history = [];
    this.version = 1; this.createdAt = new Date(); this.updatedAt = new Date();
  }
  _validate({ name, category, eventId }) {
    if (!name || name.trim() === '') throw new Error('Le nom est obligatoire');
    if (!VALID_CATEGORIES.includes(category)) throw new Error(`Catégorie invalide: ${VALID_CATEGORIES.join(', ')}`);
    if (!eventId) throw new Error('eventId obligatoire');
  }
  addHistoryEntry(status, agentId, note = '') {
    if (!VALID_STATUSES.includes(status)) throw new Error(`Statut invalide: ${VALID_STATUSES.join(', ')}`);
    this.history.push({ status, agentId, note, timestamp: new Date() });
    this.status = status; this.version++; this.updatedAt = new Date();
  }
  toDocument() { return { name:this.name, category:this.category, eventId:this.eventId, assignedZone:this.assignedZone, location:this.location, carbonKg:this.carbonKg, status:this.status, history:this.history, version:this.version, createdAt:this.createdAt, updatedAt:this.updatedAt }; }
  static get VALID_STATUSES() { return VALID_STATUSES; }
  static get VALID_CATEGORIES() { return VALID_CATEGORIES; }
}
module.exports = Item;
