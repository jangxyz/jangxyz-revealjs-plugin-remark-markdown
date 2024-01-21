# Reveal.js markdown plugin for remark

This plugin makes any Reveal.js project work with the remark plugin.

## Install

Install from github repo directly:

```bash
npm install --save github:jangxyz/jangxyz-revealjs-plugin-remark-markdown
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
