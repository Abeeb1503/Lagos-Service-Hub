export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container-xl py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm">© {new Date().getFullYear()} Lagos Service Hub</div>
        <nav className="text-sm flex items-center gap-4">
          <a href="#" className="hover:text-primary">
            Terms
          </a>
          <a href="#" className="hover:text-primary">
            Privacy
          </a>
          <a href="#" className="hover:text-primary">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  )
}

