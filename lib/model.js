async function generate(prompt) {
  return `echo: ${prompt}`;
}

module.exports = { generate };
