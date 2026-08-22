// src/app/page.tsx
import Link from "next/link";

const features = [
  {
    icon: "🗺️",
    title: "Smart Itinerary Builder",
    description: "Drag-and-drop stops, schedule activities by day, and reorder your entire trip with ease.",
  },
  {
    icon: "💰",
    title: "Budget Tracking",
    description: "Set a budget cap, see cost breakdowns by category, and never overspend on your adventure.",
  },
  {
    icon: "📅",
    title: "Day-by-Day Timeline",
    description: "Visualize your trip as a beautiful timeline with cities, activities, and free days at a glance.",
  },
  {
    icon: "🔗",
    title: "Share Your Trips",
    description: "Make trips public and share them with friends. Let others copy and remix your itinerary.",
  },
  {
    icon: "🌆",
    title: "City Discovery",
    description: "Explore destinations worldwide, browse curated activities, and add them directly to your trip.",
  },
  {
    icon: "✈️",
    title: "Multi-Stop Planning",
    description: "Plan complex trips across multiple cities with full control over dates and order.",
  },
];

const destinations = [
  { name: "Tokyo", country: "Japan", emoji: "🗼", bg: "from-pink-500 to-red-500" },
  { name: "Paris", country: "France", emoji: "🗽", bg: "from-blue-500 to-indigo-600" },
  { name: "Bali", country: "Indonesia", emoji: "🌴", bg: "from-green-500 to-teal-500" },
  { name: "New York", country: "USA", emoji: "🏙️", bg: "from-slate-600 to-slate-800" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
          🌍 GlobeTrotter
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60 -translate-x-1/2" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-40 -translate-x-1/2" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-slate-200">
            ✨ Plan smarter, travel better
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Your trips,{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
              beautifully planned
            </span>
          </h1>
          <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            GlobeTrotter turns the chaos of travel planning into a clean, collaborative, and visual experience — from
            itinerary building to budget tracking.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5"
            >
              Start planning for free →
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-8 py-3.5 rounded-xl text-base transition-all hover:bg-slate-50"
            >
              I already have an account
            </Link>
          </div>
          <p className="mt-5 text-xs text-slate-400">No credit card required · Free forever</p>
        </div>
      </section>

      {/* Mock UI Preview */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="flex-1 mx-4 bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400">
                globetrotter.app/trips/my-europe-trip
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-7 w-56 bg-white/10 rounded-lg" />
                  <div className="h-4 w-36 bg-white/5 rounded mt-2" />
                </div>
                <div className="flex gap-2">
                  {["Builder", "Budget", "Calendar", "Share"].map((label) => (
                    <div key={label} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white/60 border border-white/10">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {["Paris · Day 1–3", "Amsterdam · Day 4–6", "Berlin · Day 7–9"].map((stop) => (
                  <div key={stop} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-white/80 text-sm font-medium">{stop}</div>
                    <div className="mt-3 space-y-1.5">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-3 bg-white/10 rounded-full" style={{ width: `${60 + i * 20}%` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 bg-slate-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Everything you need to travel better</h2>
            <p className="mt-3 text-lg text-slate-500">All the tools for stress-free trip planning, in one place.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Explore top destinations</h2>
            <p className="mt-3 text-lg text-slate-500">Curated cities with activities, costs, and travel tips.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {destinations.map((d) => (
              <Link
                key={d.name}
                href="/signup"
                className={`relative bg-gradient-to-br ${d.bg} rounded-2xl p-6 aspect-square flex flex-col justify-between text-white overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer`}
              >
                <div className="text-4xl">{d.emoji}</div>
                <div>
                  <p className="font-bold text-lg leading-tight">{d.name}</p>
                  <p className="text-sm text-white/70">{d.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-slate-900">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-5xl mb-6">🌏</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready for your next adventure?</h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Join thousands of travelers who plan smarter, spend wiser, and explore more with GlobeTrotter.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold px-10 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5 shadow-xl shadow-black/30"
          >
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-100 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} GlobeTrotter · Made with ❤️ for explorers everywhere
      </footer>
    </div>
  );
}
