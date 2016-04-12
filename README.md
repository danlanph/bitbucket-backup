Bitbucket backup
===

This is a node.js script that is designed to help teams backup their bitbucket repositories without using a team members credentials in other automated scripts.

This backup script will take an OAuth consumer key and secret and backup repositories using these credentials.

The script is saves the credentials in a local file so you can "initialise" the script first time round and from then no credential input is needed on the command line.

Install
--

The script requires you have git and node installed locally. You can install it by simply running

```
npm install bitbucket-backup-oauth
```

Usage
--
```
node app.js --owner principal [--backupFolder ./backup/] [--consumerKey client_id] [--consumerSecret client_secret]
```

Note that the only mandatory argument is `--owner`. The `consumerKey` and `consumerSecret` parameters will be asked for if a locally cached copy is not found. `backupFolder` will default to `./backup/`.

The credentials are cached in your platform specific home folder within a sub directory called `.bitbucket-backup`. If your consumer key or secret changes you will need to delete the files stored in here to have the script reprompt you for the credentials.

Bitbucket.org setup
--

You will need to go to *Manage Team* for the repositories you wish to backup and then under *Access Management* there will be an *OAuth* option that you will need to click on. From the *OAuth* setup screen, under *OAuth Consumers* click on *Add a consumer*. Fill in all details and make sure you select read access to repositories and set the callback URL to localhost as we will not be using it. A consumer key and secret will not be available on the *OAuth* setup screen.