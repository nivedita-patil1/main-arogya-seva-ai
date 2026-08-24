import Navbar from "./components/Navbar"
import Services from "./components/Services"
import AIAssistant from "./components/AIAssistant"
import heroImage from "./assets/hero.png"

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      <Navbar />

      {/* HERO SECTION */}
      <section
        id="home"
        className="bg-gradient-to-br from-teal-50 via-white to-green-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">

          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Hero Content */}
            <div>

              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🤖 AI-Powered Healthcare
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
                Your Health,
                <span className="block text-teal-600">
                  Our Intelligence
                </span>
              </h1>

              <p className="text-lg text-gray-600 mt-6 max-w-xl leading-relaxed">
                ArogyaSeva AI is your smart healthcare companion.
                Get personalized health information, symptom guidance,
                and AI-powered assistance anytime, anywhere.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">

                <button
                  onClick={() =>
                    document
                      .getElementById("assistant")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-teal-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-teal-700 transition shadow-lg"
                >
                  🤖 Ask AI Assistant
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("services")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="border-2 border-teal-600 text-teal-600 px-7 py-3.5 rounded-xl font-semibold hover:bg-teal-50 transition"
                >
                  Explore Services
                </button>

              </div>

              {/* Small Trust Info */}
              <div className="flex flex-wrap gap-6 mt-8 text-sm text-gray-500">
                <span>🛡 Privacy Focused</span>
                <span>⚡ Fast Assistance</span>
                <span>💚 Easy to Use</span>
              </div>

            </div>

            {/* Hero Image */}
            <div className="flex justify-center">

              <div className="relative">

                <div className="absolute inset-0 bg-teal-200 rounded-full blur-3xl opacity-30">
                </div>

                <img
                  src={heroImage}
                  alt="ArogyaSeva AI healthcare"
                  className="relative w-full max-w-lg rounded-3xl shadow-2xl"
                />

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* SERVICES SECTION */}
      <section id="services" className="py-20 bg-white">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">

            <p className="text-teal-600 font-semibold mb-2">
              OUR SERVICES
            </p>

            <h2 className="text-4xl font-bold text-gray-900">
              Healthcare Made Smarter
            </h2>

            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Explore our AI-powered healthcare services designed
              to make healthcare information easier and more accessible.
            </p>

          </div>

          <Services />

        </div>

      </section>


      {/* AI ASSISTANT SECTION */}
      <section
        id="assistant"
        className="py-20 bg-gradient-to-br from-teal-50 to-green-50"
      >

        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-10">

            <p className="text-teal-600 font-semibold mb-2">
              AI HEALTH ASSISTANT
            </p>

            <h2 className="text-4xl font-bold text-gray-900">
              Ask ArogyaSeva AI
            </h2>

            <p className="text-gray-600 mt-4">
              Get intelligent healthcare guidance whenever you need it.
            </p>

          </div>

          <AIAssistant />

        </div>

      </section>


      {/* WHY CHOOSE US */}
      <section id="about" className="py-20 bg-white">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">

            <p className="text-teal-600 font-semibold mb-2">
              WHY AROGYASEVA AI?
            </p>

            <h2 className="text-4xl font-bold">
              Healthcare At Your Fingertips
            </h2>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="p-6 rounded-2xl bg-teal-50 border border-teal-100">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2">
                Privacy Focused
              </h3>
              <p className="text-gray-600">
                Designed with user privacy and responsible healthcare
                assistance in mind.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">
                AI Powered
              </h3>
              <p className="text-gray-600">
                Intelligent technology helps provide quick and useful
                healthcare information.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="text-3xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">
                Easy To Use
              </h3>
              <p className="text-gray-600">
                A simple and friendly interface designed for everyone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100">
              <div className="text-3xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-2">
                Available Anytime
              </h3>
              <p className="text-gray-600">
                Access your healthcare assistant whenever you need it.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer
        id="contact"
        className="bg-gray-900 text-white py-12"
      >

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid md:grid-cols-3 gap-10">

            <div>
              <h2 className="text-2xl font-bold text-teal-400">
                ArogyaSeva AI 🏥
              </h2>

              <p className="text-gray-400 mt-4 max-w-sm">
                Your intelligent healthcare companion for accessible
                and smarter healthcare assistance.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">
                Quick Links
              </h3>

              <div className="space-y-2 text-gray-400">

                <a href="#home" className="block hover:text-white">
                  Home
                </a>

                <a href="#services" className="block hover:text-white">
                  Services
                </a>

                <a href="#assistant" className="block hover:text-white">
                  AI Assistant
                </a>

                <a href="#about" className="block hover:text-white">
                  About Us
                </a>

              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">
                Contact
              </h3>

              <p className="text-gray-400">
                📧 support@arogyaseva.ai
              </p>

              <p className="text-gray-400 mt-2">
                📍 India
              </p>
            </div>

          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500">
            © 2026 ArogyaSeva AI. All rights reserved.
          </div>

        </div>

      </footer>

    </div>
  )
}

export default App