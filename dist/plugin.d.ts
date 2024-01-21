import { RemarkProcessor } from './RemarkProcessor.js';
export default function revealRemarkMarkdownPlugin(): {
    id: string;
    /**
     * Starts processing and converting Markdown within the
     * current reveal.js deck.
     */
    init(reveal: Reveal.Api): Promise<void>;
    processSlides: (scope: HTMLElement) => Promise<void>;
    convertSlides: () => Promise<void>;
    slidify: (markdown: string, options: {
        separator: string | null;
        verticalSeparator: string | null;
        notesSeparator: string | null;
        attributes: string;
    }) => string;
    markdown: RemarkProcessor;
};
