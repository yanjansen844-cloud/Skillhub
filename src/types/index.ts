export type BlockType = 'text' | 'prompt' | 'link' | 'tool';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  title?: string;
  content: string;
}

export interface PromptBlock extends BaseBlock {
  type: 'prompt';
  title: string;
  promptText: string;
  instruction?: string;
  badge?: string;
}

export interface LinkBlock extends BaseBlock {
  type: 'link';
  title: string;
  url: string;
  description?: string;
  badge?: string;
  highlighted?: boolean;
}

export interface ToolBlock extends BaseBlock {
  type: 'tool';
  name: string;
  description: string;
  url: string;
  category?: string;
  badge?: string; // e.g. "Grátis", "Freemium", "Web / App"
}

export type ContentBlock = TextBlock | PromptBlock | LinkBlock | ToolBlock;

export interface Project {
  id: string;
  name: string;
  slug: string;
  pageTitle: string;
  description: string;
  status: 'published' | 'draft';
  views: number;
  clicks: number;
  promptsCopied: number;
  createdAt: string;
  updatedAt: string;
  categoryBadge?: string;
  blocks: ContentBlock[];
}

export interface DashboardMetric {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  subtext: string;
}

export interface ChartDataPoint {
  date: string;
  views: number;
  clicks: number;
}

