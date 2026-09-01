require('dotenv').config();
const express  = require('express');
const path     = require('path');
const database = require('./config/database');
const createRouter = require('./routes');
const ItemRepository     = require('./repositories/ItemRepository');
const EventRepository    = require('./repositories/EventRepository');
const UserRepository     = require('./repositories/UserRepository');
const AnomalyRepository  = require('./repositories/AnomalyRepository');
const ItemService     = require('./services/ItemService');
const EventService    = require('./services/EventService');
const AuthService     = require('./services/AuthService');
const AnomalyService  = require('./services/AnomalyService');
const ItemController     = require('./controllers/ItemController');
const EventController    = require('./controllers/EventController');
const AuthController     = require('./controllers/AuthController');
const AnomalyController  = require('./controllers/AnomalyController');

const sseClients = [];
const recentAlerts = {};

async function bootstrap() {
  const db = await database.connect();
  const itemRepo     = new ItemRepository(db);
  const eventRepo    = new EventRepository(db);
  const userRepo     = new UserRepository(db);
  const anomalyRepo  = new AnomalyRepository(db);
  const itemService     = new ItemService(itemRepo);
  const eventService    = new EventService(eventRepo, itemRepo);
  const authService     = new AuthService(userRepo);
  const anomalyService  = new AnomalyService(anomalyRepo);
  const itemController     = new ItemController(itemService);
  const eventController    = new EventController(eventService);
  const authController     = new AuthController(authService);
  const anomalyController  = new AnomalyController(anomalyService);

  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/health', (req, res) => res.json({ status: 'ok', app: 'LogiChain', version: '2.0.0' }));

  // SSE
  app.get('/api/v1/events/:eventId/alerts', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('retry: 3000\n\n');
    res.write('data: {"type":"connected","message":"SSE connecté"}\n\n');
    if (res.flush) res.flush();
    const client = { id: Date.now(), eventId: req.params.eventId, res };
    sseClients.push(client);
    console.log(`📡 SSE client connecté (${sseClients.length} actif(s))`);
    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n'); if (res.flush) res.flush(); }
      catch (e) { clearInterval(heartbeat); }
    }, 15000);
    req.on('close', () => {
      clearInterval(heartbeat);
      const idx = sseClients.indexOf(client);
      if (idx > -1) sseClients.splice(idx, 1);
      console.log(`📡 SSE client déconnecté (${sseClients.length} actif(s))`);
    });
  });

  // Polling fallback
  app.get('/api/v1/events/:eventId/alerts-poll', (req, res) => {
    const alerts = recentAlerts[req.params.eventId] || [];
    const since = req.query.since ? parseFloat(req.query.since) : 0;
    res.json({ success: true, data: alerts.filter(a => a.id > since), serverTime: Date.now() });
  });

  // Broadcast
  app.locals.broadcast = (eventId, data) => {
    const enriched = { ...data, id: Date.now() + Math.random() };
    const payload = `data: ${JSON.stringify(enriched)}\n\n`;
    sseClients.filter(c => c.eventId === eventId).forEach(c => {
      try { c.res.write(payload); if (c.res.flush) c.res.flush(); } catch {}
    });
    if (!recentAlerts[eventId]) recentAlerts[eventId] = [];
    recentAlerts[eventId].unshift(enriched);
    recentAlerts[eventId] = recentAlerts[eventId].slice(0, 50);
  };

  app.use('/api/v1', createRouter({
    authController, eventController, itemController, anomalyController,
    itemService, broadcast: app.locals.broadcast,
  }));

  app.use((req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Route introuvable' });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Erreur serveur interne' }); });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 LogiChain API v2.0`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   SSE: /api/v1/events/:id/alerts`);
    console.log(`   Android emu: http://10.0.2.2:${PORT}/api/v1\n`);
  });
}
bootstrap().catch(e => { console.error('❌', e); process.exit(1); });
