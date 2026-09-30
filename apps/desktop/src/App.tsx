import { Sigma } from "lucide-react";

export function App() {
  return (
    <main className="production-shell">
      <section className="brand-card" aria-label="VietMath production desktop">
        <div className="brand-mark" aria-hidden="true">
          <Sigma size={28} />
        </div>
        <div>
          <p className="eyebrow">Desktop Alpha</p>
          <h1>VietMath</h1>
          <p className="subtitle">
            Production shell is ready. Editor and design-system modules land in the next tasks.
          </p>
        </div>
      </section>
    </main>
  );
}
