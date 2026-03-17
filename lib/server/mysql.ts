import mysql, { Pool } from 'mysql2/promise';

const MYSQL_ENV_KEYS = [
	'MYSQL_HOST',
	'MYSQL_PORT',
	'MYSQL_USER',
	'MYSQL_PASSWORD',
	'MYSQL_DATABASE',
] as const;

type MysqlEnvKey = (typeof MYSQL_ENV_KEYS)[number];

const globalMysql = globalThis as typeof globalThis & {
	__airportToolsMysqlPool?: Pool;
};

function getRequiredEnv(name: MysqlEnvKey) {
	const value = process.env[name];

	if (!value) {
		throw new Error(`Missing required MySQL environment variable: ${name}`);
	}

	return value;
}

export function getMysqlPool() {
	if (!globalMysql.__airportToolsMysqlPool) {
		globalMysql.__airportToolsMysqlPool = mysql.createPool({
			host: getRequiredEnv('MYSQL_HOST'),
			port: Number.parseInt(getRequiredEnv('MYSQL_PORT'), 10),
			user: getRequiredEnv('MYSQL_USER'),
			password: getRequiredEnv('MYSQL_PASSWORD'),
			database: getRequiredEnv('MYSQL_DATABASE'),
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
		});
	}

	return globalMysql.__airportToolsMysqlPool;
}
