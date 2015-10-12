$(document).ready(function() {
	$("#dboxButton").on("click", connectDropbox);

});

var
	dropboxClientCredentials,
	dropboxClient;

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

dropboxClientCredentials = {
	key: 'x8o1wifzt41hxf9',
	secret: 'ct6469y8mfch3vo'
};

dropboxClient = new Dropbox.Client(dropboxClientCredentials);

dropboxClient.authDriver(new Dropbox.AuthDriver.Redirect({
	rememberUser: true
}));

var authenticatedClient = null;

function getClient() {
	return authenticatedClient;
}

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
			}
		});
	}
}

function disconnectDropbox() {
	dropboxClient.signOut();
}

dropboxXooMLUtility = {
	driverURI: 'dropboxXooMLUtility',
	dropboxClient: dropboxClient
};
dropboxItemUtility = {
	driverURI: 'dropboxItemUtility',
	dropboxClient: dropboxClient
};
mirrorSyncUtility = {
	utilityURI: 'mirrorSyncUtility'
}