import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import { rehypeCodeHighlight } from './rehypeCodeHighlight';
import { rehypeAnimateLists } from './rehypeAnimateLists';
export class RemarkProcessor {
    _options;
    constructor(options = {}) {
        this._options = options;
    }
    setOptions(options) {
        this._options = options;
    }
    processor(renderOptions) {
        const options = {
            ...this._options,
            ...renderOptions,
        };
        if (options.renderer) {
            return options.renderer;
        }
        let _processor = unified()
            .use(remarkParse)
            .use(remarkRehype)
            //.use(rehypeRaw)
            .use(rehypeSanitize)
            .use(rehypeCodeHighlight);
        if (options.animateLists) {
            _processor = _processor.use(rehypeAnimateLists);
        }
        _processor = _processor.use(rehypeStringify);
        return _processor;
    }
    render(mdSource, renderOptions) {
        const processor = this.processor(renderOptions);
        return processor.processSync(mdSource).value;
    }
}
