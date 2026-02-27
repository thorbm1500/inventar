export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20')
];

export const server_loads = [2];

export const dictionary = {
		"/(app)": [6,[2],[3]],
		"/(app)/account/[id]": [~7,[2],[3]],
		"/(app)/account/[id]/settings": [~8,[2],[3]],
		"/(app)/browse": [9,[2],[3]],
		"/(app)/inventory": [10,[2],[3]],
		"/(app)/inventory/new": [11,[2],[3]],
		"/(app)/inventory/[id]": [~12,[2],[3]],
		"/(app)/inventory/[id]/add": [13,[2],[3]],
		"/(app)/inventory/[id]/settings": [~14,[2],[3]],
		"/(auth)/login": [17,[4],[5]],
		"/(app)/projects": [15,[2],[3]],
		"/(auth)/register": [18,[4],[5]],
		"/(auth)/reset-password": [19,[4],[5]],
		"/(auth)/reset-password/[token]": [20,[4],[5]],
		"/(app)/settings/[[category]]/[[subcategory]]": [~16,[2],[3]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';