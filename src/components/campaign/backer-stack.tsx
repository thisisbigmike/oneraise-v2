export function BackerStack({
  initials,
  totalCount,
  max = 5,
  size = "md",
}: {
  initials: string[];
  totalCount: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const shown = initials.slice(0, max);
  const extra = totalCount - shown.length;
  return (
    <div className={`ms-backers ms-backers--${size}`}>
      <div className="ms-backers__list">
        {shown.map((initial, i) => (
          <span key={i} className="ms-backers__face">
            {initial}
          </span>
        ))}
        {extra > 0 && <span className="ms-backers__more">+{extra}</span>}
      </div>
    </div>
  );
}
