const VALID_TOKEN = 'test-token';

function withAuth(handler) {
  return (req, res) => {
    const auth = req.headers['authorization'];
    if (!auth || auth !== `Bearer ${VALID_TOKEN}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    return handler(req, res);
  };
}

module.exports = { withAuth, VALID_TOKEN };
