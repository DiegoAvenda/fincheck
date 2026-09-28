import { MongoClient } from 'mongodb';
import { MONGODB_URI, MONGODB_DATABASE } from '$env/static/private';

function crearConexion() {
	const client = new MongoClient(MONGODB_URI);
	return client.connect();
}

// Evita abrir una conexión nueva en cada recarga durante desarrollo
if (!globalThis._mongoClientPromise) {
	globalThis._mongoClientPromise = crearConexion();
}

export async function getDb() {
	const client = await globalThis._mongoClientPromise;
	return client.db(MONGODB_DATABASE);
}
