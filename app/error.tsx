"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <pre className="max-w-md text-xs opacity-70">
        {error.message}
      </pre>
      <button
        onClick={() => reset()}
        className="rounded-xl bg-white px-4 py-2 text-black"
      >
        Try again
      </button>
    </div>
  );
}
