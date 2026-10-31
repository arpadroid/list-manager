/**
 * @typedef {import('../listManager.js').default} ListManager
 * @typedef {import('@arpadroid/lists').List} List
 * @typedef {import('../listManager.types.js').ListManagerConfigType} ListManagerConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ListManagerConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListManagerConfigType>} Story
 * @typedef {import('../../listManagerItem/listManagerItem.js').default} ListManagerItem
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/lists').TagItem} TagItem
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 */

import { attrString, formatDate, getInitials } from '@arpadroid/tools';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import artists from '../../../mockData/artists.json';
import { expect, waitFor, userEvent, within } from 'storybook/test';

/**
 * Initializes the list with the provided payload.
 * @param {string} id
 * @param {any[]} [payload]
 */
export async function initializeList(id, payload = artists) {
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
    await resource?.setItems(payload);
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
    await listItem?.promise;
    listNode?.id && (await initializeList(listNode?.id, items));
    await listNode?.onRendered();
    await listItem?.onRendered();
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
    excludeStories: ['initializeList'],
    args: {
        id: 'list-manager',
        title: '',
        hasMessages: true,
        hasItemsTransition: true,
        hasInfo: true,
        hasResource: true,
        controls: ['search', 'sort', 'views', 'multiselect', 'filters'],
        views: ['grid', 'list', 'list-compact', 'grid-compact'],
        itemsPerPage: 10
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
                    truncate-content="100"
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
        id: 'list-manager'
    }
};

/** @type {Story} */
export const Static = {
    parameters: {
        ...testParams,
        layout: 'flexColumn'
    },
    args: {
        id: 'list-manager-static',
        title: 'List Component',
        hasItemsTransition: true,
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
export const Test = {
    parameters: {
        ...testParams,
        layout: 'flexColumn'
    },
    args: {
        id: 'list-manager-test',
        title: 'List Component',
        hasItemsTransition: true,
        hasResource: true
    },
    play: async ({ canvasElement, canvas, step }) => {
        const DELAY = 30;
        const { listNode } = await playSetup(canvasElement);
        await listNode?.onRendered();
        await step('Refreshes the list and goes to the next page.', async () => {
            const refreshButton = await waitFor(() => canvas.getByRole('button', { name: /refresh list/i }));
            await userEvent.click(refreshButton);
            const nexButton = await waitFor(() => canvas.getByRole('button', { name: /next page/i }));
            expect(nexButton).toBeInTheDocument();

            await userEvent.click(nexButton, { delay: DELAY });
            const itemsContainer = /** @type {HTMLElement} */ (canvasElement.querySelector('.arpaList__bodyMain'));
            expect(itemsContainer).toBeInTheDocument();
            await waitFor(() => {
                expect(itemsContainer.querySelectorAll('.arpaList__items')).toHaveLength(1);
            });
        });

        await step(
            'Refreshes the list again and does not render duplicated tag-item components within tag-list',
            async () => {
                await listNode?.setView('list');
                await listNode?.promise;
                const refreshButton = await waitFor(() => canvas.getByRole('button', { name: /refresh list/i }));
                await userEvent.click(refreshButton, { delay: DELAY });

                const viewsBtn = canvas.getByRole('button', { name: /views/i });

                await userEvent.click(viewsBtn, { delay: DELAY });
                await waitFor(() => {
                    expect(canvasElement.querySelector('button[data-value="list-compact"]')).toBeInTheDocument();
                });
                const listCompactBtn = /** @type {HTMLElement} */ (
                    canvasElement.querySelector('button[data-value="list-compact"]')
                );
                await userEvent.click(listCompactBtn);

                await waitFor(() => {
                    const listItem = /** @type {HTMLElement} */ (canvasElement.querySelector('list-manager-item'));
                    const tagList = /** @type {HTMLElement} */ (listItem.querySelector('tag-list'));
                    expect(tagList).toBeInTheDocument();
                    expect(tagList?.children).toHaveLength(2);
                    const tagItems = /** @type {TagItem[]} */ ([...tagList.querySelectorAll('tag-item')]);
                    const uniqueTagItems = Array.from(new Set(tagItems.map(item => item.textContent)));
                    expect(tagItems.length).toBe(uniqueTagItems.length);
                });
            }
        );

        await step('Selects per page and renders new items with zone content', async () => {
            const filtersBtn = await waitFor(() => canvas.getByRole('button', { name: /filters/i }));
            await userEvent.click(filtersBtn, { delay: DELAY });
            const perPageBtn = await waitFor(() => canvas.getByLabelText('Per page'));
            const perPageField = /** @type {SelectCombo} */ (perPageBtn.closest('select-combo'));
            await perPageField?.promise;
            await userEvent.click(perPageBtn, { delay: DELAY });
            await waitFor(() => expect(perPageField?.optionsNode).toBeInTheDocument());
            const perPageOption = perPageField.optionsNode?.querySelector('select-option[value="5"] button');
            expect(perPageOption).toBeInTheDocument();
            await userEvent.click(/** @type {HTMLElement} */ (perPageOption), { delay: DELAY });
            await waitFor(() => {
                expect(listNode?.listResource?.getPerPage()).toBe(5);
                const itemsContainer = listNode?.querySelector('.arpaList__items:not(.arpaList--itemsOut)');
                const items = itemsContainer?.querySelectorAll('list-manager-item');
                expect(items).toHaveLength(5);
                items?.forEach(item => {
                    expect(item.querySelector('tag-list')?.children).toHaveLength(2);
                    expect(item.querySelector('.listItem__main .listItem__checkboxContainer')).toBeInTheDocument();
                });
            });
        });

        await step('Selects 25 and verifies items', async () => {
            const filtersBtn = /** @type {HTMLElement} */ (canvas.getByRole('button', { name: /filters/i }));
            expect(filtersBtn).toBeInTheDocument();
            await userEvent.click(filtersBtn, { delay: DELAY });
            const menu = /** @type {IconMenu} */ (filtersBtn.closest('icon-menu'));
            const nav = /** @type {HTMLElement} */ (menu?.nodes.nav);
            const form = /** @type {HTMLFormElement} */ (nav.querySelector('form'));
            const perPageBtn = within(form).getByLabelText('Per page');
            const perPageField = /** @type {SelectCombo} */ (form.querySelector('select-combo'));
            await perPageField.promise;
            await perPageField?.promise;
            await userEvent.click(perPageBtn, { delay: DELAY });
            await waitFor(() => {
                const options = perPageField.optionsNode;
                expect(options?.querySelector('select-option[value="25"] button')).toBeDefined();
            });

            const perPageOption25 = /** @type {HTMLElement} */ (
                perPageField.optionsNode?.querySelector('select-option[value="25"] button')
            );
            await userEvent.click(perPageOption25, { delay: DELAY });
        });

        await step('Switches to grid view and opens navigation expecting 2 items', async () => {
            await waitFor(() => {
                expect(canvasElement.querySelector('.listItem__nav button')).toBeInTheDocument();
            });
            const viewsBtn = /** @type {HTMLElement} */ (canvas.getByRole('button', { name: /views/i }));
            await userEvent.click(viewsBtn, { delay: DELAY });
            const viewMenu = /** @type {IconMenu} */ (viewsBtn.closest('icon-menu'));
            const viewsNav = /** @type {HTMLElement} */ (viewMenu?.nodes.nav);

            await waitFor(() => {
                expect(viewsNav?.querySelector('button[data-value="grid"]')).toBeInTheDocument();
            });

            const gridViewBtn = /** @type {HTMLElement} */ (viewsNav.querySelector('button[data-value="grid"]'));
            await userEvent.click(gridViewBtn, { delay: DELAY });
            const listItem = /** @type {HTMLElement} */ (canvasElement.querySelector('list-manager-item'));
            expect(listItem).toBeInTheDocument();
            await waitFor(() => {
                expect(listItem.querySelector('.listItem__nav button')).toBeInTheDocument();
            });
            const navNode = /** @type {HTMLElement} */ (listItem.querySelector('.listItem__nav button'));
            await userEvent.click(navNode, { delay: 100 });
            await waitFor(() => {
                expect(document.querySelector('.inputCombo--active')).toBeInTheDocument();
            });
            const navList = document.querySelector('.inputCombo--active');
            expect(navList).toBeInTheDocument();
            expect(navList?.children).toHaveLength(2);
        });
    }
};

/** @type {Story} */
export const ThreeHundredItems = {
    name: '300',
    parameters: testParams,
    args: {
        id: 'list-manager-300',
        itemsPerPage: 300
    }
};

/** @type {Story} */
export const Minimal = {
    parameters: testParams,
    args: {
        id: 'list-manager-1',
        itemsPerPage: 1,
        title: 'Minimal List',
        controls: [' '],
        hasInfo: false,
        hasPager: 'false'
    },
    render: args => {
        return html`
            <list-manager ${attrString(args)}>
                <template
                    template-type="list-item"
                    template-mode="append"
                    truncate-content="100"
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
