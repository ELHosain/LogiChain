const { ObjectId } = require('mongodb');
const AnomalyService = require('../src/services/AnomalyService');

function createFakeAnomalyRepository(initialAnomalies = []) {
  const anomalies = [...initialAnomalies];
  let nextId = 1;
  return {
    async create(doc) {
      const _id = String(nextId++);
      anomalies.push({ _id, ...doc });
      return _id;
    },
    async findByEvent(eventId) {
      return anomalies.filter((a) => String(a.eventId) === String(eventId));
    },
    async updateStatus(id, status) {
      const anomaly = anomalies.find((a) => a._id === id);
      if (anomaly) anomaly.status = status;
      return { modifiedCount: anomaly ? 1 : 0 };
    },
    async deleteById(id) {
      const idx = anomalies.findIndex((a) => a._id === id);
      if (idx === -1) return { deletedCount: 0 };
      anomalies.splice(idx, 1);
      return { deletedCount: 1 };
    },
    _anomalies: anomalies,
  };
}

describe('AnomalyService', () => {
  const eventId = new ObjectId().toString();

  describe('createAnomaly', () => {
    test('creates a valid anomaly with status "ouverte"', async () => {
      const repo = createFakeAnomalyRepository();
      const service = new AnomalyService(repo);

      const result = await service.createAnomaly({
        eventId,
        description: 'Câble endommagé sur la scène principale',
        agentId: 'agent-1',
        agentName: 'Marc',
      });

      expect(result.description).toBe('Câble endommagé sur la scène principale');
      expect(result.status).toBe('ouverte');
      expect(result._id).toBeDefined();
    });

    test('trims the description', async () => {
      const repo = createFakeAnomalyRepository();
      const service = new AnomalyService(repo);

      const result = await service.createAnomaly({
        eventId,
        description: '   Fuite d\'eau   ',
        agentId: 'agent-1',
        agentName: 'Marc',
      });

      expect(result.description).toBe("Fuite d'eau");
    });

    test('rejects an anomaly without a description', async () => {
      const repo = createFakeAnomalyRepository();
      const service = new AnomalyService(repo);

      await expect(
        service.createAnomaly({ eventId, description: '', agentId: 'agent-1', agentName: 'Marc' })
      ).rejects.toThrow('Description obligatoire');
    });

    test('rejects an anomaly with a whitespace-only description', async () => {
      const repo = createFakeAnomalyRepository();
      const service = new AnomalyService(repo);

      await expect(
        service.createAnomaly({ eventId, description: '   ', agentId: 'agent-1', agentName: 'Marc' })
      ).rejects.toThrow('Description obligatoire');
    });
  });

  describe('getByEvent', () => {
    test('returns only anomalies for the given event', async () => {
      const otherEventId = new ObjectId().toString();
      const repo = createFakeAnomalyRepository([
        { _id: '1', eventId, description: 'A' },
        { _id: '2', eventId: otherEventId, description: 'B' },
      ]);
      const service = new AnomalyService(repo);

      const result = await service.getByEvent(eventId);
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('A');
    });
  });

  describe('resolveAnomaly', () => {
    test('marks an anomaly as resolved', async () => {
      const repo = createFakeAnomalyRepository([
        { _id: '1', eventId, description: 'A', status: 'ouverte' },
      ]);
      const service = new AnomalyService(repo);

      await service.resolveAnomaly('1');
      expect(repo._anomalies[0].status).toBe('resolue');
    });
  });

  describe('deleteAnomaly', () => {
    test('deletes an existing anomaly', async () => {
      const repo = createFakeAnomalyRepository([{ _id: '1', eventId, description: 'A' }]);
      const service = new AnomalyService(repo);

      const result = await service.deleteAnomaly('1');
      expect(result.deletedCount).toBe(1);
    });
  });
});
