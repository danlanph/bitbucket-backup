(function (bitbucketService) {

    const fs = require("fs");
    const path = require("path");
    const async = require("async");
    const httpRequest = require("request-promise");
    const _ = require("underscore");
    const process = require("child_process");

    var oauth = null;
    var repositoryEndpointUrl = null;
    var repositoryOwner = null;
    var backupDir = null;

    bitbucketService.init = function (oauthProvider, repositoryEndpoint, owner, backupFolder) {
        oauth = oauthProvider;
        repositoryEndpointUrl = repositoryEndpoint;
        repositoryOwner = owner;
        backupDir = path.normalize(backupFolder + "/");

        ensureBackupFolderExists();
    };

    function makeBackupFolder()
    {
        fs.mkdirSync(backupDir);
    }

    function doesBackupFolderExist()
    {
        try {
            var folderStats = fs.statSync(backupDir);
            return true;
        } catch (ex) {
            return false;
        }
    }

    function ensureBackupFolderExists()
    {
        if (!doesBackupFolderExist()) {
            makeBackupFolder();
        }
    }

    bitbucketService.getRepositories = function () {

        return new Promise(function (resolve, reject) {

            var hasNextPage = false;
            var repositories = [];
            var repositoryListingPageUri = repositoryEndpointUrl + repositoryOwner;

            async.doWhilst(
                function (nextStep) {

                    httpRequest({
                        uri: repositoryListingPageUri,
                        auth: {
                            bearer: oauth.getAccessTokenSync()
                        },
                        json: true
                    })
                        .then(function (data) {

                            var repos = _.each(data.values, function (repository) {
                                var cloneLinks = repository.links.clone;

                                if (cloneLinks)
                                {
                                    var httpsLink = _.first(_.filter(cloneLinks, function (l) { return l.name == "https"; }));
                                    repositories.push({ name: repository.name, url: httpsLink.href });
                                }

                            });

                            hasNextPage = data.next ? true : false;
                            if (hasNextPage)
                            {
                                repositoryListingPageUri = data.next;
                            }

                            nextStep();
                        })
                        .catch(function (err) {
                            nextStep(err);
                        });

                },
                function () {

                    return hasNextPage;

                },
                function (err, result) {
                    if (err)
                    {
                        reject(err);
                    }
                    else
                    {
                        resolve(repositories);
                    }
                });
        });

    };

    bitbucketService.cloneRepositoryWithToken = function (repository) {

        var backupFolder = backupDir + repository.name;
        var findPattern = "//" + repositoryOwner + "@bitbucket.org/";
        var replaceString = "//x-token-auth:" + oauth.getAccessTokenSync() + "@bitbucket.org/";
        var cloneUrl = repository.url.replace(findPattern, replaceString);

        var shellCommand = "git clone --bare " + cloneUrl + " " + backupFolder;
        process.execSync(shellCommand);
    };

})(module.exports);