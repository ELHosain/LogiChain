const User = require('../src/entities/User');

describe('User entity — validation', () => {
  const validData = {
    name: 'Jean Dupont',
    email: 'jean@logichain.fr',
    password: 'password123',
    role: 'agent',
  };

  test('creates a valid user and lowercases the email', () => {
    const user = new User(validData);
    expect(user.name).toBe('Jean Dupont');
    expect(user.email).toBe('jean@logichain.fr');
    expect(user.role).toBe('agent');
  });

  test('rejects an empty name', () => {
    expect(() => new User({ ...validData, name: '' })).toThrow('Nom obligatoire');
  });

  test('rejects an invalid email', () => {
    expect(() => new User({ ...validData, email: 'not-an-email' })).toThrow('Email invalide');
  });

  test('rejects a password shorter than 6 characters', () => {
    expect(() => new User({ ...validData, password: '123' })).toThrow('Mot de passe trop court');
  });

  test('rejects an unknown role', () => {
    expect(() => new User({ ...validData, role: 'superadmin' })).toThrow(/Rôle invalide/);
  });

  test('hashPassword replaces the plaintext password with a bcrypt hash', async () => {
    const user = new User(validData);
    const plain = user.password;
    await user.hashPassword();
    expect(user.password).not.toBe(plain);
    expect(user.password.length).toBeGreaterThan(20);
  });

  test('toDocument exposes only the expected fields', () => {
    const user = new User(validData);
    const doc = user.toDocument();
    expect(Object.keys(doc).sort()).toEqual(
      ['createdAt', 'email', 'name', 'password', 'role'].sort()
    );
  });
});
