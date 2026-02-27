import { FormEvent, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { MOTION_DURATION, springFor, tweenFor } from '../motion/tokens';
import { fadeSlideY, staggerContainer } from '../motion/variants';

export interface WorkspaceSummary {
  id: string;
  title: string;
  lastVisitedAt: number;
}

interface WelcomePageProps {
  sessions: WorkspaceSummary[];
  onOpenSession: (sessionId: string) => void;
  onCreateSession: (title?: string) => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function WelcomePage({ sessions, onOpenSession, onCreateSession }: WelcomePageProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [titleInput, setTitleInput] = useState('');

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.lastVisitedAt - a.lastVisitedAt),
    [sessions],
  );

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = titleInput.trim();
    onCreateSession(trimmed || undefined);
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
        className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col justify-center"
        variants={fadeSlideY(reducedMotion, 10, MOTION_DURATION.slow)}
      >
        <p className="mb-8 text-center font-heading text-3xl font-semibold tracking-tight text-slate-900">
          LearnAgent
        </p>

        <form className="mx-auto w-full max-w-2xl" onSubmit={handleCreate}>
          <div className="flex min-h-12 items-center rounded-2xl border border-slate-200 bg-white px-2 shadow-sm">
            <input
              id="new-session-title"
              value={titleInput}
              onChange={(event) => setTitleInput(event.target.value)}
              placeholder="Create a new session..."
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

        <section className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-medium text-slate-500">
            Existing sessions
          </div>

          {sortedSessions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No sessions yet.</p>
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
                  <span className="truncate text-sm font-medium text-slate-900">{session.title}</span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {formatDate(session.lastVisitedAt)}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </section>
      </motion.main>
    </motion.div>
  );
}
