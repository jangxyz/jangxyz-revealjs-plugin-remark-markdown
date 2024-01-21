//import { MarkedRenderer, marked } from 'marked';
import { RemarkProcessor, } from './RemarkProcessor.js';
const DEFAULT_SLIDE_SEPARATOR = '\r?\n---\r?\n', DEFAULT_VERTICAL_SEPARATOR = null, DEFAULT_NOTES_SEPARATOR = '^s*notes?:', DEFAULT_ELEMENT_ATTRIBUTES_SEPARATOR = '\\.element\\s*?(.+?)$', DEFAULT_SLIDE_ATTRIBUTES_SEPARATOR = '\\.slide:\\s*?(\\S.+?)$';
const SCRIPT_END_PLACEHOLDER = '__SCRIPT_END__';
const remarkProcessor = new RemarkProcessor();
function markdown(mdSource, options) {
    return remarkProcessor.render(mdSource, options);
}
// Plugin
export default function revealRemarkMarkdownPlugin() {
    // The reveal.js instance this plugin is attached to
    let deck;
    /**
     * Retrieves the markdown contents of a slide section
     * element. Normalizes leading tabs/whitespace.
     */
    function getMarkdownFromSlide(section) {
        // look for a <script> or <textarea data-template> wrapper
        const template = section.querySelector('[data-template]') ??
            section.querySelector('script');
        // strip leading whitespace so it isn't evaluated as code
        let text = (template ?? section).textContent ?? '';
        // restore script end tags
        text = text.replace(new RegExp(SCRIPT_END_PLACEHOLDER, 'g'), '</script>');
        const leadingWs = text.match(/^\n?(\s*)/)?.[1].length ?? 0, leadingTabs = text.match(/^\n?(\t*)/)?.[1].length ?? 0;
        if (leadingTabs > 0) {
            text = text.replace(new RegExp('\\n?\\t{' + leadingTabs + '}(.*)', 'g'), function (m, p1) {
                return '\n' + p1;
            });
        }
        else if (leadingWs > 1) {
            text = text.replace(new RegExp('\\n? {' + leadingWs + '}(.*)', 'g'), function (m, p1) {
                return '\n' + p1;
            });
        }
        return text;
    }
    /**
     * Given a markdown slide section element, this will
     * return all arguments that aren't related to markdown
     * parsing. Used to forward any other user-defined arguments
     * to the output markdown slide.
     */
    function getForwardedAttributes(section) {
        const attributes = section.attributes;
        const result = [];
        for (let i = 0, len = attributes.length; i < len; i++) {
            const name = attributes[i].name, value = attributes[i].value;
            // disregard attributes that are used for markdown loading/parsing
            if (/data\-(markdown|separator|vertical|notes)/gi.test(name))
                continue;
            if (value) {
                result.push(name + '="' + value + '"');
            }
            else {
                result.push(name);
            }
        }
        return result.join(' ');
    }
    /**
     * Inspects the given options and fills out default
     * values for what's not defined.
     */
    function getSlidifyOptions(options) {
        const defaultOptions = {
            separator: DEFAULT_SLIDE_SEPARATOR,
            verticalSeparator: DEFAULT_VERTICAL_SEPARATOR,
            notesSeparator: DEFAULT_NOTES_SEPARATOR,
            attributes: '',
        };
        const markdownConfig = deck?.getConfig?.().markdown;
        options = options || {};
        options.separator =
            options.separator || markdownConfig?.separator || DEFAULT_SLIDE_SEPARATOR;
        options.verticalSeparator =
            options.verticalSeparator ||
                markdownConfig?.verticalSeparator ||
                DEFAULT_VERTICAL_SEPARATOR;
        options.notesSeparator =
            options.notesSeparator ||
                markdownConfig?.notesSeparator ||
                DEFAULT_NOTES_SEPARATOR;
        options.attributes = options.attributes || '';
        return options;
    }
    /**
     * Helper function for constructing a markdown slide.
     */
    function createMarkdownSlide(content, options) {
        options = getSlidifyOptions(options);
        const notesMatch = content.split(new RegExp(options.notesSeparator ?? '', 'mgi'));
        // create notes content
        if (notesMatch.length === 2) {
            const notesRendered = markdown(notesMatch[1].trim(), options);
            content = notesMatch[0] + `<aside class="notes">${notesRendered}</aside>`;
        }
        // prevent script end tags in the content from interfering
        // with parsing
        content = content.replace(/<\/script>/g, SCRIPT_END_PLACEHOLDER);
        return `<script type="text/template">${content}</script>`;
    }
    /**
     * Parses a data string into multiple slides based
     * on the passed in separator arguments.
     */
    function slidify(markdown, options) {
        options = getSlidifyOptions(options);
        const separatorRegex = new RegExp(options.separator +
            (options.verticalSeparator ? '|' + options.verticalSeparator : ''), 'mg'), horizontalSeparatorRegex = new RegExp(options.separator ?? '');
        const sectionStack = [];
        // iterate until all blocks between separators are stacked up
        let lastIndex = 0, wasHorizontal = true;
        let matches;
        while ((matches = separatorRegex.exec(markdown))) {
            // determine direction (horizontal by default)
            const isHorizontal = horizontalSeparatorRegex.test(matches[0]);
            if (!isHorizontal && wasHorizontal) {
                // create vertical stack
                sectionStack.push([]);
            }
            // pluck slide content from markdown input
            const content = markdown.substring(lastIndex, matches.index);
            if (isHorizontal && wasHorizontal) {
                // add to horizontal stack
                sectionStack.push(content);
            }
            else {
                // add to vertical stack
                sectionStack[sectionStack.length - 1].push(content);
            }
            lastIndex = separatorRegex.lastIndex;
            wasHorizontal = isHorizontal;
        }
        // add the remaining slide
        (wasHorizontal
            ? sectionStack
            : sectionStack[sectionStack.length - 1]).push(markdown.substring(lastIndex));
        let markdownSections = '';
        // flatten the hierarchical stack, and insert <section data-markdown> tags
        for (let i = 0, len = sectionStack.length; i < len; i++) {
            const section = sectionStack[i];
            // vertical
            if (Array.isArray(section)) {
                const childSectionContents = section.map((child) => {
                    const innerContent = createMarkdownSlide(child, options);
                    return `<section data-markdown>${innerContent}</section>`;
                });
                const sectionContent = `<section ${options.attributes}>${childSectionContents.join('')}</section>`;
                markdownSections += sectionContent;
            }
            // horizontal
            else {
                const innerContent = createMarkdownSlide(section, options);
                markdownSections += `<section ${options.attributes} data-markdown>${innerContent}</section>`;
            }
        }
        return markdownSections;
    }
    /**
     * Parses any current data-markdown slides, splits
     * multi-slide markdown into separate sections and
     * handles loading of external markdown.
     */
    async function processSlides(scope) {
        const sections = scope.querySelectorAll('section[data-markdown]:not([data-markdown-parsed])');
        for (const section of sections) {
            const slidifyOptions = {
                separator: section.getAttribute('data-separator'),
                verticalSeparator: section.getAttribute('data-separator-vertical'),
                notesSeparator: section.getAttribute('data-separator-notes'),
                attributes: getForwardedAttributes(section),
            };
            // external markdown
            if (section.getAttribute('data-markdown')?.length) {
                try {
                    const [xhr] = await loadExternalMarkdown(section);
                    // Finished loading external file
                    section.outerHTML = slidify(xhr.responseText, slidifyOptions);
                }
                catch (reason) {
                    // Failed to load markdown
                    if (Array.isArray(reason)) {
                        const [xhr, url] = reason;
                        section.outerHTML =
                            '<section data-state="alert">' +
                                `ERROR: The attempt to fetch ${url} failed with HTTP status ${xhr.status}.` +
                                "Check your browser's JavaScript console for more details." +
                                '<p>Remember that you need to serve the presentation HTML from a HTTP server.</p>' +
                                '</section>';
                    }
                    else {
                        throw reason;
                    }
                }
            }
            // inline markdown
            else {
                section.outerHTML = slidify(getMarkdownFromSlide(section), slidifyOptions);
            }
        }
    }
    function loadExternalMarkdown(section) {
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest(), url = section.getAttribute('data-markdown');
            const datacharset = section.getAttribute('data-charset');
            // see https://developer.mozilla.org/en-US/docs/Web/API/element.getAttribute#Notes
            if (datacharset !== null && datacharset !== '') {
                xhr.overrideMimeType('text/html; charset=' + datacharset);
            }
            xhr.onreadystatechange = function (section, xhr) {
                if (xhr.readyState === 4) {
                    // file protocol yields status code 0 (useful for local debug, mobile applications etc.)
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                        resolve([xhr, url]);
                    }
                    else {
                        reject([xhr, url]);
                    }
                }
            }.bind(this, section, xhr);
            xhr.open('GET', url, true);
            try {
                xhr.send();
            }
            catch (e) {
                console.warn('Failed to get the Markdown file ' +
                    url +
                    '. Make sure that the presentation and the file are served by a HTTP server and the file can be found there. ' +
                    e);
                resolve([xhr, url]);
            }
        });
    }
    /**
     * Check if a node value has the attributes pattern.
     * If yes, extract it and add that value as one or several attributes
     * to the target element.
     *
     * You need Cache Killer on Chrome to see the effect on any FOM transformation
     * directly on refresh (F5)
     * http://stackoverflow.com/questions/5690269/disabling-chrome-cache-for-website-development/7000899#answer-11786277
     */
    function addAttributeInElement(node, elementTarget, separator) {
        const markdownClassesInElementsRegex = new RegExp(separator ?? '', 'mg');
        const markdownClassRegex = new RegExp('([^"= ]+?)="([^"]+?)"|(data-[^"= ]+?)(?=[" ])', 'mg');
        let nodeValue = node.nodeValue;
        let matches, matchesClass;
        if ((matches = markdownClassesInElementsRegex.exec(nodeValue))) {
            const classes = matches[1];
            nodeValue =
                nodeValue.substring(0, matches.index) +
                    nodeValue.substring(markdownClassesInElementsRegex.lastIndex);
            node.nodeValue = nodeValue;
            while ((matchesClass = markdownClassRegex.exec(classes))) {
                if (matchesClass[2]) {
                    elementTarget?.setAttribute(matchesClass[1], matchesClass[2]);
                }
                else {
                    elementTarget?.setAttribute(matchesClass[3], '');
                }
            }
            return true;
        }
        return false;
    }
    /**
     * Add attributes to the parent element of a text node,
     * or the element of an attribute node.
     */
    function addAttributes(section, element, previousElement, separatorElementAttributes, separatorSectionAttributes) {
        if (element !== null &&
            element.childNodes !== undefined &&
            element.childNodes.length > 0) {
            let previousParentElement = element;
            for (let i = 0; i < element.childNodes.length; i++) {
                const childElement = element.childNodes[i];
                if (i > 0) {
                    let j = i - 1;
                    while (j >= 0) {
                        const aPreviousChildElement = element.childNodes[j];
                        if (typeof aPreviousChildElement.setAttribute === 'function' &&
                            aPreviousChildElement.tagName !== 'BR') {
                            previousParentElement = aPreviousChildElement;
                            break;
                        }
                        j = j - 1;
                    }
                }
                let parentSection = section;
                if (childElement.nodeName === 'section') {
                    parentSection = childElement;
                    previousParentElement = childElement;
                }
                if (typeof childElement.setAttribute === 'function' ||
                    childElement.nodeType === Node.COMMENT_NODE) {
                    addAttributes(parentSection, childElement, previousParentElement, separatorElementAttributes, separatorSectionAttributes);
                }
            }
        }
        if (element.nodeType === Node.COMMENT_NODE) {
            if (addAttributeInElement(element, previousElement, separatorElementAttributes) === false) {
                addAttributeInElement(element, section, separatorSectionAttributes);
            }
        }
    }
    /**
     * Converts any current data-markdown slides in the
     * DOM to HTML.
     */
    function convertSlides() {
        const sections = deck
            ?.getRevealElement()
            ?.querySelectorAll('[data-markdown]:not([data-markdown-parsed])');
        [...(sections ?? [])].forEach((section) => {
            section.setAttribute('data-markdown-parsed', 'true');
            const notes = section.querySelector('aside.notes');
            const mdSource = getMarkdownFromSlide(section);
            section.innerHTML = markdown(mdSource);
            addAttributes(section, section, null, section.getAttribute('data-element-attributes') ||
                section.parentNode.getAttribute('data-element-attributes') ||
                DEFAULT_ELEMENT_ATTRIBUTES_SEPARATOR, section.getAttribute('data-attributes') ||
                section.parentNode.getAttribute('data-attributes') ||
                DEFAULT_SLIDE_ATTRIBUTES_SEPARATOR);
            // If there were notes, we need to re-add them after
            // having overwritten the section's HTML
            if (notes) {
                section.appendChild(notes);
            }
        });
        return Promise.resolve();
    }
    return {
        id: 'markdown-remark',
        /**
         * Starts processing and converting Markdown within the
         * current reveal.js deck.
         */
        async init(reveal) {
            deck = reveal;
            const revealConfig = deck.getConfig();
            //// introduced in v4.1.1 https://github.com/hakimel/reveal.js/releases/tag/4.1.1
            //const { animateLists } = revealConfig.markdown as MarkdownConfig;
            let { renderer, ...markedOptions } = {
                ...revealConfig.markdown,
            };
            //// default renderer logic
            //if (!renderer) {
            //  renderer = new MarkedRenderer();
            //  renderer.code = renderCodeHighlight;
            //}
            //if (animateLists === true) {
            //  renderer.listitem = renderListItemAsFragment;
            //}
            // TODO: convert this into remark
            //marked.setOptions({ renderer, ...markedOptions } as marked.MarkedOptions);
            remarkProcessor.setOptions({
                renderer,
                ...markedOptions,
            });
            await processSlides(deck.getRevealElement());
            convertSlides();
        },
        processSlides,
        convertSlides,
        slidify,
        //marked,
        markdown: remarkProcessor,
    };
}
