const fastify = require('fastify')();
const { Octokit } = require('@octokit/rest');

// Replace with GitHub Personal Access Token
const GITHUB_TOKEN = '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';

// Create a new Octokit instance
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});


// Function to fetch single file from GitHub repository.
async function getFile(owner, repo, path) {
  try {
    // Check if the file is a .md file.
    if (path && !path.endsWith('.md')) {
      throw new Error('Invalid file format. Only .md files are supported.');
    }
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    if (response.data && response.data.content) {
      // Decode the base64 encoded content received from GitHub.
      const content = Buffer.from(response.data.content, 'base64').toString();
      return content;
    } else {
      throw new Error('File not in repository.');
    }
  } catch (error) {
    throw new Error("Error fetching file from GitHub: " + error.message);
}
}

// Function to recursively fetch all .md files from a GitHub repository.
async function getAll(owner, repo) {
  try {
    // Get the SHA of the latest commit in the repository
    const commitResponse = await octokit.repos.getBranch({
      owner,
      repo,
      branch: 'main', // Need to change branch name if not main
    });

    const commitSHA = commitResponse.data.commit.sha;

    // Fetch the entire tree recursively
    const treeResponse = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: commitSHA,
      recursive: 1,
    });

    // Filter the tree
    const filePaths = treeResponse.data.tree
      .filter((item) => item.type === 'blob' && item.path.endsWith('.md'))
      .map((item) => item.path);

    if (filePaths.length === 0) {
      throw new Error('No .md files are present.');
    }
    // Fetch the content of each file and store it in an object with file paths as keys
    const contents = {};
    await Promise.all(filePaths.map(async (filePath) => {
        const response = await octokit.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: commitSHA,
        });

        if (response.data && response.data.content) {
          const content = Buffer.from(response.data.content, 'base64').toString();
          
    contents[filePath] = content;
        }
      })
    );

    return contents;
  } catch (error) {
    throw new Error('Error fetching content: ' + error.message);
  }
}
// Route to handle requests to fetch .md contents.
// Query params required: (owner, repo) optional: path
// If path is not provided, all .md files are fetched.
// If path is provided, the .md file at that path is fetched.
fastify.get('/', async function (request, reply) {
  const { owner, repo, path } = request.query;
  try {
    if(path === undefined){ 
      const contents = await getAll(owner, repo);
      reply.code(200).send(contents);
    }else{
      const content = await getFile(owner, repo, path);
      reply.code(200).send(content);
    }
    // Send the response back to the client.
  }catch(error){
    reply.code(404).send(error.message);
  }
});

// Start the Fastify server
fastify.listen({ port: 3000 }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening 
});