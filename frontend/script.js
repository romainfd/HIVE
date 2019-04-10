// $("body").html("<div><p id='0'>ANA</p> ANB<p id='1'>ANC</p> ETT</div>");
function find_acronyms() {

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
	function acronymPlaceholder(acronym) {
		var start = "";
		if (STARTERS.includes(acronym[0])) {
			start = acronym[0];
			acronym = acronym.substring(1);
		}
		var end = "";
		while (acronym.length > MIN_SIZE && enders_regex.test(acronym[acronym.length - 1])) {
			end = acronym[acronym.length - 1] + end;
			acronym = acronym.substring(0, acronym.length - 1);
		}
		return start + "{" + acronym + "}{LiveRampAcronymFinder:"+getAcronymId(acronym)+"}" + end;
	}


	var queue = [];

	var MIN_SIZE = 2;
	var MAX_SIZE = 4 + ENDERS_MAX_SIZE;
	var acronym_regex = new RegExp("^["+STARTERS+"A-Z][A-Z]*["+ENDERS+"A-Z]{0,"+ENDERS_MAX_SIZE+"}$");
	function checkAcronym(word) {
		// good size and only capital letters except some special characters and at least 2 letters
		return MIN_SIZE <= word.length && word.length <= MAX_SIZE && acronym_regex.test(word); // && /[A-Z]{2,}/.test(word);
	}


	queue.push($("body"));

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
					changed = true;
					console.log("Acronym:", words[i]);
					words[i] = acronymPlaceholder(words[i]);
				}
			}
			if (changed) {
				levelTextNode.nodeValue = words.join(" ");
			}
		}
		elem.children().each(function() {
			queue.push($(this));
		});
	}

	var placeholder_regex = new RegExp("{([\\w]{" + MIN_SIZE + "," + MAX_SIZE + "})}{LiveRampAcronymFinder:(\\d+)}", "g");
	var newHtml = $("body").html().replace(placeholder_regex, "<a href='https://google.com/$2'>$1</a>");
	// console.log(newHtml);
	$("body").html(newHtml);
	// console.log($("body").html());
	// console.log("HTML", $("body").html());
}