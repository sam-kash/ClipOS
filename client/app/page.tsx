import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="mb-8 inline-block rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 text-sm font-semibold">
          AI Operating System for Creators
        </div>

        <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Create Viral Content with{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI-Powered
          </span>{" "}
          Intelligence
        </h1>

        <p className="mb-12 max-w-2xl text-lg text-gray-400 md:text-xl">
          ClipOS helps short-form creators generate scripts, edit videos, and grow their audience with cutting-edge AI tools.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold transition hover:opacity-90 transform active:scale-95"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-700 bg-gray-900 px-8 py-4 text-lg font-semibold transition hover:border-gray-600 hover:bg-gray-800"
          >
            Sign In
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 text-4xl">🎬</div>
            <h3 className="mb-2 text-xl font-semibold">AI Script Writer</h3>
            <p className="text-gray-400">
              Generate viral scripts tailored to your niche in seconds.
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 text-4xl">✨</div>
            <h3 className="mb-2 text-xl font-semibold">Auto Captions</h3>
            <p className="text-gray-400">
              Add professional captions automatically with Whisper AI.
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 text-4xl">📈</div>
            <h3 className="mb-2 text-xl font-semibold">Growth Analytics</h3>
            <p className="text-gray-400">
              Track performance and optimize your content strategy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-sm text-gray-500">
        © 2026 ClipOS. Built for creators, by creators.
      </footer>
    </div>
  );
}
