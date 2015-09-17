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

dropboxClient.authDriver(new Dropbox.AuthDriver.Redirect({
	rememberUser: true
}));

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