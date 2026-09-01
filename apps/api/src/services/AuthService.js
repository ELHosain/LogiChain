const jwt = require('jsonwebtoken');
const User = require('../entities/User');
const bcrypt = require('bcryptjs');
class AuthService {
  constructor(userRepository) { this.userRepository = userRepository; }
  async register(data) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new Error('Email déjà utilisé');
    const user = new User(data); await user.hashPassword();
    const id = await this.userRepository.create(user.toDocument());
    return { _id:id, name:user.name, email:user.email, role:user.role };
  }
  async login(email, password) {
    const doc = await this.userRepository.findByEmail(email);
    if (!doc) throw new Error('Identifiants invalides');
    const valid = await bcrypt.compare(password, doc.password);
    if (!valid) throw new Error('Identifiants invalides');
    const token = jwt.sign({ id:doc._id, role:doc.role, name:doc.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
    return { token, user: { id:doc._id, name:doc.name, email:doc.email, role:doc.role } };
  }
}
module.exports = AuthService;
