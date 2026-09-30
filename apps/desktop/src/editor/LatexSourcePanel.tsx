type LatexSourcePanelProps = {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onApply: () => void;
};

export function LatexSourcePanel({
  value,
  error,
  onChange,
  onApply,
}: LatexSourcePanelProps) {
  return (
    <section className="vm-source-panel" aria-label="LaTeX source editor">
      <label className="vm-source-label" htmlFor="vm-latex-source">
        LaTeX
      </label>
      <textarea
        id="vm-latex-source"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "vm-latex-error" : undefined}
      />
      <div className="vm-source-actions">
        {error ? (
          <p id="vm-latex-error" className="vm-source-error" role="status">
            {error}
          </p>
        ) : (
          <p className="vm-source-hint">
            Nội dung đang gõ được giữ riêng cho đến khi có thể áp dụng.
          </p>
        )}
        <button type="button" className="vm-source-apply" onClick={onApply}>
          Áp dụng
        </button>
      </div>
    </section>
  );
}
