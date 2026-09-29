// Funciones from scratch para reemplazar @oslojs/encoding y @oslojs/crypto/sha2

// Base32 encoding (sin padding, minúsculas)
export function encodeBase32LowerCaseNoPadding(bytes) {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
	let result = '';
	let bits = 0;
	let value = 0;

	for (let i = 0; i < bytes.length; i++) {
		value = (value << 8) | bytes[i];
		bits += 8;

		while (bits >= 5) {
			bits -= 5;
			result += alphabet[(value >>> bits) & 31];
		}
	}

	if (bits > 0) {
		result += alphabet[(value << (5 - bits)) & 31];
	}

	return result;
}

// Hex encoding (minúsculas)
export function encodeHexLowerCase(bytes) {
	const hexArray = [];
	for (let i = 0; i < bytes.length; i++) {
		const byte = bytes[i];
		hexArray.push(((byte >> 4) & 0xf).toString(16));
		hexArray.push((byte & 0xf).toString(16));
	}
	return hexArray.join('');
}

// SHA-256 hash
export async function sha256(data) {
	const encoder = new TextEncoder();
	const buffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	return new Uint8Array(hashBuffer);
}

// Generar bytes aleatorios
export function generateRandomBytes(length) {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return bytes;
}

// Generar string aleatorio (para state y code verifier)
export function generateRandomString(length) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
	const bytes = generateRandomBytes(length);
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars[bytes[i] % chars.length];
	}
	return result;
}

// Generar código verificador para PKCE
export function generateCodeVerifier() {
	return generateRandomString(128);
}

// Generar state para OAuth
export function generateState() {
	return generateRandomString(32);
}

// Generar challenge para PKCE (SHA-256 + Base64 URL encoding sin padding)
export async function generateCodeChallenge(codeVerifier) {
	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const base64 = btoa(String.fromCharCode.apply(null, hashArray));
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Decodificar Base64 URL
export function base64UrlDecode(base64Url) {
	let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4) {
		base64 += '=';
	}
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

// Decodificar JWT (JSON Web Token)
export function decodeJWT(token) {
	const parts = token.split('.');
	if (parts.length !== 3) {
		throw new Error('Invalid JWT format');
	}

	const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
	const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));

	return { header, payload };
}
