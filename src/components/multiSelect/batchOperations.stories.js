/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('../listManagerItem/listManagerItem.js').default} ListManagerItem
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
                    <select-option value="delete" icon="delete" label="Delete">
                        <delete-dialog container="#storybook-root" title="Delete items">
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
    play: async ({ canvasElement, step, canvas }) => {
        await playSetup(canvasElement);
        await waitFor(() => expect(canvasElement.querySelector('.listMultiSelect__form')).toBeInTheDocument());
        const formNode = /** @type {HTMLFormElement} */ (canvasElement.querySelector('.listMultiSelect__form'));
        const getForm = () => within(formNode);
        const form = getForm();

        const getToggleAllCheckbox = () =>
            /** @type {HTMLElement} */ (formNode?.querySelector('input[type="checkbox"][name="toggleAll"]'));
        const getItemCheckbox = () => canvasElement.querySelector('.listItem__checkbox');

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
            await waitFor(() => {
                expect(getItemCheckbox()).toBeInTheDocument();
            });
            const listItem = /** @type {ListManagerItem} */ (canvasElement.querySelector('list-manager-item'));
            expect(listItem).toBeInTheDocument();
            await listItem.promise;
            const checkbox = await waitFor(() => listItem.querySelector('input[type="checkbox"]'));
            expect(checkbox).toBeInTheDocument();
            checkbox && (await userEvent.click(checkbox));
            // await waitFor(() => expect(canvas.getByText('1 items selected')).toBeInTheDocument());
        });

        await step('Clicks on Select all and verifies the selected item count.', async () => {
            await waitFor(() => expect(getToggleAllCheckbox()).toBeInTheDocument());
            await new Promise(resolve => setTimeout(resolve, 40));

            await userEvent.click(getToggleAllCheckbox());
            await waitFor(() => expect(within(formNode).getByText('1 items selected')).toBeInTheDocument());
        });

        const selectActionButton = form.getByText('Select an action');

        await step('Clicks on "Select an action" and verifies the dropdown menu.', async () => {
            await new Promise(resolve => setTimeout(resolve, 40));
            await userEvent.click(selectActionButton);
        });

        await step('Clicks on "Delete" and verifies the dialog.', async () => {
            const actionsField = /** @type {SelectCombo | null} */ (selectActionButton.closest('select-combo'));
            await new Promise(resolve => setTimeout(resolve, 40));
            const options = actionsField?.optionsNode;
            if (!options) {
                throw new Error('Options not found.');
            }
            /** @todo Fix this flaky test. */
            // const button = await waitFor(() => options.querySelector('button'));

            // button && (await userEvent.click(button));
            // await waitFor(() => {
            //     expect(canvas.getByText('Delete items')).toBeInTheDocument();
            // });
        });
    }
};

export default Default;
