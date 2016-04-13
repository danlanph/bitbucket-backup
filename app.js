var oauth = require("./services/oauthService.js");
var bitbucket = require("./services/bitbucketService.js");
var parsedArgs = require("minimist")(process.argv);
var _ = require("underscore");

const tokenEndpoint = "https://bitbucket.org/site/oauth2/access_token";
const repositoryEndpoint = "https://api.bitbucket.org/2.0/repositories/";

var repoOwner = parsedArgs.owner;
var backupDirectory = parsedArgs.backupFolder || "./backup/";

if (!repoOwner)
{
    console.log("A repository owner parameter (--owner mybitbucketname) is required");
    process.exit(1);
}

oauth.init(tokenEndpoint, repoOwner)
.then(function (token) {

    bitbucket.init(oauth, repositoryEndpoint, repoOwner, backupDirectory);
    return bitbucket.getRepositories();
    
})
.then(function (repositories) {

    console.log("Found " + repositories.length + " repositories");
    console.log("Cloning repositories");

    _.each(repositories, function (repository) {
        bitbucket.cloneRepositoryWithToken(repository);
    });

})
.catch(function (err) {
    console.log(err);
});