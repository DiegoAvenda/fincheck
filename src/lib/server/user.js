import client from '$lib/server/db.js';

export async function createUser(googleId, name, picture) {
	try {
		const mongoClient = await client.connect();
		const db = mongoClient.db('nirvana');
		const users = db.collection('users');

		const { insertedId } = await users.insertOne({
			googleId,
			name,
			picture,
			admin: false
		});
		const user = await users.findOne({ _id: insertedId });
		return user;
	} catch (e) {
		console.log(e);
	}
}

export async function getUserFromGoogleId(googleId) {
	try {
		const mongoClient = await client.connect();
		const db = mongoClient.db('nirvana');
		const users = db.collection('users');
		const user = await users.findOne({ googleId });
		return user;
	} catch (e) {
		console.log(e);
	}
}
