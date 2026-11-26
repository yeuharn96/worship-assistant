import { marked } from 'marked';
import guideEn from '../../../docs/user-guide.md?raw';
import guideZh from '../../../docs/user-guide.zh.md?raw';
import './assets/guide.css';

type Lang = 'en' | 'zh';

const guides: Record<Lang, { markdown: string; file: string; htmlLang: string; switchLabel: string }> = {
  en: { markdown: guideEn, file: 'user-guide.md', htmlLang: 'en', switchLabel: 'English' },
  zh: { markdown: guideZh, file: 'user-guide.zh.md', htmlLang: 'zh-CN', switchLabel: '中文' },
};

// Screenshots live in docs/images and the guides refer to them as `images/<file>`, a path that also works on GitHub.
const imageModules = import.meta.glob<string>('../../../docs/images/*.{png,jpg,jpeg,gif,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const imageUrls = Object.fromEntries(
  Object.entries(imageModules).map(([path, url]) => [path.replace('../../../docs/', ''), url]),
);

/** The id GitHub gives a heading, so the guide's `#section` links work both here and on GitHub. */
const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s/g, '-');

marked.use({
  walkTokens: (token) => {
    if (token.type === 'image') token.href = imageUrls[token.href] ?? token.href;
  },
  renderer: {
    heading({ tokens, depth }) {
      const html = this.parser.parseInline(tokens);
      const id = slugify(html.replace(/<[^>]*>/g, ''));
      return `<h${depth} id="${id}">${html}</h${depth}>\n`;
    },
  },
});

const article = document.getElementById('guide') as HTMLElement;
const contents = document.getElementById('contents') as HTMLElement;

const show = (lang: Lang) => {
  const { markdown, htmlLang } = guides[lang];
  document.documentElement.lang = htmlLang;

  // The guides are our own files, bundled with the app, so their HTML can be trusted.
  article.innerHTML = marked.parse(markdown, { async: false });
  document.title = article.querySelector('h1')?.textContent ?? document.title;

  contents.replaceChildren();
  const switcher = document.createElement('div');
  switcher.className = 'lang-switch';
  (Object.keys(guides) as Lang[]).forEach((key) => {
    const button = document.createElement('button');
    button.textContent = guides[key].switchLabel;
    button.disabled = key === lang;
    button.addEventListener('click', () => show(key));
    switcher.append(button);
  });
  contents.append(switcher);

  // A list of every section beside the guide, since the app's windows have no Find (Ctrl+F).
  article.querySelectorAll<HTMLHeadingElement>('h2, h3').forEach((heading) => {
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.className = heading.tagName.toLowerCase();
    contents.append(link);
  });

  window.scrollTo(0, 0);
};

// The guides link to each other by file name, which works on GitHub; here, switch language in place instead.
article.addEventListener('click', (e) => {
  const href = (e.target as HTMLElement).closest('a')?.getAttribute('href');
  const lang = (Object.keys(guides) as Lang[]).find((key) => guides[key].file === href);
  if (!lang) return;
  e.preventDefault();
  show(lang);
});

show(new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en');
