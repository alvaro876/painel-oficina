// Query core do ClickHouse — UMA query serve as 3 telas.
// CTEs pré-agregam so_status / so_item uma vez e filtram cedo (tabelas 130k+).
// Retorna 1 linha por OS ATIVA. O split status→tela é feito em TS (lib/status.ts).
//
// Flags (descobertos explorando os dados em 2026-06-17):
//  - piso       → check-in do Maestro (NÃO está mais no maintenance_metadata)
//  - guincho    → triage.incidents.towing (estrutura nova; fallback checklist_tags p/ OS antigas)
//  - reincidente→ triage.incidents.recidivism (já calculado pela triagem)
//  - box rápido → so_type='FAST_REPAIR' (resolvido no frontend via so_type)
import { ZOMBIE } from "@/config/thresholds";

export const WORKSHOP_SQL = `
WITH
status_now AS (
  SELECT
    so_id,
    argMax(status, created_at)                                     AS status_atual,
    max(created_at)                                               AS last_status_at,
    dateDiff('minute', max(created_at), now('America/Sao_Paulo')) AS min_in_status
  FROM oms_r.so_status FINAL
  WHERE _peerdb_is_deleted = 0
  GROUP BY so_id
  HAVING status_atual IN (
    'IN_DIAGNOSIS','AWAITING_MECHANIC','IN_PROGRESS','PAUSED',
    'AWAITING_PARTS','QA_REJECTED','AWAITING_QA','IN_QA'
  )
  AND last_status_at >= now('America/Sao_Paulo') - INTERVAL ${ZOMBIE.maxStatusAgeHours} HOUR
),
mecanico AS (
  SELECT so_id, argMax(user_id, created_at) AS mec_user_id
  FROM oms_r.so_status FINAL
  WHERE _peerdb_is_deleted = 0
    AND status = 'IN_PROGRESS'
    AND user_id IS NOT NULL
    AND user_id NOT IN (146423, 146129, 23586, 146131, 146134)  -- diagnosticadores
  GROUP BY so_id
),
pecas AS (
  SELECT
    si.so_id                                    AS so_id,
    sum(coalesce(nullIf(ig.time_target, 0), 0)) AS estimated_min,
    count(DISTINCT si.item_group_id)            AS n_pecas,
    arrayFilter(x -> x != '', arrayDistinct(groupArray(coalesce(ig.name, '')))) AS pecas_nomes
  FROM oms_r.so_item si FINAL
  LEFT JOIN ims_r.item_group ig FINAL ON ig.id = si.item_group_id
  WHERE si._peerdb_is_deleted = 0
    AND si.deleted_at IS NULL
    AND si.quantity > 0          -- peças DIAGNOSTICADAS/planejadas (estimativa já na entrada)
  GROUP BY si.so_id
),
-- Cliente em piso: check-in de manutenção ATIVO, sem reserva entregue, não
-- concluído, recente (24h). Vem do Maestro — não está mais no maintenance_metadata.
piso AS (
  SELECT DISTINCT so_id
  FROM maestro_scheduler_r.checkin FINAL
  WHERE _peerdb_is_deleted = 0
    AND checkin_type = 'MAINTENANCE'
    AND status NOT IN ('NO_SHOW','CANCELLED','DROPOUT')
    AND completed_at IS NULL
    AND reserve_delivered_at IS NULL
    AND so_id IS NOT NULL
    AND created_at >= now() - INTERVAL 24 HOUR
)
SELECT
  so.id                                                                       AS so_id,
  coalesce(nullIf(JSONExtractString(so.maintenance_metadata, 'license_plate'), ''), so.asset_code) AS placa,
  so.asset_model                                                              AS modelo,
  so.so_type                                                                  AS so_type,
  so.location_id                                                              AS location_id,
  sn.status_atual                                                             AS status_atual,
  sn.min_in_status                                                            AS min_in_status,
  coalesce(u.email, '')                                                       AS mecanico_email,
  coalesce(p.estimated_min, 0)                                                AS estimated_min,
  coalesce(p.n_pecas, 0)                                                      AS n_pecas,
  p.pecas_nomes                                                               AS pecas_nomes,
  so.so_description                                                           AS reclamacao,
  if(so.id IN (SELECT so_id FROM piso), 1, 0)                                 AS is_piso,
  if(JSONExtractBool(so.maintenance_metadata, 'triage', 'incidents', 'towing')
     OR JSONExtractBool(so.maintenance_metadata, 'checklist_tags', 'towing'), 1, 0) AS is_guincho,
  if(JSONExtractBool(so.maintenance_metadata, 'triage', 'incidents', 'recidivism'), 1, 0) AS is_recidivism,
  if(sn.status_atual = 'PAUSED', 1, 0)                                        AS is_paused
FROM oms_r.so so FINAL
INNER JOIN status_now sn ON sn.so_id = so.id
LEFT  JOIN mecanico   m  ON m.so_id  = so.id
LEFT  JOIN ims_r."user" u FINAL ON u.id = m.mec_user_id AND u._peerdb_is_deleted = 0
LEFT  JOIN pecas      p  ON p.so_id  = so.id
WHERE so._peerdb_is_deleted = 0
  AND so.deleted_at IS NULL
  AND so.asset_type = 'BIKE'
  AND so.location_id IN (1, 34, 166)
  AND so.so_type NOT IN ('RETURN_INSPECTION','CORRECTIVE_LOCO','ACTIVATION','INSURANCE_QUOTE')
ORDER BY sn.min_in_status DESC
`;
