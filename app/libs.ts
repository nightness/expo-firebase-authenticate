// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

export type UriType = {
	source: string,
    protocol: string,
    authority: string,
    userInfo: string,
    user: string,
    password: string,
    host: string,
    port: string,
    relative: string,
    path: string,
    directory: string,
    file: string,
    query: string,
    anchor: string,
}

parseUri.options = {
	strictMode: false,
	key: [
		'source',
		'protocol',
		'authority',
		'userInfo',
		'user',
		'password',
		'host',
		'port',
		'relative',
		'path',
		'directory',
		'file',
		'query',
		'anchor',
	],
	q: {
		name: 'queryKey',
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
	},
	parser: {
		strict:
			/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:
			/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
	},
};

export function parseUri(str: string) {
	var o = parseUri.options,
		m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str),
		uri = {} as any,
		i = 14;

	while (i--) uri[o.key[i]] = m?.[i] || '';

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0: string, $1 : string, $2: string) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri as UriType;
}