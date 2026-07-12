/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('./listManagerItem.js').default} ListManagerItem
 * @typedef {import('./listManagerItem.types').ListManagerItemConfigType} ListManagerItemConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ListManagerItemConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListManagerItemConfigType>} Story
 */

import { waitFor, expect, userEvent, within } from 'storybook/test';
import { $attr } from '@arpadroid/tools';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
const html = String.raw;

/**
 * Sets up the test scenario.
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{ canvas: ReturnType<typeof within>, listItem: ListManagerItem | null }>}
 */
async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    /** @type {ListManagerItem | null} */
    const listItem = canvasElement.querySelector('list-manager-item');
    await customElements.whenDefined('list-manager');
    await customElements.whenDefined('list-manager-item');
    await listItem?.promise;
    return { canvas, listItem };
}

const ghostlyCrashContent = html`
    <p>
        There is a phantom structure holding the universe together called the cosmic web, and galaxies are merely the
        glowing dew drops caught in its strands.
    </p>
    <p>
        When you look at deep-space images, galaxies seem scattered like spilled glitter. In reality, they are locked
        into an intricate, invisible scaffolding made of dark matter. Shortly after the Big Bang, this mysterious
        substance clumped into an immense network of invisible filaments spanning billions of light-years.
    </p>
    <p>
        Normal matter—the gas and dust we can see—was gravitationally pulled toward these dark matter highways. It
        pooled at the intersections, dense enough to ignite the very first stars. Every single galaxy, including our
        Milky Way, was born and shaped by this hidden architecture.
    </p>
    <p>
        Even more mind-boggling: galaxies aren't isolated islands; they are constantly moving along these cosmic tracks.
        Right now, the Milky Way and Andromeda are hurtling toward each other at roughly 110 kilometers per second along
        our local filament. In about 4.5 billion years, they will merge.
    </p>
    <p>
        We tend to think of galaxies as the main characters of the universe, but they are actually just the vibrant,
        visible markers revealing where an invisible cosmic skeleton breathes.
    </p>
`;

const recyclingPlanetContent = html`
    <p>
        Earth is the only planet we know with active plate tectonics. Its crust isn't a solid shell, but a jigsaw puzzle
        of shifting plates.
    </p>
    <p>
        This constant recycling regulates carbon, stabilizes the climate, and generates our protective magnetic shield.
    </p>
    <p>
        Without this dynamic geologic engine continually reshaping the surface, life as we know it simply couldn't
        exist.
    </p>
`;

/** @type {Meta} */
const ListManagerItemStory = {
    title: 'List Manager/Item',
    component: 'list-manager-item',
    parameters: {
        layout: 'centered'
    },
    args: {
        title: 'The Ghostly Crash',
        truncateContent: 58,
        titleIcon: 'auto_awesome',
        titleLink: 'javascript:void(0)',
        image: '/test-assets/galaxy.jpg',
        subtitle: "Why the ultimate galactic collision won't destroy a single star."
    },
    render: args => {
        return html`<list-manager id="list-item-list" controls=" ">
            <list-manager-item ${$attr(args)}>${ghostlyCrashContent}</list-manager-item>
        </list-manager>`;
    }
};

/** @type {Story} */
export const Default = {
    parameters: defaultParams,
    args: {}
};

/** @type {Story} */
export const Test = {
    parameters: testParams,

    play: async ({ step, args, canvas }) => {
        await step('Renders the list item with the expected content', async () => {
            expect(canvas.getByText(args.title || '')).toBeInTheDocument();
            expect(canvas.getByText(args.subtitle || '')).toBeInTheDocument();
            expect(canvas.getByRole('link')).toHaveAttribute('href', 'javascript:void(0)');
            await waitFor(() => {
                expect(
                    canvas.getByText('There is a phantom structure holding the universe together')
                ).toBeInTheDocument();
                expect(canvas.getByRole('button', { name: /read more/i })).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const Zones = {
    args: {
        titleLink: '#test-link',
        truncateContent: 50,
        truncateButton: true,
        image: '/test-assets/space/earth-square-800.jpg',
        title: '',
        subtitle: ''
    },
    parameters: testParams,
    render: args => {
        return html`
            <list-manager id="list-item-list" controls=" ">
                <list-manager-item ${$attr(args)}>
                    <arpa-zone name="title"><strong>The Recycling Planet</strong></arpa-zone>
                    <arpa-zone name="subtitle">
                        Why Earth’s shifting continents single it out from every other rock in the cosmos.
                    </arpa-zone>
                    <arpa-zone name="nav">
                        <nav-link href="#test-link" icon="planet"> Learn more about Earth</nav-link>
                        <nav-link href="#test-link" icon="arrow_forward"> Learn more about Plate Tectonics</nav-link>
                    </arpa-zone>
                    ${recyclingPlanetContent}
                </list-manager-item>
            </list-manager>
        `;
    },
    play: async ({ canvasElement, step }) => {
        const { canvas } = await playSetup(canvasElement);
        await step('Renders the list item with the expected zones', async () => {
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for truncation to apply
            expect(canvas.getByText('The Recycling Planet')).toBeInTheDocument();
            expect(
                canvas.getByText('Why Earth’s shifting continents single it out from every other rock in the cosmos.')
            ).toBeInTheDocument();
            const titleLink = canvas.getByRole('link', { name: /The Recycling Planet/i });
            expect(titleLink).toHaveAttribute('href', '#test-link');
            const content = canvasElement.querySelector('.truncateText__content');
            expect(content).toBeInTheDocument();
            expect(content?.textContent).toHaveLength(50);
        });

        await step('Expands the content when the Read more button is clicked', async () => {
            const readMoreButton = canvas.getByRole('button', { name: /read more/i });
            expect(readMoreButton).toBeInTheDocument();
            await userEvent.click(readMoreButton);
            await waitFor(() => {
                expect(readMoreButton).toHaveTextContent('read less');
                const content = canvasElement.querySelector('.truncateText__content');
                expect(content).toHaveTextContent('Without this dynamic geologic engine continually reshaping');
            });
        });
    }
};

const templateItems = html`
    <list-manager-item image="/test-assets/galaxy.jpg" title-icon="auto_awesome" title-link="javascript:void(0)">
        ${ghostlyCrashContent}
        <arpa-zone name="title">The Ghostly Crash</arpa-zone>
        <arpa-zone name="subtitle"> Why the ultimate galactic collision won't destroy a single star. </arpa-zone>
        <arpa-zone name="tags">
            <tag-item icon="category">Space</tag-item>
            <tag-item icon="book_2">knowledge</tag-item>
        </arpa-zone>
        <arpa-zone name="nav">
            <nav-link href="#test-link" icon="arrow_forward">Learn more</nav-link>
        </arpa-zone>
    </list-manager-item>

    <list-manager-item
        image="/test-assets/space/earth-square-800.jpg"
        title-icon="auto_awesome"
        title-link="javascript:void(0)"
    >
        <arpa-zone name="title">The Recycling Planet</arpa-zone>
        <arpa-zone name="subtitle">
            Why Earth’s shifting continents single it out from every other rock in the cosmos.
        </arpa-zone>
        <arpa-zone name="tags">
            <tag-item icon="category">Space</tag-item>
            <tag-item icon="book_2">knowledge</tag-item>
        </arpa-zone>
        <arpa-zone name="nav">
            <nav-link href="#test-link" icon="arrow_forward">Learn more about Earth</nav-link>
            <nav-link href="#test-link" icon="arrow_forward">Learn more about Plate Tectonics</nav-link>
        </arpa-zone>
        ${recyclingPlanetContent}
    </list-manager-item>
`;

/** @type {Story} */
export const Template = {
    args: {
        view: 'list'
    },
    render: args => {
        return html`
            <style>
                .listItem__customContainer {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .listItem__customContentWrapper {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 1rem;
                }

                .listItem__customContent.listItem__customContent {
                    display: flex;
                    gap: 1rem;

                    arpa-image {
                        min-width: 200px;
                    }
                }
            </style>
            <list-manager id="item-with-template-list" controls=" ">
                <template template-type="list-item" truncate-content="150" view="${args.view}">
                    <div class="listItem__customContainer">
                        <arpa-node name="contentHeader" can-render="title || subtitle || nav">
                            <arpa-node name="titleWrapper" href="{titleLink}" tag="{getTitleTag()}">
                                {titleIcon} {title} {nav}
                            </arpa-node>
                            {subtitle}
                        </arpa-node>
                        <div class="listItem__customContent">
                            {image}
                            <div class="listItem__customContentWrapper">{content}{tags}</div>
                        </div>
                    </div>
                </template>
                ${templateItems}
            </list-manager>
        `;
    },
    play: async ({ canvasElement, step, args }) => {
        const { canvas, listItem } = await playSetup(canvasElement);
        await step('Renders the list item with the expected template', async () => {
            expect(canvas.getByText(args.title)).toBeInTheDocument();
            expect(canvas.getByText(args.subtitle)).toBeInTheDocument();
            expect(listItem?.querySelector('.listItem__customContent')).toBeInTheDocument();
            await waitFor(() => {
                expect(listItem?.querySelector('img')).toHaveAttribute('src', '/test-assets/galaxy.jpg');
            });
        });
    }
};

/** @type {Story} */
export const CompactView = {
    args: {
        view: 'listCompact'
    },
    render: args => {
        return html`
            <list-manager id="item-with-template-list" controls=" ">
                <template template-type="list-item" truncate-content="150" view="${args.view}"></template>
                ${templateItems}
            </list-manager>
        `;
    },
    play: async ({ canvasElement, step, args }) => {
        const { canvas } = await playSetup(canvasElement);
        await step('Renders the list item with the expected compact view', async () => {
            await waitFor(() => {
                expect(canvas.getByText(args.title)).toBeInTheDocument();
                expect(canvas.getByText(args.subtitle)).toBeInTheDocument();
                expect(canvasElement?.querySelector('.listItem--list-compact')).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const GridView = {
    render: CompactView.render,
    args: {
        view: 'grid'
    },
    play: async ({ canvasElement, step, args }) => {
        const { canvas } = await playSetup(canvasElement);
        await step('Renders the list item with the expected grid view', async () => {
            await waitFor(() => {
                expect(canvas.getByText(args.title)).toBeInTheDocument();
                expect(canvas.getByText(args.subtitle)).toBeInTheDocument();
                expect(canvasElement?.querySelector('.listItem--grid')).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const GridCompactView = {
    render: CompactView.render,
    args: {
        view: 'grid-compact'
    },
    play: async ({ canvasElement, step, args }) => {
        const { canvas } = await playSetup(canvasElement);
        await step('Renders the list item with the expected grid compact view', async () => {
            await waitFor(() => {
                expect(canvas.getByText(args.title)).toBeInTheDocument();
                expect(canvas.getByText(args.subtitle)).toBeInTheDocument();
                expect(canvasElement?.querySelector('.listItem--grid-compact')).toBeInTheDocument();
            });
        });
    }
};


export default ListManagerItemStory;
