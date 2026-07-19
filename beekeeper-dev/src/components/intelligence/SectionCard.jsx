// src/components/intelligence/SectionCard.jsx

export default function SectionCard({ title, children, className = "" }) {
  return (
    <section className={`rounded-xl border bg-white p-4 shadow-sm ${className}`}>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}
