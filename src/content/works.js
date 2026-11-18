/* Trabalhos publicados no portfólio. systems = áreas da carta estelar em que o
   trabalho aparece; img = print em /assets/works (sem img, o card é só texto);
   t = [tipo, descrição] em cada idioma. */
export const WORKS = [
  { id: 'portal', name: 'Portal Institucional', img: 'portal', url: 'https://portal.fuzabalta.com.br',
    systems: ['ia', 'backend', 'seguranca'],
    stack: ['FastAPI', 'React', 'PostgreSQL', 'Redis', 'Claude', 'Gemini', 'DeepSeek', 'Whisper', 'Docker'],
    t: {
      pt: ['Plataforma interna e agente de IA', 'Portal da Fuzabalta com acesso por papéis, gestão de documentos e o Jarvson, um agente de IA com ferramentas que respeita as permissões de quem está logado e pede confirmação antes de qualquer escrita.', [['384', 'testes automatizados'], ['3', 'provedores de IA']]],
      en: ['Internal platform and AI agent', 'Fuzabalta\'s portal with role-based access, document management and Jarvson, a tool-using AI agent that respects the logged-in user\'s permissions and asks for confirmation before any write.', [['384', 'automated tests'], ['3', 'AI providers']]],
      es: ['Plataforma interna y agente de IA', 'Portal de Fuzabalta con acceso por roles, gestión de documentos y Jarvson, un agente de IA con herramientas que respeta los permisos de quien inició sesión y pide confirmación antes de cualquier escritura.', [['384', 'pruebas automatizadas'], ['3', 'proveedores de IA']]]
    } },
  { id: 'avm', name: 'AVM CAIXA São Paulo', img: 'avm',
    systems: ['dados', 'backend'],
    stack: ['Python', 'LightGBM', 'scikit-learn', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'geopandas', 'shapely', 'Docker'],
    t: {
      pt: ['Avaliação automatizada de imóveis', 'Modelo que estima o valor de apartamentos em São Paulo para o Edital de Credenciamento CAIXA 012/2026. Cada previsão traz um intervalo calibrado, e as previsões incertas são recusadas automaticamente.', [['425.664', 'vendas na base'], ['9,3%', 'erro mediano fora do tempo'], ['79,8%', 'cobertura do intervalo de 80%']]],
      en: ['Automated property valuation', 'Model that estimates apartment values in São Paulo for CAIXA\'s Accreditation Notice 012/2026. Each prediction carries a calibrated interval, and uncertain predictions are refused automatically.', [['425,664', 'sales in the base'], ['9.3%', 'median out-of-time error'], ['79.8%', 'coverage of the 80% interval']]],
      es: ['Valuación automatizada de inmuebles', 'Modelo que estima el valor de apartamentos en São Paulo para el Edicto de Acreditación CAIXA 012/2026. Cada predicción trae un intervalo calibrado, y las predicciones inciertas se rechazan automáticamente.', [['425.664', 'ventas en la base'], ['9,3%', 'error mediano fuera de tiempo'], ['79,8%', 'cobertura del intervalo de 80%']]]
    } },
  { id: 'lune', name: 'Lune', img: 'lune',
    systems: ['ia', 'infra'],
    stack: ['Python', 'ComfyUI', 'LTX-2.5', 'Claude', 'GPU', 'Docker', 'Cloudflare Tunnel'],
    t: {
      pt: ['Estúdio de imagem e vídeo com IA', 'Aplicativo que cria imagens, vídeos e novelas com personas, galeria e editor, usando um motor ComfyUI em GPU e um redator de prompts.'],
      en: ['AI image and video studio', 'App that creates images, videos and serial dramas with personas, a gallery and an editor, using a ComfyUI engine on GPU and a prompt writer.'],
      es: ['Estudio de imagen y video con IA', 'Aplicación que crea imágenes, videos y novelas con personas, galería y editor, usando un motor ComfyUI en GPU y un redactor de prompts.']
    } },
  { id: 'scopeads', name: 'ScopeAds', img: 'scopeads', url: 'https://scope.fuzabalta.com.br',
    systems: ['automacao', 'backend', 'dados'],
    stack: ['FastAPI', 'asyncpg', 'Playwright', 'PostgreSQL', 'Redis', 'React', 'Gluetun'],
    t: {
      pt: ['Inteligência de anúncios', 'Coleta a Biblioteca de Anúncios da Meta, guarda os criativos e dá uma nota de 0 a 100 para destacar o que está escalando, com filtros, transcrição e tradução.'],
      en: ['Ad intelligence', 'Collects the Meta Ad Library, stores the creatives and scores them from 0 to 100 to highlight what is scaling, with filters, transcription and translation.'],
      es: ['Inteligencia de anuncios', 'Recopila la Biblioteca de Anuncios de Meta, guarda los creativos y les da una nota de 0 a 100 para destacar lo que está escalando, con filtros, transcripción y traducción.']
    } },
  { id: 'copyforge', name: 'CopyForge', img: 'copyforge', url: 'https://copyforge.fuzabalta.com.br',
    systems: ['backend', 'automacao'],
    stack: ['Java', 'Kafka', 'Playwright', 'Flyway', 'PostgreSQL', 'Redis'],
    t: {
      pt: ['Gerador de páginas', 'Parte de uma página de referência para modelar e publicar uma página própria, com backend em Java e filas Kafka.'],
      en: ['Page generator', 'Starts from a reference page to model and publish a page of your own, with a Java backend and Kafka queues.'],
      es: ['Generador de páginas', 'Parte de una página de referencia para modelar y publicar una página propia, con backend en Java y colas Kafka.']
    } },
  { id: 'viralview', name: 'ViralView', img: 'viralview', url: 'https://beta.fuzabalta.com.br',
    systems: ['backend', 'dados'],
    stack: ['Java', 'Spring Modulith', 'Flyway', 'PostgreSQL', 'Redis'],
    t: {
      pt: ['Painel de divulgação', 'Mostra o que divulgar a cada dia e quanto cada divulgação rendeu, em um backend Java modular.'],
      en: ['Promotion dashboard', 'Shows what to promote each day and how much each promotion earned, on a modular Java backend.'],
      es: ['Panel de divulgación', 'Muestra qué divulgar cada día y cuánto rindió cada divulgación, en un backend Java modular.']
    } },
  { id: 'albe', name: 'Albe Wear', img: 'albewear', url: 'https://www.albewear.store',
    systems: ['backend', 'seguranca', 'infra'],
    stack: ['FastAPI', 'SQLAlchemy', 'Alembic', 'PostgreSQL', 'React', 'argon2', 'Cloudflare Tunnel'],
    t: {
      pt: ['Loja virtual completa', 'Vitrine, painel administrativo, API e backups de uma marca de moda fitness, publicados por túnel da Cloudflare.'],
      en: ['Full online store', 'Storefront, admin panel, API and backups for a fitness fashion brand, published through a Cloudflare Tunnel.'],
      es: ['Tienda virtual completa', 'Escaparate, panel administrativo, API y copias de seguridad de una marca de moda fitness, publicados por un túnel de Cloudflare.']
    } },
  { id: 'manhua', name: 'RogerManhua',
    systems: ['frontend', 'automacao'],
    stack: ['Kotlin', 'Jetpack Compose', 'Python'],
    t: {
      pt: ['App Android', 'Leitor nativo com download offline, sobre um catálogo próprio de obras e capítulos.', [['1.358', 'obras'], ['81 mil', 'capítulos']]],
      en: ['Android app', 'Native reader with offline downloads, built on its own catalog of titles and chapters.', [['1,358', 'titles'], ['81k', 'chapters']]],
      es: ['App Android', 'Lector nativo con descarga sin conexión, sobre un catálogo propio de obras y capítulos.', [['1.358', 'obras'], ['81 mil', 'capítulos']]]
    } },
  { id: 'voz', name: 'Clonador de voz',
    systems: ['ia'],
    stack: ['XTTS', 'RVC', 'Python', 'Docker'],
    t: {
      pt: ['Serviço de voz', 'API HTTP que fala um texto com a voz de uma amostra de 8 a 30 segundos.'],
      en: ['Voice service', 'HTTP API that speaks a text in the voice of an 8 to 30 second sample.'],
      es: ['Servicio de voz', 'API HTTP que dice un texto con la voz de una muestra de 8 a 30 segundos.']
    } },
  { id: 'hub', name: 'Fuzatto Hub',
    systems: ['ia', 'automacao'],
    stack: ['Flask', 'React', 'Claude', 'yt-dlp', 'faster-whisper'],
    t: {
      pt: ['Central de produção de conteúdo', 'Checklists, dias de gravação, pipeline de Reels, análise de referências e gerador de roteiros.'],
      en: ['Content production hub', 'Checklists, shooting days, a Reels pipeline, reference analysis and a script generator.'],
      es: ['Central de producción de contenido', 'Checklists, días de grabación, pipeline de Reels, análisis de referencias y generador de guiones.']
    } },
  { id: 'formula', name: 'Fórmula 28D',
    systems: ['frontend', 'backend'],
    stack: ['React 19', 'Vite', 'FastAPI', 'SQLAlchemy', 'Alembic', 'PostgreSQL'],
    t: {
      pt: ['App de desafio fitness', 'Desafio de 28 dias com acesso liberado pela compra, em layouts próprios para celular e desktop.'],
      en: ['Fitness challenge app', '28-day challenge with access unlocked by purchase, with dedicated mobile and desktop layouts.'],
      es: ['App de desafío fitness', 'Desafío de 28 días con acceso liberado por la compra, con diseños propios para móvil y escritorio.']
    } },
  { id: 'planner', name: 'Planner 28D',
    systems: ['frontend'],
    stack: ['React', 'TanStack Query', 'FastAPI', 'PostgreSQL', 'Redis', 'Web Push'],
    t: {
      pt: ['PWA de acompanhamento', 'Transforma um planner fitness em aplicativo com login: medidas, metas, hábitos, treinos e alimentação.'],
      en: ['Tracking PWA', 'Turns a fitness planner into an app with login: measurements, goals, habits, workouts and nutrition.'],
      es: ['PWA de seguimiento', 'Convierte un planner fitness en una aplicación con inicio de sesión: medidas, metas, hábitos, entrenamientos y alimentación.']
    } }
];

export const worksFor = (systemId) => WORKS.filter((w) => w.systems.includes(systemId));
