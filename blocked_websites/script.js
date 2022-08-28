let buttons = document.getElementsByTagName('button');
for (let button of buttons) {
	if (button.classList.contains("tabbutton")) {
		button.addEventListener("click", openTab);
	}
	if (button.id == "block_button") {
		button.addEventListener("click", blockWebsite);
	}
}
loadTable();

function showInputResultMessage(msg) {
	document.getElementById("input_result").innerHTML = msg;
}

function isValidWebsiteName(website) {
	// The function returning "true" doesn't mean the domain name entered is 100% correct
	let domain_array = website.split(".").filter(function(entry) {return entry.trim() != '';});
	return (
		domain_array.length >= 2 &&
		domain_array[domain_array.length-1].length >= 2
	)
}

function blockWebsite(_evt) {
	chrome.storage.local.get("blocked_websites", function(items) {
		// Begin by getting the user input
		let user_input = document.getElementById("input_url").value;
		let blocked_websites = items.blocked_websites;
		// Begin by checking if user_input is empty, then if valid and if already in localStorage
		console.log(user_input.length);
		if (user_input.length) {
			if (isValidWebsiteName(user_input)) {
				if (!blocked_websites.includes(user_input)) {
					// If not, proceed
					console.log("Website to block: "+user_input);
					// Then, read the "blocked_websites" Array
					if (typeof blocked_websites == "undefined") {
						// If nothing is defined, make a new Array with the user_input
						blocked_websites = [user_input]
					} else {
						// Else, push the user_input to the blocked_websites
						blocked_websites.push(user_input);
					}
					console.log("New blocked websites: "+blocked_websites);
					// Lastly, save them to localStorage, update the table and show a message
					chrome.storage.local.set({
						"blocked_websites": blocked_websites
					});
					loadTable();
					showInputResultMessage(`Website ${user_input} succesfully blocked`);
				} else {
					showInputResultMessage(`Website "${user_input}" is already blocked`);
				}
			} else {
				// Else, print a message
				console.log("Nothing to block");
				showInputResultMessage(`Website "${user_input}" is not valid`);
			}
		} else {
			showInputResultMessage(`Expected non-empty user input`);
		}
	});
}

function unblockWebsite(website) {
	// Begin by reading the localStorage
	chrome.storage.local.get("blocked_websites", function(items) {
		// Code below obtained from https://stackoverflow.com/a/3954451/
		// It basically removes "website" from "items" (if it exists)
		let blocked_websites = items.blocked_websites;
		let index = blocked_websites.indexOf(website);
		if (index != -1) {
			blocked_websites.splice(index, 1);
			// Once removed "website" from "items". save it to localStorage
			chrome.storage.local.set({
				"blocked_websites": blocked_websites
			});
			// Lastly, update the table
			loadTable();
		}
	});
}

function loadTable(_evt) {
	chrome.storage.local.get("blocked_websites", function(items) {
		let blocked_websites = typeof items.blocked_websites == "undefined" ? [] : items.blocked_websites;
		if (blocked_websites) { // if array isn't empty, execute the rest of the code
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
				url_cell.innerHTML = website;
				// Create a cell with a small button to unblock the corresponding website
				let unblock_cell = row.insertCell();
				let unblock_button = document.createElement("button");
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

function openTab(evt) {
	let toshowTabId = evt.target.id.slice(7);
	let toshowTab = document.getElementById(toshowTabId);

	let visible_tabs = document.getElementsByClassName("visible_tab");
	let button_is_active = evt.target.className.endsWith("active");
	for (let visible_tab of visible_tabs) {
		visible_tab.className = "hidden_tab";
	}

	let tabbuttons = document.getElementsByClassName("tabbutton");
	for (let tabbutton of tabbuttons) {
		tabbutton.className = tabbutton.className.replace(" active", "");
	}

	if (!button_is_active) {
		toshowTab.className = "visible_tab";
		evt.target.className += " active";
	}
}