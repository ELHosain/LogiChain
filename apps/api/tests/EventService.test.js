const EventService = require('../src/services/EventService');

function createFakeEventRepository(initialEvents = []) {
  const events = [...initialEvents];
  let nextId = 1;
  return {
    async create(doc) {
      const _id = String(nextId++);
      events.push({ _id, ...doc });
      return _id;
    },
    async findAll() {
      return events;
    },
    async findById(id) {
      return events.find((e) => e._id === id) || null;
    },
    async update(id, data) {
      const ev = events.find((e) => e._id === id);
      Object.assign(ev, data);
      return { modifiedCount: 1 };
    },
    async deleteById(id) {
      const idx = events.findIndex((e) => e._id === id);
      if (idx !== -1) events.splice(idx, 1);
      return { deletedCount: 1 };
    },
    _events: events,
  };
}

describe('EventService', () => {
  describe('createEvent', () => {
    test('creates a valid event', async () => {
      const repo = createFakeEventRepository();
      const service = new EventService(repo, null);

      const result = await service.createEvent({
        name: 'Festival Été',
        startDate: '2026-07-01',
        endDate: '2026-07-03',
      });

      expect(result.name).toBe('Festival Été');
      expect(result._id).toBeDefined();
    });

    test('rejects an event with startDate after endDate', async () => {
      const repo = createFakeEventRepository();
      const service = new EventService(repo, null);

      await expect(
        service.createEvent({
          name: 'Festival invalide',
          startDate: '2026-07-10',
          endDate: '2026-07-01',
        })
      ).rejects.toThrow('Date début doit être antérieure à la fin');
    });

    test('rejects an event without a name', async () => {
      const repo = createFakeEventRepository();
      const service = new EventService(repo, null);

      await expect(
        service.createEvent({
          name: '',
          startDate: '2026-07-01',
          endDate: '2026-07-03',
        })
      ).rejects.toThrow('Nom obligatoire');
    });
  });

  describe('getEventById', () => {
    test('returns the event when it exists', async () => {
      const repo = createFakeEventRepository([
        { _id: '1', name: 'Concert', startDate: new Date(), endDate: new Date() },
      ]);
      const service = new EventService(repo, null);

      const result = await service.getEventById('1');
      expect(result.name).toBe('Concert');
    });

    test('throws when the event does not exist', async () => {
      const repo = createFakeEventRepository();
      const service = new EventService(repo, null);

      await expect(service.getEventById('unknown')).rejects.toThrow('Événement introuvable');
    });
  });

  describe('updateEvent', () => {
    test('updates an existing event', async () => {
      const repo = createFakeEventRepository([
        { _id: '1', name: 'Ancien nom', startDate: new Date(), endDate: new Date() },
      ]);
      const service = new EventService(repo, null);

      await service.updateEvent('1', { name: 'Nouveau nom' });
      const updated = await service.getEventById('1');
      expect(updated.name).toBe('Nouveau nom');
    });

    test('throws when updating a non-existent event', async () => {
      const repo = createFakeEventRepository();
      const service = new EventService(repo, null);

      await expect(service.updateEvent('unknown', { name: 'X' })).rejects.toThrow(
        'Événement introuvable'
      );
    });
  });

  describe('deleteEvent', () => {
    test('deletes an existing event', async () => {
      const repo = createFakeEventRepository([
        { _id: '1', name: 'À supprimer', startDate: new Date(), endDate: new Date() },
      ]);
      const service = new EventService(repo, null);

      const result = await service.deleteEvent('1');
      expect(result.deleted).toBe(true);
      await expect(service.getEventById('1')).rejects.toThrow('Événement introuvable');
    });

    test('throws when deleting a non-existent event', async () => {
      const repo = createFakeEventRepository();
      const service = new EventService(repo, null);

      await expect(service.deleteEvent('unknown')).rejects.toThrow('Événement introuvable');
    });
  });
});
