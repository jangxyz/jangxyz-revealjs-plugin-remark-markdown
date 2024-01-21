import { type Processor } from 'unified';
type RemarkRenderOptions = {
    renderer: Processor;
    animateLists: boolean;
};
export declare class RemarkProcessor {
    _options: Partial<RemarkRenderOptions>;
    constructor(options?: Partial<RemarkRenderOptions>);
    setOptions(options: Partial<RemarkRenderOptions>): void;
    processor(renderOptions?: Partial<RemarkRenderOptions>): any;
    render(mdSource: string, renderOptions?: any): string;
}
export {};
