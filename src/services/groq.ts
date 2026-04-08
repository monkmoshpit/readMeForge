import Groq from 'groq-sdk';
import type { ReadmeLocale } from '../readmeLocale';
import { buildInstructionBlock } from '../prompts/templates';
import type { GeneratorFormData } from '../types';

const SYSTEM_PROMPTS: Record<ReadmeLocale, string> = {
  en: [
    'You generate README files in Markdown for GitHub repositories.',
    'Strict rules:',
    '- Do not use Markdown links [text](url) for license, badges, screenshots, or any data not present in the JSON context. Do not invent URLs.',
    '- For anything missing or that the user must supply (license, demo URL, env vars, etc.), output exactly one full line: README_FORGE_AVISO:field:short message',
    '  where field is one of: name, description, homepage, languages, topics, extraContext.',
    '- Do not use [to do], TODO, placeholder URLs, or links whose URL contains "to do" or fake slugs.',
    '- Reply with valid Markdown only, no preamble.',
  ].join('\n'),
  'pt-BR': [
    'Você gera README em Markdown para repositórios no GitHub.',
    'Regras obrigatórias:',
    '- Não use links Markdown [texto](url) para licença, badges, prints ou qualquer dado que não exista no JSON do contexto. Não invente URLs.',
    '- Para o que faltar ou o usuário tiver de informar (licença, demo, variáveis, etc.), use uma linha inteira: README_FORGE_AVISO:campo:texto curto',
    '  com campo em: name, description, homepage, languages, topics, extraContext.',
    '- Não use [to do], TODO, URLs placeholder nem links com "to do" ou slug falso.',
    '- Responda só com Markdown válido, sem preâmbulo.',
  ].join('\n'),
  es: [
    'Generas README en Markdown para repositorios en GitHub.',
    'Reglas estrictas:',
    '- No uses enlaces Markdown [texto](url) para licencia, badges, capturas ni ningún dato ausente del JSON de contexto. No inventes URLs.',
    '- Si falta algo o debe aportarlo el usuario (licencia, URL de demo, variables de entorno, etc.), devuelve exactamente una línea completa: README_FORGE_AVISO:field:mensaje breve',
    '  donde field es uno de: name, description, homepage, languages, topics, extraContext.',
    '- No uses [to do], TODO, URLs placeholder ni enlaces con "to do" o slugs falsos.',
    '- Responde solo con Markdown válido, sin preámbulo.',
  ].join('\n'),
};

const CONTEXT_LABEL: Record<ReadmeLocale, string> = {
  en: 'Context as JSON:',
  'pt-BR': 'Contexto em JSON:',
  es: 'Contexto en JSON:',
};

function getClient(): Groq {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error('ENV_KEY');
  return new Groq({
    apiKey: key,
    dangerouslyAllowBrowser: true,
  });
}

export async function generateReadmeStream(
  form: GeneratorFormData,
  readmeLocale: ReadmeLocale,
  onChunk: (s: string) => void,
): Promise<void> {
  const client = getClient();
  const instruction = buildInstructionBlock(form.projectType, form.tone, readmeLocale);

  const userPayload = {
    projectData: form.projectData,
    projectType: form.projectType,
    tone: form.tone,
    extraContext: form.extraContext ?? '',
  };

  const system = SYSTEM_PROMPTS[readmeLocale];
  const contextLabel = CONTEXT_LABEL[readmeLocale];

  const stream = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `${instruction}\n\n${contextLabel}\n${JSON.stringify(userPayload, null, 2)}`,
      },
    ],
  });

  for await (const chunk of stream) {
    const piece = chunk.choices[0]?.delta?.content ?? '';
    if (piece) onChunk(piece);
  }
}
