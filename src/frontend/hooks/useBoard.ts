import { useEffect, useState } from "react";
import { fetchBoard, Play } from "../utils/api";

export function useBoard() {
  const [board, setBoard] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBoard();
        setBoard(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { board, loading };
} 