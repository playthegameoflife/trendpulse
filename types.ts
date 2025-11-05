export interface Topic {
  id: string;
  name: string;
  category: string;
  description: string;
  growth: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}
