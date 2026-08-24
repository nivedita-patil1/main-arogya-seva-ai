function Services() {
  const services = [
    {
      icon: "🤖",
      title: "AI Health Assistant",
      description:
        "Get quick and intelligent answers to your general healthcare questions with our AI-powered assistant.",
    },
    {
      icon: "🔍",
      title: "Symptom Guidance",
      description:
        "Understand common symptoms and receive helpful health information to guide your next steps.",
    },
    {
      icon: "🩺",
      title: "Find a Doctor",
      description:
        "Discover healthcare support and find the right medical professional for your needs.",
    },
    {
      icon: "📅",
      title: "Book Appointment",
      description:
        "Make healthcare access easier by planning and managing your doctor appointments.",
    },
  ]

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <div
            key={service.title}
            className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-3xl transition-transform duration-300 group-hover:scale-110">
              {service.icon}
            </div>

            {/* Title */}
            <h3 className="mt-5 text-xl font-bold text-gray-900">
              {service.title}
            </h3>

            {/* Description */}
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {service.description}
            </p>

            {/* Learn More */}
            <button className="mt-5 font-semibold text-teal-600 transition-colors hover:text-teal-700">
              Learn More →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Services