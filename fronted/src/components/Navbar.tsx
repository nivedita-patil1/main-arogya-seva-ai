function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-sm">
      <h1 className="text-2xl font-bold text-blue-600">
        ArogyaSeva AI 🏥
      </h1>

      <div className="hidden md:flex gap-8 text-gray-700">
        <a href="#" className="hover:text-blue-600">
          Home
        </a>

        <a href="#" className="hover:text-blue-600">
          Services
        </a>

        <a href="#" className="hover:text-blue-600">
          AI Assistant
        </a>

        <a href="#" className="hover:text-blue-600">
          Doctors
        </a>
      </div>

      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
        Get Started
      </button>
    </nav>
  )
}

export default Navbar