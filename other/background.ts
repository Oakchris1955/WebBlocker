// Create an interface
interface Items {
	blocked_websites?: string[]
}

// This listener sends the banned websites objects if necessary
chrome.tabs.onUpdated.addListener(
	function (tabId, changeInfo, tab) {
		// Load banned websites object from localStorage
		chrome.storage.local.get("blocked_websites", function(items: Items) {
			// If items.blocked_websites is undefined, return an empty array
			let blocked_websites_string = typeof items.blocked_websites === "undefined" ? [] : items.blocked_websites;
			let blocked_websites = blocked_websites_string.map((item) => new URL(item))
			console.log("Blocked websites: "+blocked_websites);
			console.log("Current tab ID: "+tabId);
			console.log("Current tab URL: "+tab.url);
			// Format the tab URL so that it only contains the hostname (both and without "www.")
			let tabDomain = new URL(tab.url);
			// If current tab URL is in blocked_websites...
			function is_blocked(blocked_websites: URL[], tabUrl: URL) {
				/*let tabDomain: any = new URL(tabUrl);
				tabDomain = tabDomain.hostname.replace('www.','');
				return (
					blocked_websites.includes(tabDomain) || 
					blocked_websites.includes("www."+tabDomain) ||
					blocked_websites.includes("http://"+tabDomain) ||
					blocked_websites.includes("https://"+tabDomain) ||
					blocked_websites.includes("://"+tabDomain)
				)*/
				return blocked_websites.some(
					(item) => {
						console.log(tabUrl.hostname);
						console.log(item.hostname)
						return tabUrl.hostname.replace("www.", "") === item.hostname.replace("www.", "");
					})
			};
			if (is_blocked(blocked_websites, tabDomain)) {
				console.log("Blocked URL: "+tabDomain.href)
				// ...try removing the tab
				chrome.tabs.remove(tabId)
				.then(function() {
					// If Promise didn't return an error, show an notification telling the user what happened
					let notification_options: any = {
						type: "basic",
						title: "Website blocked",
						message: `The website ${tab.url} has been blocked by the WebBlocker extension`,
						iconUrl: "default.png"
					};
					chrome.notifications.create(notification_options);
				})
				// If Promise object has an error, catch it
				.catch(function(error) {
					if (error === `Error: No tab with id: ${tabId}.`) {
						// If failed to remove tab, print the message
						console.log("Failed to remove tab");
					} else {
						// If other error occured, log it and throw it
						console.error(error);
						throw error;
					}
				});
			}
		});
	}
);

chrome.runtime.onInstalled.addListener(
	function () {
		// Read localStorage
        chrome.storage.local.get("blocked_websites", function(items: Items) {
            // If "blocked_websites doesn't exit..."
            if (typeof items.blocked_websites === "undefined") {
                // ...initialise the JSON string
                chrome.storage.local.set({"blocked_websites": [] as string[]});
            }
        });
    }
)