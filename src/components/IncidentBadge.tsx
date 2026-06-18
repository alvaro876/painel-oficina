import { Badge } from "./Badge";

// guincho + reincidência → um badge combinado "guincho reincidente".
export function IncidentBadge({
  guincho,
  recidivism,
}: {
  guincho: boolean;
  recidivism: boolean;
}) {
  if (guincho && recidivism) return <Badge color="danger">guincho reincidente</Badge>;
  if (guincho) return <Badge color="warn">guincho</Badge>;
  if (recidivism) return <Badge color="warn">reincidente</Badge>;
  return null;
}
