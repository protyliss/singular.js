dash
	.configure({
		htmlSelectors : 'main',
		classSelectors: 'body',
		enableKeepHtml: true,
		enableKeepStyles: true,
		enableHashString: true
	})
	.activeLink('nav')


dash.session.set('test', {'test': 'tested'});
console.log(dash.session.get('test'));
