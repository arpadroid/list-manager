/**
 * @typedef {import('../listManager.js').default} ListManager
 * @typedef {import('../../listManagerItem/listManagerItem.js').default} ListManagerItem
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 */
import ListManagerStory from './listManager.stories.js';
import { attrString, getInitials } from '@arpadroid/tools';
import { within } from 'storybook/test';
import { getArgTypes } from './listManager.stories.util.js';

const html = String.raw;
const ApiDrivenListStory = {
    ...ListManagerStory,
    title: 'List Manager/Lists'
};

function renderItemTemplate() {
    return html`<template
        template-type="list-item"
        template-mode="append"
        id="{id}"
        image="/api/image/convert?width=[width]&height=[height]&quality=[quality]&source={image_url}"
    >
        <zone name="tags">
            <tag-item label="{author_initials}" icon="person"></tag-item>
            <tag-item label="{date}" icon="calendar_month"></tag-item>
        </zone>

        <zone name="nav">
            <nav-link link="/gallery/{id}" icon-right="visibility">View</nav-link>
            <nav-link link="/gallery/{id}/edit" icon-right="edit">Edit</nav-link>
        </zone>
    </template>`;
}

/**
 * Initializes the list.
 * @param {string} id
 * @returns {Promise<void>}
 */
async function initializeList(id) {
    /** @type {ListManager | null} */
    const list = /** @type {ListManager | null} */ (document.getElementById(id));
    const resource = list?.listResource;
    resource?.mapItem((/** @type {Record<string, any>} */ item) => {
        item.author_initials = getInitials(item.author_name + ' ' + item.author_surname);
        item.date = new Date(item.date)?.getFullYear() ?? '?';
        return item;
    });
    await resource?.fetch()?.catch(() => {});
}

/**
 * Sets up the test scenario.
 * @param {HTMLElement} canvasElement
 * @param {boolean} [initList]
 * @returns {Promise<{ canvas: ReturnType<typeof within>, listNode: ListManager | null, listItem: ListManagerItem | null }>}
 */
async function playSetup(canvasElement, initList = true) {
    await customElements.whenDefined('arpa-list');
    await customElements.whenDefined('list-item');
    const canvas = within(canvasElement);
    /** @type {ListManager | null} */
    const listNode = canvasElement.querySelector('arpa-list');
    /** @type {ListManagerItem | null} */
    const listItem = canvasElement.querySelector('list-item');
    await listNode?.promise;
    listNode?.id && initList && (await initializeList(listNode?.id));
    return { canvas, listNode, listItem };
}

/** @type {StoryObj} */
export const ApiDrivenList = {
    name: 'API Driven',
    argTypes: getArgTypes(),
    args: {
        id: 'api-driven-list',
        title: 'List',
        url: 'api/gallery/item/get-items',
        paramNamespace: 'galleryList-',
        hasSelection: true,
        itemsPerPage: 10
    },

    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement }} options
     */
    play: async ({ canvasElement }) => {
        await playSetup(canvasElement);
    },

    render: args => {
        return html`
            <arpa-list ${attrString(args)}>
                <zone name="batch-operations">
                    <select-option value="delete" icon="delete">
                        Delete
                        <delete-dialog>
                            <zone name="header"> Delete items </zone>
                            <zone name="content"> Are you sure you want to delete the selected items? </zone>
                        </delete-dialog>
                    </select-option>
                </zone>

                <zone name="sort-options">
                    <nav-link param-value="title" icon-right="sort_by_alpha"> Title </nav-link>
                    <nav-link param-value="date" icon-right="calendar_month" default> Date </nav-link>
                </zone>

                <zone name="list-filters"> </zone>
                ${renderItemTemplate()}
            </arpa-list>
        `;
    }
};

export default ApiDrivenListStory;
