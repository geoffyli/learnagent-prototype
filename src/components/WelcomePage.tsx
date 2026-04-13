import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TreePine, Sparkles, GitBranch } from 'lucide-react';
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
  domain?: string;
  stats?: string;
  accentColor?: string;
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
  onOpenCreatorStudio,
}: WelcomePageProps) {
  const reducedMotion = useReducedMotion() ?? false;

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.lastVisitedAt - a.lastVisitedAt),
    [sessions],
  );

  return (
    <motion.div
      className="min-h-screen px-4 py-6 text-gray-900"
      variants={staggerContainer(reducedMotion, 0.09, 0.03)}
      initial="hidden"
      animate="visible"
    >
      <motion.main
        className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center"
        variants={fadeSlideY(reducedMotion, 10, MOTION_DURATION.slow)}
      >
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-[72px] font-normal tracking-[-1.44px] text-[#0f172a] leading-[1]">Knovia</h1>
          <p className="text-lg font-normal text-[#64748b] mt-3 leading-[1.4]">Structured learning that adapts to you</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-medium text-[#64748b] flex items-center gap-1.5">
              <TreePine size={12} />
              Skill Trees
            </span>
            <span className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-medium text-[#64748b] flex items-center gap-1.5">
              <Sparkles size={12} />
              Rich Content
            </span>
            <span className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-medium text-[#64748b] flex items-center gap-1.5">
              <GitBranch size={12} />
              Side Explorations
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-4">
          <section className="rounded-[22px] border border-[#f1f5f9] bg-white p-6">
            <p className="font-heading text-2xl font-normal tracking-[-0.32px] text-[#0f172a]">Course Packages</p>
            <p className="mt-1 text-sm text-gray-600">Click a package to see details and start.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {coursePackages.map((item) => {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onStartPackageSession(item.id)}
                    className="group rounded-[22px] border border-[#f1f5f9] bg-white px-5 py-4 text-left transition-colors hover:border-[#2563eb]"
                  >
                    {item.domain && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e2e8f0] px-2 py-0.5 text-[11px] font-medium text-[#1e293b] mb-1.5">
                        {item.domain}
                      </span>
                    )}
                    <p className="text-base font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-[13px] text-gray-600">{item.subtitle}</p>
                    {item.stats && (
                      <p className="text-xs text-gray-400 mt-1.5">{item.stats}</p>
                    )}
                  </button>
                );
              })}

              {/* Build Your Own card */}
              <button
                type="button"
                onClick={onOpenCreatorStudio}
                className="group sm:col-span-2 flex flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-[#e2e8f0] bg-white px-3 py-4 text-center transition-colors hover:border-[#2563eb]"
              >
                <Sparkles size={20} className="text-[#64748b] group-hover:text-[#2563eb] transition-colors" />
                <div>
                  <p className="font-semibold text-gray-900">Build Your Own</p>
                  <p className="text-xs text-gray-500">Design a custom learning path</p>
                </div>
              </button>
            </div>
          </section>

          {sortedSessions.length > 0 && (
            <section className="rounded-[22px] border border-[#f1f5f9] bg-white">
              <div className="border-b border-[#f1f5f9] px-4 py-3 text-base font-medium text-gray-700">
                Your Custom Sessions
              </div>
              <motion.div
                className="divide-y divide-[#f1f5f9]"
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
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[#f1f5f9]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-gray-900">{session.title}</p>
                      <p className="mt-0.5 truncate text-[13px] text-gray-600">{session.packageTitle}</p>
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
              className="text-sm text-[#64748b] transition hover:text-[#2563eb]"
            >
              Or create a custom session with your own materials
            </button>
          </div>
        </div>
      </motion.main>
    </motion.div>
  );
}
