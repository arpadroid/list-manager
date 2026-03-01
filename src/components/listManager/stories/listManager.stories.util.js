/**
 * @typedef {import('../../listManagerItem/listManagerItem.js').default} ListManagerItem
 * @typedef {import('../listManager.js').default} ListManager
 * @typedef {import('../../listManagerItem/listManagerItem.types').ListManagerItemConfigType} ListManagerItemConfigType
 * @typedef {import('./listManager.stories.types.js').ListManagerPlaySetupPayloadType} ListManagerPlaySetupPayloadType
 * @typedef {import('./listManager.stories.types.js').ListManagerPlaySetupResponseType} ListManagerPlaySetupResponseType
 */

import { initializeList, getArgTypes as _getArgTypes } from '@arpadroid/lists/stories/utils';
import { attrString } from '@arpadroid/tools';
import { within } from 'storybook/test';
const html = String.raw;

/**
 * Sets up the test scenario.
 * @param {HTMLElement} canvasElement
 * @param {ListManagerPlaySetupPayloadType} [options]
 * @returns {Promise<ListManagerPlaySetupResponseType>}
 */
export async function playSetup(canvasElement, options) {
    await customElements.whenDefined('list-manager');
    await customElements.whenDefined('list-manager-item');
    const { initList = true, preRenderCallback } = options || {};
    const canvas = within(canvasElement);
    /** @type {ListManager | null} */
    const listNode = canvasElement.querySelector('list-manager');
    /** @type {ListManagerItem | null} */
    const listItem = canvasElement.querySelector('list-manager-item');
    const listResource = listNode?.listResource;
    typeof preRenderCallback === 'function' && preRenderCallback({ listResource, listNode, listItem });
    await listNode?.promise;
    listNode?.id && initList && (await initializeList(listNode?.id));
    await new Promise(resolve => setTimeout(resolve, 50));
    return { canvas, listNode, listItem, listResource };
}

/**
 * Renders the list item template with the provided attributes.
 * @param {Record<string, any>} [attr]
 * @returns {string}
 */
export function renderItemTemplate(attr = {}) {
    return html` <!-- List Item Template -->
        <template
            template-type="list-item"
            template-mode="append"
            truncate-content="200"
            image="{portraitURL}"
            truncate-button
            ${attrString(attr)}
        >
            <zone name="tags">
                <tag-item label="{date}" icon="calendar_month"></tag-item>
                <tag-item label="{movement}" icon="palette"></tag-item>
            </zone>
            <zone name="nav">
                <nav-link link="javascript:void(0)" icon-right="visibility">View</nav-link>
                <nav-link link="javascript:void(0)" icon-right="edit">Edit</nav-link>
            </zone>
            <zone name="content">{legacy}</zone>
        </template>`;
}

/**
 * Renders the list component.
 * @param {Record<string, unknown>} args
 * @returns {string}
 */
export function renderSimple(args) {
    return html`<list-manager ${attrString(args)}>${renderItemTemplate()}</list-manager>`;
}

export const getArgTypes = _getArgTypes;
