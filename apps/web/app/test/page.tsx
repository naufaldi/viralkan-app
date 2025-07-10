export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Tailwind CSS v4 Test Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Colors Test
            </h2>
            <div className="space-y-2">
              <div className="w-full h-4 bg-red-500 rounded"></div>
              <div className="w-full h-4 bg-green-500 rounded"></div>
              <div className="w-full h-4 bg-blue-500 rounded"></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Spacing Test
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-200 p-2 rounded">p-2</div>
              <div className="bg-gray-200 p-4 rounded">p-4</div>
              <div className="bg-gray-200 p-6 rounded">p-6</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Flex Test
            </h2>
            <div className="flex justify-between items-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Flex Item 1
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Flex Item 2
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Hover Effects Test
          </h2>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
            Hover Me
          </button>
        </div>

        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Custom Theme Colors Test
          </h2>
          <div className="space-y-2">
            <div className="w-full h-8 bg-primary text-primary-foreground flex items-center justify-center rounded">
              Primary Color (from theme)
            </div>
            <div className="w-full h-8 bg-secondary text-secondary-foreground flex items-center justify-center rounded">
              Secondary Color (from theme)
            </div>
            <div className="w-full h-8 bg-accent text-accent-foreground flex items-center justify-center rounded">
              Accent Color (from theme)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
