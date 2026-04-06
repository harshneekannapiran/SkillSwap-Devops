import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="mx-auto max-w-5xl px-6 w-full">
          <div className="text-center">
            {/* Logo and Branding */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary text-white text-2xl font-bold shadow-lg">
                S
              </div>
              <h1 className="mt-3 text-4xl font-bold text-text-primary">
                Skill<span className="text-primary">Swap</span>
              </h1>
              <p className="mt-2 text-lg text-text-secondary max-w-xl mx-auto">
                Connect • Learn • Grow Together
              </p>
            </div>

            {/* Description */}
            <div className="mt-6 max-w-2xl mx-auto">
              <p className="text-base text-text-secondary leading-relaxed">
                SkillSwap is your exclusive network where students and alumni connect for 
                <span className="font-semibold text-primary"> skill-sharing</span>, 
                <span className="font-semibold text-primary"> mentorship</span>, and 
                <span className="font-semibold text-primary"> career opportunities</span>.
              </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth?mode=register"
                className="group relative px-6 py-3 bg-primary text-white text-base font-semibold rounded-lg shadow-lg hover:bg-indigo-600 transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/auth?mode=login"
                className="px-6 py-3 border-2 border-primary text-primary text-base font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-200 hover:scale-105"
              >
                Sign In
              </Link>
            </div>

            {/* Features Preview */}
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-card backdrop-blur-sm border border-border">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H9m0 0l3-3m0 0l-3 3" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">Find Mentors</h3>
                <p className="text-sm text-text-secondary">Connect with alumni for 1:1 guidance and career advice</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-card backdrop-blur-sm border border-border">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.071 0l.707-.707M12 3a4 4 0 00-4 4v1" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">Share Skills</h3>
                <p className="text-sm text-text-secondary">Offer your expertise and help others grow</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-card backdrop-blur-sm border border-border">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A7.977 7.977 0 0112 15.901c0 2.714-.712 5.247-2.037 6.782a7.977 7.977 0 01-6.782 2.037C3.712 14.632 3 12.155 3 9.155a7.977 7.977 0 012.037 6.782c1.325 1.535 2.037 3.068 2.037 6.746 0 5.247-.712 6.782-2.037l1.726-1.726a1 1 0 01.707-.293z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">Grow Career</h3>
                <p className="text-sm text-text-secondary">Discover opportunities and accelerate your professional journey</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

