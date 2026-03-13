export default function About() {
  return (
    <div className="flex flex-col items-start h-full px-12 py-10">
      <h1 className="text-4xl font-bold text-[var(--text-h)] tracking-tight">
        About
      </h1>
      <p className="mt-4 text-base text-[var(--text)] max-w-2xl leading-relaxed">
        Learn more about this project. Built with React, Vite, and Tailwind CSS
        for a fast and modern development experience.
      </p>
    </div>
  );
}
