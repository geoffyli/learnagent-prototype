import { useReducedMotion } from 'framer-motion';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Users, Award } from 'lucide-react';
import { MOTION_DURATION, springFor } from '../motion/tokens';
import { fadeSlideY, staggerContainer } from '../motion/variants';
import type { CoursePackageConfig } from '../types/course-package';
import type { CourseCommunityData } from '../types/course-community';

interface CourseDetailPageProps {
  pkg: CoursePackageConfig;
  community: CourseCommunityData;
  onStartCourse: () => void;
  onBack: () => void;
}

function StarRow({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${cls} ${i < Math.round(score) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function CourseDetailPage({ pkg, community, onStartCourse, onBack }: CourseDetailPageProps) {
  const rm = useReducedMotion() ?? false;

  const totalMinutes = pkg.skillNodes.reduce((sum, n) => sum + (n.estimatedMinutes ?? 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 text-gray-900"
      variants={staggerContainer(rm, 0.07, 0.02)}
      initial="hidden"
      animate="visible"
    >
      {/* Top nav */}
      <motion.header
        className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm"
        variants={fadeSlideY(rm, 8, MOTION_DURATION.slow)}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <p className="font-heading text-xl font-semibold tracking-tight text-gray-900">Knovia</p>
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={rm ? undefined : { y: -1 }}
            whileTap={rm ? undefined : { scale: 0.98 }}
            transition={springFor(rm, 'snappy')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-blue-300 hover:text-blue-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </motion.button>
        </div>
      </motion.header>

      {/* Hero banner */}
      <motion.div
        className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-10"
        variants={fadeSlideY(rm, 12, MOTION_DURATION.slow)}
      >
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-200">Course</p>
          <h1 className="text-3xl font-bold text-white">{pkg.title}</h1>
          <p className="mt-2 text-base text-blue-100">{pkg.subtitle}</p>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-blue-100">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 opacity-80" />
              {community.learnerCount.toLocaleString()} learners
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 opacity-80" />
              {community.completionCount.toLocaleString()} completions
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 opacity-80" />
              ~{totalHours} hrs
            </span>
          </div>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <StarRow score={community.rating.score} />
            <span className="text-sm font-semibold text-white">{community.rating.score}</span>
            <span className="text-sm text-blue-200">({community.rating.count.toLocaleString()} reviews)</span>
          </div>
        </div>
      </motion.div>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6 pb-12">

        {/* CTA card */}
        <motion.div
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          variants={fadeSlideY(rm, 10, MOTION_DURATION.slow)}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Ready to start?</p>
              <p className="mt-0.5 text-xs text-gray-400">{pkg.skillNodes.length} skills · ~{totalMinutes} min total</p>
            </div>
            <motion.button
              type="button"
              onClick={onStartCourse}
              whileHover={rm ? undefined : { y: -1 }}
              whileTap={rm ? undefined : { scale: 0.98 }}
              transition={springFor(rm, 'snappy')}
              className="shrink-0 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              Start Course
            </motion.button>
          </div>
        </motion.div>

        {/* Section — Skill path */}
        <motion.div
          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          variants={fadeSlideY(rm, 10, MOTION_DURATION.slow)}
        >
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">What you will learn</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pkg.skillNodes.map((node, i) => (
              <div key={node.id} className="flex items-start gap-4 px-5 py-3.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{node.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{node.description}</p>
                </div>
                {node.estimatedMinutes != null && (
                  <span className="shrink-0 text-xs text-gray-400">{node.estimatedMinutes} min</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section — Creator */}
        <motion.div
          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          variants={fadeSlideY(rm, 10, MOTION_DURATION.slow)}
        >
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">About the Creator</h2>
          </div>
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {community.creator.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{community.creator.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{community.creator.bio}</p>
            </div>
          </div>
        </motion.div>

        {/* Section — Reviews */}
        <motion.div
          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          variants={fadeSlideY(rm, 10, MOTION_DURATION.slow)}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Learner Reviews
            </h2>
            <div className="flex items-center gap-1.5">
              <StarRow score={community.rating.score} size="sm" />
              <span className="text-xs font-semibold text-gray-700">{community.rating.score}</span>
              <span className="text-xs text-gray-400">/ 5</span>
            </div>
          </div>
          <motion.div
            className="divide-y divide-gray-100"
            variants={staggerContainer(rm, 0.06, 0.04)}
            initial="hidden"
            animate="visible"
          >
            {community.comments.map((comment) => (
              <motion.div
                key={comment.id}
                variants={fadeSlideY(rm, 6, MOTION_DURATION.fast)}
                className="px-5 py-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {comment.authorInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{comment.authorName}</span>
                      <span className="text-xs text-gray-400">{comment.daysAgo}</span>
                    </div>
                    <StarRow score={5} size="sm" />
                  </div>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-gray-600">{comment.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="pt-2"
          variants={fadeSlideY(rm, 10, MOTION_DURATION.slow)}
        >
          <motion.button
            type="button"
            onClick={onStartCourse}
            whileHover={rm ? undefined : { y: -1 }}
            whileTap={rm ? undefined : { scale: 0.98 }}
            transition={springFor(rm, 'snappy')}
            className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
          >
            Start Course
          </motion.button>
        </motion.div>
      </main>
    </motion.div>
  );
}
