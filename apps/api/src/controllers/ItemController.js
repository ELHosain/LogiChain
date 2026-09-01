class ItemController {
  constructor(itemService) { this.itemService = itemService; }
  async getByEvent(req,res) { try { const items = await this.itemService.getItemsByEvent(req.params.eventId, req.query.status); return res.status(200).json({ success:true, data:items, count:items.length }); } catch(e) { return res.status(500).json({ error:e.message }); } }
  async getById(req,res) { try { const item = await this.itemService.getItemById(req.params.itemId); return res.status(200).json({ success:true, data:item }); } catch(e) { return res.status(404).json({ error:e.message }); } }
  async create(req,res) { try { const item = await this.itemService.createItem({ ...req.body, eventId:req.params.eventId }); return res.status(201).json({ success:true, data:item }); } catch(e) { return res.status(422).json({ error:e.message }); } }
  async scan(req,res) {
    try {
      const { status, version } = req.body;
      if (!status || version===undefined) return res.status(400).json({ error:'status et version requis' });
      const updated = await this.itemService.scanItem(req.params.itemId, req.user.id, status, version);
      return res.status(200).json({ success:true, data:updated });
    } catch(e) { return res.status(e.message.includes('Conflit') ? 409 : 400).json({ error:e.message }); }
  }
  async dashboard(req,res) { try { const kpi = await this.itemService.getDashboardKpi(req.params.eventId); return res.status(200).json({ success:true, data:kpi }); } catch(e) { return res.status(500).json({ error:e.message }); } }
  async delete(req,res) { try { await this.itemService.deleteItem(req.params.itemId); return res.status(200).json({ success:true, message:'Item supprimé' }); } catch(e) { return res.status(404).json({ error:e.message }); } }
}
module.exports = ItemController;
