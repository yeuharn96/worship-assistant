import axios from 'axios';

type GithubRelease = {
  id: number;
  name: string;
  created_at: string;
  published_at: string;
  tag_name: string;
  assets: GithubReleaseAsset[];
};

type GithubReleaseAsset = {
  id: number
  name: string;
  created_at: string;
  updated_at: string;
  content_type: string; // 'application/x-zip-compressed'
  size: string;
  browser_download_url: string;
}

// https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
(async () => {
  const owner = 'yeuharn96';
  const repo = 'worship-assistant';
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const result = await axios.get(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  const releases: GithubRelease = result.data;

  console.log(releases);
  console.log(releases.assets.length);
})();
