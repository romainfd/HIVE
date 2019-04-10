// content.js

/* Used in popup.js to make sure it's only used once per page */
chrome.storage.sync.set({"cpt": 0}, function() {
  console.log("Counter value set to 0");
});

/* Listen to this call to run the flow */
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.message === "clicked_browser_action") {
			lraf_main();
		}
	}
);

/* Also runs the flow if usage setting is set to always */
window.addEventListener("load", function() {
	chrome.storage.sync.get('usage', function(result) {
		console.log('Usage setting is set to ' + result.usage);
		if (result.usage === "always") {
			lraf_main();
		}
	});
});


// Main function (wraps everything to avoid naming issues)

// $("body").html("<div><p id='0'>ANA</p> ANB<p id='1'>ANC</p> ETT</div>");
function lraf_main() {
	SERVER = "https://liveramp-eng-hackweek.appspot.com/";
	STOP_WORDS = ["IE"];  // list of words not to modify (core html/js/css/... keywords)
	console.log("The following acronyms are ignored for safety reason:", STOP_WORDS);

	var acronymsToId = {
		"ANA": 0,
		"ANB": 1,
		"ANC":123,
		"ETT": 65
	};

	function getAcronymId(word) {
		if (word in acronymsToId) {
			return acronymsToId[word];
		}
		return 3;
	}

	var STARTERS = "\\[\\{\\(,/";
	var ENDERS = "\\}\\]\\),.s?!/\\s";
	var enders_regex = new RegExp("["+ENDERS+"]");
	var ENDERS_MAX_SIZE = 4;
	function splitMatch(match) {
		var start = "";
		if (STARTERS.includes(match[0])) {
			start = match[0];
			match = match.substring(1);
		}
		var end = "";
		while (match.length > MIN_SIZE && enders_regex.test(match[match.length - 1])) {
			end = match[match.length - 1] + end;
			match = match.substring(0, match.length - 1);
		}
		return {
			"start": start,
			"acronym": match,
			"end": end
		};
	}

	function acronymPlaceholder(match) {
		var split = splitMatch(match);
		return split["start"] + "[{LiveRampAcronymFinder:" + split["acronym"] + "}]" + split["end"];
	}

	function replaceAcronym(acronymsData, acronym) {
		if (acronym in acronymsData) {
			return (`<span class="lraf-tooltip">`+acronym+`
			  <span class="lraf-tooltiptext">
			  	<span class="lraf_meaning">` + acronymsData[acronym]["meaning"] + `<a href="https://liveramp-eng-hackweek.appspot.com/acronym?acronym=` + acronym + `" target="_blank"><img src="`+chrome.extension.getURL("pencil.png")+`" style="width: 13px;"></a></span>` + 
			  	(acronymsData[acronym]["synonyms"].length > 0 ? `<span class="lraf_synonyms">Synonyms: ` + acronymsData[acronym]["synonyms"].join(', ') + `</span><br/>`: ``) +
			  	(acronymsData[acronym]["description"].length > 0 ? `<span class="lraf_description">Description: ` + acronymsData[acronym]["description"] + `</span>` : ``) +
			  `</span>
			</span>`);
		} else {
			console.log(acronym, "Missed");
			return (`<span class="lraf-tooltip">`+acronym+`
			  <span class="lraf-tooltiptext">
			  	Help the LiveRamp family: <a href="https://liveramp-eng-hackweek.appspot.com/acronym" target="_blank"><img src="`+chrome.extension.getURL("pencil.png")+`" style="width: 13px;"></a>
			  </span>
			</span>`);
		}
	}

	var MIN_SIZE = 2;
	var MAX_SIZE = 4 + ENDERS_MAX_SIZE;
	var acronym_regex = new RegExp("^["+STARTERS+"A-Z][A-Z]*["+ENDERS+"A-Z]{0,"+ENDERS_MAX_SIZE+"}$");
	function checkAcronym(word) {
		// good size and only capital letters except some special characters and at least 2 letters
		return word.length <= MAX_SIZE && MIN_SIZE <= word.length && acronym_regex.test(word) && /[A-Z]{2,}/.test(word) && !(STOP_WORDS.includes(splitMatch(word)["acronym"]));
	}

	var places_to_replace = [$("body")];
	if (window.location.href.includes("atlassian.net/wiki")) {
		places_to_replace = [$("#main-content")];
		// doesn't work because comments are loaded later
		for (var i  = 0; i < $(".comment-content").length; i++) {
			places_to_replace.push($($(".comment-content")[i]));
		}
	}

	function find_acronyms(modify, _places_to_replace) {
		var queue = _places_to_replace.slice(0);  // copy it
		var acronyms_found = new Set();
		console.log(queue.length, queue);
		while (queue.length > 0) {
			var elem = queue.pop();
			if (elem.prop("tagName") === "IFRAME") {
				// can't access (same-origin policy)
				continue;
			}
			var levelTextNodes = elem.contents().filter(function() { 
			  return this.nodeType == 3;  // text node
			});
			for (var j = 0; j < levelTextNodes.length; j++) {
				var levelTextNode = levelTextNodes[j];
				var words = levelTextNode.nodeValue.split(" ");
				var changed = false;
				for (var i = 0; i < words.length; i++) {
					if (checkAcronym(words[i])) {
						console.log(words[i], "context: " + levelTextNode.nodeValue);
						changed = true;
						acronyms_found.add(splitMatch(words[i])["acronym"]);
						if (modify) {
							words[i] = acronymPlaceholder(words[i]);
						}
					}
				}
				if (modify && changed) {
					levelTextNode.nodeValue = words.join(" ");
				}
			}
			elem.children().each(function() {
				queue.push($(this));
			});
		}
		return acronyms_found;
	}

	// 1. Collect all the acronyms in the page
	var acronyms_found = find_acronyms(modify=false, places_to_replace);

	// 2. Retrieve the data from the DB before updating the acronyms display
	if (acronyms_found.size > 0) {
		console.log("Connecting to DB...");
		$.getJSON(SERVER+"get?acronym=" + Array.from(acronyms_found).join(","), function(acronymsData) {
			/* Fake server answer to test the frontend flow
			acronymsData = {	
				"success":true,
				"acronyms": { 
					"SSA": {
						"acronym":"SSA",
						"meaning":"Server Side Account",
						"description":"Coucou",
						"synonyms":[]
					}
				}
			}
			*/
			console.log("DB answered.");
			if (acronymsData["success"]) {
				// 3. Replace the acronyms in the text by the text placeholder
				find_acronyms(modify=true, places_to_replace);

				// 4. Find the placeholders and replace them with the popup html
				var placeholder_regex = new RegExp("\\[{LiveRampAcronymFinder:([\\w]{" + MIN_SIZE + "," + MAX_SIZE + "})}\\]", "g");
				for (var i in places_to_replace) {	
					var place_to_replace = places_to_replace[i];		
					var newHtml = place_to_replace.html().replace(placeholder_regex, (s, m1) => replaceAcronym(acronymsData["acronyms"], m1) );
					// console.log(newHtml);
					place_to_replace.html(newHtml);
					// console.log($("body").html());
					// console.log("HTML", $("body").html());			
				}
			} else {
				alert("Error with LiveRamp acronym finder: couldn't connect to the database.");
			}

		});		
	}
	
}
