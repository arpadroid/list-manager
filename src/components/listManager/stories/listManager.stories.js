/**
 * @typedef {import('../listManager.js').default} ListManager
 * @typedef {import('@arpadroid/lists').List} List
 * @typedef {import('../listManager.types.js').ListManagerConfigType} ListManagerConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ListManagerConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListManagerConfigType>} Story
 * @typedef {import('../../listManagerItem/listManagerItem.js').default} ListManagerItem
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 */

import { attrString, formatDate, getInitials } from '@arpadroid/tools';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import artists from '../../../mockData/artists.json';
import { expect } from 'storybook/test';

/**
 * Initializes the list with the provided payload.
 * @param {string} id
 * @param {any[]} [payload]
 */
async function initializeList(id, payload = artists) {
    const list = /** @type {List | null} */ (document.getElementById(id));
    const resource = list?.listResource;
    resource?.mapItem((/** @type {Record<string, any>} */ item) => {
        const dob = formatDate(item.dateOfBirth, 'YYYY');
        const dod = formatDate(item.dateOfDeath, 'YYYY');
        const lived = `${dob} - ${dod}` || dob;
        return {
            ...item,
            title: `${item.firstName} ${item.lastName}`,
            date: lived
        };
    });
    resource?.setItems(payload);
}

/**
 * Sets up the test scenario.
 * @param {HTMLElement} canvasElement
 * @param {any[]} [items]
 * @returns {Promise<{ listNode: ListManager | null, listItem: ListManagerItem | null, listResource: ListResource | undefined }>}
 */
async function playSetup(/** @type {HTMLElement} */ canvasElement, items) {
    /** @type {ListManager | null} */
    const listNode = canvasElement.querySelector('list-manager');
    /** @type {ListManagerItem | null} */
    const listItem = canvasElement.querySelector('list-manager-item');
    const listResource = listNode?.listResource;
    await listNode?.promise;
    listNode?.id && (await initializeList(listNode?.id, items));
    return { listNode, listItem, listResource };
}

const html = String.raw;
/** @type {Meta} */
const ListManagerStory = {
    title: 'List Manager/Lists',
    component: 'list-manager',
    tags: ['docs'],
    parameters: {
        layout: 'flexColumn'
    },
    args: {
        id: 'list-manager',
        title: '',
        hasMessages: true,
        hasItemsTransition: true,
        hasInfo: true,
        hasResource: true,
        controls: ['search', 'sort', 'views', 'multiselect', 'filters'],
        views: ['grid', 'list', 'list-compact', 'grid-compact'],
        itemsPerPage: 200
    },
    play: async ({ canvasElement }) => {
        await playSetup(canvasElement);
    },
    render: args => {
        return html`
            <list-manager ${attrString(args)}>
                <arpa-zone name="messages">
                    <info-message>
                        The list-manager component is an advanced list creation tool, which aims to simplify the process
                        of creating and managing advanced UI lists with search and filtering functionality. It features
                        highly customizable list items via templates, multiple view modes, and seamless integration with
                        data resources.
                    </info-message>
                </arpa-zone>
                <arpa-zone name="batchOperations">
                    <select-option value="delete" icon="delete">
                        Delete
                        <delete-dialog>
                            <arpa-zone name="header"> Delete items </arpa-zone>
                            <arpa-zone name="content"> Are you sure you want to delete the selected items? </arpa-zone>
                        </delete-dialog>
                    </select-option>
                </arpa-zone>

                <arpa-zone name="sort-options">
                    <nav-link param-value="title" icon-right="sort_by_alpha"> Title </nav-link>
                    <nav-link param-value="date" icon-right="calendar_month" default> Date </nav-link>
                </arpa-zone>
                <arpa-zone name="list-filters"> </arpa-zone>

                <template
                    template-type="list-item"
                    template-mode="append"
                    truncate-content="10"
                    image="{portraitURL}"
                    truncate-button
                >
                    <arpa-zone name="tags">
                        <tag-item icon="calendar_month">{date}</tag-item>
                        <tag-item icon="palette">{movement}</tag-item>
                    </arpa-zone>
                    <arpa-zone name="nav">
                        <nav-link link="javascript:void(0)" icon-right="visibility">View</nav-link>
                        <nav-link link="javascript:void(0)" icon-right="edit">Edit</nav-link>
                    </arpa-zone>
                    <arpa-zone name="content">{legacy}</arpa-zone>
                </template>
            </list-manager>
        `;
    }
};

/** @type {Story} */
export const Default = {
    parameters: defaultParams,
    args: {
        id: 'list-manager',
        itemsPerPage: 10
    }
};

/** @type {Story} */
export const Static = {
    args: {
        id: 'list-manager',
        title: 'List Component',
        itemsPerPage: 10,
        hasResource: true
    },
    play: async ({ canvasElement, canvas, step, args }) => {
        await playSetup(canvasElement);

        await step('Renders the list manager with the expected title', async () => {
            args.title && expect(canvas.getByText(args.title)).toBeInTheDocument();
        });
    }
};

/** @type {Story} */
export const ApiDriven = {
    parameters: testParams,
    args: {
        id: 'api-driven-list',
        controls: ['search', 'sort', 'views', 'multiselect', 'filters'],
        views: ['grid', 'list', 'list-compact', 'grid-compact'],
        url: 'api/gallery/item/get-items',
        paramNamespace: 'galleryList-',
        hasSelection: true,
        itemsPerPage: 10
    },
    play: async ({ canvasElement }) => {
        /** @type {ListManager | null} */
        const list = canvasElement.querySelector('list-manager');
        await list?.promise;

        const resource = list?.listResource;
        resource?.mapItem((/** @type {Record<string, any>} */ item) => {
            item.author_initials = getInitials(item.author_name + ' ' + item.author_surname);
            item.date = new Date(item.date)?.getFullYear() ?? '?';
            return item;
        });
        await resource?.fetch()?.catch(() => {});
    }
};

export default ListManagerStory;
