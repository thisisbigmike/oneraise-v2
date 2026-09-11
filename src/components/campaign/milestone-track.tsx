import { Icon } from "@/components/ui/icon";
import type { Milestone } from "@/lib/types";

/** Horizontal N-stage rail — the desktop milestone tracker used throughout
 *  campaign detail, auth context panels, and both dashboards. */
export function MilestoneTrack({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="ms-track">
      {milestones.map((m, i) => {
        const isLast = i === milestones.length - 1;
        return (
          <div key={m.label} className={`ms-track__step${isLast ? "" : " ms-track__step--grow"}`}>
            <div className="ms-track__row">
              <span aria-hidden="true" className={`ms-track__node ms-track__node--${m.state}`}>
                {m.state === "released" && <Icon name="check" size={16} strokeWidth={3} />}
                {m.state === "disputed" && <Icon name="alert-triangle" size={14} />}
                {m.state === "active" && <span className="ms-track__pip" />}
              </span>
              {!isLast && (
                <span aria-hidden="true" className={`ms-track__bar ms-track__bar--${m.barState ?? m.state}`} />
              )}
            </div>
            <div className="ms-track__meta" style={isLast ? { paddingRight: 0 } : undefined}>
              <span className={`ms-track__label${m.state === "pending" ? " ms-track__label--muted" : ""}`}>
                {m.label}
              </span>
              <span className="ms-track__state numeric">
                {m.statusLabel} · {m.amount}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
