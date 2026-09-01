class Event {
  constructor({ name, startDate, endDate, zones = [] }) {
    this._validate({ name, startDate, endDate });
    this.name = name; this.startDate = new Date(startDate); this.endDate = new Date(endDate);
    this.zones = zones; this.carbonFootprint = 0; this.createdAt = new Date(); this.updatedAt = new Date();
  }
  _validate({ name, startDate, endDate }) {
    if (!name || name.trim() === '') throw new Error('Nom obligatoire');
    if (!startDate) throw new Error('Date début obligatoire');
    if (!endDate) throw new Error('Date fin obligatoire');
    if (new Date(startDate) >= new Date(endDate)) throw new Error('Date début doit être antérieure à la fin');
  }
  toDocument() { return { name:this.name, startDate:this.startDate, endDate:this.endDate, zones:this.zones, carbonFootprint:this.carbonFootprint, createdAt:this.createdAt, updatedAt:this.updatedAt }; }
}
module.exports = Event;
