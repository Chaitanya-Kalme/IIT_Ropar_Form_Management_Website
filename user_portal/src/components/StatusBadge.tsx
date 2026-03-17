import { Badge } from "@/components/ui/badge";

type Status = "Approved" | "Pending" | "Rejected" | "Under Review";

export default function StatusBadge({ status }: { status: Status }) {
  const classes: Record<Status, string> = {
    Approved: "status-approved",
    Pending: "status-pending",
    Rejected: "status-rejected",
    "Under Review": "status-review",
  };

  return (
    <Badge variant="outline" className={`${classes[status]} border font-medium text-xs`}>
      {status}
    </Badge>
  );
}
