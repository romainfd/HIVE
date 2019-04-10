/* Manage user settings: never or always */
function setUsageSetting() {
	var usageValue = "never";
	if (document.getElementById("usageSlider").checked) {
		usageValue = "always";
		convertAcronyms();  // directly call it as well
	}
	chrome.storage.sync.set({"usage": usageValue}, function() {
		console.log('Usage value is set to ' + usageValue);
	});
}

// Slider updates settings
document.getElementById('usageSlider').onclick = setUsageSetting;

// Sets to slider based on the former settings
chrome.storage.sync.get('usage', function(result) {
	console.log('Value currently is ' + result.usage);
	if (result.usage === "always") {
  	    document.getElementById("usageSlider").checked = true;
	}
});


/* Manage once convertAcronyms use */
function convertAcronyms() {
	chrome.storage.sync.get('cpt', function(result) {
		if (result.cpt > 0) {
			console.log("LiveRamp Acronyms Finder already used once");
			return;  // we do it only once to avoid matching inside the popups themselves
		} else {
			    // Send a message to the active tab
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					var activeTab = tabs[0];
					chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
				});
				chrome.storage.sync.set({"cpt": 1}, function() {
				console.log("Counter value set to 1");
			});
		}
	});
}

document.getElementById('do_once').onclick = convertAcronyms;


/* Manages the creation of new content */
document.getElementById("add_one").onclick = function() {
	var searched_acronym = document.getElementById("acronym").value;
	var end = 0;
	if (searched_acronym.length > 0) {
		end = "?acronym="+searched_acronym;  // we prefill the creation form
	}
	chrome.tabs.create({url: "https://liveramp-eng-hackweek.appspot.com/acronym" + end});
	// We collect the acronym entered but not found
};

document.getElementById("add_csv").onclick = function() {
	chrome.tabs.create({url: "https://liveramp-eng-hackweek.appspot.com/csv"});
};
