const configureValues = {
	outletSelectors  : 'main',
	classSelectors  : 'body',
	enableKeepHtml  : true,
	enableKeepStyles: true
};

singular
	.configure(configureValues)
	.ready(() => {
		const h3 = document.createElement('h3');
		h3.textContent = 'Configure';
		const pre       = document.createElement('pre');
		pre.textContent = JSON.stringify(configureValues, null, 2);
		document.getElementsByTagName('header')[0].append(h3, pre);
	});
