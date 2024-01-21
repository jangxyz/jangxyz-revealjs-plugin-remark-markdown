import { type Processor } from 'unified';
type RemarkRenderOptions = {
    renderer: Processor;
    animateLists: boolean;
};
export declare class RemarkProcessor {
    _options: Partial<RemarkRenderOptions>;
    constructor(options?: Partial<RemarkRenderOptions>);
    setOptions(options: Partial<RemarkRenderOptions>): void;
    processor(renderOptions?: Partial<RemarkRenderOptions>): Processor<undefined, undefined, undefined, undefined, undefined> | Processor<import("mdast").Root, import("mdast").Root, import("hast").Root, undefined, undefined>;
    render(mdSource: string, renderOptions?: any): string;
}
export {};
