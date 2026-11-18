/* Trajetória e formação, conforme os currículos em public/cv.
   t = [cargo, período, descrição] em cada idioma; a ordem é da mais recente para a mais antiga. */
export const CV_FILES = {
  pt: { href: '/cv/Roger_Allan_Curriculo.pdf', name: 'Roger_Allan_Curriculo.pdf' },
  en: { href: '/cv/Roger_Allan_Resume_EN.pdf', name: 'Roger_Allan_Resume_EN.pdf' },
  es: { href: '/cv/Roger_Allan_Resume_EN.pdf', name: 'Roger_Allan_Resume_EN.pdf' }
};

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/roger-allan',
  github: 'https://github.com/RogerAllan'
};

export const CAREER = [
  { org: 'Fuzabalta',
    stack: ['FastAPI', 'React', 'PostgreSQL', 'Redis', 'Docker', 'GitHub Actions', 'Java', 'Kafka'],
    t: {
      pt: ['Engenheiro de Software', 'abr/2025 – nov/2026', 'Prestador de serviços responsável por arquitetura, desenvolvimento, deploy e operação dos sistemas internos e dos produtos digitais de uma empresa de marketing e infoprodutos.'],
      en: ['Software Engineer', 'Apr 2025 – Nov 2026', 'Contractor responsible for the architecture, development, deployment and operation of the internal systems and digital products of a marketing company.'],
      es: ['Ingeniero de Software', 'abr/2025 – nov/2026', 'Prestador de servicios responsable de la arquitectura, el desarrollo, el despliegue y la operación de los sistemas internos y los productos digitales de una empresa de marketing e infoproductos.']
    } },
  { org: 'Tear Escola de Negócios',
    stack: ['Laravel', 'Inertia.js', 'Vue', 'WordPress', 'WooCommerce', 'PHP 8.2'],
    t: {
      pt: ['Desenvolvedor Pleno', 'abr/2025 – jul/2025', 'Criei no TearMind a tradução simultânea de idiomas, a cobrança por tokens e o fit de vagas, e mantive a plataforma de análise DISC, as landing pages e a loja.'],
      en: ['Mid-Level Developer', 'Apr 2025 – Jul 2025', 'Built real-time language translation, token billing and job fit in TearMind, and maintained the DISC analysis platform, the landing pages and the store.'],
      es: ['Desarrollador Semi Senior', 'abr/2025 – jul/2025', 'Creé en TearMind la traducción simultánea de idiomas, el cobro por tokens y el fit de vacantes, y mantuve la plataforma de análisis DISC, las landing pages y la tienda.']
    } },
  { org: 'Bean Softwares',
    stack: ['TypeScript', 'React', 'C#', 'SQL Server'],
    t: {
      pt: ['Desenvolvedor de Software Júnior II', 'ago/2024 – out/2024', 'Desenvolvimento remoto com testes unitários, princípios SOLID e otimização de consultas.'],
      en: ['Software Developer (Junior II)', 'Aug 2024 – Oct 2024', 'Remote development with unit tests, SOLID principles and query optimization.'],
      es: ['Desarrollador de Software Junior II', 'ago/2024 – oct/2024', 'Desarrollo remoto con pruebas unitarias, principios SOLID y optimización de consultas.']
    } },
  { org: 'Prefeitura de Balneário Camboriú',
    stack: ['Spring Boot', 'React', 'PostGIS', 'Leaflet', 'Docker', 'Kubernetes'],
    t: {
      pt: ['Desenvolvedor de Software', 'mar/2023 – ago/2024', 'Desenvolvi o sistema web da Defesa Civil, com APIs protegidas por JWT e OAuth2, mapas de risco e rotas de evacuação.'],
      en: ['Software Developer', 'Mar 2023 – Aug 2024', 'Built the Civil Defense web system, with APIs secured by JWT and OAuth2, risk maps and evacuation routes.'],
      es: ['Desarrollador de Software', 'mar/2023 – ago/2024', 'Desarrollé el sistema web de Defensa Civil, con APIs protegidas por JWT y OAuth2, mapas de riesgo y rutas de evacuación.']
    } }
];

export const EDUCATION = {
  pt: [['Bacharelado em Engenharia de Software', 'Estácio, ago/2022 – dez/2025'], ['Fundamentos de DevOps', 'Certificado LinkedIn, 2023'], ['Idiomas', 'Português nativo, inglês e espanhol avançados']],
  en: [['Bachelor\'s in Software Engineering', 'Estácio, Aug 2022 – Dec 2025'], ['DevOps Foundations', 'LinkedIn certificate, 2023'], ['Languages', 'Native Portuguese, advanced English and Spanish']],
  es: [['Licenciatura en Ingeniería de Software', 'Estácio, ago/2022 – dic/2025'], ['Fundamentos de DevOps', 'Certificado LinkedIn, 2023'], ['Idiomas', 'Portugués nativo, inglés y español avanzados']]
};
