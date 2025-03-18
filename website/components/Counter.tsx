import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex justify-center">
      <div className="my-4 p-4 border border-gray-200 rounded-md w-96">
        <h2 className="text-lg font-semibold mb-2">Counter Component</h2>
        <p className="mb-2">
          Current count: <span className="font-bold">{count}</span>
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setCount(count - 1)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Decrease
          </button>
          <button
            onClick={() => setCount(count + 1)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Increase
          </button>
        </div>
      </div>
    </div>
  );
}
