export interface CourseComment {
  id: string;
  authorInitials: string;
  authorName: string;
  daysAgo: string;
  text: string;
}

export interface CourseRating {
  score: number;
  outOf: number;
  count: number;
}

export interface CourseCreator {
  initials: string;
  name: string;
  bio: string;
}

export interface CourseCommunityData {
  packageId: string;
  learnerCount: number;
  completionCount: number;
  rating: CourseRating;
  creator: CourseCreator;
  comments: CourseComment[];
}
