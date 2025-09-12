export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        <p className="text-white text-lg font-medium">Loading Workshop...</p>
      </div>
    </div>
  )
}
