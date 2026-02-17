export interface WidgetConfig {
  id: string;
  visible: boolean;
  order: number;
  colSpan?: number;
}

export type ActivityType =
  | 'contribution'
  | 'event'
  | 'news'
  | 'blog_article'
  | 'knowledge_entry';

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  title: string;
  date: string;
  link: string;
  metadata?: Record<string, unknown>;
}
