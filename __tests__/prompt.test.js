jest.mock('../lib/model', () => ({
  generate: jest.fn(() => Promise.resolve('mocked response'))
}));

const request = require('supertest');
const express = require('express');
const handler = require('../pages/api/prompt');
const { VALID_TOKEN } = require('../lib/auth');
const db = require('../lib/db');
const model = require('../lib/model');

const app = express();
app.use(express.json());
app.post('/prompt', handler);

describe('auth middleware', () => {
  test('rejects missing token', async () => {
    await request(app).post('/prompt').send({ prompt: 'hi' }).expect(401);
  });

  test('rejects invalid token', async () => {
    await request(app)
      .post('/prompt')
      .set('Authorization', 'Bearer bad')
      .send({ prompt: 'hi' })
      .expect(401);
  });
});

describe('/prompt handler', () => {
  beforeEach(done => {
    db.run('DELETE FROM usage', done);
  });

  test('returns model output and records usage', async () => {
    const res = await request(app)
      .post('/prompt')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ prompt: 'hello' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ output: 'mocked response' });
    expect(model.generate).toHaveBeenCalledWith('hello');

    await new Promise((resolve, reject) => {
      db.get(
        'SELECT prompt, output FROM usage ORDER BY id DESC LIMIT 1',
        (err, row) => {
          if (err) return reject(err);
          expect(row.prompt).toBe('hello');
          expect(row.output).toBe('mocked response');
          resolve();
        }
      );
    });
  });
});
