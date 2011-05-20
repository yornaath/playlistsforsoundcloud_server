var request = require("request"),
scSettings = require("./SoundcloudSettings").SoundcloudSettings;


var Soundcloud = function() {};

Soundcloud.prototype.authorize = function(tokens, code, callback) {
  if (tokens) this.tokens = tokens;
  else if (code) {
    this.exchangeCode(code,
    function(err, response, data) {
      if (err) throw new Error(err)
      else {
        callback(data);
      }
    });
  } else {
    throw new Error("Code or tokens has to be specified when creating a Soundcloud instance");
  }
};

//This function takes the atuhorization code and queries the sc oauth server to get a access_token
Soundcloud.prototype.exchangeCode = function(code, callback) {
  request({
    uri: scSettings.exchange_token_url,
    method: "POST",
    body: "client_id=" + scSettings.client_id + "&client_secret=" + scSettings.client_secret + "&grant_type=authorization_code&redirect_uri=" + scSettings.redirect_uri + "&code=" + code
  },
  function(err, response, body) {
    if (!err && response.statusCode == 200) {
      callback(null, response, JSON.parse(body));
    } else {
      callback(err, response, body);
    }
  });
};

Soundcloud.prototype.refreshTokens = function(refreshToken) {
	
};

Soundcloud.prototype.me = function(callback) {
  this.apiQuery({
    resource: "/me",
    format: "json",
    params: {
      oauth_token: this.tokens.access_token
    }
  },
  function(err, response, data) {
    if (!err) callback(null, data)
    else callback(err, data)
  });
};

Soundcloud.prototype.apiQuery = function(options, callback) {
  if (options.resource) {
    request({
      uri: (function() {
        var uri = scSettings.api_url + options.resource + "." + options.format;
        if (options.params) {
          uri += "?";
          for (var index in options.params) {
            uri += index + "=" + options.params[index] + "&";
          }
        }
        return uri;
      })()
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) callback(null, response, JSON.parse(body));
      else callback(err, response, body);
    })
  } else {
    throw new err("Resource not specified when making a Soundcloud.apiQuery")
  }
};

exports.Soundcloud = Soundcloud;






