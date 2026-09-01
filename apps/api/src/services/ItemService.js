const Item = require('../entities/Item');
const { ObjectId } = require('mongodb');

class ItemService {
  constructor(itemRepository) { this.itemRepository = itemRepository; }

  async createItem(data) {
    if (data.eventId && typeof data.eventId === 'string') {
      data.eventId = new ObjectId(data.eventId);
    }
    const item = new Item(data);
    const id = await this.itemRepository.create(item.toDocument());
    return { _id: id, ...item.toDocument() };
  }

  async getItemsByEvent(eventId, status = null) {
    return this.itemRepository.findByEvent(eventId, status ? { status } : {});
  }

  async getItemById(id) {
    const item = await this.itemRepository.findById(id);
    if (!item) throw new Error('Item introuvable');
    return item;
  }

  async scanItem(itemId, agentId, newStatus, version) {
    if (!Item.VALID_STATUSES.includes(newStatus))
      throw new Error(`Statut invalide. Valeurs: ${Item.VALID_STATUSES.join(', ')}`);
    return this.itemRepository.updateWithOptimisticLock(itemId, version, {
      status: newStatus,
      historyEntry: { status: newStatus, agentId, timestamp: new Date(), note: 'Scan validé' }
    });
  }

  async getDashboardKpi(eventId) {
    const [carbonData, stockSummary] = await Promise.all([
      this.itemRepository.getCarbonAggregation(eventId),
      this.itemRepository.getStockSummary(eventId)
    ]);
    const totalCarbon = carbonData.reduce((s, c) => s + c.totalCarbon, 0);
    const totalItems = stockSummary.reduce((s, x) => s + x.count, 0);
    const bottleneck = stockSummary.find(s => s._id === 'en_transit');
    return {
      totalCarbon: Math.round(totalCarbon * 100) / 100,
      carbonByCategory: carbonData, stock: stockSummary, totalItems,
      bottleneck: bottleneck ? bottleneck.count : 0
    };
  }

  async deleteItem(id) {
    const r = await this.itemRepository.deleteById(id);
    if (r.deletedCount === 0) throw new Error('Item introuvable');
    return { deleted: true };
  }
}
module.exports = ItemService;
