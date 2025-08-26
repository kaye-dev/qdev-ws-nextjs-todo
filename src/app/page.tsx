import Link from "next/link";
import TodoApp from "../components/TodoApp";

export default function Home() {
  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-2xl">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 transition-colors duration-300 hover:text-blue-600">
            Simple Todo App
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed transition-colors duration-300">
            Manage your daily tasks with ease
          </p>

          {/* Decorative element */}
          <div className="mt-4 flex justify-center">
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
          </div>

          {/* Navigation to notifications */}
          <div className="mt-6">
            <Link
              href="/notifications"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-200"
            >
              📧 通知設定
            </Link>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <TodoApp />
        </div>
      </div>

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 transition-all duration-200"
      >
        メインコンテンツにスキップ
      </a>
    </main>
  );
}
