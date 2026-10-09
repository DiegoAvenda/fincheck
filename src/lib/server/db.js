import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

let _clientPromise = null;

function getClientPromise() {
	if (_clientPromise) return _clientPromise;

	const uri = env.MONGODB_URI;
	if (!uri) {
		throw new Error(
			'MONGODB_URI is not defined. Create a .env file (see .env.example) or set the environment variable.'
		);
	}

	const client = new MongoClient(uri);
	_clientPromise = client.connect();
	return _clientPromise;
}

export async function getDb() {
	const client = await getClientPromise();
	const dbName = env.MONGODB_DATABASE ?? 'fincheck';
	return client.db(dbName);
}

