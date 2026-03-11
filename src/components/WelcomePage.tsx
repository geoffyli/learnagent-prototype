import { FormEvent, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { MOTION_DURATION, springFor, tweenFor } from '../motion/tokens';
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

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function WelcomePage({
  sessions,
  coursePackages,
  onOpenSession,
  onCreateCustomSession,
  onStartPackageSession,
  onOpenCreatorStudio,
}: WelcomePageProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [titleInput, setTitleInput] = useState('');

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.lastVisitedAt - a.lastVisitedAt),
    [sessions],
  );

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = titleInput.trim();
    onCreateCustomSession(trimmed || undefined);
    setTitleInput('');
  };

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
        <div className="mb-8 flex items-center justify-between gap-3">
          <p className="font-heading text-3xl font-semibold tracking-tight text-slate-900">LearnAgent</p>
          <button
            type="button"
            onClick={onOpenCreatorStudio}
            className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
          >
            Open Creator Studio
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:min-h-[32rem]">
            <p className="font-heading text-lg font-semibold text-slate-800">Course Packages</p>
            <p className="mt-1 text-sm text-slate-600">Click a package to start right away.</p>
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

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:min-h-[32rem]">
            <form className="p-4" onSubmit={handleCreate}>
              <p className="font-heading text-lg font-semibold text-slate-800">Create Your Own Session</p>
              <p className="mt-1 text-sm text-slate-600">Use your own materials and learning goal.</p>

              <div className="mt-3 flex min-h-12 items-center rounded-2xl border border-slate-200 bg-white px-2">
                <input
                  id="new-session-title"
                  value={titleInput}
                  onChange={(event) => setTitleInput(event.target.value)}
                  placeholder="Create a custom session..."
                  className="h-11 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={reducedMotion ? undefined : { y: -1 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  transition={springFor(reducedMotion, 'snappy')}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Session
                </motion.button>
              </div>
            </form>

            <div className="border-t border-slate-100 px-4 py-3 text-base font-medium text-slate-700">
              Your Custom Sessions
            </div>

            {sortedSessions.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No custom sessions yet.</p>
            ) : (
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
                    whileHover={reducedMotion ? undefined : { backgroundColor: 'rgba(248,250,252,0.8)' }}
                    transition={tweenFor(reducedMotion, MOTION_DURATION.fast)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-slate-900">{session.title}</p>
                      <p className="mt-0.5 truncate text-[13px] text-slate-600">{session.packageTitle}</p>
                    </div>
                    <span className="shrink-0 text-[13px] text-slate-600">
                      {formatDate(session.lastVisitedAt)}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </section>
        </div>
      </motion.main>
    </motion.div>
  );
}
