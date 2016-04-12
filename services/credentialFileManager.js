(function (credentialFileManager) {

    const os = require("os");
    const path = require("path");
    const fs = require("fs");
    
    const credentialFolderName = ".bitbucket-backup";
    
    function ensureCredentialFolder()
    {
        if (!doesCredentialFolderExist()) {
            makeCredentialFolder();
        }
    }

    function makeCredentialFolder()
    {
        var directoryName = path.join(os.homedir(), credentialFolderName);
        fs.mkdirSync(directoryName);
    }
    
    function doesCredentialFolderExist()
    {
        try {
            var folderStats = fs.statSync(path.join(os.homedir(), credentialFolderName));
            return true;            
        } catch (ex) {
            return false;
        }
    }

    function getCredentialFileName(repositoryOwner) {
    
        var homeDir = os.homedir();
        var filename = repositoryOwner + ".credential.json";
        var fullFilename = path.join(homeDir, credentialFolderName, filename);

        return fullFilename;
    }
    
    function loadCredentials(filename) {
        
        try {            
            var data = fs.readFileSync(filename, "utf8");
            var credentials = JSON.parse(data);
            return { accessToken: credentials.accessToken, expiry: new Date(credentials.expiry), consumerKey: credentials.consumerKey, consumerSecret: credentials.consumerSecret };
        } catch (ex) {
            if (ex.code == "ENOENT") {
                return null;
            }

            throw ex;
        }
        
    }
    
    function saveCredentials(filename, credentials, callback) {
        
        var serialisedCredentials = JSON.stringify(credentials);
        fs.writeFileSync(filename, serialisedCredentials, "utf8");

    }

    credentialFileManager.getCredentials = function (repositoryOwner) {

        ensureCredentialFolder();
        var credentialFile = getCredentialFileName(repositoryOwner);

        var credentials = loadCredentials(credentialFile);
        return credentials;

    };

    credentialFileManager.saveCredentials = function (repositoryOwner, credentials) {
        
        ensureCredentialFolder();
        var credentialFile = getCredentialFileName(repositoryOwner);
        
        saveCredentials(credentialFile, credentials);

    };

})(module.exports);