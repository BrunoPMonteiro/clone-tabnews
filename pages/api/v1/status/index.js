import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const dataBaseVersionResult = await database.query("SHOW server_version;");
  const dataBaseVersionValue = dataBaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(`
  SELECT setting AS max_connections
  FROM pg_settings
  WHERE name = 'max_connections';
`);
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseOpenedConnectionsResult = await database.query(
    "SELECT count(*)::int AS opened_connections FROM pg_stat_activity WHERE datname = 'local_db';",
  );
  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].opened_connections;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: dataBaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: Number(databaseOpenedConnectionsValue),
      },
    },
  });
}

export default status;
