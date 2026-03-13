export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h1 className="text-5xl font-bold text-[var(--text-h)] tracking-tight">
        Welcome Home
      </h1>
      <p className="text-lg text-[var(--text)] max-w-md text-center">
        This is the home page. Use the navigation above to explore different
        sections of the application.
      </p>
    </div>
  );
}
