"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemarkProcessor = void 0;
const unified_1 = require("unified");
const remark_parse_1 = __importDefault(require("remark-parse"));
const remark_rehype_1 = __importDefault(require("remark-rehype"));
const rehype_stringify_1 = __importDefault(require("rehype-stringify"));
const rehype_sanitize_1 = __importDefault(require("rehype-sanitize"));
const rehypeCodeHighlight_1 = require("./rehypeCodeHighlight");
const rehypeAnimateLists_1 = require("./rehypeAnimateLists");
class RemarkProcessor {
    _options;
    constructor(options = {}) {
        this._options = options;
    }
    setOptions(options) {
        this._options = options;
    }
    processor(renderOptions = {}) {
        const options = {
            ...this._options,
            ...renderOptions,
        };
        if (options.renderer) {
            return options.renderer;
        }
        let _processor = (0, unified_1.unified)()
            .use(remark_parse_1.default)
            .use(remark_rehype_1.default)
            //.use(rehypeRaw)
            .use(rehype_sanitize_1.default)
            .use(rehypeCodeHighlight_1.rehypeCodeHighlight);
        if (options.animateLists) {
            _processor = _processor.use(rehypeAnimateLists_1.rehypeAnimateLists);
        }
        _processor = _processor.use(rehype_stringify_1.default);
        return _processor;
    }
    render(mdSource, renderOptions) {
        const processor = this.processor(renderOptions);
        return processor.processSync(mdSource).value;
    }
}
exports.RemarkProcessor = RemarkProcessor;
