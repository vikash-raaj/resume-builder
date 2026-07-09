import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { subscribeToPageViews } from "../firebase/analytics";

export default function VisitorCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const unsub = subscribeToPageViews(setCount);
    return unsub;
  }, []);

  if (count === null) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 animate-pulse">
        <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />
        <div className="w-10 h-4 rounded bg-gray-300" />
        <div className="w-20 h-3 rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
      <Eye className="w-3.5 h-3.5 text-blue-500" />
      <span className="text-sm font-semibold text-gray-700">
        {count.toLocaleString()}
      </span>
      <span className="text-xs text-gray-400">total page visits</span>
    </div>
  );
}
