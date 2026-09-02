const bcrypt = require('bcryptjs');
const AuthService = require('../src/services/AuthService');

// Fake in-memory repository — no real MongoDB connection needed.
function createFakeUserRepository(initialUsers = []) {
  const users = [...initialUsers];
  let nextId = 1;
  return {
    async findByEmail(email) {
      return users.find((u) => u.email === email.toLowerCase()) || null;
    },
    async create(doc) {
      const _id = String(nextId++);
      users.push({ _id, ...doc });
      return _id;
    },
    _users: users,
  };
}

describe('AuthService', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  describe('register', () => {
    test('creates a new user when the email is not already used', async () => {
      const repo = createFakeUserRepository();
      const authService = new AuthService(repo);

      const result = await authService.register({
        name: 'Sophie Martin',
        email: 'Sophie@LogiChain.fr',
        password: 'password123',
        role: 'responsable',
      });

      expect(result.email).toBe('sophie@logichain.fr');
      expect(result.name).toBe('Sophie Martin');
      expect(result.role).toBe('responsable');
      expect(result).not.toHaveProperty('password');
    });

    test('rejects registration when the email is already used', async () => {
      const repo = createFakeUserRepository([
        { _id: '1', email: 'sophie@logichain.fr', password: 'hashed', role: 'agent' },
      ]);
      const authService = new AuthService(repo);

      await expect(
        authService.register({
          name: 'Sophie Duplicate',
          email: 'sophie@logichain.fr',
          password: 'password123',
          role: 'agent',
        })
      ).rejects.toThrow('Email déjà utilisé');
    });
  });

  describe('login', () => {
    test('returns a valid JWT and user info on correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 4);
      const repo = createFakeUserRepository([
        {
          _id: '42',
          name: 'Marc Agent',
          email: 'marc@logichain.fr',
          password: hashedPassword,
          role: 'agent',
        },
      ]);
      const authService = new AuthService(repo);

      const result = await authService.login('marc@logichain.fr', 'password123');

      expect(result.token).toEqual(expect.any(String));
      expect(result.user).toMatchObject({
        id: '42',
        name: 'Marc Agent',
        email: 'marc@logichain.fr',
        role: 'agent',
      });
    });

    test('rejects login for an unknown email', async () => {
      const repo = createFakeUserRepository();
      const authService = new AuthService(repo);

      await expect(authService.login('ghost@logichain.fr', 'whatever')).rejects.toThrow(
        'Identifiants invalides'
      );
    });

    test('rejects login for a wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 4);
      const repo = createFakeUserRepository([
        { _id: '1', name: 'Marc', email: 'marc@logichain.fr', password: hashedPassword, role: 'agent' },
      ]);
      const authService = new AuthService(repo);

      await expect(authService.login('marc@logichain.fr', 'wrong-password')).rejects.toThrow(
        'Identifiants invalides'
      );
    });
  });
});
