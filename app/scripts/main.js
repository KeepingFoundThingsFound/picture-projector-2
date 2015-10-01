$.ready(function() {

});

var
	dropboxClientCredentials,
	dropboxClient,
	dropboxXooMLUtility,
	dropboxItemUtility,
	mirrorSyncUtility,
	groupingItemURI,
	itemMirrorOptions,
	createAssociationOptions;
dropboxClientCredentials = {
	key: 'x8o1wifzt41hxf9',
	secret: 'ct6469y8mfch3vo'
};

dropboxClient = new Dropbox.Client(dropboxClientCredentials);


console.log(dropboxClient);

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

connectDropbox();