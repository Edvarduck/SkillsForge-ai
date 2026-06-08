const GITHUB_API = 'https://api.github.com';

export class GitHubError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

async function githubFetch(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (response.status === 404) {
    throw new GitHubError('GitHub vartotojas nerastas', 'NOT_FOUND');
  }

  if (response.status === 403) {
    throw new GitHubError('GitHub API limitas – bandyk vėliau', 'RATE_LIMIT');
  }

  if (!response.ok) {
    throw new GitHubError(`GitHub API klaida (${response.status})`, 'API_ERROR');
  }

  return response.json();
}

async function fetchAllPublicRepos(username) {
  const encoded = encodeURIComponent(username);
  const repos = [];
  let page = 1;

  while (page <= 10) {
    const batch = await githubFetch(
      `${GITHUB_API}/users/${encoded}/repos?sort=updated&per_page=100&page=${page}&type=owner`
    );

    if (!batch.length) break;

    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return repos;
}

function countLanguages(repos) {
  const languages = {};

  repos.forEach((repo) => {
    if (!repo.language) return;
    languages[repo.language] = (languages[repo.language] ?? 0) + 1;
  });

  return languages;
}

function mapTopRepos(repos, limit = 10) {
  return repos.slice(0, limit).map((repo) => ({
    name: repo.name,
    language: repo.language,
    pushedAt: repo.pushed_at,
    stars: repo.stargazers_count ?? 0,
    isPrivate: repo.private ?? false,
  }));
}

export async function fetchGithubProfile(username) {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    throw new GitHubError('Įvesk GitHub vartotojo vardą', 'INVALID_USERNAME');
  }

  const encoded = encodeURIComponent(cleanUsername);
  const user = await githubFetch(`${GITHUB_API}/users/${encoded}`);
  const repos = await fetchAllPublicRepos(user.login);

  const publicReposCount = user.public_repos ?? repos.length;
  const fetchedCount = repos.length;

  return {
    username: user.login,
    reposCount: publicReposCount,
    fetchedReposCount: fetchedCount,
    languages: countLanguages(repos),
    topRepos: mapTopRepos(repos),
    onlyPublicVisible: true,
  };
}
