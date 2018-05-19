const actualCode = `
	var s = document.createElement('script');
	s.src = ${resourceUrl};
	s.onload = function() {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
`;

chrome.tabs.executeScript(tabId, {code: actualCode, runAt: 'document_end'}, cb);
