/********************.    Manage user settings: never or always     ********************/
// Set the user setting based on slider value
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

// Sets slider position based on the former settings
chrome.storage.sync.get('usage', function(result) {
	console.log('Value currently is ' + result.usage);
	if (result.usage === "always") {
  	    document.getElementById("usageSlider").checked = true;
	}
});


/********************.    Manage once convertAcronyms use     ********************/
function convertAcronyms() {
    // Send a message to the active tab to convert acronyms (will test there if already done (with .lraf_acronyms_converted tag))
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, {"message": "convertAcronyms"});
	});
}

document.getElementById('do_once').onclick = convertAcronyms;


/********************.    Manages the creation of new content     ********************/
SERVER = "https://liveramp-eng-hackweek.appspot.com/";

document.getElementById("add_one").onclick = function() {
	var searched_acronym = document.getElementById("acronym").value;
	var end = "";
	// We collect the acronym entered but not found
	if (searched_acronym.length > 0) {
		end = "?acronym="+searched_acronym;
	}
	chrome.tabs.create({url: SERVER + "acronym" + end});
};

document.getElementById("add_csv").onclick = function() {
	chrome.tabs.create({url: SERVER + "csv"});
};
