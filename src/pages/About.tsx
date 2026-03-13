export default function About() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h1 className="text-5xl font-bold text-[var(--text-h)] tracking-tight">
        About
      </h1>
      <p className="text-lg text-[var(--text)] max-w-md text-center">
        Learn more about this project. Built with React, Vite, and Tailwind CSS
        for a fast and modern development experience.
      </p>
    </div>
  );
}
