// Shared type for all LeetCode 150 problems
export interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  statement: string;
  solution: string;
  englishDesc: string;
  banglaDesc: string;
}

export interface Category {
  name: string;
  problems: Problem[];
}
