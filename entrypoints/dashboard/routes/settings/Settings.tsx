import { useState } from "react";
import { useParams } from "react-router";

export function Settings() {
  const params = useParams();
  return (
    <div>
      <h2 className="text-lg font-bold">Settings</h2>
      {params.id}
      <Counter defaultCount={30} />
    </div>
  );
}

function Counter(props: { defaultCount?: number }) {
  const [count, setCount] = useState(props.defaultCount || 0);

  function handleClick() {
    setCount((prev) => prev + 1);
  }

  return <div onClick={handleClick}>{count}</div>;
}
