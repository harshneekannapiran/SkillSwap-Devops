import { Link } from 'react-router-dom'

export function HeroSection() {
  return (
    <section className="grid gap-10 md:grid-cols-2 md:items-center">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Designed for students &amp; alumni
        </p>
        <h1 className="mt-3 text-5xl font-bold leading-tight text-text-primary tracking-tight">
          Exchange skills, get mentorship, and grow together.
        </h1>
        <p className="mt-4 text-base text-text-secondary max-w-xl">
          SkillSwap is a private network where students and alumni connect for
          skill-sharing sessions, structured mentorship, and real internship and
          job opportunities.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/auth"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-card shadow-sm hover:bg-indigo-600 transition-colors"
          >
            Get started
          </Link>
          <Link
            to="/mentorship"
            className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            Explore mentors
          </Link>
        </div>
        <div className="mt-6 grid gap-4 text-sm text-text-secondary sm:grid-cols-3">
          <div>
            <p className="font-semibold text-text-primary">Mentorship</p>
            <p>1:1 sessions, portfolio reviews, and career guidance.</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Skill marketplace</p>
            <p>Offer what you know, learn what you need.</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Opportunities</p>
            <p>Jobs, internships, and workshops from alumni.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center md:justify-end">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md hover:scale-[1.01]">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Live campus network</span>
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-600">
              Beta
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg bg-background px-3 py-3">
              <p className="text-xs font-medium text-text-secondary">
                Mentorship match
              </p>
              <p className="mt-1 text-text-primary">
                You&apos;re matched with{' '}
                <span className="font-semibold">Ananya (Alumni · SDE)</span> for
                a 45 min session on system design.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-dashed border-border px-3 py-3 text-xs text-text-secondary">
                <p className="font-semibold text-text-primary">
                  Internship opportunity
                </p>
                <p className="mt-1">
                  Alumni at WavePay posted a summer internship for frontend
                  engineers.
                </p>
              </div>
              <div className="rounded-lg border border-border px-3 py-3 text-xs text-text-secondary">
                <p className="font-semibold text-text-primary">Upcoming event</p>
                <p className="mt-1">
                  Resume clinic: &quot;Breaking into product roles&quot; this
                  Friday.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-background px-3 py-2.5 text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">
                120+ active mentors
              </span>{' '}
              are reviewing requests this week.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

