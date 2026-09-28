import { getDb } from '$lib/server/db.js';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

export async function validateSessionToken(token) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	try {
		const db = await getDb();
		const sessions = db.collection('sessions');
		const session = await sessions.findOne({ id: sessionId });

		if (session === null) {
			return { session: null, user: null };
		}

		const user = await db.collection('users').findOne({ _id: session.userId });

		if (Date.now() >= session.expiresAt.getTime()) {
			await sessions.deleteOne({ id: sessionId });
			return { session: null, user: null };
		}
		if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
			session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
			const filter = { id: session.id };
			const updateDoc = {
				$set: {
					expiresAt: session.expiresAt
				}
			};
			await sessions.updateOne(filter, updateDoc);
		}
		return { session, user };
	} catch (error) {
		console.log(error);
	}
}

export function generateSessionToken() {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token, userId) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};
	try {
		const db = await getDb();
		const sessions = db.collection('sessions');
		await sessions.insertOne(session);
		return session;
	} catch (error) {
		console.log(error);
	}
}

export async function invalidateSession(sessionId) {
	try {
		const db = await getDb();
		const sessions = db.collection('sessions');
		await sessions.deleteOne({ id: sessionId });
	} catch (error) {
		console.log(error);
	}
}

export function setSessionTokenCookie(event, token, expiresAt) {
	event.cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event) {
	event.cookies.set('session', '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/'
	});
}
