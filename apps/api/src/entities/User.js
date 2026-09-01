const bcrypt = require('bcryptjs');
const VALID_ROLES = ['admin','responsable','agent','prestataire'];
class User {
  constructor({ name, email, password, role }) {
    this._validate({ name, email, password, role });
    this.name = name; this.email = email.toLowerCase(); this.password = password; this.role = role; this.createdAt = new Date();
  }
  _validate({ name, email, password, role }) {
    if (!name || name.trim() === '') throw new Error('Nom obligatoire');
    if (!email || !email.includes('@')) throw new Error('Email invalide');
    if (!password || password.length < 6) throw new Error('Mot de passe trop court');
    if (!VALID_ROLES.includes(role)) throw new Error(`Rôle invalide: ${VALID_ROLES.join(', ')}`);
  }
  async hashPassword() { this.password = await bcrypt.hash(this.password, 12); }
  async comparePassword(plain) { return bcrypt.compare(plain, this.password); }
  toDocument() { return { name:this.name, email:this.email, password:this.password, role:this.role, createdAt:this.createdAt }; }
}
module.exports = User;
