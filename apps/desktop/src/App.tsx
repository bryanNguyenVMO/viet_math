import { QuickEditor } from "./quick/QuickEditor";
import { DesktopWorkspace } from "./layout/DesktopWorkspace";

export function App() {
  const mode = new URLSearchParams(window.location.search).get("mode");

  return mode === "quick" ? <QuickEditor /> : <DesktopWorkspace />;
}
