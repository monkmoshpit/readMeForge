import type { ReadmeLocale } from '../readmeLocale';
import type { ProjectType, Tone } from '../types';

const SECTIONS_PT: Record<ProjectType, string> = {
  opensource:
    'badges, descrição, funcionalidades, instalação, uso, contribuindo, licença',
  saas: 'hero, funcionalidades, demo, stack, deploy, variáveis de ambiente',
  api: 'visão geral, autenticação, endpoints, exemplos de request/response, erros',
  portfolio: 'motivação, funcionalidades, stack, aprendizados, demo ao vivo, screenshots',
  cli: 'instalação global, comandos, flags, exemplos',
  fullstack:
    'arquitetura, stack, como rodar local, variáveis de ambiente, estrutura de pastas (explicando brevemente o papel das principais pastas e arquivos — por exemplo, o que vive em camadas como app, src, jobs, models, services, routes, etc., sem assumir uma linguagem específica)',
};

const SECTIONS_EN: Record<ProjectType, string> = {
  opensource: 'badges, description, features, install, usage, contributing, license',
  saas: 'hero, features, demo, stack, deploy, environment variables',
  api: 'overview, authentication, endpoints, request/response examples, errors',
  portfolio: 'motivation, features, stack, learnings, live demo, screenshots',
  cli: 'global install, commands, flags, examples',
  fullstack:
    'architecture, stack, local setup, environment variables, folder structure (briefly describing the purpose of the main folders and files — for example what lives in layers like app, src, jobs, models, services, routes, etc., without assuming a specific language or framework)',
};

const SECTIONS_ES: Record<ProjectType, string> = {
  opensource: 'badges, descripción, características, instalación, uso, contribución, licencia',
  saas: 'hero, características, demo, stack, deploy, variables de entorno',
  api: 'visión general, autenticación, endpoints, ejemplos request/response, errores',
  portfolio: 'motivación, características, stack, aprendizajes, demo en vivo, capturas',
  cli: 'instalación global, comandos, flags, ejemplos',
  fullstack:
    'arquitectura, stack, setup local, variables de entorno, estructura de carpetas (explicando brevemente el papel de las carpetas y archivos principales — por ejemplo, qué vive en capas como app, src, jobs, models, services, routes, etc., sin asumir un lenguaje específico)',
};

const TONE_LABEL_PT: Record<Tone, string> = {
  technical: 'técnico e direto',
  casual: 'casual e acessível',
  recruiter: 'focado em recrutador / impacto',
};

const TONE_LABEL_EN: Record<Tone, string> = {
  technical: 'technical and direct',
  casual: 'casual and approachable',
  recruiter: 'recruiter-focused / impact',
};

const TONE_LABEL_ES: Record<Tone, string> = {
  technical: 'técnico y directo',
  casual: 'casual y accesible',
  recruiter: 'orientado a reclutador / impacto',
};

const SECTIONS_BY_LOCALE: Record<ReadmeLocale, Record<ProjectType, string>> = {
  en: SECTIONS_EN,
  es: SECTIONS_ES,
  'pt-BR': SECTIONS_PT,
};

const TONE_BY_LOCALE: Record<ReadmeLocale, Record<Tone, string>> = {
  en: TONE_LABEL_EN,
  es: TONE_LABEL_ES,
  'pt-BR': TONE_LABEL_PT,
};

export function buildInstructionBlock(
  projectType: ProjectType,
  tone: Tone,
  readmeLocale: ReadmeLocale,
): string {
  const sections = SECTIONS_BY_LOCALE[readmeLocale][projectType];
  const toneLabel = TONE_BY_LOCALE[readmeLocale][tone];

  const badgeRule =
    readmeLocale === 'pt-BR'
      ? 'Mantenha cada badge/link em uma única linha: não quebre entre ] e ( — por exemplo [![rótulo](shield)](https://github.com/...) deve ficar inteiro na mesma linha.'
      : readmeLocale === 'es'
        ? 'Mantén cada badge/enlace en una sola línea: no partas entre ] y ( — p. ej. [![etiqueta](shield)](https://github.com/…) debe quedar en una línea.'
        : 'Keep each badge/link on one line: never break a line between ] and ( — e.g. [![label](shield)](https://github.com/...) must stay on a single line.';

  const warnRule =
    readmeLocale === 'pt-BR'
      ? 'Para lacunas, use linhas inteiras README_FORGE_AVISO:campo:texto conforme as regras do sistema — nunca links falsos de licença ou badge.'
      : readmeLocale === 'es'
        ? 'Para huecos, usa líneas completas README_FORGE_AVISO:field:mensaje como en las reglas del sistema — nunca enlaces falsos de licencia o badge.'
        : 'For gaps, use full lines README_FORGE_AVISO:field:message as in the system rules — never fake license or badge links.';

  if (readmeLocale === 'en') {
    return [
      `Project type: ${projectType}.`,
      `Tone: ${toneLabel}.`,
      `Structure the README to cover at least these areas: ${sections}.`,
      warnRule,
      badgeRule,
      'Reply with valid Markdown only, no preamble or text outside the README.',
    ].join('\n');
  }

  if (readmeLocale === 'es') {
    return [
      `Tipo de proyecto: ${projectType}.`,
      `Tono: ${toneLabel}.`,
      `Estructura el README cubriendo al menos estas áreas: ${sections}.`,
      warnRule,
      badgeRule,
      'Responde solo con Markdown válido, sin preámbulo ni texto fuera del README.',
    ].join('\n');
  }

  return [
    `Tipo de projeto: ${projectType}.`,
    `Tom: ${toneLabel}.`,
    `Estruture o README cobrindo, no mínimo, estas áreas: ${sections}.`,
    warnRule,
    badgeRule,
    'Responda apenas com Markdown válido, sem preâmbulo ou texto fora do README.',
  ].join('\n');
}
