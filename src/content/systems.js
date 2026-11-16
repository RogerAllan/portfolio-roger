/* Dados que não mudam com o idioma: sistemas (posição, estrela, arsenal,
   palavras-chave), trechos de código das anomalias e a stack do resumo.
   tags[i] são as palavras-chave da técnica i de cada sistema. */

export const LANGS = ['pt', 'en', 'es'];

/* pos = [x, z] no plano da galáxia (raio ~0–60). star: cor da estrela; kind: o que a cena desenha no centro. */
export const SYSTEMS = [
  { id: 'frontend', code: 'FE-01', pos: [34, -18], star: 0xb8cbe0, kind: 'prism',
    stack: ['React', 'Vite', 'TypeScript', 'React Router', 'TanStack Query', 'Zustand', 'Recharts', 'Framer Motion', 'Three.js', 'React Three Fiber', 'PixiJS', 'Phaser', 'Expo', 'React Native', 'Electron'],
    tags: [['React.lazy', 'Suspense', 'Vite', 'ErrorBoundary'], ['WebSocket', 'Socket.IO', 'React hooks'], ['TanStack Virtual', 'Performance'], ['Three.js', 'React Three Fiber', 'GLSL', 'WebGL'], ['React Native', 'Expo', 'Kotlin', 'Swift', 'Electron']] },
  { id: 'backend', code: 'BE-02', pos: [12, -38], star: 0x7fd6ff, kind: 'pulsar',
    stack: ['Node.js', 'Express', 'FastAPI', 'Flask', 'Django REST', 'Spring Boot', 'Java 25', 'Pydantic', 'zod', 'Socket.IO', 'WebSocket', 'SSE', 'Celery', 'PM2'],
    tags: [['Node.js', 'Socket.IO', 'Redis pub/sub', 'PM2'], ['WebSocket', 'SSE', 'FastAPI'], ['Streaming', 'asyncio', 'TTL'], ['Consistency'], ['TypeScript', 'Ports & Adapters', 'DI', 'Monorepo'], ['State machine', 'Redis lock'], ['Java 25', 'Spring Boot', 'Spring Modulith', 'OAuth2', 'Testcontainers']] },
  { id: 'automacao', code: 'AU-03', pos: [-26, -30], star: 0xffb547, kind: 'swarm',
    stack: ['Playwright', 'Selenium', 'Puppeteer', 'httpx', 'aiohttp', 'requests', 'APScheduler', 'Celery beat', 'cron', 'ffmpeg', 'yt-dlp'],
    tags: [['Docker healthcheck', 'autoheal'], ['Circuit breaker', 'Backoff'], ['Data integrity', 'pytest'], ['Chaos testing', 'Soak test'], ['Playwright', 'Selenium', 'Headless'], ['Gluetun', 'VPN', 'Rate control']] },
  { id: 'dados', code: 'DA-04', pos: [-42, 4], star: 0xff7b54, kind: 'eye',
    stack: ['PostgreSQL', 'Redis', 'SQLite', 'Kafka', 'RabbitMQ', 'SQLAlchemy', 'asyncpg', 'Alembic', 'Flyway', 'pandas', 'LightGBM', 'scikit-learn', 'statsmodels', 'geopandas', 'shapely', 'pyproj'],
    tags: [['PostgreSQL', 'SKIP LOCKED'], ['PostgreSQL', 'Advisory lock'], ['Idempotency', 'Webhooks'], ['Alembic', 'Flyway', 'SQL'], ['LightGBM', 'Conformal prediction', 'FastAPI', 'MLOps'], ['scikit-learn', 'GroupKFold', 'Data leakage'], ['geopandas', 'shapely', 'pyproj'], ['pandas', 'COPY', 'Data lineage', 'pytest']] },
  { id: 'ia', code: 'AI-05', pos: [-20, 34], star: 0xb48cff, kind: 'crystal',
    stack: ['Claude', 'Gemini', 'DeepSeek', 'OpenAI', 'llama.cpp', 'Ollama', 'faster-whisper', 'Kokoro', 'XTTS', 'edge-tts', 'OpenCV', 'Tesseract', 'PyTorch', 'Diffusers', 'ComfyUI'],
    tags: [['Claude API', 'Tool use', 'RBAC', 'Redis'], ['LLM security', 'Prompt injection'], ['faster-whisper', 'Vision', 'Multimodal'], ['RAG', 'Embeddings', 'NumPy'], ['Prompt caching', 'LLM cost'], ['OCR', 'llama.cpp', 'Local LLM', 'LGPD'], ['GPU', 'PyTorch', 'Diffusers', 'ComfyUI']] },
  { id: 'seguranca', code: 'SE-06', pos: [18, 40], star: 0x3fd1c4, kind: 'shield',
    stack: ['JWT', 'argon2id', 'bcrypt', 'cookies httpOnly', 'CSP', 'helmet', 'slowapi', 'express-rate-limit', 'Flask-Limiter', 'HMAC', 'RBAC'],
    tags: [['JWT', 'Refresh token', 'Session security'], ['2FA', 'Redis', 'argon2id'], ['RBAC', 'IDOR', 'Authorization'], ['HMAC', 'Webhooks'], ['SSRF', 'OWASP'], ['Rate limiting', 'Redis', 'Abuse prevention']] },
  { id: 'infra', code: 'OP-07', pos: [44, 16], star: 0xffd27a, kind: 'neutron',
    stack: ['Docker', 'Docker Compose', 'Podman', 'PM2', 'Nginx', 'Cloudflare Tunnel', 'GitHub Actions', 'GHCR', 'Prometheus', 'Alertmanager', 'Grafana', 'Sentry', 'autoheal', 'Gluetun'],
    tags: [['Cloudflare Tunnel', 'Zero trust', 'SSH'], ['Docker', 'Healthcheck', 'autoheal'], ['Docker Compose', 'cgroups', 'Capacity planning'], ['GitHub Actions', 'GHCR', 'CI/CD'], ['Prometheus', 'Grafana', 'Alertmanager', 'Sentry']] },
  { id: 'incidentes', code: 'IR-00', pos: [0, 0], star: 0xe0242b, kind: 'quarantine' },
  { id: 'sobre', code: 'ME-00', pos: [58, -46], star: 0xffcf8a, kind: 'origin' }
];

/* trecho de código de cada anomalia (igual em todos os idiomas) */
export const BOSS_CODE = [
  "SET LOCAL lock_timeout = '5s';",
  'ALTER TABLE … ALTER COLUMN id TYPE bigint;',
  'ports: []   # banco só na rede interna',
  'kill -USR1 $(pidof dockerd)',
  'init: true',
  'cloudflared tunnel run --protocol http2'
];

/* stack do resumo técnico: rótulo traduzido + itens iguais em todos os idiomas */
export const STACK = [
  ['lang', ['Python', 'TypeScript', 'JavaScript', 'Java', 'SQL', 'Kotlin', 'Swift']],
  ['front', ['React', 'Vite', 'Three.js', 'React Three Fiber', 'React Native', 'Expo', 'Electron']],
  ['back', ['FastAPI', 'Express', 'Spring Boot', 'Flask', 'Socket.IO', 'Celery']],
  ['data', ['PostgreSQL', 'Redis', 'Kafka', 'RabbitMQ', 'pandas', 'LightGBM', 'scikit-learn', 'geopandas']],
  ['ai', ['Claude', 'Gemini', 'OpenAI', 'DeepSeek', 'llama.cpp', 'Ollama', 'faster-whisper']],
  ['infra', ['Docker', 'Podman', 'Nginx', 'Cloudflare Tunnel', 'GitHub Actions', 'Prometheus', 'Grafana', 'Sentry']]
];
