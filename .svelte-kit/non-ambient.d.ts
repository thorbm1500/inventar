
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/(auth)" | "/(app)" | "/" | "/(app)/account" | "/(app)/account/[id]" | "/(app)/account/[id]/settings" | "/(app)/browse" | "/(app)/inventory" | "/(app)/inventory/new" | "/(app)/inventory/[id]" | "/(app)/inventory/[id]/add" | "/(app)/inventory/[id]/settings" | "/(auth)/login" | "/(app)/projects" | "/(auth)/register" | "/(auth)/reset-password" | "/(auth)/reset-password/[token]" | "/(app)/settings" | "/(app)/settings/[[category]]/[[subcategory]]" | "/(app)/settings/[[category]]";
		RouteParams(): {
			"/(app)/account/[id]": { id: string };
			"/(app)/account/[id]/settings": { id: string };
			"/(app)/inventory/[id]": { id: string };
			"/(app)/inventory/[id]/add": { id: string };
			"/(app)/inventory/[id]/settings": { id: string };
			"/(auth)/reset-password/[token]": { token: string };
			"/(app)/settings/[[category]]/[[subcategory]]": { category?: string; subcategory?: string };
			"/(app)/settings/[[category]]": { category?: string }
		};
		LayoutParams(): {
			"/(auth)": { token?: string };
			"/(app)": { id?: string; category?: string; subcategory?: string };
			"/": { id?: string; token?: string; category?: string; subcategory?: string };
			"/(app)/account": { id?: string };
			"/(app)/account/[id]": { id: string };
			"/(app)/account/[id]/settings": { id: string };
			"/(app)/browse": Record<string, never>;
			"/(app)/inventory": { id?: string };
			"/(app)/inventory/new": Record<string, never>;
			"/(app)/inventory/[id]": { id: string };
			"/(app)/inventory/[id]/add": { id: string };
			"/(app)/inventory/[id]/settings": { id: string };
			"/(auth)/login": Record<string, never>;
			"/(app)/projects": Record<string, never>;
			"/(auth)/register": Record<string, never>;
			"/(auth)/reset-password": { token?: string };
			"/(auth)/reset-password/[token]": { token: string };
			"/(app)/settings": { category?: string; subcategory?: string };
			"/(app)/settings/[[category]]/[[subcategory]]": { category?: string; subcategory?: string };
			"/(app)/settings/[[category]]": { category?: string; subcategory?: string }
		};
		Pathname(): "/" | `/account/${string}` & {} | `/account/${string}/settings` & {} | "/browse" | "/inventory" | "/inventory/new" | `/inventory/${string}` & {} | `/inventory/${string}/add` & {} | `/inventory/${string}/settings` & {} | "/login" | "/projects" | "/register" | "/reset-password" | `/reset-password/${string}` & {} | `/settings${string}${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}