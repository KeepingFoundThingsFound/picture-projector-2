/*
 * name: main.js
 * Authors: Tanner Garrett, Brandon Thepvongsa
 * Description: JavaScript used to create the functionality of FolderDocs
 * TODO:
 * -Marked.js has been changed to not enclose given markup in <p> tags, need
 * to create own renderer later
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
	$("#groupingItems").empty();
	$("#nonGroupingItems").empty();
	$("#toolbar").empty();

	// Creates the previous/back button
	$("#toolbar").append(printToolbar());

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
	printAssociations(orderAssociations(groupingItems), $("#groupingItems"));
	printAssociations(nonGroupingItems.sort(), $("#nonGroupingItems"));

	createClickHandlers();
}

function orderAssociations(associationList) {
	var orderedItems = [];
	var nonOrderedItems = [];

	for(var i = 0; i < associationList.length; i++) {
		var guid = associationList[i];
		var placement = im.getAssociationNamespaceAttribute('order', guid, 'folder-docs');
		if(placement) {
			orderedItems[placement] = guid;
		} else {
			nonOrderedItems.push(guid);
		}
	}

	// Return an array of unorderedItems + orderedItems (in that order)
	return nonOrderedItems.concat(orderedItems);
}

function printAssociations(associationList, div) {
	for(var i = 0; i < associationList.length; i++) {
		var originalDisplayText = im.getAssociationDisplayText(associationList[i]);
		var appendingObject = associationMarkup(associationList[i]);
		div.append(appendingObject);
		$("#" + associationList[i]).data("originalDisplayText", originalDisplayText);
		console.log($("#" + associationList[i]).data("originalDisplayText"));
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

		var textbox = $('#' + guid);
		$("h4[data-guid='" + guid + "']").show();
		textbox.show();
		textbox.putCursorAtEnd();
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

	$('.assoc-textbox').live('keyup', function(e) {
		var guid = $(this).attr('id');
		var newText = $(this).val();
		$("div[data-guid='" + guid + "'] .assoc-displaytext").html(marked(newText));
	});

	$("#groupingItems").sortable({
		// placeholder: "drop-placeholder",
		stop: function() {
			var order = $("#groupingItems").sortable("toArray", {attribute: 'data-guid'});
			saveOrder(order);
		}
	});

	$("#previous-link").on("click", navigatePrevious);
}

// Handles the showing/hiding/saving functionality of the edit textareas
function textboxHandler(element) {
	var guid = element.attr('id');
	var newText = element.val();
	$("div[data-guid='" + guid + "'] .assoc-displaytext").html(marked(newText)).show();

	// Hides the "live preview" header
	$("h4[data-guid='" + guid + "']").hide();
	im.setAssociationDisplayText(guid, newText);
	saveMirror();
  element.hide();
}

// Saves the current itemMirror object
function saveMirror() {
	im.save(function(error) {
		if(error) {
			console.log('Save Error: ' + error);
		} else {
			console.log('Successfully saved.');
		}
	});
}

// Refreshes the itemMirror object
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

// Prints the previous link to go back up to parent/creator
function printToolbar() {
	var result = "";
	var previous = im.getCreator();
	if(previous) {
		result += "<p><a href='#' id='previous-link'><< back</a></p>";
	}

	result += "<h3>" + im.getDisplayName() + "</h3>";

	return result;
}

// Navigates and refreshes the display to the previous mirror
function navigatePrevious() {
	var previous = im.getCreator();

	if(previous) {
		im = previous;
		refreshIMDisplay();
	}
}

// Attempts to save the order of the associations by matching
// each associations guid with the array of guids returned on a reordering drop.
function saveOrder(displayedAssocs) {
	// Loop through each association
	for(var i = 0; i < associations.length; i++) {
		// Loop through each association we grabbed from the drop event
		for(var k = 0; k < displayedAssocs.length; k++) {
			// Find where the guids match, k will equal the proper order placement
			// when we find a match
			if(associations[i] == displayedAssocs[k]) {
				im.setAssociationNamespaceAttribute('order', k, associations[i], 'folder-docs');
			}
		}
	}
	// After we've set all the proper namespace attributes, let's save the itemMirror
	saveMirror();
}

// Returns the markup for an association to be printed to the screen
// Differentiates between a groupingItem and nonGroupinItem via icon
function associationMarkup(guid) {
	var originalDisplayText = im.getAssociationDisplayText(guid);
	var displayTextWithMarkdown = marked(originalDisplayText);
	var functionCall = "navigateMirror(" + guid + ")";
	var markup = "<div data-guid='" + guid + "' class='row association-row'>" +
	"<div class='col-xs-11'><textarea class='assoc-textbox form-control' rows='5' id='" + guid + "' style='display:none;'>" + originalDisplayText
	+ "</textarea><h4 style='display:none;' data-guid='" + guid + "'>Live preview:</h4>" +

	// Display text area
	"<div data-guid='" + guid + "' class='assoc-displaytext'>" + displayTextWithMarkdown + "</div></div>" +
	"<div class='col-xs-1'>";

	if(im.isAssociationAssociatedItemGrouping(guid)) {
		markup += "<span data-guid='" + guid + "' class='association association-grouping glyphicon glyphicon-folder-open'></span></div>";
	} else {
		markup += "<span class='association association-file glyphicon glyphicon-file'></span></div>";
	}


	return markup;

}

jQuery.fn.putCursorAtEnd = function() {

  return this.each(function() {

    $(this).focus()

    // If this function exists...
    if (this.setSelectionRange) {
      // ... then use it (Doesn't work in IE)

      // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
      var len = $(this).val().length * 2;

      this.setSelectionRange(len, len);

    } else {
    // ... otherwise replace the contents with itself
    // (Doesn't work in Google Chrome)

      $(this).val($(this).val());

    }

    // Scroll to the bottom, in case we're in a tall textarea
    // (Necessary for Firefox and Google Chrome)
    this.scrollTop = 999999;

  });

};
