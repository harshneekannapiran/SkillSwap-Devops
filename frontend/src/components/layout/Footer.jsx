import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-container px-6 py-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold flex items-center justify-center">
              S
            </div>
            <span className="text-sm font-semibold text-text-primary">SkillSwap</span>
          </div>
          <p className="text-xs text-text-secondary max-w-md">
            Connecting students and alumni for skill-sharing, mentorship, and career growth.
          </p>
          <div className="flex gap-6 text-xs text-text-secondary">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="text-xs text-text-secondary">
            © {new Date().getFullYear()} SkillSwap. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

