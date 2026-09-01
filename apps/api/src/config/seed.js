require('dotenv').config();
const database = require('./database');
const bcrypt = require('bcryptjs');
async function seed() {
  const db = await database.connect();
  console.log('🌱 Seeding...');
  await db.collection('users').deleteMany({});
  await db.collection('events').deleteMany({});
  await db.collection('items').deleteMany({});
  const hash = await bcrypt.hash('password123', 12);
  const { insertedIds: uids } = await db.collection('users').insertMany([
    { name:'Admin LogiChain', email:'admin@logichain.fr', password:hash, role:'admin', createdAt:new Date() },
    { name:'Sophie Martin', email:'sophie@logichain.fr', password:hash, role:'responsable', createdAt:new Date() },
    { name:'Marc Dupont', email:'marc@logichain.fr', password:hash, role:'agent', createdAt:new Date() },
  ]);
  const { insertedId: eid } = await db.collection('events').insertOne({
    name:'Festival EcoSound 2025', startDate:new Date('2025-07-15'), endDate:new Date('2025-07-18'),
    zones:[
      { zoneId:'z1', name:'Scène Principale', location:{ type:'Polygon', coordinates:[[[2.30,48.80],[2.31,48.80],[2.31,48.81],[2.30,48.81],[2.30,48.80]]] } },
      { zoneId:'z2', name:'Zone Restauration', location:{ type:'Polygon', coordinates:[[[2.32,48.80],[2.33,48.80],[2.33,48.81],[2.32,48.81],[2.32,48.80]]] } },
    ],
    carbonFootprint:0, createdAt:new Date(), updatedAt:new Date()
  });
  await db.collection('items').insertMany([
    { name:'Groupe électrogène 50kW', category:'energie', eventId:eid, assignedZone:'z1', location:{type:'Point',coordinates:[2.305,48.805]}, carbonKg:120.5, status:'stocké', history:[], version:1, createdAt:new Date(), updatedAt:new Date() },
    { name:'Console son Yamaha CL5', category:'son', eventId:eid, assignedZone:'z1', location:{type:'Point',coordinates:[2.306,48.806]}, carbonKg:15.2, status:'en_transit', history:[{status:'stocké',agentId:uids[2],timestamp:new Date(),note:'Chargé entrepôt'}], version:2, createdAt:new Date(), updatedAt:new Date() },
    { name:'Tour éclairage LED x4', category:'lumiere', eventId:eid, assignedZone:'z1', location:{type:'Point',coordinates:[2.307,48.807]}, carbonKg:8.0, status:'livré', history:[], version:1, createdAt:new Date(), updatedAt:new Date() },
    { name:'Barrières sécurité x50', category:'securite', eventId:eid, assignedZone:'z2', location:{type:'Point',coordinates:[2.325,48.805]}, carbonKg:45.0, status:'stocké', history:[], version:1, createdAt:new Date(), updatedAt:new Date() },
  ]);
  console.log('\n🎉 Seeding terminé !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  admin@logichain.fr   / password123');
  console.log('  sophie@logichain.fr  / password123');
  console.log('  marc@logichain.fr    / password123');
  console.log(`  Event ID : ${eid}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await database.disconnect(); process.exit(0);
}
seed().catch(e => { console.error('❌', e); process.exit(1); });
