// Create an interface
interface Items {
	blocked_websites?: string[]
}

let divs = document.getElementsByTagName("div");
for (let i = 0; i < divs.length; i++) {
	if (divs[i].classList.contains("tabbutton")) {
		divs[i].addEventListener("click", openTab);
	}
	if (divs[i].id === "block_button") {
		divs[i].addEventListener("click", blockWebsite);
	}
}
loadTable();

function showInputResultMessage(msg: string) {
	document.getElementById("input_result").innerHTML = msg;
}

function isValidWebsiteName(website: string) {
	// The function returning "true" doesn't mean the domain name entered is 100% correct
	let domain_array = website.split(".").filter(function(entry) {return entry.trim() != '';});
	return (
		domain_array.length >= 2 &&
		domain_array[domain_array.length-1].length >= 2
	)
}

function blockWebsite() {
	chrome.storage.local.get("blocked_websites", function(items: Items) {
		// Begin by getting the user input
		let user_input = (document.getElementById("url_input") as HTMLInputElement).value;
        console.log(user_input);
		let blocked_websites_string = typeof items.blocked_websites === "undefined" ? [] : items.blocked_websites;
		let blocked_websites = blocked_websites_string.map((item) => new URL(item))

		// Try creating a URL object from the input provided
		try {
			new URL(user_input);
		} catch(err) {
			// If error occured...
			if (err.name === "TypeError") {
				// ... and error type is "TypeError", change message on "url_input" and return function
				showInputResultMessage("Invalid URL entered. Perhaps you forgot a \"http(s)://\"?");
				return;
			} else {
				// and error type is unexpected, log it, change message on "url_input" and return function
				console.error(err);
				showInputResultMessage("An unexpected error has occured. Check the console for more info.");
				return;
			}
		}

		// Begin by checking if user_input is empty and if already in localStorage
		if (user_input.length) {
			let tabUrl = new URL(user_input);
			console.log(typeof blocked_websites)
			if (!(blocked_websites.indexOf(tabUrl) > -1)) {
				// If not, proceed
				console.log(`Website to block: ${tabUrl.href}`);
				// Then, read the "blocked_websites" Array
				if (typeof blocked_websites === "undefined") {
					// If nothing is defined, make a new Array with the tabUrl
					blocked_websites = [tabUrl]
				} else {
					// Else, push the tabUrl to the blocked_websites
					blocked_websites.push(tabUrl);
				}
				console.log(`New blocked websites: ${blocked_websites}`);
				// Lastly, save them to localStorage, update the table and show a message
				chrome.storage.local.set({
					"blocked_websites": blocked_websites.map((item) => item.href)
				});
				loadTable();
				showInputResultMessage(`Website "${tabUrl.href}" succesfully blocked`);
			} else {
				showInputResultMessage(`Website "${tabUrl.href}" is already blocked`);
			}
		} else {
			showInputResultMessage(`Expected non-empty user input`);
		}
	});
}

function unblockWebsite(website: URL) {
	// Begin by reading the localStorage
	console.log(`Unblocking ${website.href}`);
	chrome.storage.local.get("blocked_websites", function(items: Items) {
		// Code below obtained from https://stackoverflow.com/a/3954451/
		// It basically removes "website" from "items" (if it exists)
		let blocked_websites_string = typeof items.blocked_websites === "undefined" ? [] : items.blocked_websites;
		//let blocked_websites = blocked_websites_string.map((item) => new URL(item))
		let index = blocked_websites_string.indexOf(website.href);
		console.log(website.href)
		console.log(blocked_websites_string);
		if (index != -1) {
			blocked_websites_string.splice(index, 1);
			// Once removed "website" from "items". save it to localStorage
			chrome.storage.local.set({
				"blocked_websites": blocked_websites_string
			});
			// Lastly, update the table
			loadTable();
		}
	});
}

function loadTable() {
	chrome.storage.local.get("blocked_websites", function(items: Items) {
		let blocked_websites_string = typeof items.blocked_websites === "undefined" ? [] : items.blocked_websites;
		console.log(blocked_websites_string);
		let blocked_websites = blocked_websites_string.map((item) => new URL(item))
		if (blocked_websites) { // if array isn't empty, execute the rest of the code
			console.log(blocked_websites[0]);
			// Create an empty table
			let table = document.createElement("table");
			// Edit it's ID
			table.id = "blocked_websites_table";
			// Iterate blocked_websites and add them to the table, one by one
			for (let website of blocked_websites) {
				// Create a new row
				let row = table.insertRow();
				// Create a cell which contains the blocked URL
				let url_cell = row.insertCell();
				url_cell.innerHTML = website.href;
				// Create a cell with a small button to unblock the corresponding website
				let unblock_cell = row.insertCell();
				let unblock_button = document.createElement("div");
				unblock_button.classList.add("unblock")
				unblock_button.innerHTML = "Unblock";
				unblock_button.addEventListener("click", function() {unblockWebsite(website)});
				unblock_cell.appendChild(unblock_button);

			}
			// Once filled the table with the websites, append it to "table" division
			let htmltablediv = document.getElementById("table");
			htmltablediv.innerHTML = "Blocked websites:\n";
			htmltablediv.appendChild(table);
		} else {
			let htmltablediv = document.getElementById("table");
			htmltablediv.innerHTML = "Nothing is blocked yet. Try inputting a website";
		}
	});
}

function openTab(evt: Event) {
	let event_target = (evt.currentTarget as HTMLDivElement);
	let toshowTabId = event_target.getAttribute("tabId");
	let toshowTab = document.getElementById(toshowTabId);

	let visible_tabs = document.getElementsByClassName("visible_tab");
	let button_is_active = event_target.className.endsWith("active");
	for (let i = 0; i < visible_tabs.length; i++) {
		visible_tabs[i].className = "hidden_tab";
	}

	let tabbuttons = document.getElementsByClassName("tabbutton");
	for (let i = 0; i < tabbuttons.length; i++) {
		tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
	}

	if (!button_is_active) {
		toshowTab.className = "visible_tab";
		event_target.className += " active";
	}
}
