import { app, BrowserWindow, dialog, net, shell } from 'electron';

const REPO = 'yeuharn96/worship-assistant';
export const REPO_URL = `https://github.com/${REPO}`;
const LATEST_RELEASE_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const RELEASES_PAGE = `${REPO_URL}/releases`;
const TIMEOUT_MS = 15_000;
const MAX_NOTES_LENGTH = 1500;
const TITLE = 'Check for Updates';

type Release = {
  tag_name: string;
  html_url: string;
  body?: string | null;
  assets?: { name: string; browser_download_url: string }[];
};

/** Compare `1.6.1`-style versions (a leading `v` is ignored). Positive if `a` is newer than `b`. */
export const compareVersions = (a: string, b: string) => {
  const parse = (v: string) =>
    v
      .trim()
      .replace(/^v/i, '')
      .split('-')[0]
      .split('.')
      .map((n) => parseInt(n, 10) || 0);
  const [pa, pb] = [parse(a), parse(b)];
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff) return diff;
  }
  return 0;
};

/**
 * The release notes as plain text for a message box: only the change log, since the rest (how to run the app, the
 * release footer) is the same every time and covered by the upgrade hint.
 */
export const formatReleaseNotes = (body?: string | null) => {
  if (!body) return '';
  const lines: string[] = [];
  for (const line of body.replace(/\r\n/g, '\n').split('\n')) {
    if (/^##\s+run the app/i.test(line)) break;
    if (/^##\s+change log/i.test(line)) continue;
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const text = (heading ? `${heading[1]}:` : line.replace(/^\s*[-*]\s+/, '• '))
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    lines.push(text.trimEnd());
  }
  const notes = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/:\n\n(?=• )/g, ':\n') // keep a heading next to its list
    .trim();
  return notes.length > MAX_NOTES_LENGTH ? `${notes.slice(0, MAX_NOTES_LENGTH).trimEnd()}…` : notes;
};

const fetchLatestRelease = async (): Promise<Release> => {
  const res = await net.fetch(LATEST_RELEASE_API, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`GitHub responded with ${res.status} ${res.statusText}`.trim());
  const release = (await res.json()) as Release;
  if (!release?.tag_name) throw new Error('GitHub did not return a version number.');
  return release;
};

let checking = false;

/** Ask GitHub for the latest release and tell the user whether it is newer than this version. */
const checkForUpdates = async (mainWindow: BrowserWindow) => {
  if (checking) return;
  checking = true;
  // Indeterminate progress on the taskbar button while waiting for GitHub.
  mainWindow.setProgressBar(2, { mode: 'indeterminate' });

  const currentVersion = app.getVersion();
  let release: Release;
  try {
    release = await fetchLatestRelease();
  } catch (error) {
    mainWindow.setProgressBar(-1);
    checking = false;
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: TITLE,
      message: 'Couldn’t check for updates.',
      detail: `Check your internet connection and try again, or look for a newer version on the releases page.\n\n${
        error instanceof Error ? error.message : String(error)
      }`,
      buttons: ['Open Releases Page', 'Close'],
      defaultId: 1,
      cancelId: 1,
    });
    if (response === 0) shell.openExternal(RELEASES_PAGE);
    return;
  }
  mainWindow.setProgressBar(-1);
  checking = false;

  const latestVersion = release.tag_name.replace(/^v/i, '');
  if (compareVersions(latestVersion, currentVersion) <= 0) {
    await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: TITLE,
      message: 'You’re up to date.',
      detail: `Worship Assistant ${currentVersion} is the latest version.`,
    });
    return;
  }

  const download = release.assets?.find((a) => a.name.toLowerCase().endsWith('.zip'))?.browser_download_url;
  const notes = formatReleaseNotes(release.body);
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: TITLE,
    message: `Worship Assistant ${latestVersion} is available.`,
    detail: [
      `You have version ${currentVersion}.`,
      notes,
      'To upgrade, unzip the download into a new folder, run it, then use Settings → Import from Previous Version… to bring across your profiles, playlist, Bible text and fonts.',
    ]
      .filter(Boolean)
      .join('\n\n'),
    buttons: download ? ['Download', 'View Release Notes', 'Later'] : ['View Release Notes', 'Later'],
    defaultId: 0,
    cancelId: download ? 2 : 1,
    noLink: true,
  });
  const choice = download ? ['download', 'notes', 'later'][response] : ['notes', 'later'][response];
  if (choice === 'download' && download) shell.openExternal(download);
  if (choice === 'notes') shell.openExternal(release.html_url);
};

export default checkForUpdates;
