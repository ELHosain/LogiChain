const Event = require('../entities/Event');
class EventService {
  constructor(eventRepository, itemRepository) { this.eventRepository = eventRepository; this.itemRepository = itemRepository; }
  async createEvent(data) { const ev = new Event(data); const id = await this.eventRepository.create(ev.toDocument()); return { _id:id, ...ev.toDocument() }; }
  async getAllEvents() {
    const events = await this.eventRepository.findAll();
    // Enrich each event with the REAL total carbon + item count computed from its items
    let carbonMap = {};
    if (this.itemRepository?.getCarbonByAllEvents) {
      try {
        const agg = await this.itemRepository.getCarbonByAllEvents();
        agg.forEach(a => { carbonMap[String(a._id)] = { totalCarbon: a.totalCarbon || 0, itemCount: a.itemCount || 0 }; });
      } catch {}
    }
    return events.map(ev => {
      const stats = carbonMap[String(ev._id)] || { totalCarbon: 0, itemCount: 0 };
      return { ...ev, carbonFootprint: stats.totalCarbon, itemCount: stats.itemCount };
    });
  }
  async getEventById(id) { const ev = await this.eventRepository.findById(id); if (!ev) throw new Error('Événement introuvable'); return ev; }
  async updateEvent(id, data) { await this.getEventById(id); return this.eventRepository.update(id, data); }
  async deleteEvent(id) { await this.getEventById(id); await this.eventRepository.deleteById(id); return { deleted:true }; }
}
module.exports = EventService;