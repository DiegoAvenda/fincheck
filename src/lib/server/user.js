import { getDb } from '$lib/server/db.js';

export async function createUser(googleId, name, picture) {
	try {
		const db = await getDb();
		const users = db.collection('users');

		const { insertedId } = await users.insertOne({
			googleId,
			name,
			picture,
			admin: false,
			createdAt: new Date()
		});
		const user = await users.findOne({ _id: insertedId });
		return user;
	} catch (e) {
		console.log(e);
		return null;
	}
}

export async function getUserFromGoogleId(googleId) {
	try {
		const db = await getDb();
		const users = db.collection('users');
		const user = await users.findOne({ googleId });
		return user;
	} catch (e) {
		console.log(e);
		return null;
	}
}
