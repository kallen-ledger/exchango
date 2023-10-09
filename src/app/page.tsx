"use client";

import { useExchangeContext } from "@/context/ExchangeContext";

export default function Home() {
  const ctx = useExchangeContext();

  return (
    <main>
      <header>
        <h1>Swap live app</h1>
      </header>
      <code>
        exchange sdk instantiated: {`${ctx.instantiated}`}
      </code>
    </main>
  );
}
