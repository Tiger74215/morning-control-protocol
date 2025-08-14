const { encode } = require('gpt-tokenizer');

function countTokens(input) {
  if (Array.isArray(input)) {
    return input.reduce((sum, item) => sum + countTokens(item), 0);
  }
  if (typeof input !== 'string') {
    input = String(input);
  }
  const tokens = encode(input);
  return tokens.length;
}

module.exports = { countTokens };
