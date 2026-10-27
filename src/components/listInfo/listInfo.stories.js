/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('../listManager/listManager.types.js').ListManagerConfigType} ListManagerConfigType
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('@storybook/web-components-vite').Meta<ListManagerConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListManagerConfigType>} Story
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 */

import { Static as ListStory } from '../listManager/stories/listManager.stories.js';
import { userEvent, waitFor, expect } from 'storybook/test';
import { testParams } from '@arpadroid/module/storybook/helper';
import { renderSimple, playSetup } from '../listManager/stories/listManager.stories.util.js';

/** @type {Meta} */
const Default = {
    ...ListStory,
    title: 'List Manager/Controls/List Info',
    component: 'list-manager',
    parameters: {
        layout: 'flexColumn'
    },
    args: {
        ...ListStory.args,
        id: 'list-info',
        title: 'List Info',
        controls: ['search'],
        hasInfo: true,
        itemsPerPage: 5
    },
    render: renderSimple
};

/** @type {Story} */
export const Render = Default;

/** @type {Story} */
export const Test = {
    parameters: testParams,
    args: {
        ...Default.args,
        id: 'test-list-info',
        title: 'List Info Test'
    },
    play: async ({ canvasElement, step, canvas }) => {
        const setup = await playSetup(canvasElement);
        const { listNode } = setup;

        const listInfoClass = '.listInfo__text';
        await step('Renders the list info', async () => {
            await waitFor(() => {
                const prevBtn = canvas.getByLabelText(/Previous page/i);
                const nextBtn = canvas.getByLabelText(/Next page/i);
                const refreshBtn = canvas.getByLabelText(/Refresh list/i);
                expect(refreshBtn).toBeInTheDocument();
                expect(prevBtn).toBeInTheDocument();
                expect(nextBtn).toBeInTheDocument();
                const listInfo = canvasElement.querySelector(listInfoClass);
                expect(listInfo).toHaveTextContent(
                    `Showing 1 - 5 out of ${listNode?.listResource?.getTotalItems()} results`
                );
            });
        });

        await step('Clicks on the next page button and verifies the list info', async () => {
            const nextBtn = canvas.getByLabelText(/Next page/i);
            await userEvent.click(nextBtn, { delay: 50});
            await waitFor(() => {
                const listInfo = canvasElement.querySelector(listInfoClass);
                expect(listInfo).toHaveTextContent(
                    `Showing 6 - 10 out of ${listNode?.listResource?.getTotalItems()} results`
                );
            });
        });

        await step('Searches for non-existing term and shows no results message.', async () => {
            const input = canvas.getByRole('searchbox');
            const form = /** @type {FormComponent} */ (input.closest('arpa-form'));
            form?._config && (form._config.debounce = false);
            await userEvent.clear(input);
            await userEvent.type(input, 'Some search term');
            await userEvent.keyboard('{Enter}');
            await waitFor(() => {
                const listInfo = canvasElement.querySelector(listInfoClass);
                expect(listInfo).toHaveTextContent('No results found for Some search term');
            });
        });

        await step('Searches for "Leon" and expects 1 result to be produced with appropriate message.', async () => {
            const input = canvas.getByRole('searchbox');
            const form = /** @type {FormComponent} */ (input.closest('arpa-form'));
            form?._config && (form._config.debounce = false);
            await userEvent.clear(input);
            await userEvent.type(input, 'Leon');
            await userEvent.keyboard('{Enter}');
            await waitFor(() => {
                const listInfo = canvasElement.querySelector(listInfoClass);
                expect(listInfo).toHaveTextContent('Found 1 search results for Leon');
            });
            expect(canvas.queryByText(/Previous page/i)).not.toBeInTheDocument();
            expect(canvas.queryByText(/Next page/i)).not.toBeInTheDocument();
        });
    }
};

export default Default;
