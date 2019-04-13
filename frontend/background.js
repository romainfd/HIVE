// background.js
console.log("BACK");
 chrome.extension.onConnect.addListener(function(port) {
      console.log("Connected .....");
      port.onMessage.addListener(function(msg) {
           console.log("message received" + msg);
		  // Send a message to the active tab
		  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		    var activeTab = tabs[0];
		    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
		  });
           port.postMessage("Hi Popup.js");
   });
 })

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "open_new_tab" ) {
      chrome.tabs.create({"url": request.url});
    }
  }
);