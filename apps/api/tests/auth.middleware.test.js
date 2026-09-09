const jwt = require('jsonwebtoken');
const { authMiddleware, requireRole } = require('../src/middlewares/auth');

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret';
  });

  test('rejects a request with no Authorization header', () => {
    const req = { headers: {} };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token manquant' });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a request with a malformed Authorization header', () => {
    const req = { headers: { authorization: 'NotBearer abc123' } };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a request with an invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.here' } };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token invalide ou expiré' });
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a request with a valid token and attaches req.user', () => {
    const token = jwt.sign({ id: '1', role: 'admin' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: '1', role: 'admin' });
  });

  test('rejects an expired token', () => {
    const token = jwt.sign({ id: '1', role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: -10, // already expired
    });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  test('allows a user with an authorized role', () => {
    const req = { user: { role: 'admin' } };
    const res = createMockRes();
    const next = jest.fn();

    requireRole('admin', 'responsable')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rejects a user with an unauthorized role', () => {
    const req = { user: { role: 'agent' } };
    const res = createMockRes();
    const next = jest.fn();

    requireRole('admin', 'responsable')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Accès refusé' });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects when req.user is missing', () => {
    const req = {};
    const res = createMockRes();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
