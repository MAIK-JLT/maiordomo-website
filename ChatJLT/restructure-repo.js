const { Octokit } = require("@octokit/rest");
require('dotenv').config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = "MAIK-JLT";  // Reemplazar con su nombre de usuario de GitHub
const repo = "ChatJLT";    // Reemplazar con el nombre de su repositorio

const newStructure = {
  "src": {
    "agents": {
      "agentGitHub": ["index.js", "README.md"],
      "agentMongo": ["index.js", "README.md"],
      "agentOpenAI": ["index.js", "README.md"],
      "agentReplit": ["index.js", "README.md"],
      "agentMail": ["index.js", "README.md"],
      "agentCalendar": ["index.js", "README.md"]
    },
    "connections": {
      "githubConnection.js": null,
      "mongoConnection.js": null,
      "openaiConnection.js": null,
      "replitConnection.js": null,
      "gmailConnection.js": null,
      "README.md": null
    },
    "server": {
      "server.js": null,
      "routes": {
        "index.js": null,
        "README.md": null
      },
      "README.md": null
    }
  },
  "docs": {
    "index.md": null,
    "agents": {
      "index.md": null,
      "agentGitHub.md": null,
      "agentMongo.md": null,
      "agentOpenAI.md": null,
      "agentReplit.md": null,
      "agentMail.md": null,
      "agentCalendar.md": null
    },
    "connections": {
      "index.md": null,
      "githubConnection.md": null,
      "mongoConnection.md": null,
      "openaiConnection.md": null,
      "replitConnection.md": null,
      "gmailConnection.md": null
    },
    "server": {
      "index.md": null,
      "routes.md": null
    }
  },
  "scripts": {
    "update-docs.js": null
  },
  "README.md": null
};

async function deleteAllContents() {
  try {
    const { data: contents } = await octokit.repos.getContent({ owner, repo, path: '' });
    for (const item of contents) {
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: item.path,
        message: `Delete ${item.path}`,
        sha: item.sha
      });
      console.log(`Deleted ${item.path}`);
    }
  } catch (error) {
    console.error("Error deleting contents:", error.message);
  }
}

async function createFile(path, content = "") {
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Create ${path}`,
      content: Buffer.from(content).toString('base64'),
    });
    console.log(`Created ${path}`);
  } catch (error) {
    console.error(`Error creating ${path}:`, error.message);
  }
}

async function createStructure(structure, basePath = "") {
  for (const [key, value] of Object.entries(structure)) {
    const path = basePath ? `${basePath}/${key}` : key;
    if (value === null) {
      await createFile(path);
    } else if (Array.isArray(value)) {
      for (const file of value) {
        await createFile(`${path}/${file}`);
      }
    } else {
      await createStructure(value, path);
    }
  }
}

async function restructureRepository() {
  try {
    console.log("Deleting existing contents...");
    await deleteAllContents();
    console.log("Creating new structure...");
    await createStructure(newStructure);
    console.log("Repository restructured successfully");
  } catch (error) {
    console.error("Error restructuring repository:", error.message);
  }
}

restructureRepository();