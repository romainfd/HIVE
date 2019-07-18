/* Listen to this call to run the flow */
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.message === "convertAcronyms") {
			lraf_main();
		}
	}
);

/* Listen to keyboard shortcut as well */
window.onkeyup = function(e){
	// Ctrl + Option + H
	if (e.keyCode == 72 && e.ctrlKey && e.altKey) {
		lraf_main();
	}
}

// Main function (wraps everything to avoid naming issues)

// $("body").html("<div><p id='0'>ANA</p> ANB<p id='1'>ANC</p> ETT</div>");  // for test purposes: gives a simple body
function lraf_main() {
	console.log("******** Running HIVE *********");
	SERVER = "https://liveramp-eng-hackweek.appspot.com/";
	STOP_WORDS = ["IE"];  // list of words not to modify (core html/js/css/... keywords)
	console.log("The following acronyms are ignored for safety reason:", STOP_WORDS);

	// Extract an acronym from its context: (ANA) or ANA, or ANA. ...
	var STARTERS = "\\[\\{\\(,/\\-";
	var ENDERS = "\\}\\]\\),.s?\\-!/\\s";
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

	// Placeholder to use in text nodes to replace acronyms. Should be find later and replace by html
	function acronymPlaceholder(match) {
		var split = splitMatch(match);
		return split["start"] + "[{LiveRampAcronymFinder:" + split["acronym"] + "}]" + split["end"];
	}

	// Replace the text placeholder by the html for the tooltip and the explanation
	function replaceAcronym(acronymsData, acronym) {
		if (acronym in acronymsData) {
			return (`<span class="lraf-tooltip">`+acronym+`
			  <span class="lraf-tooltiptext">
			  	<span class="lraf_meaning">` + acronymsData[acronym]["meaning"] + `<span class="modify-icon" data-href="https://liveramp-eng-hackweek.appspot.com/acronym?acronym=` + acronym + `"><img src="`+chrome.extension.getURL("img/pencil.png")+`" style="width: 13px;"/></span></span>` + 
			  	(acronymsData[acronym]["synonyms"].length > 0 ? `<span class="lraf_synonyms">Synonyms: ` + acronymsData[acronym]["synonyms"].join(', ') + `</span><br/>`: ``) +
			  	(acronymsData[acronym]["description"].length > 0 ? `<span class="lraf_description">Description: ` + acronymsData[acronym]["description"] + `</span>` : ``) +
			   `<span class="end"></span>
			  </span>
			</span>`);
		} else {
			console.log(acronym, "Missed");  // to easily know the acronyms to add
			return (`<span class="lraf-tooltip">`+acronym+`
			  <span class="lraf-tooltiptext">
			  	Help the LiveRamp family: <span class="modify-icon" data-href="https://liveramp-eng-hackweek.appspot.com/acronym" target="_blank"><img src="`+chrome.extension.getURL("img/pencil.png")+`" style="width: 13px;"/></span>
			    <span class="end"></span>
			  </span>
			</span>`);
		}
	}

	// Check if a given word is an acronym (not too short or too long, with only capital letters (except start/end characters) and at least 2 of them
	var MIN_SIZE = 2;
	var MAX_SIZE = 4 + ENDERS_MAX_SIZE;
	var acronym_regex = new RegExp("^["+STARTERS+"A-Z][A-Z]*["+ENDERS+"A-Z]{0,"+ENDERS_MAX_SIZE+"}$");
	function checkAcronym(word) {
		// good size and only capital letters except some special characters and at least 2 letters
		return word.length <= MAX_SIZE && MIN_SIZE <= word.length && acronym_regex.test(word) && /[A-Z]{2,}/.test(word) && !(STOP_WORDS.includes(splitMatch(word)["acronym"]));
	}

	// Only active on certain pages and certain areas
	function get_places_to_replace() {
		var places_to_replace = [];
		// specific places for the website
		if (window.location.href.includes("atlassian.net/wiki")) {
			console.log("KB set up detected");
			places_to_replace.push($("#main-content"));
			// doesn't work because comments are loaded later
			for (var i  = 0; i < $(".comment-content").length; i++) {
				places_to_replace.push($($(".comment-content")[i]));
			}
		} else if (window.location.href.includes("atlassian.net/browse")) {
			console.log("JIRA set up detected");
			places_to_replace.push($("#descriptionmodule"));
		} else if (window.location.href.includes("mail.google.com/mail")) {
			console.log("Gmail set up detected");
			for (var i  = 0; i < $(".a3s").length; i++) {
				places_to_replace.push($($(".a3s")[i]));
			}
		}
		return places_to_replace;
	}

	// find the acronyms in the _places_to_replace (going through their children)
	// modify = true/false says if we should modify the acronyms we found (if not, only collects them)
	function find_acronyms(modify, _places_to_replace) {
		var queue = _places_to_replace.slice(0);  // copy it
		var acronyms_found = new Set();
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
				var wordsSpaced = levelTextNode.nodeValue.split(" ");  // split on space
				var changed = false;
				for (var i = 0; i < wordsSpaced.length; i++) {
					// We also split on hyphens to match acronyms like CID-PEL
					var words = wordsSpaced[i].split("-");
					for (var k = 0; k < words.length; k++) {
						if (checkAcronym(words[k])) {
							changed = true;
							acronyms_found.add(splitMatch(words[k])["acronym"]);
							if (modify) {
								words[k] = acronymPlaceholder(words[k]);
							}
						}
					}
					wordsSpaced[i] = words.join("-");
				}
				if (modify && changed) {
					levelTextNode.nodeValue = wordsSpaced.join(" ");
				}
			}
			elem.children().each(function() {
				queue.push($(this));
			});
		}
		return acronyms_found;
	}

	// Pages using sub divs with scroll (like gmail mail content) won't scroll anymore because they would simply overflow
	function allow_overflow_no_scroll() {
		var tooltiptexts = $(".lraf-tooltiptext");
		for (var i = 0; i < tooltiptexts.length; i++) {
			var parent = $(tooltiptexts[i]).parent();
			while (parent.length > 0) {
				if (parent.css("overflow") != "visible") {
					parent.css("overflow", "visible");
					break;
				}
				parent = parent.parent();
			}
		}
	}

	// To allow overflow, we use a fixed position => we have to find the correct position and height for the tooltiptext
	function allow_overflow() {
		$(".lraf-tooltip").hover( function() {
			if ($(this).children(".lraf-tooltiptext").length == 1) {
				var tooltip_text = $($(this).children(".lraf-tooltiptext")[0]);
	    
   				// We set the popup size
				var height = 16;
				if (tooltip_text.children(".end").length > 0) {
					var margin = 10;
					if (tooltip_text.children().length == 2) {
						if (tooltip_text.children(".modify-icon").length == 1) {
							// No match in DB => modify-icon directly in tooltip
							margin = 15;
						} else {
							// modify-icon in meaning
							margin = -10;  // only the end span and the meaning
						}
					} else {
						margin = 10;
					}
					height = $(tooltip_text.children(".end")[0]).offset().top - tooltip_text.offset().top + margin;  // 10 to have some margin
				}
				tooltip_text.css("height", height + "px");

			    // place the tooltiptext in the correct position relevant to the tooltip
			    tooltip_text.offset({
					top: $(this).offset().top - Math.round($(this).outerHeight() * 0.75) - height,
					left: $(this).offset().left - Math.round(tooltip_text.innerWidth() * 0.5) + 7 + Math.round($(this).outerWidth() * 0.5)
				});
			}
		}, function() {
			// OUT
		});
	}

	/***********************************************************************************************************************************************
	********															MAIN LOGIC															********
	***********************************************************************************************************************************************/    
	// 0. Should we do something ? If yes mark it not to redo once. And what to do ?
	// 0.a Should we do something on this page ?
	if (document.getElementsByClassName("lraf_acronyms_converted").length > 0) {
		// we have already done this page (couldn't simply store the url because we can come back to a page)
		console.log("LiveRamp Acronyms Finder already run once on this page");
		return;
	}
	// 0.b What to do ?
	var places_to_replace = get_places_to_replace();
	// 0.c Set a tag not to redo it
	if (places_to_replace.length > 0) {
		places_to_replace[0].append("<span class='lraf_acronyms_converted' style='display: none;'></span>");  // to say we already converted this page
	}

	// 1. Collect all the acronyms in the page
	var acronyms_found = find_acronyms(modify=false, places_to_replace);

	// 2. Retrieve the data from the DB before updating the acronyms display (to avoid a flash of the placeholder texts while we query the DB)
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
				// 3. Now that we have the data to auickly replace the placeholders afterwards, we replace the acronyms in the text by the text placeholder
				find_acronyms(modify=true, places_to_replace);

				// 4. Find the placeholders and replace them with the tooltip html
				var placeholder_regex = new RegExp("\\[{LiveRampAcronymFinder:([\\w]{" + MIN_SIZE + "," + MAX_SIZE + "})}\\]", "g");
				for (var i in places_to_replace) {	
					var place_to_replace = places_to_replace[i];		
					var newHtml = place_to_replace.html().replace(placeholder_regex, (s, m1) => replaceAcronym(acronymsData["acronyms"], m1) );
					place_to_replace.html(newHtml);
				}

				// 5. We allow the tooltips to overflow
				allow_overflow();

				// 6. We listen to the modify icon
				$(".modify-icon").click(function() {
      				// sends message so that background opens the modification tab
      				chrome.runtime.sendMessage({"message": "open_new_tab", "url": $(this).data("href")});
				});
			} else {
				alert("Error with LiveRamp acronym finder: couldn't connect to the database.");
			}

		});		
	}
}
