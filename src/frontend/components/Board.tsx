import { useBoard } from "../hooks/useBoard";

export default function Board() {
  const { board, loading } = useBoard();

  if (loading) return <div>Loading Board...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Current Plays</h2>
      <ul>
        {board.map((play) => (
          <li key={play.id} className="border p-2 mb-2 rounded">
            <strong>{play.name}</strong> → {play.target_outcome}
          </li>
        ))}
      </ul>
    </div>
  );
} 