let totalSeconds = 0;
let totalTimer;
let eachTimer;
if (sessionStorage['total']) {
	totalSeconds = +sessionStorage['total'];
}

function debug(message) {
	console.debug(message);
	const li     = document.createElement('li');
	li.innerHTML = message;
	document.getElementById('logs').appendChild(li);
}

singular
	.configure({
		outletSelectors: ['heading'],
		enableKeepHtml : true
	})
	.ready(() => {
		debug('singular.ready');
		const totalNode     = document.getElementById('totalPage');
		totalNode.innerHTML = '' + totalSeconds;
		totalTimer          = setInterval(() => {
			totalNode.innerHTML = '' + (totalSeconds++);
			sessionStorage.setItem('total', '' + totalSeconds);
		}, 1000);
	})
	.load(() => {
		debug('singular.load');
		const eachNode     = document.getElementById('currentPage');
		let seconds        = sessionStorage[location.href] || 0;
		eachNode.innerHTML = seconds;
		eachTimer          = setInterval(() => {
			eachNode.innerHTML = '' + (seconds++);
			sessionStorage.setItem(location.href, seconds);
		}, 1000);
	})
	.unload(() => {
		debug('singular.unload');
		clearInterval(eachTimer);
	});
