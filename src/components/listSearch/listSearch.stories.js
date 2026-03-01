/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 */
import { ResourceDriven as ListStory } from '../listManager/stories/listManager.stories.js';
import { expect, waitFor, fireEvent } from 'storybook/test';
import { playSetup, renderSimple } from '../listManager/stories/listManager.stories.util.js';

/** @type {Meta} */
const Default = {
    ...ListStory,
    title: 'List Manager/Controls/Search',
    args: {
        ...ListStory.args,
        controls: 'search',
        id: 'list-search',
        title: null,
        hasInfo: true,
        hasSelection: null,
        searchPlaceholder: 'List Search'
    },
    render: renderSimple
};

/** @type {StoryObj} */
export const Render = Default;

/** @type {StoryObj} */
export const Test = {
    args: {
        ...Default.args,
        id: 'test-search',
        searchPlaceholder: 'List Search Test'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        await customElements.whenDefined('field-input');
        const { canvas } = setup;
        const input = canvas.getByRole('searchbox');
        const field = input.closest('search-field');
        await field.promise;
        const form = input.closest('arpa-form');
        form?._config && (form._config.debounce = false);
        await customElements.whenDefined('field-input');
        input.value = '';
        await fireEvent.submit(form);

        await step('Renders the search', async () => {
            expect(input).toHaveAttribute('placeholder', 'List Search Test');
        });

        await step('Searches for "Leon" and expects "Leonardo Da Vinci\'s" item to be highlighted', async () => {
            field.setValue('Leon', true);
            await fireEvent.input(input);
            await waitFor(() => {
                const searchMatch = canvasElement.querySelector('mark');
                expect(searchMatch).toHaveTextContent('Leon');
                expect(searchMatch?.parentNode).toHaveTextContent('Leonardo da Vinci');
            });
        });

        await step('Searches and submits query for "Mitch" expecting two results.', async () => {
            field.setValue('Mich', true);
            await fireEvent.input(input);
            await waitFor(() => {
                document.querySelectorAll('mark')?.forEach(element => {
                    expect(element).toHaveTextContent('Mich');
                    expect(element?.parentNode).toHaveTextContent('Michelangelo Buonarroti');
                });
            });
            await fireEvent.submit(form);
            await waitFor(() => {
                const marks = canvasElement.querySelectorAll('mark');
                expect(marks).toHaveLength(2);
                expect(marks[0]).toHaveTextContent('Mich');
                expect(marks[0]?.parentNode).toHaveTextContent('Michelangelo Buonarroti');
                expect(marks[1]).toHaveTextContent('Mich');
                expect(marks[1]?.parentNode).toHaveTextContent('Jean-Michel Basquiat');
                expect(canvasElement.querySelector('list-info')).toHaveTextContent('Found 2 search results for Mich.');
            });
        });
    }
};

export default Default;
