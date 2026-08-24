function Services() {
  return (
    <section className="bg-blue-50 px-6 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-4xl font-bold text-gray-900">
          Our Healthcare Services 🏥
        </h2>

        <p className="mt-4 text-gray-600">
          Smart healthcare solutions powered by ArogyaSeva AI.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            🤖
            <h3 className="mt-4 font-bold">AI Health Assistant</h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            🩺
            <h3 className="mt-4 font-bold">Symptom Checker</h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            👨‍⚕️
            <h3 className="mt-4 font-bold">Find a Doctor</h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            📅
            <h3 className="mt-4 font-bold">Book Appointment</h3>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services