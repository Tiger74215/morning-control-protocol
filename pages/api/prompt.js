const db = require('../../lib/db');
const { withAuth } = require('../../lib/auth');
const model = require('../../lib/model');

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { prompt } = req.body;
  const output = await model.generate(prompt);
  db.run('INSERT INTO usage (prompt, output) VALUES (?, ?)', [prompt, output], err => {
    if (err) console.error(err);
  });
  res.status(200).json({ output });
}

module.exports = withAuth(handler);
