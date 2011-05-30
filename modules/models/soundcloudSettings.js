
//Add your soundcloud api information here
var SoundcloudSettings = {
	production: {
		client_id : "V0LK9YnuiV6o7mFCqqjDQw",
		client_secret : "NrAiHyDKRjjFqBBylNXSGmJljJ0FLqY4VTiyCRcU",
		redirect_uri : "http://localhost:3000/authorizeapp",
		exchange_token_url : "https://api.soundcloud.com/oauth2/token",
		api_url : "https://api.soundcloud.com"
	},
	development: {
		client_id : "cc9f69d980f0416ed720e0d5a8a6a950",
		client_secret : "ca2db1b733de0c84ad1987db74e962de",
		redirect_uri : "http://localhost:3000/authorizeapp",
		exchange_token_url : "https://api.soundcloud.com/oauth2/token",
		api_url : "https://api.soundcloud.com"
	}
}

module.exports = SoundcloudSettings;