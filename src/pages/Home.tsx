export default function Home() {
  return (
    <div className="flex flex-col items-start justify-center h-full px-12 py-10">
      <h1 className="text-4xl font-bold text-[var(--text-h)] tracking-tight">
        Welcome Home
      </h1>
      <p className="mt-4 text-base text-[var(--text)] max-w-2xl leading-relaxed">
        This is the home page. Use the navigation above to explore different
        sections of the application.
      </p>
    </div>
  );
}
