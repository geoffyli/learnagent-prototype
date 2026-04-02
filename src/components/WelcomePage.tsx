import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MOTION_DURATION } from '../motion/tokens';
import { fadeSlideY, staggerContainer } from '../motion/variants';

export interface WorkspaceSummary {
  id: string;
  title: string;
  packageTitle: string;
  origin: 'custom' | 'package';
  lastVisitedAt: number;
}

export interface CoursePackageOption {
  id: string;
  title: string;
  subtitle: string;
}

interface WelcomePageProps {
  sessions: WorkspaceSummary[];
  coursePackages: CoursePackageOption[];
  onOpenSession: (sessionId: string) => void;
  onCreateCustomSession: (title?: string) => void;
  onStartPackageSession: (coursePackageId: string) => void;
  onOpenCreatorStudio: () => void;
}

export default function WelcomePage({
  sessions,
  coursePackages,
  onOpenSession,
  onCreateCustomSession,
  onStartPackageSession,
  onOpenCreatorStudio: _onOpenCreatorStudio,
}: WelcomePageProps) {
  const reducedMotion = useReducedMotion() ?? false;

  // Keep onOpenCreatorStudio callable via prop but do not render a button for it
  void _onOpenCreatorStudio;

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.lastVisitedAt - a.lastVisitedAt),
    [sessions],
  );

  return (
    <motion.div
      className="min-h-screen px-4 py-6 text-slate-900"
      variants={staggerContainer(reducedMotion, 0.09, 0.03)}
      initial="hidden"
      animate="visible"
    >
      <motion.main
        className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center"
        variants={fadeSlideY(reducedMotion, 10, MOTION_DURATION.slow)}
      >
        <div className="mb-8">
          <p className="font-heading text-3xl font-semibold tracking-tight text-slate-900">LearnAgent</p>
        </div>

        <div className="mx-auto max-w-2xl space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-heading text-lg font-semibold text-slate-800">Course Packages</p>
            <p className="mt-1 text-sm text-slate-600">Click a package to see details and start.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {coursePackages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onStartPackageSession(item.id)}
                  className="group rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-teal-300 hover:bg-teal-50/50"
                >
                  <p className="text-base font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-[13px] text-slate-600">{item.subtitle}</p>
                </button>
              ))}
            </div>
          </section>

          {sortedSessions.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3 text-base font-medium text-slate-700">
                Your Custom Sessions
              </div>
              <motion.div
                className="divide-y divide-slate-100"
                variants={staggerContainer(reducedMotion, 0.05, 0.02)}
                initial="hidden"
                animate="visible"
              >
                {sortedSessions.map((session) => (
                  <motion.button
                    key={session.id}
                    type="button"
                    onClick={() => onOpenSession(session.id)}
                    variants={fadeSlideY(reducedMotion, 6, MOTION_DURATION.fast)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50/80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-slate-900">{session.title}</p>
                      <p className="mt-0.5 truncate text-[13px] text-slate-600">{session.packageTitle}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </section>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => onCreateCustomSession()}
              className="text-sm text-slate-500 transition hover:text-teal-600"
            >
              Or create a custom session with your own materials
            </button>
          </div>
        </div>
      </motion.main>
    </motion.div>
  );
}
