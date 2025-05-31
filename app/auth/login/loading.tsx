export default function LoginLoading() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="text-center space-y-6">
            <div className="h-12 bg-white/20 rounded w-64 mx-auto animate-pulse"></div>
            <div className="h-6 bg-white/20 rounded w-80 mx-auto animate-pulse"></div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-28 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
