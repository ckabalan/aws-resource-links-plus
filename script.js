var mappings = {
	'ec2/v2': [ {
		"_comment": "EC2 Details: Subnet ID -> Filtered VPC Subnet List",
		"selector": "span#detailsSubnetId",
		"service": "vpc",
		"objtype": "subnets",
		"filtertype": "filter"
	}, {
		"_comment": "EC2 Details: VPC ID -> Filtered VPC List",
		"selector": "span#detailsNetwork",
		"service": "vpc",
		"objtype": "vpcs",
		"filtertype": "filter"
	}, {
		"_comment": "EC2 Details: Key Pair Name -> Filtered EC2 KeyPair List",
		"selector": "#gwt-debug-tabularDetails > table > tbody > tr:nth-child(12) > td:nth-child(1) > div > div > div > span:not([style]):not([class]):not([id])",
		"service": "ec2/v2",
		"objtype": "KeyPairs",
		"filtertype": "keyName"
	}, {
		"_comment": "EC2 Details: Instance State -> Filtered EC2 Instance List",
		"selector": "span#detailsInstanceState",
		"service": "ec2/v2",
		"objtype": "Instances",
		"filtertype": "instanceState"
	}, {
		"_comment": "EC2 Details: Instance Type -> Filtered EC2 Instance List",
		"selector": "span#detailsInstanceType",
		"service": "ec2/v2",
		"objtype": "Instances",
		"filtertype": "instanceType"
	}, {
		"_comment": "EC2 Details: Availability Zone -> Filtered EC2 Instance List",
		"selector": "#gwt-debug-tabularDetails > table > tbody > tr:nth-child(6) > td:nth-child(1) > div > div > div > span:not([style]):not([class]):not([id])",
		"service": "ec2/v2",
		"objtype": "Instances",
		"filtertype": "availabilityZone"
	}, {
		"_comment": "EC2 Details: Private IP -> Filtered EC2 Network Interface List",
		"selector": "#gwt-debug-tabularDetails > table > tbody > tr:nth-child(6) > td:nth-child(2) > div > div > div > span:not([style]):not([class]):not([id])",
		"service": "ec2/v2",
		"objtype": "NIC",
		"filtertype": "privateIpAddress"
	}, {
		"_comment": "EC2 Details: Tags -> Filtered EC2 Instance List",
		"selector": "#gwt-debug-columnNr-0 > div > div:not([style])",
		"following_selector": "div:not([style])",
		"service": "ec2/v2",
		"objtype": "Instances",
		"filtertype": "{{{SELECTOR}}}"
	}]
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
					if (curMapping.hasOwnProperty('following_selector')) {
						$(element).next(curMapping.following_selector);
					} else {
						if (!element.innerHTML.includes('href')) {
							element.innerHTML = "<a href='https://console.aws.amazon.com/" + curMapping.service + "/home?region=" + region + "#" + curMapping.objtype + ":" + curMapping.filtertype + "=" + element.innerHTML + "'>" + element.innerHTML + "</a>"
						}
						return true;
					}
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
