export const colors = [
	'#FFFFFF', /* white */
	'#646464', /* gray */
	'#EF2929', /* red */
	'#8AE234', /* green */
	'#FCE94F', /* yellow */
	'#0000FF', /* blue */
	'#AD7fA8', /* magenta */
	'#AA3300', /* brown */
	'#050505', /* black */
];

export const tiles = new Map<string, string> ([
	[ 'items', '*$()[]%&/?!' ],
	[ 'map', '<>^v+/' ],
	[ 'characters', '@t' ],
	[ 'obstacles', '#~*' ],
	[ 'walkable', '.' ],
]);

export const textRegexp = new RegExp('^[a-zA-Z0-9 \.,!\?_\-]$');
