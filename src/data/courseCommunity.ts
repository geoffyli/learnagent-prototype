import type { CourseCommunityData } from '../types/course-community';

export const COURSE_COMMUNITY: Record<string, CourseCommunityData> = {
  'pkg-data-analyst-job-sprint': {
    packageId: 'pkg-data-analyst-job-sprint',
    learnerCount: 1847,
    completionCount: 934,
    rating: { score: 4.8, outOf: 5, count: 412 },
    creator: {
      initials: 'KN',
      name: 'Knovia Team',
      bio: 'Designed by the Knovia Team in collaboration with hiring managers and senior analysts at B2C tech companies. Every node maps to a real interview signal.',
    },
    comments: [
      {
        id: 'c1',
        authorInitials: 'SK',
        authorName: 'Sarah K.',
        daysAgo: '2 days ago',
        text: 'The SQL section finally made window functions click for me. The interview case simulation at the end was exactly what I needed — landed my offer two weeks after finishing.',
      },
      {
        id: 'c2',
        authorInitials: 'TN',
        authorName: 'Tom N.',
        daysAgo: '5 days ago',
        text: 'A/B guardrail metrics were something I always glossed over. This sprint forced me to reason through them step by step. Really practical framing for interview questions.',
      },
      {
        id: 'c3',
        authorInitials: 'VG',
        authorName: 'Vanessa G.',
        daysAgo: '1 week ago',
        text: 'Dashboard storytelling changed how I present data at work. The recommendation-first structure is something I now use in every team sync.',
      },
      {
        id: 'c4',
        authorInitials: 'RW',
        authorName: 'Ryan W.',
        daysAgo: '2 weeks ago',
        text: 'The case simulation felt like a real interview. I got challenged on my assumptions and had to defend my metric choices — that pressure is exactly what you need to prepare.',
      },
      {
        id: 'c5',
        authorInitials: 'HM',
        authorName: 'Hannah M.',
        daysAgo: '1 month ago',
        text: 'Finished the full sprint in 6 weeks while working full-time. The skill graph kept me focused — I always knew exactly what to do next without feeling overwhelmed.',
      },
    ],
  },
  'pkg-sat-exam-prep': {
    packageId: 'pkg-sat-exam-prep',
    learnerCount: 2341,
    completionCount: 1156,
    rating: { score: 4.9, outOf: 5, count: 587 },
    creator: {
      initials: 'KN',
      name: 'Knovia Team',
      bio: 'Designed by the Knovia Team in collaboration with Digital SAT tutoring experts. Every skill node maps to a real College Board domain and adaptive scoring strategy.',
    },
    comments: [
      {
        id: 'c1',
        authorInitials: 'MJ',
        authorName: 'Maya J.',
        daysAgo: '1 day ago',
        text: 'The reasoning error diagnosis changed everything. I went from randomly reviewing wrong answers to understanding WHY I kept picking plausible-but-wrong choices. Score jumped 140 points in 5 weeks.',
      },
      {
        id: 'c2',
        authorInitials: 'AK',
        authorName: 'Alex K.',
        daysAgo: '3 days ago',
        text: 'Understanding the adaptive module system was a game-changer. Once I focused on Module 1 accuracy instead of speed, my total score jumped 80 points.',
      },
      {
        id: 'c3',
        authorInitials: 'LP',
        authorName: 'Lily P.',
        daysAgo: '1 week ago',
        text: 'The strategy cards are nothing like Quizlet. Each one teaches a reasoning PROCESS — like the delete-the-clause trick for grammar. I use these patterns on every practice test now.',
      },
      {
        id: 'c4',
        authorInitials: 'DR',
        authorName: 'Daniel R.',
        daysAgo: '2 weeks ago',
        text: 'The score diagnosis told me exactly where my 200-point gap lived. Turned out 60 points were in grammar rules I could learn in two weeks. Best ROI of any test prep I have tried.',
      },
    ],
  },
};
