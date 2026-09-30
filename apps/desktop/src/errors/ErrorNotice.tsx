import {
  errorMessage,
  type UserError,
} from "@vietmath/shared";
import type { Locale } from "@vietmath/i18n";

type ErrorNoticeProps = {
  error: UserError | null;
  locale: Locale;
  onDismiss?: () => void;
};

export function ErrorNotice({
  error,
  locale,
  onDismiss,
}: ErrorNoticeProps) {
  if (!error) return null;

  return (
    <div className="vm-error-notice" role="status">
      <span>{errorMessage(error, locale)}</span>
      {onDismiss ? (
        <button type="button" aria-label="Dismiss" onClick={onDismiss}>×</button>
      ) : null}
    </div>
  );
}
