function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
      
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="text-3xl">💚</div>

        <div>
          <h1 className="text-2xl font-bold text-teal-600">
            ArogyaSeva AI
          </h1>
          <p className="text-xs text-gray-500">
            Your Health, Our Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
        <a
          href="#home"
          className="hover:text-teal-600 transition-colors"
        >
          Home
        </a>

        <a
          href="#services"
          className="hover:text-teal-600 transition-colors"
        >
          Services
        </a>

        <a
          href="#assistant"
          className="hover:text-teal-600 transition-colors"
        >
          AI Assistant
        </a>

        <a
          href="#about"
          className="hover:text-teal-600 transition-colors"
        >
          About Us
        </a>

        <a
          href="#contact"
          className="hover:text-teal-600 transition-colors"
        >
          Contact
        </a>
      </div>

      {/* Get Started */}
      <button className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all shadow-sm">
        Get Started
      </button>
    </nav>
  )
}

export default Navbar
