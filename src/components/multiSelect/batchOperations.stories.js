/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 */

import { Static as ListStory } from '../listManager/stories/listManager.stories.js';
import { within, waitFor, userEvent, expect } from 'storybook/test';
import { attrString } from '@arpadroid/tools';
import { playSetup, renderItemTemplate } from '../listManager/stories/listManager.stories.util.js';

const html = String.raw;

/** @type {Meta} */
const Default = {
    ...ListStory,
    title: 'List Manager/Controls/Batch Operations',
    args: {
        ...ListStory.args,
        id: 'batch-operations',
        controls: 'multiselect',
        itemsPerPage: 1,
        title: 'Batch Operations'
    },
    render: args => {
        return html`
            <list-manager ${attrString(args)}>
                <arpa-zone name="batchOperations">
                    <select-option value="delete" icon="delete">
                        Delete
                        <delete-dialog title="Delete items">
                            <arpa-zone name="content"> Are you sure you want to delete the selected items? </arpa-zone>
                        </delete-dialog>
                    </select-option>
                </arpa-zone>
                ${renderItemTemplate()}
            </list-manager>
        `;
    }
};

/** @type {StoryObj} */
export const Render = Default;

/** @type {StoryObj} */
export const Test = {
    args: {
        ...Default.args,
        id: 'test-batch-operations',
        itemsPerPage: 1
    },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        await waitFor(() => expect(document.querySelector('.listMultiSelect__form')).toBeInTheDocument());
        const { canvas } = setup;
        const formNode = /** @type {HTMLFormElement} */ (document.querySelector('.listMultiSelect__form'));
        const getForm = () => within(formNode);
        const form = getForm();

        const getToggleAllCheckbox = () =>
            /** @type {HTMLElement} */ (formNode?.querySelector('input[type="checkbox"][name="toggleAll"]'));
        const getItemCheckbox = () => document.querySelector('.listItem__checkbox');

        await step('Opens and renders Batch Operations panel.', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /Batch Operations/i });
            await userEvent.click(filtersMenu);
            await waitFor(() => {
                expect(form.getByText('Batch operations')).toBeInTheDocument();
                expect(form.getAllByText('No items selected')).toHaveLength(1);
                expect(form.getByText('Select all')).toBeInTheDocument();
                expect(form.getByText('Show selected only')).toBeInTheDocument();
            });
        });

        await step('Checks an item checkbox and verifies the selected item count.', async () => {
            const checkbox = getItemCheckbox();
            await new Promise(resolve => setTimeout(resolve, 40));
            checkbox && (await userEvent.click(checkbox));
            expect(checkbox).toBeInTheDocument();
            await waitFor(() => expect(form.getAllByText('1 items selected')).toHaveLength(1));
        });

        await step('Clicks on Select all and verifies the selected item count.', async () => {
            await waitFor(() => expect(getToggleAllCheckbox()).toBeInTheDocument());
            getToggleAllCheckbox()?.click();
            await waitFor(() => expect(form.getByText('1 items selected')).toBeInTheDocument());
        });

        const selectActionButton = form.getByText('Select an action');

        await step('Clicks on "Select an action" and verifies the dropdown menu.', async () => {
            await new Promise(resolve => setTimeout(resolve, 40));
            selectActionButton.click();
        });

        await step('Clicks on "Delete" and verifies the dialog.', async () => {
            const actionsField = /** @type {SelectCombo | null} */ (selectActionButton.closest('select-combo'));
            const options = actionsField?.optionsNode;
            if (!options) {
                throw new Error('Options not found.');
            }
            await new Promise(resolve => setTimeout(resolve, 40));
            const button = await waitFor(() => within(options).getAllByText('Delete')[0].closest('button'));
            button && (await userEvent.click(button));
            await waitFor(() => expect(document.querySelector('delete-dialog')).toBeInTheDocument());
        });
    }
};

export default Default;
