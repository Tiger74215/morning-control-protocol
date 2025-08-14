const assert = require('assert');
const { countTokens } = require('./utils/tokenizer');

function runExamples() {
  const examples = [
    { text: 'Hello, world!', expected: 4 },
    { text: 'The quick brown fox jumps over the lazy dog.', expected: 11 }
  ];

  examples.forEach(({ text, expected }) => {
    const count = countTokens(text);
    console.log(`"${text}" -> ${count} tokens`);
    if (typeof expected === 'number') {
      assert.strictEqual(count, expected, `Token count mismatch for: ${text}`);
    }
  });
}

runExamples();
