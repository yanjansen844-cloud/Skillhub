// URLs públicas sempre derivadas do domínio onde o app está rodando (Vercel, domínio próprio, localhost)
export const publicHost = (): string => window.location.host;
export const publicUrl = (slug: string): string => `${window.location.origin}/p/${slug}`;
