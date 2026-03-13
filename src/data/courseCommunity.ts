import type { CourseCommunityData } from '../types/course-community';

export const COURSE_COMMUNITY: Record<string, CourseCommunityData> = {
  'pkg-data-analyst-job-sprint': {
    packageId: 'pkg-data-analyst-job-sprint',
    learnerCount: 1847,
    completionCount: 934,
    rating: { score: 4.8, outOf: 5, count: 412 },
    creator: {
      initials: 'LA',
      name: 'LearnAgent Team',
      bio: 'Designed by the LearnAgent Team in collaboration with hiring managers and senior analysts at B2C tech companies. Every node maps to a real interview signal.',
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
  'pkg-product-analyst-growth-sprint': {
    packageId: 'pkg-product-analyst-growth-sprint',
    learnerCount: 1103,
    completionCount: 521,
    rating: { score: 4.7, outOf: 5, count: 238 },
    creator: {
      initials: 'LA',
      name: 'LearnAgent Team',
      bio: 'Designed by the LearnAgent Team in collaboration with product managers and growth analysts at leading B2C tech companies. Every skill node reflects a real product analytics interview signal or on-the-job decision.',
    },
    comments: [
      {
        id: 'c1',
        authorInitials: 'CM',
        authorName: 'Chris M.',
        daysAgo: '1 day ago',
        text: 'The experiment readout module is incredibly well structured. I went from just reading p-values to framing trade-offs and making rollout recommendations. Game changer for PM interviews.',
      },
      {
        id: 'c2',
        authorInitials: 'LS',
        authorName: 'Lena S.',
        daysAgo: '4 days ago',
        text: 'Funnel and retention finally feel intuitive. The branching sessions let me go deep on specific drop-off stages without losing the big picture of the overall path.',
      },
      {
        id: 'c3',
        authorInitials: 'DO',
        authorName: 'David O.',
        daysAgo: '10 days ago',
        text: 'Narrative structure was the weak link in my analysis work. This sprint gave me a repeatable framework I now use for every stakeholder update.',
      },
      {
        id: 'c4',
        authorInitials: 'YB',
        authorName: 'Yara B.',
        daysAgo: '3 weeks ago',
        text: 'Event instrumentation basics was a topic I always avoided. The way this course walks through schema design and validation tracking made it approachable even without a data engineering background.',
      },
    ],
  },
};
