# Morning Control Protocol

## Generating self-signed certificates

For local development, you may need HTTPS certificates.

1. Create a directory for certificates:
   ```bash
   mkdir -p backend/certs
   ```
2. Generate a new self-signed certificate and private key:
   ```bash
   openssl req -x509 -nodes -newkey rsa:2048 -keyout backend/certs/server.key -out backend/certs/server.crt -days 365 -subj "/CN=localhost"
   ```
3. Use `backend/certs/server.crt` and `backend/certs/server.key` for local HTTPS servers. **Do not commit these files**; they are ignored via `.gitignore`.

