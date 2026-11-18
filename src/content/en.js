/* Textos em inglês: interface, resumo técnico, sistemas, técnicas e anomalias. */
export default {
  ui: {
    htmlLang: 'en',
    langLabel: 'Language',
    soundOn: 'Sound on', soundOff: 'Sound off',
    role: 'Full-stack engineer: real-time systems, data and AI',
    lead: 'I design, build and run production systems end to end. This star chart maps what I can do: each system is an area of engineering, each planet is a technique applied in production and, at the center, are the real incidents I solved.',
    start: 'Start navigation',
    summaryBtn: 'View technical summary',
    surface: 'In production: about <b>30</b> systems, more than <b>160</b> containers across <b>87</b> compose files, more than <b>100</b> Dockerfiles, more than <b>750</b> test files and <b>27</b> CI/CD pipelines, in Python, TypeScript, JavaScript and Java.',
    systems: 'Systems',
    hint: 'Drag to rotate, scroll to zoom and click a system to jump.',
    back: 'Back to the map',
    mapped: 'Charted: {n} of {t}',
    arsenal: 'Arsenal',
    how: 'Implementation',
    strike: 'Scan', strikeAgain: 'Analyze', finish: 'Neutralize',
    phases: ['Symptom', 'Root cause', 'Fix'],
    defeated: 'Contained',
    skip: 'Skip',
    hp: 'Threat level',
    bossCount: 'Anomalies contained: {n} of {t}',
    toastMap: 'Every system charted.',
    toastBosses: 'Every incident contained.',
    loading: { title: 'Calibrating the star chart', fonts: 'Panel fonts', data: 'System records', images: 'Sensor images', engine: '3D engine', textures: 'Planet textures', models: 'Fleet models', shaders: 'Compiling shaders', done: 'Ready' },
    viewPage: 'Page version',
    viewPageBoot: 'Prefer to read? Open the page version',
    view3d: 'View in 3D',
    pageToc: 'On this page',
    pageLead: 'I design, build and run production systems end to end. Below, each engineering area with the techniques I applied in production and the real incidents I diagnosed and fixed.',
    problem: 'Problem',
    incidentsH: 'Post-mortem',
    incidentsIntro: 'Real production incidents I diagnosed and fixed, each with the symptom, the root cause and the fix applied.',
    toastKonami: 'Gravitational collapse.',
    summaryH: 'Technical summary',
    summarySub: 'For those with two minutes',
    worksH: 'Work',
    worksSub: 'Real systems, live',
    worksIntro: 'Products and platforms I built, with the technologies used in each one.',
    worksArea: 'Work in this area',
    worksVisit: 'Open the system',
    worksZoom: 'Enlarge the screenshot of {n}',
    worksClose: 'Close',
    available: 'Open to opportunities and projects',
    kpis: [['~30', 'production systems'], ['160+', 'production containers'], ['87', 'compose files'], ['100+', 'Dockerfiles'], ['750+', 'test files'], ['27', 'CI/CD pipelines']],
    jump: { trabalhos: 'Work', trajetoria: 'Experience', resumo: 'Summary', engenharia: 'Engineering', incidentes: 'Incidents', tema: 'Theme', sobre: 'About' },
    mapH: 'Star chart',
    metaWorks: '{n} projects',
    metaJobs: '{n} positions',
    metaEng: '{n} areas, {t} techniques',
    metaInc: '{n} of {n} contained',
    dockBridge: 'Command bridge',
    dockTime: 'in Balneário Camboriú',
    themeLink: 'Why this theme?',
    themeH: 'Why a command center',
    themeLede: 'Because software does not end at deploy. Someone has to see the whole picture and act when something goes wrong.',
    themeWhy: [
      'I do not just build systems: I also run what I build. Data collection, APIs, interfaces, databases and infrastructure go through the same hands, and that changes how each layer gets written. Every project starts with health checks, logs, tests and a plan for when something fails.',
      'A command center is the most honest image of that work: keeping an eye on what is live, quickly understanding what happened and making the right call under pressure.',
      'The space theme comes from what I enjoy away from the terminal: science fiction, cosmic horror, anime and games. The 3D star chart was born from that, and this page is the same ship seen from the bridge.'
    ],
    themeReadH: 'How to read this panel',
    themeRead: [
      ['Star chart', 'Each system is an engineering area I work in.'],
      ['Telemetry', 'The numbers behind what I shipped to production.'],
      ['Work', 'The proof: real systems and the technologies behind each one.'],
      ['Incidents', 'Real production failures, with the cause and the fix.']
    ],
    headline: 'Software Engineer: Python back-end, full stack and infrastructure',
    location: 'Balneário Camboriú, Brazil, open to remote work',
    cvDownload: 'Download resume',
    cvMeta: 'PDF, 2 pages',
    careerH: 'Experience',
    careerNow: 'Current',
    educationH: 'Education and languages',
    areasLabel: 'Filter by area',
    allAreas: 'All areas',
    engH: 'Engineering',
    engIntro: 'Each area brings together real production problems and how I solved them.',
    radarHint: 'Click an area on the map to jump straight to its section.',
    seeArea: 'See work',
    workWord: ['project', 'projects'],
    techWord: ['technique', 'techniques'],
    profile: 'Full-stack engineer who designs, builds and runs production systems end to end: React interfaces, APIs in Python, Node.js and Java, data and machine learning pipelines, AI agents and the infrastructure that keeps it all up around the clock.',
    highlightsH: 'Highlights',
    highlights: [
      'About 30 systems in production and more than 160 containers, run on 3 servers with Docker Compose, CI/CD on GitHub Actions and no ports exposed to the internet.',
      'Real time at scale: Socket.IO on a PM2 cluster with Redis pub/sub, a fan-out WebSocket proxy and SSE.',
      'Machine learning in production: a pricing model (LightGBM with conformal regression) built on a base of 425 thousand sales, served through an API with versioned artifacts and an auditable pipeline of 1.3 million records.',
      'AI agents with tool use that respect the user’s RBAC and require confirmation before any write, with layered defense against prompt injection.',
      'Production incident response, from root cause to fix: PostgreSQL lock pileup (CPU from 192 % to 24 %), int4 sequence overflow and orphan process leaks.',
      'Quality: more than 750 test files with pytest, Vitest, Jest and JUnit with Testcontainers.'
    ],
    stackH: 'Stack',
    stackLabels: { lang: 'Languages', front: 'Frontend and mobile', back: 'Backend', data: 'Data and ML', ai: 'AI', infra: 'Infra and DevOps' },
    explore: 'Explore the star chart',
    aboutH: 'Who flies this',
    about: [
      'I am a full-stack engineer and I work end to end: collection, processing, modeling, interface and operations. Designing, building and running the same system changes how you write every layer: every project ships with healthchecks, logs, tests and a plan for when something fails.',
      'Music came before code. I am a musician and used to teach guitar; from there I kept the daily practice and the habit of explaining complicated things simply, which helps a lot in code review, documentation and talking to non-technical people.',
      'Away from the terminal it is death metal, deathcore, cosmic horror, science fiction, anime and games. You can probably tell.'
    ],
    contactH: 'Shall we talk?',
    contactP: 'Open to opportunities and projects. I reply quickly by email or WhatsApp.',
    mail: 'Send an email', wa: 'Message on WhatsApp',
    waMsg: 'Hi Roger, I saw your portfolio and would like to talk about an opportunity.',
    credits: 'Third-party 3D models, CC BY 4.0 license:',
    foot: 'Handmade, no template: Vite, Three.js and GLSL. Soundtrack: death metal and deathcore.',
    noscript: 'This portfolio needs JavaScript for navigation.'
  },
  layers: {
    sobre: { name: 'About me', sub: 'Background and contact' },
    frontend: {
      name: 'Frontend', sub: 'Interfaces, mobile and 3D',
      intro: 'React interfaces built for production: on-demand loading, real time on the client, data visualization and 3D in the browser. React in about 47 projects, Three.js in 14, mobile apps with Expo and desktop with Electron.',
      techs: [
        { t: 'Deploy-resilient code splitting', p: 'After a deploy, users with the tab open requested chunks that no longer existed and the app broke.', h: 'Routes with React.lazy and Suspense, manualChunks in Vite and an ErrorBoundary that detects chunk failures and reloads the page exactly once, with no loops.' },
        { t: 'Resilient WebSocket client', p: 'Connection drops froze real-time dashboards or duplicated events on reconnect.', h: 'A socket hook with exponential backoff from 1 s to 30 s, dedupe by id, pause while the tab is hidden and 24 h client-side retention.' },
        { t: 'Rendering large lists', p: 'Lists with thousands of rows degraded scrolling and time to interaction.', h: 'Virtualization with TanStack Virtual, plus a custom implementation where the library did not fit: only what is visible reaches the DOM.' },
        { t: 'Performant 3D in the browser', p: '3D scenes have to run on modest devices and respect people who ask for less motion.', h: 'Three.js and React Three Fiber with instancing, custom GLSL shaders, a pixel-ratio cap, pause on hidden tabs and a prefers-reduced-motion fallback. This portfolio uses the same approach.' },
        { t: 'Mobile and desktop apps', p: 'Some products need the camera, audio, notifications or local files.', h: 'Apps with Expo and React Native, with native modules in Kotlin and Swift; desktop apps with Electron and SQLite, and with pywebview.' }
      ]
    },
    backend: {
      name: 'Backend', sub: 'APIs and real time',
      intro: 'APIs and real-time services across three ecosystems: Node.js with Express (31 projects), Python with FastAPI (22) and Java with Spring Boot. WebSocket in about 22 projects, SSE in 18 and horizontal scaling with PM2 and Redis.',
      techs: [
        { t: 'Horizontal scaling for real time', p: 'With several Node.js processes, an event emitted in one worker never reached clients connected to the others.', h: 'PM2 in cluster mode with the Socket.IO Redis adapter and pub/sub: any worker publishes and every worker delivers to its own clients.' },
        { t: 'WebSocket proxy with fan-out', p: 'Every client opening its own connection to the external source multiplied cost and the risk of being blocked.', h: 'A single consumer of the source, an enrichment layer (Observer and Mediator) and distribution to N clients over WebSocket and SSE.' },
        { t: 'Streaming event correlation', p: 'The same event arrives through two channels, WebSocket and SSE, out of order and with different delays.', h: 'A FIFO queue of pending items with a TTL pairs them inside a time window; whatever expires is dropped without blocking the stream.' },
        { t: 'Sequencing without a local clock', p: 'Event numbering had to stay continuous even when collection dropped.', h: 'Extrapolation anchored on a known event using the mode of the observed offset, guaranteeing a gap-free sequence.' },
        { t: 'Hexagonal architecture', p: 'Business rules coupled to the framework make isolated tests and infrastructure swaps impossible.', h: 'An isolated domain with ports and adapters, container-based dependency injection and a monorepo with a types package shared between API and frontend.' },
        { t: 'Conversational state machine', p: 'Users sent several messages in a row and the bot answered each one out of context.', h: 'Per-conversation debounce with a lock and a timer merges the burst into one turn; the flow stage lives in a state machine persisted outside the LLM.' },
        { t: 'Modular Java services', p: 'Monoliths that grow without boundaries turn into coupling that is hard to undo.', h: 'Spring Boot with Spring Modulith for explicit module boundaries, OAuth2 Resource Server, Flyway migrations and integration tests with Testcontainers (PostgreSQL and Kafka).' }
      ]
    },
    automacao: {
      name: 'Automation', sub: 'Collection and 24/7 bots',
      intro: 'Automated collection running around the clock without supervision: Playwright in 11 projects, Selenium in 12 and more than 50 scheduled jobs, with silent-failure detection and automatic recovery.',
      techs: [
        { t: 'Silence watchdog', p: 'The collector stayed alive but stopped producing data, and the default healthcheck never noticed.', h: 'A watcher measures the time since the last valid datum; past the limit, it marks the container unhealthy and autoheal restarts it.' },
        { t: 'Circuit breaker with backoff', p: 'Hammering an unavailable source caused blocks and cascading failures.', h: 'The circuit opens after N failures, waits with exponential backoff and probes once before closing.' },
        { t: 'Gap backfill', p: 'Downtime left holes in the collected history.', h: 'Aligning the source history with the last trusted record and filling only the missing interval, covered by a dedicated test.' },
        { t: 'Chaos tests', p: 'Collectors that work under normal conditions break under failure.', h: 'Six chaos scenarios against the real collector (extractor, state, load, persistence and balancing), running as a test suite.' },
        { t: 'SPA automation', p: 'On SPA sites the page loads before the app mounts, and the bot read empty data.', h: 'Waiting for an explicit mount signal (selector or app state) before reading or interacting, with a timeout and a retry.' },
        { t: 'Adaptive egress', p: 'Traffic concentrated on a single network origin ends up blocked.', h: 'Egress alternates between residential network and VPN (Gluetun) on a controlled cadence, switching servers when a block is detected.' }
      ]
    },
    dados: {
      name: 'Data & ML', sub: 'Databases, pipelines and models',
      intro: 'Data modeling in PostgreSQL (about 42 projects) and Redis (16), queues with Kafka and RabbitMQ and applied machine learning: a pricing model built on a base of 425 thousand sales, with rigorous validation and calibrated uncertainty.',
      techs: [
        { t: 'Transactional queue in PostgreSQL', p: 'Several workers processed the same item and duplicated work.', h: 'SELECT … FOR UPDATE SKIP LOCKED: each worker atomically reserves a free row, with no extra broker.' },
        { t: 'Advisory locks', p: 'Replicas ran the same maintenance routine in parallel.', h: 'pg_advisory_lock guarantees exclusive execution across replicas; whoever does not get the lock moves on without blocking.' },
        { t: 'Idempotency in the database', p: 'Webhooks resent by the provider duplicated customer credits.', h: 'A unique key per reason and reference with INSERT … ON CONFLICT DO NOTHING: reprocessing does not change the balance.' },
        { t: 'Versioned migrations', p: 'A schema that depends on someone remembering to run a script drifts between environments.', h: 'Numbered, idempotent SQL (IF NOT EXISTS) applied at boot or through a CLI; Alembic and Flyway where the project calls for it.' },
        { t: 'ML pricing with calibrated uncertainty', p: 'A point estimate says nothing about the model’s confidence, and bad predictions must be refused.', h: 'LightGBM with Huber loss and conformal quantile regression: every prediction ships with a calibrated range, and ranges that are too wide become automatic refusals. Served by a FastAPI API with hash-versioned artifacts and monthly monitoring.' },
        { t: 'Leak-free validation', p: 'A 1 % test error became 10 % in production because a column derived from the target leaked into training.', h: 'Grouped (GroupKFold) and out-of-time validation, plus a leakage detector that blocks auxiliary columns before training.' },
        { t: 'Geoprocessing', p: 'Different public registries describe the same property in different ways.', h: 'Matching by street, number and polygon with geopandas, shapely and pyproj, in SIRGAS 2000.' },
        { t: 'Auditable data pipeline', p: 'Without traceability, nobody can say where each number in a report came from.', h: 'Ingestion of 1.3 million records with a SHA-256 manifest, raw, staging and feature layers, COPY bulk loads, a numbered decision log and about 420 automated tests.' }
      ]
    },
    ia: {
      name: 'Applied AI', sub: 'Agents, RAG, voice and vision',
      intro: 'AI in production, not demos: agents with tool use that respect permissions, RAG, voice and vision. Claude, Gemini, DeepSeek and OpenAI APIs, and open models running locally with llama.cpp and Ollama.',
      techs: [
        { t: 'Tool-use agent with confirmation', p: 'An agent with write access can take the wrong action from one ambiguous sentence.', h: 'Tool use with the Claude API: reads run immediately; writes become a plan the user confirms, released by a single-use server token (atomic GETDEL in Redis), always inside the logged-in user’s RBAC.' },
        { t: 'Prompt-injection defense', p: 'User input tries to override the model’s instructions.', h: 'Successive layers: normalization, a detector, delimiters, a canary token and a link allowlist.' },
        { t: 'Unified multimodal input', p: 'Malicious instructions can arrive by audio or image and bypass text filters.', h: 'Audio transcribed with faster-whisper and images described by a vision model before any check: security does not depend on the channel.' },
        { t: 'Lean RAG', p: 'The model made up product specs.', h: 'In-memory embeddings with matrix-product search in NumPy: for a few hundred facts, no vector database and no extra infrastructure.' },
        { t: 'Cost reduction with prefix caching', p: 'Every message resent the same context and paid for it again.', h: 'Prompt layers in a fixed order, from most stable to most volatile, maximizing prefix-cache hits: lower cost and lower latency.' },
        { t: 'On-premise document extraction', p: 'Documents with personal data cannot be sent to external APIs.', h: 'A local pipeline: PDF text, OCR where text is missing, rules and an open LLM served locally; each field only reaches production after its accuracy is measured.' },
        { t: 'On-demand GPU orchestration', p: 'An idle rented GPU costs as much as a busy one.', h: 'A supervisor on the server, a cron watcher, state reconciliation and a queue that keeps the GPU busy and shuts it down when done.' }
      ]
    },
    seguranca: {
      name: 'Security', sub: 'Authentication, authorization and protection',
      intro: 'Security as a design standard replicated across the fleet: JWT with refresh in 33 projects, rate limiting in 31, HMAC webhooks in more than 25, RBAC, CSP and protection against SSRF and IDOR.',
      techs: [
        { t: 'Refresh tokens with reuse detection', p: 'A stolen refresh token stayed valid until it expired.', h: 'Every use issues a new token and invalidates the previous one; if an old token shows up again, the whole family is revoked.' },
        { t: '2FA with trusted devices', p: 'Asking for a code on every login hurts the experience; never asking is risky.', h: 'A confirmed device is stored as a hash in Redis, bound to the user and the token version; changing the password revokes them all.' },
        { t: 'Object-level authorization', p: 'A partial admin could promote themselves or access another department’s resources.', h: 'An anti-escalation rule when granting roles and an ownership check on every object (anti-IDOR), not just on the route.' },
        { t: 'Authenticated webhooks', p: 'Anyone could call the webhook URL pretending to be the payment gateway.', h: 'HMAC signature verified with constant-time comparison before any side effect.' },
        { t: 'SSRF protection', p: 'User-supplied URLs could make the server reach the internal network.', h: 'Every redirect is resolved and validated; private and cloud-metadata ranges are blocked.' },
        { t: 'Rate limiting and abuse prevention', p: 'Limits calibrated without real data ended up blocking paying customers.', h: 'Rate limiting in Redis, fail-closed where abuse costs money, and a ban policy that runs in observe mode first and enforce mode only later.' }
      ]
    },
    incidentes: {
      name: 'Incidents', sub: 'Production post-mortems',
      intro: 'Real production incidents I diagnosed and fixed. Each anomaly shows the symptom, the root cause and the fix applied: scan it to open the post-mortem.'
    },
    infra: {
      name: 'Infrastructure', sub: 'DevOps, CI/CD and observability',
      intro: 'End-to-end operations: 3 servers, 87 compose files with more than 160 containers, more than 100 Dockerfiles, 27 CI/CD pipelines on GitHub Actions, observability with Prometheus and Grafana and no exposed ports.',
      techs: [
        { t: 'Zero exposed ports', p: 'Databases and dashboards exposed to the internet become targets within hours.', h: 'Publishing only through Cloudflare Tunnel with managed TLS, server access only by SSH key and databases restricted to the internal network.' },
        { t: 'Self-healing services', p: 'Frozen containers are still "running" as far as Docker knows.', h: 'A healthcheck on every service, an autoheal sidecar that restarts unhealthy ones and an init as PID 1 to reap orphan processes.' },
        { t: 'Resource isolation', p: 'One runaway collector ate every core and took production down with it.', h: 'Per-container CPU limits adding up to at most 5 of 8 cores: 3 stay reserved for the services that serve users.' },
        { t: 'CI/CD with artifact promotion', p: 'Deploys with no guarantee that the shipped code is the code that was tested.', h: 'CI tests and builds; CD publishes exactly the approved SHA. Matrix builds with images on GHCR and disk cleanup on the runner.' },
        { t: 'Observability', p: 'Finding out about a failure from a customer complaint.', h: 'Prometheus, Alertmanager and Grafana, custom exporters and metrics inside the collectors; Sentry for application errors.' }
      ]
    }
  },
  bosses: [
    { name: 'The Lock Devourer',
      s: 'A whole server at load 25, the database at 192 % CPU and unrelated apps going down.',
      c: 'Dozens of INSERTs stuck behind a transaction idle for 21 minutes. A whole batch in one long transaction, collection cycles overlapping and a process.exit that killed the app on every dropped connection.',
      f: 'Found the root blocker with pg_blocking_pids and terminated it. At the source: a 5 s lock_timeout, a self-scheduling loop with no overlap and a pool that recovers on its own. CPU from 192 % to 24 %; stuck locks from 17 to 0.' },
    { name: 'The 32-Bit Ceiling',
      s: 'Collection kept running, but nothing new showed up on screen.',
      c: 'The id sequence, typed integer, hit 2,147,483,647. Every INSERT failed.',
      f: 'Two commands, no code changes and about 36 s of lock: sequence and column moved to bigint.' },
    { name: 'The Parasite',
      s: 'Load 51, 75 % of CPU stolen and simple queries taking 2.4 s.',
      c: 'A database exposed to the internet with a weak password got broken into: a miner disguised as a system process, a supervisor that kept reviving it and hidden superusers as a backdoor.',
      f: 'Containment, removal of the binary and the rogue users, every credential rotated and the database taken off the internet. Since then nothing is exposed: tunnel only.' },
    { name: 'The dockerd Specter',
      s: 'dockerd stuck at 480 % CPU, with no container showing up as the culprit.',
      c: 'Seven orphaned docker logs --tail commands from dead SSH sessions, reading logs of containers that had already been recreated. Each one spun forever.',
      f: 'A goroutine dump with SIGUSR1 as proof, the orphan clients killed and a new rule: remote diagnostics always run with a timeout.' },
    { name: 'The Orphan Horde',
      s: '363 zombie processes piled up in one container, threatening to exhaust the machine’s process table.',
      c: 'It was not the code. The shell healthcheck kept timing out and leaving orphaned grandchild processes that nobody reaped.',
      f: 'init: true on the service. A real init as PID 1 reaps the orphans. Zombies: zero.' },
    { name: 'The 502 Wraith',
      s: 'After a routine reboot, every consumer of a service got 502, yet the service answered 200 locally.',
      c: 'The reboot reset the kernel UDP buffer to its default. The tunnel used QUIC, which became unreliable, and requests never arrived.',
      f: 'Buffers persisted in sysctl and the tunnel forced onto HTTP/2 over TCP. Twelve out of twelve requests at 200.' }
  ]
};
