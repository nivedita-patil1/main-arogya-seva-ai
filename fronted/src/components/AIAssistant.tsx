import { useState } from "react"

type Message = {
  text: string
  sender: "user" | "ai"
}

function AIAssistant() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  const handleSend = () => {
    if (!message.trim()) return

    const userMessage = message.trim()

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        text: userMessage,
        sender: "user",
      },
      {
        text:
          "Thanks for your question! 🤖 I'm ArogyaSeva AI. I'm currently being connected to the healthcare AI service. Please use this information for general guidance and consult a qualified healthcare professional for medical decisions.",
        sender: "ai",
      },
    ])

    setMessage("")
  }

  const handleClear = () => {
    setMessages([])
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Chat Card */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white p-5 sm:p-6">

          <div className="flex items-center gap-4">

            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-3xl">
              🤖

              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                ArogyaSeva AI
              </h3>

              <p className="text-sm text-green-600">
                ● Online & Ready to Help
              </p>
            </div>

          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              Clear Chat
            </button>
          )}

        </div>

        {/* Messages */}
        <div className="min-h-[320px] max-h-[450px] space-y-4 overflow-y-auto bg-gray-50 p-5 sm:p-6">

          {/* Welcome Message */}
          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100">
              🤖
            </div>

            <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-white p-4 shadow-sm">
              <p className="text-sm leading-6 text-gray-700">
                Hello! 👋 I'm <span className="font-semibold">ArogyaSeva AI</span>.
                How can I help you today?
              </p>

              <p className="mt-2 text-xs text-gray-500">
                You can ask about general health information,
                symptoms, wellness, or healthcare guidance.
              </p>
            </div>

          </div>

          {/* User + AI Messages */}
          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.sender === "user"
                  ? "justify-end"
                  : "items-start gap-3"
              }`}
            >

              {msg.sender === "ai" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-6 ${
                  msg.sender === "user"
                    ? "rounded-tr-none bg-teal-600 text-white shadow-sm"
                    : "rounded-tl-none bg-white text-gray-700 shadow-sm"
                }`}
              >
                {msg.text}
              </div>

            </div>

          ))}

        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-white p-4 sm:p-5">

          <div className="flex flex-col gap-3 sm:flex-row">

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend()
                }
              }}
              placeholder="Ask a health question..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />

            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send ➤
            </button>

          </div>

          <p className="mt-3 text-center text-xs text-gray-400">
            ArogyaSeva AI provides general information and is not a substitute for professional medical advice.
          </p>

        </div>

      </div>
    </div>
  )
}

export default AIAssistant