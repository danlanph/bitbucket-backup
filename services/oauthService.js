(function (oauthService) {
    
    const credentialFileManager = require("./credentialFileManager");
    const rarguments = require("./requiredArguments.js");
    const httpRequest = require('request-promise');
    
    var tokenEndpointUrl = null;        
    var repositoryOwner = null;
    var credentials = null;

    function haveValidAccessToken()
    {
        if (credentials == null) {
            credentials = { accessToken: null, expiry: null, consumerKey: null, consumerSecret: null };
        }

        var currentTime = new Date();
             
        if (!credentials || credentials.expiry <= currentTime) {
            return false;
        }

        return true;
    }
    
    function requestAccessToken(consumerKey, consumerSecret, callback) {

        if (!consumerKey) {
            rarguments.getParameter("consumerKey", function (err, result) { 

                if (err) {
                    callback(err);                    
                }
                else {
                    credentials.consumerKey = result;
                    requestAccessToken(result, consumerSecret, callback);
                }

            });
            return;
        }

        if (!consumerSecret) {
            rarguments.getParameter("consumerSecret", function (err, result) {
                
                if (err) {
                    callback(err);
                }
                else {
                    credentials.consumerSecret = result;
                    requestAccessToken(consumerKey, result, callback);
                }

            });
            return;
        }

        httpRequest({
            uri: tokenEndpointUrl,
            auth: {
                user: consumerKey,
                pass: consumerSecret,
                sendImmediately: true,
                json: true
            },
            method: "POST",
            form: {
                grant_type: "client_credentials"
            }})
            .then(function (result) {

                result = JSON.parse(result);
                credentials.accessToken = result.access_token;
                credentials.expiry = new Date(Date.now() + result.expires_in*1000);

                credentialFileManager.saveCredentials(repositoryOwner, credentials);
                callback(null);

            })
            .catch(function (err) {
                callback(err);
            });
    }
    
    oauthService.init = function (tokenEndpoint, repoOwner) {

        tokenEndpointUrl = tokenEndpoint;
        repositoryOwner = repoOwner;

        credentials = credentialFileManager.getCredentials(repositoryOwner);

        return new Promise(function (resolve, reject) {
            oauthService.getAccessToken(function (err, token) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(token);
                }
            });
        });
    }

    oauthService.getAccessToken = function (callback) { 
    
        if (!haveValidAccessToken()) {
            requestAccessToken(credentials.consumerKey, credentials.consumerSecret, function (err) {
                if (err) {
                    callback(err);
                } else { 
                    callback(null, credentials.accessToken);
                }
            });
            return;
        }

        callback(null, credentials.accessToken);
    
    };

    oauthService.getAccessTokenSync = function () {

        if (!haveValidAccessToken()) {

            /* Need to perform synchronous token request */
            throw "Not implemented exception";

        }

        return credentials.accessToken;

    }

})(module.exports);