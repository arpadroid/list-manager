/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('../listManager/listManager.types.js').ListManagerConfigType} ListManagerConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ListManagerConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListManagerConfigType>} Story
 */
import { Static as ListStory } from '../listManager/stories/listManager.stories.js';
import { expect, waitFor, userEvent } from 'storybook/test';
import { testParams } from '@arpadroid/module/storybook/helper';
import { playSetup, renderSimple } from '../listManager/stories/listManager.stories.util.js';

/** @type {Meta} */
const Default = {
    ...ListStory,
    title: 'List Manager/Controls/Search',
    args: {
        ...ListStory.args,
        controls: ['search'],
        id: 'list-search',
        title: null,
        hasInfo: true,
        hasSelection: false,
        searchPlaceholder: 'List Search'
    },
    render: renderSimple
};

/** @type {Story} */
export const Render = Default;

/** @type {Story} */
export const Test = {
    parameters: testParams,
    args: {
        id: 'test-search',
        title: 'List Search Test',
        searchPlaceholder: 'List Search Test'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { canvas } = setup;
        const input = await waitFor(() => canvas.getByRole('searchbox'));
        const field = input.closest('search-field');
        await field.promise;
        const form = input.closest('arpa-form');
        form?._config && (form._config.debounce = false);
        input.value = '';

        await step('Renders the search', async () => {
            expect(input).toHaveAttribute('placeholder', 'List Search Test');
        });

        await step('Searches for "Leon" and expects "Leonardo Da Vinci\'s" item to be highlighted', async () => {
            await userEvent.clear(input);
            await userEvent.type(input, 'Leon');
            await waitFor(() => {
                const searchMatch = canvasElement.querySelector('mark');
                expect(searchMatch).toHaveTextContent('Leon');
                expect(searchMatch?.parentNode).toHaveTextContent('Leonardo da Vinci');
            });
            await userEvent.clear(input);
        });

        await step('Searches and submits query for "Mitch" expecting two results.', async () => {
            await userEvent.clear(input);
            await userEvent.type(input, 'Mich');
            await waitFor(() => {
                document.querySelectorAll('mark')?.forEach(element => {
                    expect(element).toHaveTextContent('Mich');
                    // expect(element?.parentNode).toHaveTextContent('Michelangelo Buonarroti', { exact: false });
                });
            });
            input.focus();
            await userEvent.keyboard('{Enter}');
            await waitFor(() => {
                const marks = canvasElement.querySelectorAll('mark');
                expect(marks).toHaveLength(2);
                expect(marks[0]).toHaveTextContent('Mich');
                expect(marks[0]?.parentNode).toHaveTextContent('Michelangelo Buonarroti');
                expect(marks[1]).toHaveTextContent('Mich');
                expect(marks[1]?.parentNode).toHaveTextContent('Jean-Michel Basquiat');
                expect(canvasElement.querySelector('.listInfo__resultsText')).toHaveTextContent(
                    'Found 2 search results for Mich.'
                );
            });
        });
    }
};

export default Default;
