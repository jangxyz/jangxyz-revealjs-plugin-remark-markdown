# Reveal.js markdown plugin for remark

This plugin makes any Reveal.js project work with the remark plugin.

## Install

Install from github repo directly:

```bash
npm install --save github:jangxyz/jangxyz-revealjs-plugin-remark-markdown#0.3.0
# pnpm
#pnpm add github:jangxyz/jangxyz-revealjs-plugin-remark-markdown#0.3.0
# yarn
#yarn add github:jangxyz/jangxyz-revealjs-plugin-remark-markdown#0.3.0
```

## Usage

```javascript
import Reveal from 'reveal.js';

//import markdown from 'reveal.js/plugin/markdown/markdown';
import markdown from 'jangxyz-reveal-plugin-remark-markdown';

const deck = new Reveal();
deck.initialize({
  plugins: [markdown],
});
```

### Options

`animatesLists` option was added in Reveal.js [4.1.1](https://github.com/hakimel/reveal.js/releases/tag/4.1.1), though not documented anywhere.

You can set this markdown option, and the plugin will animate lists (by adding `fragment` class to each list items).

```javascript
const deck = new Reveal({
  plugins: [markdown],
  markdown: {
    animateLists: true,
  },
});
```

For any other markdown options, you should make your custom unified processor and pass it as a `renderer` option instead.
That means you cannot use other options such as `smartypants` that used to work for marked.

```javascript
const renderer = unified()
  .use(remarkParse)
  .use(remarkParse)
  .use(remarkRehype)
  //.use(rehypeRaw)
  .use(rehypeSanitize)
  .use(rehypeStringify);

const deck = new Reveal({
  plugins: [markdown],
  markdown: { renderer },
});
```

NOTE you may use rehype plugins that powered code highlight and `animateLists` in the default implementation.

```javascript
import markdown, {
  rehypeCodeHighlight,
  rehypeAnimateLists,
} from 'jangxyz-reveal-plugin-remark-markdown';

const renderer = unified()
  .use(remarkParse)
  .use(remarkParse)
  .use(remarkRehype)
  //.use(rehypeRaw)
  .use(rehypeSanitize)
  .use(rehypeCodeHighlight)
  .use(rehypeAnimateLists)
  .use(rehypeStringify);

const deck = new Reveal({
  plugins: [markdown],
  markdown: { renderer },
});
```
