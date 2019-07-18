// Opens the url in a new tab on demand
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "open_new_tab" ) {
      chrome.tabs.create({"url": request.url});
    }
  }
);

// listens to url updates
var old_url = "";  // the url of the page we were on before
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log(tabId, changeInfo, tab);
	// a new page is loaded ?
	if (changeInfo["status"] == "complete" && tab.url != old_url) {
		console.log("Went through");
		old_url = tab.url;  // remember we already arrived on this page (and do this before the asynchronous call to load only once per page)
		// is usage set to always
		chrome.storage.sync.get('usage', function(result) {
			if (result.usage === "always") {
				// Send a message to the active tab to convert acronyms
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					var activeTab = tabs[0];
					chrome.tabs.sendMessage(activeTab.id, {"message": "convertAcronyms"});
				});
			}
		});
	}
});