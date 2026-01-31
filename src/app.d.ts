// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		interface Locals {
			uuid: import('$lib/server/auth').SessionValidationResult['uuid'];
			session_id: import('$lib/server/auth').SessionValidationResult['session_id'],
			user: import('$lib/server/db/database').User;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
