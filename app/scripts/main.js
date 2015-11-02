/*
 * name: main.js
 * Authors: Tanner Garrett, Brandon Thepvongsa
 * Discription: JavaScript used to create the functionality of FolderDocs
*/

$(document).ready(function() {
	$("#dboxButton").on("click", connectDropbox);
});

var
	im,
	previous,
	associations,
	dropboxClientCredentials,
	dropboxClient;

dropboxClientCredentials = {
	key: config.key,
	secret: config.secret
};

dropboxClient = new Dropbox.Client(dropboxClientCredentials);

dropboxClient.authDriver(new Dropbox.AuthDriver.Redirect({
	rememberUser: true
}));

var authenticatedClient = null;

function getClient() {
	return authenticatedClient;
}

// Constructs the root ItemMirror object from the root of the Dropbox.
function constructIMObject() {
	dropboxXooMLUtility = {
		fragmentURI: '/XooML2.xml',
		driverURI: 'DropboxXooMLUtility',
		dropboxClient: dropboxClient
	};
	dropboxItemUtility = {
		driverURI: 'DropboxItemUtility',
		dropboxClient: dropboxClient
	};
	mirrorSyncUtility = {
		utilityURI: 'MirrorSyncUtility'
	};
	var options = {
		groupingItemURI: "/",
		xooMLDriver: dropboxXooMLUtility,
		itemDriver: dropboxItemUtility,
		syncDriver: mirrorSyncUtility
	};
	im = new ItemMirror(options, function(error, newMirror) {
		if(error) {
			console.log(error);
		} else {
			im = newMirror
			console.log(im);
			refreshIMDisplay();
		}
	});
}

// Directs the client to Dropbox's authentication page to sign in.
function connectDropbox() {
	if(authenticatedClient) {
		console.log('Dropbox authenticated');
	} else {
		console.log('Dropbox authenticating...');
		dropboxClient.authenticate(function (error, client) {
			if(error) {
				console.log('Dropbox failed to authenticate');
			} else {
				authenticatedClient = client;
				console.log('Dropbox authenticated');
				constructIMObject();
			}
		});
	}
}

// Signs current client out of Dropbox
function disconnectDropbox() {
	dropboxClient.signOut();
}

// Deletes all elements in the display, then populates the list with paragraphs for each
// association (WiP).
function refreshIMDisplay() {

	// Hides the jumbotron if we are already connected to Dropbox
	if(getClient()) {
		$(".jumbotron").hide();
	}

	var entryDisplayName;
	$("#display").empty();

	// Creates the previous/back button
	previous = im.getCreator();
	$("#display").append(printPrevious());

	associations = im.listAssociations();
	var length = associations.length;

	// Grab associations and organize them by type
	var groupingItems = [];
	var nonGroupingItems = [];
	for(var i = 0; i < length; i++) {
		if(im.isAssociationAssociatedItemGrouping(associations[i])) {
			groupingItems.push(associations[i]);
		} else {
			nonGroupingItems.push(associations[i]);
		}
	}

	// Prints out items in alphabetical order
	printAssociations(groupingItems.sort());
	printAssociations(nonGroupingItems.sort());

	createClickHandlers();
}

function printAssociations(associationList) {
	for(var i = 0; i < associationList.length; i++) {
		$("#display").append(associationMarkup(associationList[i]));
	}
}

// Creates the JS click handlers for the various associations and links
// Also creates the handlers for the textbox editing of associations
function createClickHandlers() {
	$(".association-grouping").click(function(){
		var guid = $(this).attr('data-guid');
		navigateMirror(guid);
	});

	$('.assoc-displaytext').on('click', function() {
		var guid = $(this).attr('data-guid');
		$(this).hide();
		$('#' + guid).show();
	});
	
	$('.assoc-textbox').on('blur', function() {
		var element = $(this);
		textboxHandler(element);
    });

	$('.assoc-textbox').keypress(function (e) {
		if(e.which == 13) {
			var element = $(this);
			textboxHandler(element);
		}
	});

	$("#previous-link").on("click", navigatePrevious);
}

function textboxHandler(element) {
	var guid = element.attr('id');
	var newText = element.val();
	$("p[data-guid='" + guid + "']").text(newText).show();

	//refreshMirror();
	im.setAssociationDisplayText(guid, newText);
	saveMirror();
    element.hide();

}

// Saves the current itemMirror object
function saveMirror() {
	im.save(function(error) {
		if(error) { 
			console.log('Save Error: ' + error)
		}
	});
}

function refreshMirror() {
	im.refresh(function(error) {
		if(error) {
			console.log('Refresh error:' + error);
		}
	});
}

// Attempts to navigate and display a new itemMirror association
function navigateMirror(guid) {
	im.createItemMirrorForAssociatedGroupingItem(guid, function(error, newMirror) {
		console.log(error);

		if(!error) {
			im = newMirror;
			refreshIMDisplay();
		}
	});
	
}

// Prints the previous link to go back up
function printPrevious() {
	if(previous) {
		return "<p><a href='#' id='previous-link'><< back</a></p>";
	}
}

// Navigates and refreshes the display to the previous mirror
function navigatePrevious() {
	var previous = im.getCreator();

	if(previous) {
		im = previous;
		refreshIMDisplay();
	}
}

// Returns the markup for an association to be printed to the screen
// Differentiates between a groupingItem and nonGroupinItem via icon
function associationMarkup(guid) {
	var displayText = im.getAssociationDisplayText(guid);
	var functionCall = "navigateMirror(" + guid + ")";
	displayText = insertMarkup(displayText, "__", "bold");
	displayText = insertMarkup(displayText, "_", "italic");
	var markup = "<div class='row association-row'>" +
	"<div class='col-xs-11'><p data-guid='" + guid + "' class='assoc-displaytext'>" + displayText + "</p></div>" + 
	"<div class='col-xs-1'>";

	if(im.isAssociationAssociatedItemGrouping(guid)) {
		markup += "<span data-guid='" + guid + "' class='association association-grouping glyphicon glyphicon-folder-open'></span></div>";
	} else {
		markup += "<span class='association association-file glyphicon glyphicon-file'></span></div>";
	}

	markup +="<input class='assoc-textbox' id='" + guid + "' type='textbox' style='display:none;' value='" + displayText + "' />";

	return markup;
	
}

// When given the display text, the value of the markup, and the tag name,
// it will encase the text between pairs of the markup specified in a span
// and removes the markup characters.The name of the span is the tag name 
// given. It then returns this new string
function insertMarkup(displayText, markup, tagName) {
	while(displayText.indexOf(markup) != -1) {
		displayText = splice(displayText, "<span class=\"" + tagName +"\">", displayText.indexOf(markup), markup.length);
		console.log(displayText);
		if(displayText.indexOf(markup) != -1) {
			displayText = splice(displayText, "</span>", displayText.indexOf(markup), markup.length);
			console.log(displayText);
		} else {
			displayText = displayText + "</span>";
		}
	}
	return displayText;
}

// Inserts the string specified into the original string at the index specified.
// It will remove the amount of characters given at that index
function splice(originalString, insertString, index, remove) {
	return(originalString.slice(0, index) + insertString + originalString.slice(index + Math.abs(remove)));
}
