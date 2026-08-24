import { useState } from "react"

type Message = {
  text: string
  sender: "user" | "ai"
}

function AIAssistant() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  const handleSend = () => {
    if (message.trim() === "") return

    const userMessage = message.trim()

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        text: userMessage,
        sender: "user",
      },
      {
        text: "Thanks for your question! I'm ArogyaSeva AI. I'm currently being connected to the AI service. 🤖",
        sender: "ai",
      },
    ])

    setMessage("")
  }

  return (
    <section className="bg-blue-50 px-6 py-20">
      <div className="mx-auto max-w-4xl">

        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="font-semibold text-blue-600">
            AI HEALTH ASSISTANT
          </p>

          <h2 className="mt-2 text-4xl font-bold text-gray-900">
            Talk to ArogyaSeva AI 🤖
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Ask health-related questions and get helpful AI-powered
            information anytime.
          </p>
        </div>

        {/* Chat Box */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">

          {/* AI Header */}
          <div className="flex items-center gap-4 border-b p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-2xl">
              🤖
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                ArogyaSeva AI
              </h3>

              <p className="text-sm text-green-600">
                ● Online
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="min-h-[250px] space-y-4 p-6">

            {/* Initial AI Message */}
            <div className="max-w-xl rounded-2xl rounded-tl-none bg-gray-100 p-4">
              <p className="text-gray-700">
                Hello! 👋 I'm ArogyaSeva AI. How can I help you today?
              </p>
            </div>

            {/* User and AI Messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-xl rounded-2xl p-4 ${
                  msg.sender === "user"
                    ? "ml-auto rounded-tr-none bg-blue-600 text-white"
                    : "rounded-tl-none bg-gray-100 text-gray-700"
                }`}
              >
                {msg.text}
              </div>
            ))}

          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-3">

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend()
                  }
                }}
                placeholder="Describe your symptoms or ask a health question..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <button
                onClick={handleSend}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Send
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default AIAssistant