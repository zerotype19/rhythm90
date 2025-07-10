export default function Training() {
  const sections = [
    "✅ What is Rhythm90?",
    "🛠 How to run Kickoff, Pulse Check, R&R",
    "🎯 How to write smart plays",
    "🔍 How to log useful signals",
    "🏗 Access workshop kits + templates",
  ];

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Rhythm90 Training Hub</h1>
      <ul className="list-disc pl-6 space-y-2">
        {sections.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
} 