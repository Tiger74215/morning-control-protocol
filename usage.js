const { init, insertMessage } = require('./db');

async function run() {
  try {
    await init();
    const id = await insertMessage('hello from usage');
    console.log('Inserted row with id:', id);
  } catch (err) {
    console.error('Database error:', err);
  }
}

run();
