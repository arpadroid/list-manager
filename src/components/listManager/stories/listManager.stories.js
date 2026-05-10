/**
 * @typedef {import('../listManager.js').default} ListManager
 * @typedef {import('../listManager.types.js').ListManagerConfigType} ListManagerConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ListManagerConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListManagerConfigType>} Story
 * @typedef {import('../../listManagerItem/listManagerItem.js').default} ListManagerItem
 * @typedef {import('@arpadroid/resources').ListResource} ListResource *
 */

import { attrString } from '@arpadroid/tools';
import { renderItemTemplate } from '@arpadroid/lists/stories/utils';
import { playSetup } from './listManager.stories.util.js';

const html = String.raw;
/** @type {Meta} */
const ListManagerStory = {
    title: 'List Manager/Lists',
    tags: ['docs'],
    component: 'list-manager',
    parameters: {
        layout: 'padded'
    },
    args: {
        id: 'list-manager',
        title: '',
        hasMessages: true,
        hasItemsTransition: true,
        hasInfo: true,
        hasResource: true,
        controls: ['search', 'sort', 'views', 'multiselect', 'filters'],
        views: ['grid', 'list', 'list-compact', 'grid-compact']
    },
    render: args => {
        // delete args.text;
        return html`
            <list-manager ${attrString(args)} views="grid, list">
                <list-manager-item title="Some title" title-link="/some-link" image="/some-image.jpg">
                    A Demo list item.
                </list-manager-item>
            </list-manager>
            <script>
                // http://museovaquero.local/api/gallery/item/get-items?galleryList-search=&galleryList-sortBy=modified_date&galleryList-sortDir=desc&galleryList-state=&galleryList-page=2&galleryList-perPage=50&public=
                customElements.whenDefined('list-manager').then(() => {
                    /** @type {ListManager} */
                    const list = document.getElementById('test-list');
                });
            </script>
        `;
    }
};

/** @type {Story} */
export const ResourceDriven = {
    parameters: {
        layout: 'flexColumn'
    },
    args: {
        // ...ListManagerStory.args,
        id: 'list-manager',
        title: 'List Component',
        itemsPerPage: 10,
        hasResource: true
    },
    play: async ({ canvasElement }) => {
        await playSetup(canvasElement);
    },
    render: args => {
        return html`
            <list-manager ${attrString(args)}>
                <zone name="messages">
                    <info-message>
                        The list component is an advanced list creation tool, which aims to simplify the process of
                        creating and managing advanced UI lists with search and filtering functionality. It features
                        highly customizable list items via templates, multiple view modes, and seamless integration with
                        data resources.
                    </info-message>
                </zone>
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
            </list-manager>
        `;
    }
};

export default ListManagerStory;
