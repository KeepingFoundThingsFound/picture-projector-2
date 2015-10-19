/*
 * name: main.js
 * Authors: Tanner Garrett, Brandon Thepvongsa
 * Discription: JavaScript used to create the functionality of FolderDocs
*/

$(document).ready(function() {
	$("#dboxButton").on("click", connectDropbox);
	if(getClient()) {
		$(".jumbotron").hide();
	}
});

var
	im,
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
	var entryDisplayName;
	$("#display").empty();
	// im.listAssociations(function(GUIDs) {
	// 	associations = GUIDs;
	// });
	associations = im.listAssociations();
	var length = associations.length;

	for(var i = 0; i < length; i++) {
		var displayText = im.getAssociationDisplayText(associations[i]);
		$("#display").append("<p>" + displayText + "</p>");
	}

	// associations.forEach(function(entry) {
	// 	im.getDisplayName(function(displayName) {
	// 		entryDisplayName = displayName;
	// 	});
	// 	$("#display").append("<p>" + entryDisplayName + "</p>");
	// });
}