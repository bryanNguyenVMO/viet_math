import { lazy, Suspense } from "react";

const QuickEditor = lazy(() =>
  import("./quick/QuickEditor").then((module) => ({ default: module.QuickEditor })),
);
const DesktopWorkspace = lazy(() =>
  import("./layout/DesktopWorkspace").then((module) => ({
    default: module.DesktopWorkspace,
  })),
);

export function App() {
  const mode = new URLSearchParams(window.location.search).get("mode");

  return (
    <Suspense fallback={<div className="vm-app-loading">VietMath…</div>}>
      {mode === "quick" ? <QuickEditor /> : <DesktopWorkspace />}
    </Suspense>
  );
}
