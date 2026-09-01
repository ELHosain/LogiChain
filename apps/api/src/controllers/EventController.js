class EventController {
  constructor(eventService) { this.eventService = eventService; }
  async getAll(req,res) { try { const ev = await this.eventService.getAllEvents(); return res.status(200).json({ success:true, data:ev, count:ev.length }); } catch(e) { return res.status(500).json({ error:e.message }); } }
  async getById(req,res) { try { const ev = await this.eventService.getEventById(req.params.id); return res.status(200).json({ success:true, data:ev }); } catch(e) { return res.status(404).json({ error:e.message }); } }
  async create(req,res) { try { const ev = await this.eventService.createEvent(req.body); return res.status(201).json({ success:true, data:ev }); } catch(e) { return res.status(422).json({ error:e.message }); } }
  async update(req,res) { try { const ev = await this.eventService.updateEvent(req.params.id, req.body); return res.status(200).json({ success:true, data:ev }); } catch(e) { return res.status(404).json({ error:e.message }); } }
  async delete(req,res) { try { await this.eventService.deleteEvent(req.params.id); return res.status(200).json({ success:true, message:'Supprimé' }); } catch(e) { return res.status(404).json({ error:e.message }); } }
}
module.exports = EventController;
