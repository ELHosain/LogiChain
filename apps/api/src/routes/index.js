const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/auth');

function createRouter({ authController, eventController, itemController, anomalyController, itemService, broadcast }) {
  const r = express.Router();

  r.post('/auth/register', (q,s) => authController.register(q,s));
  r.post('/auth/login',    (q,s) => authController.login(q,s));
  r.get('/auth/me', authMiddleware, (q,s) => authController.me(q,s));

  r.get('/events', authMiddleware, (q,s) => eventController.getAll(q,s));
  r.get('/events/:id', authMiddleware, (q,s) => eventController.getById(q,s));
  r.post('/events', authMiddleware, requireRole('admin','responsable'), (q,s) => eventController.create(q,s));
  r.put('/events/:id', authMiddleware, requireRole('admin','responsable'), (q,s) => eventController.update(q,s));
  r.delete('/events/:id', authMiddleware, requireRole('admin','responsable'), (q,s) => eventController.delete(q,s));

  r.get('/events/:eventId/items', authMiddleware, (q,s) => itemController.getByEvent(q,s));
  r.get('/events/:eventId/items/:itemId', authMiddleware, (q,s) => itemController.getById(q,s));
  r.post('/events/:eventId/items', authMiddleware, requireRole('admin','responsable','agent'), (q,s) => itemController.create(q,s));

  r.patch('/events/:eventId/items/:itemId/scan', authMiddleware, async (q, s) => {
    await itemController.scan(q, s);
    if (s.statusCode < 400) {
      let itemName = 'un item';
      try { const item = await itemService.getItemById(q.params.itemId); itemName = item.name; } catch {}
      broadcast(q.params.eventId, {
        type: 'ITEM_SCANNED',
        message: `${q.user.name} a scanné "${itemName}" → ${q.body.status}`,
        itemId: q.params.itemId, itemName, status: q.body.status,
        agent: q.user.name, timestamp: new Date().toISOString(),
      });
    }
  });

  r.delete('/events/:eventId/items/:itemId', authMiddleware, (q,s) => itemController.delete(q,s));
  r.get('/events/:eventId/dashboard', authMiddleware, requireRole('admin','responsable'), (q,s) => itemController.dashboard(q,s));

  r.get('/events/:eventId/anomalies', authMiddleware, (q,s) => anomalyController.getByEvent(q,s));
  r.post('/events/:eventId/anomalies', authMiddleware, async (q, s) => {
    await anomalyController.create(q, s);
    const itemName = q.body.itemName || 'un équipement';
    broadcast(q.params.eventId, {
      type: 'ANOMALY_CREATED',
      message: `${q.user.name} a déclaré une anomalie sur "${itemName}"`,
      description: q.body.description, itemName,
      agent: q.user.name, timestamp: new Date().toISOString(),
    });
  });
  r.patch('/events/:eventId/anomalies/:anomalyId/resolve', authMiddleware, (q,s) => anomalyController.resolve(q,s));
  r.delete('/events/:eventId/anomalies/:anomalyId', authMiddleware, (q,s) => anomalyController.delete(q,s));

  return r;
}
module.exports = createRouter;
