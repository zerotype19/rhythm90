import Board from "../components/Board";
import PlayCanvas from "../components/PlayCanvas";
import SignalLog from "../components/SignalLog";

export default function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <PlayCanvas />
      <Board />
      <SignalLog />
    </div>
  );
} 