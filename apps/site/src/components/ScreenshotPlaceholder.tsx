type ScreenshotPlaceholderProps = {
  label: string;
  title: string;
  copy: string;
  compact?: boolean;
};

export function ScreenshotPlaceholder({
  label,
  title,
  copy,
  compact = false,
}: ScreenshotPlaceholderProps) {
  return (
    <div className="screen-placeholder">
      <div className="screen-chip w-fit">{label}</div>
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <h3 className="screen-placeholder-title">{title}</h3>
        <p className="screen-placeholder-copy">{copy}</p>
      </div>
      <div className={compact ? 'grid gap-2' : 'grid gap-3'}>
        <div className="screen-line screen-line-strong" />
        <div className="screen-line screen-line-medium" />
        <div className="screen-line screen-line-short" />
      </div>
    </div>
  );
}
