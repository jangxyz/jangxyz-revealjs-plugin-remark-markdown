import { type Processor } from 'unified';
import type { Root as MdastRoot } from 'mdast';
import type { Root as HastRoot } from 'hast';
export type RemarkRenderer = Processor<MdastRoot, MdastRoot, HastRoot, HastRoot, string>;
export type RemarkRenderOptions = {
    renderer: RemarkRenderer;
    animateLists: boolean;
};
export declare class RemarkProcessor {
    _options: Partial<RemarkRenderOptions>;
    constructor(options?: Partial<RemarkRenderOptions>);
    setOptions(options: Partial<RemarkRenderOptions>): void;
    processor(renderOptions?: Partial<RemarkRenderOptions>): RemarkRenderer;
    render(mdSource: string, renderOptions?: Partial<RemarkRenderOptions>): string;
}
