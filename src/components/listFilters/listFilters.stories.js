/**
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/forms').NumberField} NumberField
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 */
import { Static as ListStory } from '../listManager/stories/listManager.stories.js';
import { within, userEvent, expect, waitFor, fireEvent } from 'storybook/test';
import { playSetup, renderSimple } from '../listManager/stories/listManager.stories.util.js';

/** @type {Meta} */
const Default = {
    ...ListStory,
    component: 'list-manager',
    title: 'List Manager/Controls/Filters',
    args: {
        ...ListStory.args,
        id: 'list-filters',
        controls: 'filters',
        title: 'List Filters',
        itemsPerPage: 5
    },
    render: renderSimple
};

/** @type {StoryObj} */
export const Render = Default;

/** @type {StoryObj} */
export const Test = {
    args: {
        ...Default.args,
        id: 'test-filters'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { canvas, listNode } = setup;
        const filtersBtn = await waitFor(() => canvas.getByRole('button', { name: /Filters/i }));
        const filtersNode = filtersBtn.closest('icon-menu');
        const filtersCombo = filtersNode.navigation;
        const combo = within(filtersCombo);
        /** @type {FormComponent | null} */
        let filtersForm;

        await step('Renders the filters menu control', async () => {
            await waitFor(() => {
                filtersForm = filtersCombo.querySelector('arpa-form');
                filtersForm?._config && (filtersForm._config.debounce = 0);
                expect(filtersBtn).toBeInTheDocument();
                expect(filtersForm).toBeInTheDocument();
            });
        });

        await step('Clicks on filters menu and opens the filters panel', async () => {
            await userEvent.click(filtersBtn);
            await waitFor(() => {
                expect(filtersCombo).toBeVisible();
            });
        });

        await step('Renders the filters panel with the pagination controls', async () => {
            const pagination = combo.getByText(/Pagination/i);
            expect(pagination).toBeInTheDocument();
            const perPageInput = combo.getByLabelText(/Per page/i);
            const pageInput = combo.getByLabelText('Page');
            expect(perPageInput).toBeInTheDocument();
            expect(pageInput).toBeInTheDocument();
        });

        await step('Changes the page, submits the form and verifies the page change', async () => {
            const pageInput = combo.getByLabelText('Page');
            const pageField = /** @type {NumberField} */ (pageInput.closest('number-field'));
            pageField?.setValue(2);
            if (!filtersForm) {
                throw new Error('Filters form not found');
            }
            await fireEvent.submit(filtersForm);
            await waitFor(() => {
                expect(setup.listResource?.getPage()).toEqual(2);
                const currPage = canvas.getByLabelText('Current page');
                expect(currPage).toHaveAttribute('value', '2');
            });
        });

        await step('Changes the per page, submits the form and verifies the per page change', async () => {
            const perPageInput = combo.getByLabelText(/Per page/i);

            const perPageField = /** @type {SelectCombo} */ (perPageInput.closest('select-combo'));
            await userEvent.click(perPageInput);
            await waitFor(() => {
                expect(perPageField?.optionsNode).toBeInTheDocument();
            });
            if (!(perPageField.optionsNode instanceof HTMLElement)) {
                throw new Error('Options node not found');
            }
            const options = within(perPageField.optionsNode);
            expect(perPageField.getValue()).toEqual('5');
            expect(listNode?.getItemNodes()).toHaveLength(5);
            const option5 = options.getByText('10').closest('button');
            if (!option5) {
                throw new Error('Option 10 not found');
            }
            await userEvent.click(option5);
            await waitFor(() => {
                expect(setup.listResource?.getPerPage()).toEqual(10);
                // const currPage = canvas.getByLabelText('Current page');
                // expect(currPage).toHaveAttribute('value', '1');
                // expect(canvasElement.querySelector('[is-active]')).toHaveTextContent('1');
                expect(canvasElement.querySelectorAll('list-manager-item')).toHaveLength(10);
            });
        });
    }
};

export default Default;
