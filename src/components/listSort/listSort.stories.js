/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('../listManager/listManager.types.js').ListManagerConfigType} ListManagerConfigType
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 */
import { ResourceDriven as ListStory } from '../listManager/stories/listManager.stories.js';
import { within, waitFor, expect, fireEvent, userEvent } from 'storybook/test';
import { attrString } from '@arpadroid/tools';
import { playSetup, renderItemTemplate } from '../listManager/stories/listManager.stories.util.js';
import artists from '../../mockData/artists.json';

const html = String.raw;

/** @type {Meta} */
const Default = {
    ...ListStory,
    title: 'List Manager/Controls/Sort',
    args: {
        ...ListStory.args,
        id: 'list-sort',
        controls: 'sort',
        title: 'List Sort',
        hasInfo: false,
        hasMessages: false,
        currentPage: 1,
        itemsPerPage: 10
    },
    render: args => {
        return html`<list-manager ${attrString(args)}>
            <zone name="sort-options">
                <nav-link param-value="title" icon-right="sort_by_alpha" default> Title </nav-link>
                <nav-link param-value="date" icon-right="calendar_month"> Date </nav-link>
            </zone>
            ${renderItemTemplate()}
        </list-manager>`;
    },
    play: async ({ canvasElement, step }) => {
        await playSetup(canvasElement, {
            initList: true,
            items: artists,
            preRenderCallback: async ({ listResource }) => {
                await listResource?.setSort('title', 'asc');
                return true;
            }
        });
    }
};

/** @type {StoryObj} */
export const Render = Default;

/** @type {StoryObj} */
export const Test = {
    args: {
        ...Default.args,
        id: 'test-sorted'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement, {
            initList: true,
            items: [
                artists.find(item => item?.lastName === 'da Vinci'),
                artists.find(item => item?.lastName === 'Picasso'),
                artists.find(item => item?.firstName === 'Phidias')
            ].filter(item => item !== undefined),
            preRenderCallback: async ({ listResource }) => {
                await listResource?.clearFilters();
                await listResource?.setSort('title', 'desc');
                return true;
            }
        });
        const { canvas } = setup;
        const sortByButton = canvas.getByRole('button', { name: /Sort by/i });
        const sortOrderButton = canvas.getByLabelText('Sort order');

        const sortByMenu = sortByButton.closest('icon-menu');
        await sortByMenu.promise;
        const sortByCombo = sortByMenu.navigation;
        sortByCombo && (await sortByCombo.promise);
        /** @type {ReturnType<typeof within>} */
        const combo = within(sortByCombo);

        /**
         * Asserts the index of an item in the list based on its name.
         * @param {string} name - The name of the item to check.
         * @param {number} index - The expected index of the item in the list.
         */
        const assertItemIndex = (name, index) => {
            const item = canvas.getByText(name).closest('list-manager-item');
            expect(Array.from(item.parentNode.children).indexOf(item)).toBe(index);
        };

        await step('Renders the sort controls.', async () => {
            expect(sortByButton).toBeInTheDocument();

            const sortedBy = canvas.getByRole('button', { name: /Sort by/i });
            expect(sortedBy).toBeInTheDocument();
            await waitFor(() => {
                expect(sortOrderButton).toHaveTextContent('Sorted descending');
            });
        });

        await step('Opens the sort menu and verifies "title" sort is selected.', async () => {
            await fireEvent.click(sortByButton);
            const sortByCombo = sortByMenu.navigation;
            expect(sortByCombo.querySelector('a[aria-current="page"]')).toHaveTextContent('Title');
            expect(sortByCombo).toBeVisible();
        });

        await step('Verifies items are sorted by title descending by default.', async () => {
            await waitFor(() => {
                assertItemIndex('Phidias', 0);
                assertItemIndex('Pablo Picasso', 1);
                assertItemIndex('Leonardo da Vinci', 2);
            });
        });

        await step('Sorts item descending by title and verifies items.', async () => {
            await userEvent.click(sortOrderButton);
            await waitFor(() => {
                expect(sortOrderButton).toHaveTextContent('ascending');
                assertItemIndex('Leonardo da Vinci', 0);
                assertItemIndex('Pablo Picasso', 1);
                assertItemIndex('Phidias', 2);
            });
        });

        await step('Selects "Date" sort option and verifies items', async () => {
            const dateLink = combo.getByText('Date').closest('a');
            await userEvent.click(dateLink);
            const tooltip = sortByButton.querySelector('.iconMenu__tooltip');
            await waitFor(() => {
                expect(tooltip).toHaveTextContent('Sorted by: Date');
                assertItemIndex('Phidias', 0);
                assertItemIndex('Leonardo da Vinci', 1);
                assertItemIndex('Pablo Picasso', 2);
            });
            await userEvent.click(sortOrderButton);
            await waitFor(() => {
                expect(sortOrderButton).toHaveTextContent('descending');
                assertItemIndex('Pablo Picasso', 0);
                const item2 = canvas.getByText('Leonardo da Vinci').closest('list-manager-item');
                assertItemIndex('Leonardo da Vinci', 1);
                assertItemIndex('Phidias', 2);
            });
        });
    }
};

export default Default;
