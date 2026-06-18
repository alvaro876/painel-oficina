// Base "casa" de cada mecânico = a base mais recente em que ele esteve IN_PROGRESS
// nos últimos 21 dias. Usado pra atribuir base aos logins da planilha (que não
// tem base), inclusive os ociosos.
export const MECH_BASE_SQL = `
SELECT
  u.email                                          AS email,
  toInt32(argMax(so.location_id, ss.created_at))   AS location_id
FROM oms_r.so_status ss FINAL
JOIN oms_r.so so FINAL ON so.id = ss.so_id
JOIN ims_r."user" u FINAL ON u.id = ss.user_id AND u._peerdb_is_deleted = 0
WHERE ss._peerdb_is_deleted = 0
  AND ss.status = 'IN_PROGRESS'
  AND ss.created_at >= now('America/Sao_Paulo') - INTERVAL 21 DAY
  AND so.asset_type = 'BIKE'
  AND so.location_id IN (1, 34, 166)
  AND u.email != ''
GROUP BY u.email
`;
