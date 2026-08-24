import Navbar from "./components/Navbar"
import Services from "./components/Services"
import AIAssistant from "./components/AIAssistant"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center px-6">

          <p className="text-blue-600 font-semibold mb-4">
            Your Health. Your Care. Your Future.
          </p>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to ArogyaSeva AI
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Your intelligent healthcare companion for personalized,
            accessible and smarter healthcare assistance.
          </p>

          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Talk to AI Assistant
            </button>

            <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50">
              Explore Services
            </button>
          </div>

        </div>
      </main>
      <Services/>
      <AIAssistant/>
    </div>
  )
}

export default App