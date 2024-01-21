import { unified, type Processor } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import type { Root as MdastRoot } from 'mdast';
import type { Root as HastRoot } from 'hast';
import type {
  Token,
  Tokenizer,
  RendererObject,
  TokenizerObject,
  Renderer,
} from 'marked';

import { rehypeCodeHighlight } from './rehypeCodeHighlight';
import { rehypeAnimateLists } from './rehypeAnimateLists';

// TODO: make options compatible with MarkedRenderOptions
type RemarkRenderOptions = {
  renderer: Processor<MdastRoot, MdastRoot, HastRoot, HastRoot, string>;

  // introduced in v4.1.1 https://github.com/hakimel/reveal.js/releases/tag/4.1.1
  animateLists: boolean;
};
export class RemarkProcessor {
  _options: Partial<RemarkRenderOptions>;

  constructor(options: Partial<RemarkRenderOptions> = {}) {
    this._options = options;
  }

  setOptions(options: Partial<RemarkRenderOptions>) {
    this._options = options;
  }

  processor(renderOptions: Partial<RemarkRenderOptions> = {}) {
    const options = {
      ...this._options,
      ...renderOptions,
    };

    if (options.renderer) {
      return options.renderer;
    }

    let _processor: Processor<MdastRoot, MdastRoot, HastRoot, any, any> =
      unified()
        .use(remarkParse)
        .use(remarkRehype)
        //.use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeCodeHighlight);

    if (options.animateLists) {
      _processor = _processor.use(rehypeAnimateLists);
    }

    _processor = _processor.use(rehypeStringify);

    return _processor as Processor<
      MdastRoot,
      MdastRoot,
      HastRoot,
      HastRoot,
      string
    >;
  }

  render(mdSource: string, renderOptions?: any): string {
    const processor = this.processor(renderOptions);
    return processor.processSync(mdSource).value as string;
  }
}

type MarkedRenderOptions = {
  /**
   * True will tell marked to await any walkTokens functions before parsing the tokens and returning an HTML string.
   */
  async?: boolean;

  /**
   * A prefix URL for any relative link.
   */
  baseUrl?: string | undefined;

  /**
   * Enable GFM line breaks. This option requires the gfm option to be true.
   */
  breaks?: boolean | undefined;

  /**
   * Enable GitHub flavored markdown.
   */
  gfm?: boolean | undefined;

  /**
   * Include an id attribute when emitting headings.
   */
  headerIds?: boolean | undefined;

  /**
   * Set the prefix for header tag ids.
   */
  headerPrefix?: string | undefined;

  /**
   * A function to highlight code blocks. The function can either be
   * synchronous (returning a string) or asynchronous (callback invoked
   * with an error if any occurred during highlighting and a string
   * if highlighting was successful)
   */
  highlight?(
    code: string,
    lang: string,
    callback?: (error: any, code?: string) => void
  ): string | void;

  /**
   * Hooks are methods that hook into some part of marked.
   * preprocess is called to process markdown before sending it to marked.
   * postprocess is called to process html after marked has finished parsing.
   */
  hooks?: {
    preprocess?: (markdown: string) => string;
    postprocess?: (html: string) => string;
  };

  /**
   * Set the prefix for code block classes.
   */
  langPrefix?: string | undefined;

  /**
   * Mangle autolinks (<email@domain.com>).
   */
  mangle?: boolean | undefined;

  /**
   * Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
   */
  pedantic?: boolean | undefined;

  /**
   * Type: object Default: new Renderer()
   *
   * An object containing functions to render tokens to HTML.
   */
  renderer?: Renderer | RendererObject | undefined;

  /**
   * Sanitize the output. Ignore any HTML that has been input.
   */
  sanitize?: boolean | undefined;

  /**
   * Optionally sanitize found HTML with a sanitizer function.
   */
  sanitizer?(html: string): string;

  /**
   * Shows an HTML error message when rendering fails.
   */
  silent?: boolean | undefined;

  /**
   * Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
   */
  smartLists?: boolean | undefined;

  /**
   * Use "smart" typograhic punctuation for things like quotes and dashes.
   */
  smartypants?: boolean | undefined;

  /**
   * The tokenizer defines how to turn markdown text into tokens.
   */
  tokenizer?: Tokenizer | TokenizerObject | undefined;

  /**
   * The walkTokens function gets called with every token.
   * Child tokens are called before moving on to sibling tokens.
   * Each token is passed by reference so updates are persisted when passed to the parser.
   * The return value of the function is ignored.
   */
  walkTokens?: ((token: Token) => void) | undefined;
  /**
   * Generate closing slash for self-closing tags (<br/> instead of <br>)
   */
  xhtml?: boolean | undefined;
};
