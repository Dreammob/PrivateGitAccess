# Private Git Access for .md files
This repo gives functionality to access private github .md files with an access token \

# Requirements
Node js, fastify and Octokit\

# To start a server
In IDE enter : node index.js\

## How to use
Replace const GITHUB_TOKEN in index.js with the github access token for needed git repo\
To get a specific .md file:\
construct a query string that has the format of :\
<!-- embedme-ignore-next -->
```
http://localhost:3000/?owner= &repo= &path=
```
Where after the equal sign is the owner of the repo, the name of the repo and the path to .md files repectively.\
For example if trying to get this README.md:\
http://localhost:3000/?owner=Dreammob&repo=PrivateGitAccess&path=README.md\


To get all .md files in a repo:\
omit the path parameter from the above query string\
For example, to get all .md files in this repo:\
http://localhost:3000/?owner=Dreammob&repo=PrivateGitAccess\




