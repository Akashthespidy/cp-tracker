
import { startOfMonth, subMonths, format } from 'date-fns';

export type Platform = 'Codeforces' | 'LeetCode' | 'CodeChef' | 'AtCoder';

export interface UserProfile {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  avatar: string;
}

export interface ProblemStats {
  difficulty: string;
  count: number;
  color: string;
}

export interface ContestResult {
  contestName: string;
  rank: number;
  ratingChange: number;
  newRating: number;
  date: string;
}

export interface Recommendation {
  title: string;
  difficulty: number | string;
  link: string;
  tags: string[];
}

export const getMockProfile = (platform: Platform, handle: string): UserProfile => {
  switch (platform) {
    case 'Codeforces':
      return {
        handle,
        rating: 1200,
        maxRating: 1450,
        rank: 'Pupil',
        avatar: 'https://github.com/shadcn.png',
      };
    case 'LeetCode':
      return {
        handle,
        rating: 1540,
        maxRating: 1600,
        rank: 'Guardian',
        avatar: 'https://github.com/shadcn.png',
      };
    case 'CodeChef':
      return {
        handle,
        rating: 1400,
        maxRating: 1600,
        rank: '2 Star',
        avatar: 'https://github.com/shadcn.png',
      };
    case 'AtCoder':
      return {
        handle,
        rating: 600,
        maxRating: 850,
        rank: 'Brown',
        avatar: 'https://github.com/shadcn.png',
      };
    default:
      return {
        handle,
        rating: 1000,
        maxRating: 1000,
        rank: 'Newbie',
        avatar: 'https://github.com/shadcn.png',
      };
  }
};

export const getRatingHistory = (platform: Platform) => {
  const history = [];
  let currentRating = platform === 'Codeforces' ? 1000 : platform === 'LeetCode' ? 1400 : 1200;
  
  for (let i = 6; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const change = Math.floor(Math.random() * 100) - 30;
    currentRating += change;
    history.push({
      date: format(date, 'MMM yyyy'),
      rating: currentRating,
    });
  }
  return history;
};

export const getProblemStats = (platform: Platform): ProblemStats[] => {
  switch (platform) {
    case 'Codeforces':
      return [
        { difficulty: '800-1000', count: 120, color: '#8884d8' }, // Gray/Green
        { difficulty: '1000-1200', count: 80, color: '#82ca9d' }, // Cyan
        { difficulty: '1200-1400', count: 45, color: '#ffc658' }, // Blue
        { difficulty: '1400+', count: 10, color: '#ff8042' },   // Purple
      ];
    case 'LeetCode':
      return [
        { difficulty: 'Easy', count: 200, color: '#00b8a3' },
        { difficulty: 'Medium', count: 150, color: '#ffc01e' },
        { difficulty: 'Hard', count: 30, color: '#ff375f' },
      ];
    case 'CodeChef':
      return [
        { difficulty: 'Beginner', count: 50, color: '#6A5ACD' },
        { difficulty: '1 Star', count: 40, color: '#20B2AA' },
        { difficulty: '2 Star', count: 30, color: '#FFD700' },
        { difficulty: '3 Star', count: 10, color: '#FF4500' },
      ];
    case 'AtCoder':
       return [
        { difficulty: 'A', count: 150, color: '#808080' },
        { difficulty: 'B', count: 100, color: '#008000' },
        { difficulty: 'C', count: 40, color: '#00C0C0' },
        { difficulty: 'D', count: 5, color: '#0000FF' },
      ];
    default: 
      return [];
  }
};

export const getRecentContests = (platform: Platform): ContestResult[] => {
  return Array.from({ length: 5 }).map((_, i) => ({
    contestName: `${platform} Round #${900 + i}`,
    rank: Math.floor(Math.random() * 5000) + 100,
    ratingChange: Math.floor(Math.random() * 100) - 40,
    newRating: 1200 + (i * 20),
    date: format(subMonths(new Date(), i), 'yyyy-MM-dd'),
  }));
};

export const getRecommendations = (platform: Platform, currentRating: number): Recommendation[] => {
   // Mock logic: suggest slightly harder problems
   const base = platform === 'LeetCode' ? 0 : currentRating;
   
   if (platform === 'LeetCode') {
     return [
       { title: 'Two Sum', difficulty: 'Easy', link: '#', tags: ['Array', 'Hash Table'] },
       { title: 'Add Two Numbers', difficulty: 'Medium', link: '#', tags: ['LinkedList', 'Math'] },
       { title: 'LRU Cache', difficulty: 'Medium', link: '#', tags: ['Design', 'Hash Table'] },
     ];
   }

   return [
     { title: 'Problem A', difficulty: base + 100, link: '#', tags: ['Implementation', 'Math'] },
     { title: 'Problem B', difficulty: base + 200, link: '#', tags: ['DP', 'Greedy'] },
     { title: 'Problem C', difficulty: base + 300, link: '#', tags: ['Graphs', 'DFS'] },
   ];
}
