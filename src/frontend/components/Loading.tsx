export default function Loading() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rhythmRed"></div>
      <span className="ml-3 text-rhythmGray">Loading...</span>
    </div>
  );
} 