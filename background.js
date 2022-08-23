// This listener sends the banned websites objects if necessary
chrome.tabs.onUpdated.addListener(
	function (tabId, changeInfo, tab) {
		// Load banned websites object from localStorage
		chrome.storage.local.get(null, function(items) {
			/*console.log(items);
			let jsonString = function() {
				if (Object.keys(items).length === 0) {
					return "{}"
				} else {
					return items.WebBlocker
				}
			}();
			console.log(jsonString);
			let blocked_websites = function() {
				let parsed_json = JSON.parse(jsonString);
				if (typeof parsed_json.blocked_websites === "undefined") {
					return []
				} else {
					return parsed_json.blocked_websites
				}
			};*/
			// If items.blocked_websites is undefined, return an empty array
			let blocked_websites = typeof items.blocked_websites === "undefined" ? [] : items.blocked_websites;
			console.log("Blocked websites: "+blocked_websites);
			console.log("Current tab ID: "+tabId);
			console.log("Current tab URL: "+tab.url);
			// Format the tab URL so that it only contains the hostname (both and without "www.")
			let tabDomain = new URL(tab.url);
			tabDomain = tabDomain.hostname.replace('www.','');
			// If current tab URL is in blocked_websites...
			function is_blocked(blocked_websites, tabUrl) {
				let tabDomain = new URL(tabUrl);
				tabDomain = tabDomain.hostname.replace('www.','');
				return (
					blocked_websites.includes(tabDomain) || 
					blocked_websites.includes("www."+tabDomain) ||
					blocked_websites.includes("http://"+tabDomain) ||
					blocked_websites.includes("https://"+tabDomain) ||
					blocked_websites.includes("://"+tabDomain)
				)
			};
			if (is_blocked(blocked_websites, tab.url)) {
				console.log("Blocked URL: "+tab.url)
				// ...try removing the tab
				chrome.tabs.remove(tabId)
				.then(function() {
					// If Promise didn't return an error, show an notification telling the user what happened
					let notification_options = {
						type: "basic",
						title: "Website blocked",
						message: `The website ${tab.url} has been blocked by the WebBlocker extension`,
						iconUrl: "default.png"
					};
					chrome.notifications.create(notification_options);
				})
				// If Promise object has an error, catch it
				.catch(function(error) {
					if (error == `Error: No tab with id: ${tabId}.`) {
						// If failed to remove tab, print the message
						console.log("Failed to remove tab");
					} else {
						// If other error occured, log it and throw it
						console.error(error);
						throw error;
					}
				});
			}
			/*
			if (Object.entries(items).length === 0) {
				chrome.runtime.sendMessage(
					items.WebBlocker, function(response) {}
				);
				console.log("problem");
			} else {
				chrome.runtime.sendMessage(
					"{}", function(response) {}
				);
				console.log("ahm");
			};*/
		});
		/*console.log(jsonString);
		let jsonObject = JSON.parse(jsonString);
		if (tab.url in jsonObject["blocked_websites"]) {
			chrome.tabs.remove(tabId);
		}*/
	}
);

/*chrome.runtime.onMessage.addListener(
	function(jsonString, _sender, _sendResponse) {
		console.log(jsonString);
		let jsonObject = JSON.parse(jsonString);
		if (tab.url in jsonObject["blocked_websites"]) {
			chrome.tabs.remove(tabId);
		}
	}
)*/

chrome.runtime.onStartup.addListener(
	function () {
		// Initialise the JSON string
		chrome.storage.local.set(
			{
				"blocked_websites": [
					"google.com",
					"google.gr",
					"www.example.com"
					]
			});
	}
);