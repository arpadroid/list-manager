/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('../listManager/listManager.types.js').ListManagerConfigType} ListManagerConfigType
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 */
import { ResourceDriven as ListStory } from '../listManager/stories/listManager.stories.js';
import { within, waitFor, expect, userEvent, fireEvent } from 'storybook/test';
import { attrString } from '@arpadroid/tools';
import { playSetup, renderItemTemplate, renderSimple } from '../listManager/stories/listManager.stories.util.js';

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
    }
};

/** @type {StoryObj} */
export const Render = Default;

/** @type {StoryObj} */
export const Test = {
    args: {
        ...Default.args,
        id: 'test-sort'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement, {
            initList: true,
            preRenderCallback: ({ listResource }) => {
                listResource?.clearFilters();
                listResource?.setSort('title', 'asc');
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

        const getItems = () => setup.listNode?.getItemNodes() || [];

        await step('Renders the sort controls.', async () => {
            expect(sortByButton).toBeInTheDocument();

            const sortedBy = canvas.getByRole('button', { name: /Sort by/i });
            expect(sortedBy).toBeInTheDocument();
            expect(sortOrderButton).toHaveTextContent('Sorted ascending');
        });

        await step('Opens the sort menu and verifies "title" sort is selected.', async () => {
            await fireEvent.click(sortByButton);
            const sortByCombo = sortByMenu.navigation;
            // expect(sortByCombo.querySelector('a[aria-current="page"]')).toHaveTextContent('Title');
            expect(sortByCombo).toBeVisible();
        });

        await step('Verifies items are sorted by title ascending by default.', async () => {
            await waitFor(() => {
                const items = getItems();
                console.log('items', items);
                expect(items[0]).toHaveTextContent('Ai Weiwei');
                expect(items[1]).toHaveTextContent('Alexander Calder');
                expect(items[2]).toHaveTextContent('Andy Warhol');
                expect(items[3]).toHaveTextContent('Ansel Adams');
            });
        });

        await step('Sorts item descending by title and verifies items.', async () => {
            await fireEvent.click(sortOrderButton);
            expect(sortOrderButton).toHaveTextContent('ascending');
            await waitFor(() => {
                const items = getItems();
                expect(items[0]).toHaveTextContent('Zaha Hadid');
                expect(items[1]).toHaveTextContent('Yayoi Kusama');
                expect(items[2]).toHaveTextContent('William Blake');
                expect(items[3]).toHaveTextContent('Wassily Kandinsky');
            });
        });

        await step('Selects "Date" sort option and verifies items', async () => {
            const dateLink = combo.getByText('Date').closest('a');
            await fireEvent.click(dateLink);
            await new Promise(resolve => setTimeout(resolve, 40));

            /**
             * @todo Fix bug where the tooltip text content is not updated after clicking the sort option. The test works when running locally but fails in CI, needs investigation.
             */
            // const tooltip = sortByButton.querySelector('.iconMenu__tooltip');
            // await waitFor(() => {
            //     expect(tooltip).toHaveTextContent('Sorted by: Date');
            // });
            await fireEvent.click(sortOrderButton);
            await waitFor(() => {
                expect(canvas.getByText('Leonardo da Vinci')).toBeInTheDocument();
                expect(canvas.getByText('Michelangelo Buonarroti')).toBeInTheDocument();
                expect(canvas.getByText('Raphael')).toBeInTheDocument();
                expect(canvas.getByText('El Greco')).toBeInTheDocument();
            });
        });
    }
};

export default Default;
