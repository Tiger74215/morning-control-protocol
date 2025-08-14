require('dotenv').config();

const requiredVars = ['PORT', 'MODEL_PATH', 'LLAMA_BIN', 'JWT_SECRET'];
const missing = requiredVars.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Backend server logic goes here.
