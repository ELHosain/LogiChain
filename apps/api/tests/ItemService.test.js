const { ObjectId } = require('mongodb');
const ItemService = require('../src/services/ItemService');

function createFakeItemRepository(initialItems = []) {
  const items = [...initialItems];
  let nextId = 1;
  return {
    async create(doc) {
      const _id = String(nextId++);
      items.push({ _id, ...doc });
      return _id;
    },
    async findByEvent(eventId, filter = {}) {
      return items.filter((i) => {
        const matchesEvent = String(i.eventId) === String(eventId);
        const matchesStatus = filter.status ? i.status === filter.status : true;
        return matchesEvent && matchesStatus;
      });
    },
    async findById(id) {
      return items.find((i) => i._id === id) || null;
    },
    async updateWithOptimisticLock(id, version, changes) {
      const item = items.find((i) => i._id === id);
      if (!item) throw new Error('Item introuvable');
      Object.assign(item, changes);
      return { modifiedCount: 1 };
    },
    async deleteById(id) {
      const idx = items.findIndex((i) => i._id === id);
      if (idx === -1) return { deletedCount: 0 };
      items.splice(idx, 1);
      return { deletedCount: 1 };
    },
    async getCarbonAggregation() {
      return [{ _id: 'scene', totalCarbon: 12.5 }];
    },
    async getStockSummary() {
      return [
        { _id: 'stocké', count: 3 },
        { _id: 'en_transit', count: 2 },
      ];
    },
    _items: items,
  };
}

describe('ItemService', () => {
  const eventId = new ObjectId().toString();

  describe('createItem', () => {
    test('creates a valid item', async () => {
      const repo = createFakeItemRepository();
      const service = new ItemService(repo);

      const result = await service.createItem({
        name: 'Enceinte JBL',
        category: 'son',
        eventId,
      });

      expect(result.name).toBe('Enceinte JBL');
      expect(result.status).toBe('stocké');
    });

    test('rejects an item with an invalid category', async () => {
      const repo = createFakeItemRepository();
      const service = new ItemService(repo);

      await expect(
        service.createItem({ name: 'Truc', category: 'inconnue', eventId })
      ).rejects.toThrow(/Catégorie invalide/);
    });

    test('rejects an item without a name', async () => {
      const repo = createFakeItemRepository();
      const service = new ItemService(repo);

      await expect(
        service.createItem({ name: '', category: 'son', eventId })
      ).rejects.toThrow('Le nom est obligatoire');
    });
  });

  describe('getItemsByEvent', () => {
    test('returns only items for the given event', async () => {
      const otherEventId = new ObjectId().toString();
      const repo = createFakeItemRepository([
        { _id: '1', name: 'A', eventId, status: 'stocké' },
        { _id: '2', name: 'B', eventId: otherEventId, status: 'stocké' },
      ]);
      const service = new ItemService(repo);

      const result = await service.getItemsByEvent(eventId);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('A');
    });

    test('filters by status when provided', async () => {
      const repo = createFakeItemRepository([
        { _id: '1', name: 'A', eventId, status: 'stocké' },
        { _id: '2', name: 'B', eventId, status: 'en_transit' },
      ]);
      const service = new ItemService(repo);

      const result = await service.getItemsByEvent(eventId, 'en_transit');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('B');
    });
  });

  describe('scanItem', () => {
    test('updates the item status when valid', async () => {
      const repo = createFakeItemRepository([
        { _id: '1', name: 'A', eventId, status: 'stocké', version: 1 },
      ]);
      const service = new ItemService(repo);

      await service.scanItem('1', 'agent-42', 'en_transit', 1);
      const item = await service.getItemById('1');
      expect(item.status).toBe('en_transit');
    });

    test('rejects an invalid status', async () => {
      const repo = createFakeItemRepository([
        { _id: '1', name: 'A', eventId, status: 'stocké', version: 1 },
      ]);
      const service = new ItemService(repo);

      await expect(service.scanItem('1', 'agent-42', 'statut_invalide', 1)).rejects.toThrow(
        /Statut invalide/
      );
    });
  });

  describe('getDashboardKpi', () => {
    test('aggregates carbon and stock data', async () => {
      const repo = createFakeItemRepository();
      const service = new ItemService(repo);

      const kpi = await service.getDashboardKpi(eventId);
      expect(kpi.totalCarbon).toBe(12.5);
      expect(kpi.totalItems).toBe(5);
      expect(kpi.bottleneck).toBe(2);
    });
  });

  describe('deleteItem', () => {
    test('deletes an existing item', async () => {
      const repo = createFakeItemRepository([{ _id: '1', name: 'A', eventId }]);
      const service = new ItemService(repo);

      const result = await service.deleteItem('1');
      expect(result.deleted).toBe(true);
    });

    test('throws when deleting a non-existent item', async () => {
      const repo = createFakeItemRepository();
      const service = new ItemService(repo);

      await expect(service.deleteItem('unknown')).rejects.toThrow('Item introuvable');
    });
  });
});
