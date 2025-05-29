"use client"

import { DevModeIndicator } from "@/components/dev-mode-indicator"

export default function HomePage() {
  console.log("HomePage is rendering")

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Project Bobcat - Form Builder</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Page</h2>
          <p className="text-gray-600 mb-4">If you can see this, React is working correctly.</p>

          <div className="space-y-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => alert("Button clicked!")}
            >
              Test Button
            </button>

            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">✅ Basic rendering is working</p>
            </div>
          </div>
        </div>
      </div>

      <DevModeIndicator />
    </div>
  )
}
