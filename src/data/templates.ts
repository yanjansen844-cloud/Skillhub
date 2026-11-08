import type { ContentBlock } from '../types';

export interface ProjectTemplate {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  badge: string;
  data: {
    name: string;
    slug: string;
    pageTitle: string;
    description: string;
    blocks: ContentBlock[];
  };
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    title: 'Projeto em Branco',
    subtitle: 'Começar do Zero',
    description: 'Configure campos limpos e adicione blocos livremente.',
    category: 'Geral',
    badge: 'Em branco',
    data: {
      name: '',
      slug: '',
      pageTitle: '',
      description: '',
      blocks: [],
    },
  },
  {
    id: 'audio-tools',
    title: '3 Ferramentas de Som & Áudio',
    subtitle: 'Baseada na Referência GOAT',
    description: 'Estrutura completa com 3 ferramentas IA de áudio, prompt de locução e link de pack SFX.',
    category: 'Áudio & Vídeo',
    badge: 'Mais Popular',
    data: {
      name: '3 Ferramentas de Som com IA',
      slug: '3-ferramentas-som-novo',
      pageTitle: '3 Ferramentas de Som com IA para Criadores',
      description: 'Os melhores recursos e prompts revelados no vídeo para você transformar o áudio dos seus vídeos no Instagram e TikTok em produções cinematográficas.',
      blocks: [
        {
          id: 'temp-a1',
          type: 'text',
          title: 'Bem-vindo ao pacote de recursos!',
          content: 'Aqui estão todas as ferramentas e o prompt mestre que mostrei no vídeo. Salve esta página nos favoritos!',
        },
        {
          id: 'temp-a2',
          type: 'tool',
          name: 'ElevenLabs',
          description: 'Geração de vozes hiper-realistas com inteligência artificial e clonagem vocal de alta fidelidade.',
          url: 'https://elevenlabs.io',
          category: 'Locução com IA',
          badge: 'Mais Popular',
        },
        {
          id: 'temp-a3',
          type: 'tool',
          name: 'LALAL.AI',
          description: 'Separador de faixas musicais e removedor de voz cirúrgico com qualidade profissional.',
          url: 'https://lalal.ai',
          category: 'Limpeza de Áudio',
          badge: 'Grátis para testar',
        },
        {
          id: 'temp-a4',
          type: 'prompt',
          title: 'Prompt Mestre: Direção Vocal & Retenção',
          promptText: `Você é um diretor de locução e editor sênior de vídeos verticais.
Analise o seguinte roteiro:
[COLE SEU ROTEIRO AQUI]

Gere:
1. Marcações de pausas dramáticas de 0.5s a 1s para aumentar a retenção.
2. Palavras-chave que devem receber ênfase vocal.
3. Sugestão de efeito sonoro (SFX) para cada frase.`,
          instruction: 'Copie e cole este comando no ChatGPT ou Claude.',
          badge: 'Prompt Testado',
        },
        {
          id: 'temp-a5',
          type: 'link',
          title: 'Pack de Efeitos Sonoros Gratuitos (Drive)',
          description: 'Mais de 200 efeitos sonoros e transições sem royalties.',
          url: 'https://drive.google.com',
          badge: 'Download Grátis',
          highlighted: true,
        },
      ],
    },
  },
  {
    id: 'viral-scripts',
    title: 'Roteiros & Ganchos Virais',
    subtitle: 'Fórmula de Alta Retenção',
    description: 'Prompts psicológicos de 3 segundos, ferramentas de corte automático e templates no Notion.',
    category: 'Copywriting',
    badge: 'Viral',
    data: {
      name: 'Fórmula de Ganchos e Roteiros Virais',
      slug: 'ganchos-roteiros-virais',
      pageTitle: 'Ganchos Psicológicos para Vídeos Virais',
      description: 'A fórmula exata de 3 segundos para capturar a atenção imediata da sua audiência no TikTok e Reels.',
      blocks: [
        {
          id: 'temp-v1',
          type: 'text',
          title: 'Regra de Ouro',
          content: 'Se o espectador não for fisgado nos primeiros 2 segundos, ele desliza o vídeo. Use o prompt abaixo para criar aberturas irresistíveis.',
        },
        {
          id: 'temp-v2',
          type: 'prompt',
          title: 'Prompt: Gerador de 10 Ganchos Psicológicos',
          promptText: `Atue como um estrategista de conteúdo viral para TikTok.
Nicho: [INSERIR SEU NICHO]
Tema: [INSERIR TEMA DO VÍDEO]

Gere 10 ganchos de abertura irresistíveis com no máximo 12 palavras cada.`,
          instruction: 'Substitua as variáveis entre colchetes.',
          badge: 'Alta Retenção',
        },
        {
          id: 'temp-v3',
          type: 'tool',
          name: 'Opus Clip',
          description: 'Transforma vídeos longos em cortes verticais curtos com legendas animadas por IA.',
          url: 'https://opus.pro',
          category: 'Cortes Automáticos',
          badge: 'IA',
        },
      ],
    },
  },
  {
    id: 'carousel-design',
    title: 'Kit de Carrosséis & Design Instagram',
    subtitle: 'Social Media & Engajamento',
    description: 'Prompts de 7 slides, ferramentas de design ágil e templates prontos.',
    category: 'Design & Social',
    badge: 'Instagram',
    data: {
      name: 'Kit de Carrosséis para Instagram',
      slug: 'carrosseis-instagram-ia',
      pageTitle: 'Como Criar Carrosséis Virais em Minutos',
      description: 'Fluxo rápido para produzir 10 carrosséis por semana com auxílio de IA.',
      blocks: [
        {
          id: 'temp-c1',
          type: 'text',
          title: 'Estrutura dos Slides',
          content: 'Slide 1: Gancho visual. Slides 2 a 6: Uma dica prática por slide. Slide 7: Chamada para salvar.',
        },
        {
          id: 'temp-c2',
          type: 'prompt',
          title: 'Prompt para Roteiro de Carrossel',
          promptText: `Escreva o texto exato para um carrossel de 7 slides sobre [SEU ASSUNTO].
Público: [PÚBLICO-ALVO]
Use frases curtas e objetivas.`,
          badge: 'Instagram',
        },
        {
          id: 'temp-c3',
          type: 'tool',
          name: 'Canva Pro',
          description: 'Crie múltiplos formatos em lote com recursos inteligentes.',
          url: 'https://canva.com',
          category: 'Design Rápido',
          badge: 'Essencial',
        },
      ],
    },
  },
];

