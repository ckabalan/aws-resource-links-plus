var mappings = {
	'ec2/v2': [ {
		"selector": "span#detailsSubnetId",
		"service": "vpc",
		"objtype": "subnets",
		"filtertype": "filter",
		"link": "<a href='https://console.aws.amazon.com/vpc/home?region={{{RESOURCE_REGION}}}#subnets:filter={{{RESOURCE_ID}}}'>{{{RESOURCE_ID}}}</a>"
	}, {
		"selector": "span#detailsNetwork",
		"service": "vpc",
		"objtype": "vpcs",
		"filtertype": "filter",
		"link": "<a href='https://console.aws.amazon.com/vpc/home?region={{{RESOURCE_REGION}}}#vpcs:filter={{{RESOURCE_ID}}}'>{{{RESOURCE_ID}}}</a>"
	}, {
		"selector": "#gwt-debug-tabularDetails > table > tbody > tr:nth-child(12) > td > div > div > div > span:not([style]):not([class]):not([id])",
		"service": "ec2/v2",
		"objtype": "KeyPairs",
		"filtertype": "search",
	} ]
}
// Get the Service and the Region
var url_re = /(?:http(?:s?):\/\/console\.aws\.amazon\.com\/)(ec2\/v2)(?:\/home\?region=)((?:ap|ca|cn|eu|sa|us)-(?:north|south)?(?:east|west|central)?-\d)\#.+/i;
var url_matches = window.location.href.match(url_re);
var service = url_matches[1];
var region = url_matches[2];





var observer = new MutationObserver(function(mutations) {
    // For each MutationRecord in 'mutations'...
    mutations.some(function(mutation) {
        // If elements have beed added...
        if (mutation.addedNodes && (mutation.addedNodes.length > 0)) {
            // Look for current selector
			mappings[service].forEach(function(curMapping) {
				var element = mutation.target.querySelector(curMapping.selector);
				if (element) {
					console.log(element);
					if (!element.innerHTML.includes('href')) {
						element.innerHTML = "<a href='https://console.aws.amazon.com/" + curMapping.service + "/home?region=" + region + "#" + curMapping.objtype + ":" + curMapping.filtertype + "=" + element.innerHTML + "'>" + element.innerHTML + "</a>"
					}
					return true;
				}
			});
        }
    });
});
/* Start observing 'body' for 'div#search' */
observer.observe(document.body, { childList: true, subtree: true });


addXMLRequestCallback(function(xhr) {
});
function createLinks() {
	mappings[service].forEach(function(curMapping) {
		var subnets = document.querySelectorAll(curMapping.selector);
		subnets.forEach(function (element) {
			if (!element.innerHTML.includes('href')) {
				console.log(element.innerHTML);
				element.innerHTML = "<a href='https://console.aws.amazon.com/" + curMapping.service + "/home?region=" + region + "#" + curMapping.type + ":" + curMapping.filtertype + "=" + element.innerHTML + "'>" + element.innerHTML + "</a>"
				//element.innerHTML = curMapping.link.replaceAll('{{{RESOURCE_REGION}}}', region).replaceAll('{{{RESOURCE_ID}}}', element.innerHTML);
				console.log(element.innerHTML);
			}
		});
	});
}

function addXMLRequestCallback(callback) {
	var oldSend, i;
	if( XMLHttpRequest.callbacks ) {
		// we've already overridden send() so just add the callback
		XMLHttpRequest.callbacks.push( callback );
	} else {
		// create a callback queue
		XMLHttpRequest.callbacks = [callback];
		// store the native send()
		oldSend = XMLHttpRequest.prototype.send;
		// override the native send()
		XMLHttpRequest.prototype.send = function(){
			// process the callback queue
			// the xhr instance is passed into each callback but seems pretty useless
			// you can't tell what its destination is or call abort() without an error
			// so only really good for logging that a request has happened
			// I could be wrong, I hope so...
			// EDIT: I suppose you could override the onreadystatechange handler though
			for( i = 0; i < XMLHttpRequest.callbacks.length; i++ ) {
				XMLHttpRequest.callbacks[i]( this );
			}
			// call the native send()
			oldSend.apply(this, arguments);
		}
	}
}
String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.split(search).join(replacement);
};
