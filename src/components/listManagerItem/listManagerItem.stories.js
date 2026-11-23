/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('./listManagerItem.js').default} ListManagerItem
 * @typedef {import('./listManagerItem.types').ListManagerItemConfigType} ListManagerItemConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ListManagerItemConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListManagerItemConfigType>} Story
 */

import { waitFor, expect, userEvent } from 'storybook/test';
import { $attr } from '@arpadroid/tools';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
const html = String.raw;

/**
 * Sets up the test scenario.
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{ list: ListManager | null, listItem: ListManagerItem | null }>}
 */
async function playSetup(canvasElement) {
    await customElements.whenDefined('list-manager');
    await customElements.whenDefined('list-manager-item');
    const list = /** @type {ListManager | null} */ (canvasElement.querySelector('list-manager'));
    await list?.promise;
    /** @type {ListManagerItem | null} */
    const listItem = canvasElement.querySelector('list-manager-item');
    await listItem?.promise;
    return { listItem, list };
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
        layout: 'flexColumn'
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
    args: {
        view: 'list'
    }
};

/** @type {Story} */
export const Test = {
    parameters: testParams,
    render: args => {
        return html`<list-manager id="list-item-test" controls=" " view="${args.view}">
            <list-manager-item ${$attr(args)}>${ghostlyCrashContent}</list-manager-item>
        </list-manager>`;
    },
    play: async ({ step, args, canvas, canvasElement }) => {
        await step('Renders the list item with the expected content', async () => {
            await waitFor(() => {
                expect(canvasElement.querySelector('list-manager-item')).toBeInTheDocument();
            });
            const item = /** @type {ListManagerItem} */ (canvasElement.querySelector('list-manager-item'));
            await item.onRendered();
            await item.onNodesReady();
            await waitFor(() => {
                expect(canvas.getByText(args.title || '')).toBeInTheDocument();
                expect(canvas.getByText(args.subtitle || '')).toBeInTheDocument();
                expect(canvas.getByRole('link')).toHaveAttribute('href', 'javascript:void(0)');
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
                        <nav-link link="#test-link" icon="planet">Earth</nav-link>
                        <nav-link link="#test-link" icon="arrow_forward">Plate Tectonics</nav-link>
                    </arpa-zone>
                    ${recyclingPlanetContent}
                </list-manager-item>
            </list-manager>
        `;
    },
    play: async ({ canvasElement, step, canvas }) => {
        await playSetup(canvasElement);
        await step('Renders the list item with the expected zones', async () => {
            await new Promise(resolve => setTimeout(resolve, 20)); // Wait for truncation to apply
            await waitFor(() => {
                expect(canvas.getByText('The Recycling Planet')).toBeInTheDocument();
                expect(
                    canvas.getByText(
                        'Why Earth’s shifting continents single it out from every other rock in the cosmos.'
                    )
                ).toBeInTheDocument();
                const titleLink = canvas.getByRole('link', { name: /The Recycling Planet/i });
                expect(titleLink).toHaveAttribute('href', '#test-link');
                const content = canvasElement.querySelector('.truncateText__content');
                expect(content).toBeInTheDocument();
                expect(content?.textContent).toHaveLength(50);
            });
        });

        await step('Expands the content when the Read more button is clicked', async () => {
            const readMoreButton = await waitFor(() => canvas.getByRole('button', { name: /read more/i }));
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
            <nav-link link="#test-link" icon="arrow_forward">Learn more</nav-link>
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
            <nav-link link="#test-link" icon="arrow_forward">Learn more about Earth</nav-link>
            <nav-link link="#test-link" icon="arrow_forward">Learn more about Plate Tectonics</nav-link>
        </arpa-zone>
        ${recyclingPlanetContent}
    </list-manager-item>

    <list-manager-item
        image="/test-assets/space/moon-400.jpg"
        title-icon="auto_awesome"
        title-link="javascript:void(0)"
    >
        <arpa-zone name="title">The Wandering Moon</arpa-zone>
        <arpa-zone name="subtitle">
            Why the Moon is slowly drifting away from Earth, one thumbnail-width at a time.
        </arpa-zone>
        <arpa-zone name="tags">
            <tag-item icon="category">Space</tag-item>
            <tag-item icon="book_2">knowledge</tag-item>
        </arpa-zone>
        <arpa-zone name="nav">
            <nav-link link="#test-link" icon="arrow_forward">Learn more about the Moon</nav-link>
        </arpa-zone>
        ${recyclingPlanetContent}
    </list-manager-item>

    <list-manager-item
        image="/test-assets/space/black-hole-400.jpg"
        title-icon="auto_awesome"
        title-link="javascript:void(0)"
    >
        <arpa-zone name="title">The Hungry Dark</arpa-zone>
        <arpa-zone name="subtitle">
            Why black holes bend light, time and space around them without ever being seen directly.
        </arpa-zone>
        <arpa-zone name="tags">
            <tag-item icon="category">Space</tag-item>
            <tag-item icon="book_2">knowledge</tag-item>
        </arpa-zone>
        <arpa-zone name="nav">
            <nav-link link="#test-link" icon="arrow_forward">Learn more about black holes</nav-link>
            <nav-link link="#test-link" icon="arrow_forward">Learn more about event horizons</nav-link>
        </arpa-zone>
        ${ghostlyCrashContent}
    </list-manager-item>

    <list-manager-item
        image="/test-assets/space/sun-earth-moon-400.jpg"
        title-icon="auto_awesome"
        title-link="javascript:void(0)"
    >
        <arpa-zone name="title">The Perfect Eclipse</arpa-zone>
        <arpa-zone name="subtitle">
            Why the Sun and Moon appear the same size in our sky, a cosmic coincidence.
        </arpa-zone>
        <arpa-zone name="tags">
            <tag-item icon="category">Space</tag-item>
            <tag-item icon="book_2">knowledge</tag-item>
        </arpa-zone>
        <arpa-zone name="nav">
            <nav-link link="#test-link" icon="arrow_forward">Learn more about eclipses</nav-link>
        </arpa-zone>
        ${recyclingPlanetContent}
    </list-manager-item>

    <list-manager-item
        image="/test-assets/space/earth-vertical-400.jpg"
        title-icon="auto_awesome"
        title-link="javascript:void(0)"
    >
        <arpa-zone name="title">The Thin Blue Line</arpa-zone>
        <arpa-zone name="subtitle">
            Why Earth’s atmosphere is thinner relative to the planet than the skin on an apple.
        </arpa-zone>
        <arpa-zone name="tags">
            <tag-item icon="category">Space</tag-item>
            <tag-item icon="book_2">knowledge</tag-item>
        </arpa-zone>
        <arpa-zone name="nav">
            <nav-link link="#test-link" icon="arrow_forward">Learn more about the atmosphere</nav-link>
        </arpa-zone>
        ${ghostlyCrashContent}
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
                .arpaList {
                    --list-items-gap: 2rem;
                }

                .listItem__customContentWrapper {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 1rem;
                }

                .listItem__contentHeader {
                    flex-direction: row;
                    flex-wrap: nowrap;
                }

                .listItem__customContent.listItem__customContent {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem 0;

                    arpa-image.listItem__image.listItem__image {
                        min-width: 150px;
                        max-width: 250px;
                        width: 30%;
                        flex: none;
                    }
                }

                .listItem__titleWrapper {
                    display: flex;
                    flex: 1 1 auto;
                }

                .listItem__titles {
                    display: flex;
                    flex-direction: column;
                    flex: 1 1 auto;
                }
            </style>
            <list-manager id="item-with-template-list" controls=" ">
                <template template-type="list-item" truncate-lines="3" view="${args.view}">
                    <div class="listItem__customContainer">
                        <arpa-node name="contentHeader" can-render="title || subtitle || nav">
                            <arpa-node name="titleWrapper" href="{titleLink}" tag="{getTitleTag()}">
                                {titleIcon}
                                <arpa-node name="titles">{title} </arpa-node>
                            </arpa-node>
                            {nav}
                        </arpa-node>
                        <arpa-node name="subtitle" tag="truncate-text" max-lines="2"></arpa-node>
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
    play: async ({ canvasElement, step, args, canvas }) => {
        const { listItem } = await playSetup(canvasElement);
        await step('Renders the list item with the expected template', async () => {
            await waitFor(() => {
                expect(canvas.getByText(args.title || '')).toBeInTheDocument();
                expect(canvas.getByText(args.subtitle || '')).toBeInTheDocument();
                expect(listItem?.querySelector('.listItem__customContent')).toBeInTheDocument();
                expect(listItem?.querySelector('img')).toHaveAttribute('src', '/test-assets/galaxy.jpg');
            });
        });
    }
};

/** @type {Story} */
export const ListView = {
    name: 'View - List',
    args: {
        view: 'list'
    },
    render: args => {
        return html`
            <list-manager id="item-with-template-list" controls=" " view="${args.view}">
                <template template-type="list-item" truncate-lines="3" view="${args.view}"></template>
                ${templateItems}
            </list-manager>
        `;
    },
    play: async ({ canvasElement, step, args, canvas }) => {
        await playSetup(canvasElement);
        await step('Renders the list item with the expected compact view', async () => {
            await waitFor(() => {
                expect(canvas.getByText(args.title || '')).toBeInTheDocument();
                expect(canvas.getByText(args.subtitle || '')).toBeInTheDocument();
                expect(canvasElement?.querySelector('.listItem--list')).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const CompactView = {
    name: 'View - List Compact',
    args: {
        view: 'list-compact'
    },
    render: ListView.render,
    play: async ({ canvasElement, step, args, canvas }) => {
        await playSetup(canvasElement);
        await step('Renders the list item with the expected compact view', async () => {
            await waitFor(() => {
                expect(canvas.getByText(args.title || '')).toBeInTheDocument();
                expect(canvas.getByText(args.subtitle || '')).toBeInTheDocument();
                expect(canvasElement?.querySelector('.listItem--list-compact')).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const GridView = {
    name: 'View - Grid',
    render: CompactView.render,
    args: {
        view: 'grid'
    },
    play: async ({ canvasElement, step, args, canvas }) => {
        await playSetup(canvasElement);
        await step('Renders the list item with the expected grid view', async () => {
            await waitFor(() => {
                expect(canvas.getByText(args.title || '')).toBeInTheDocument();
                expect(canvas.getByText(args.subtitle || '')).toBeInTheDocument();
                expect(canvasElement?.querySelector('.listItem--grid')).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const GridCompactView = {
    name: 'View - Grid Compact',
    args: {
        view: 'grid-compact'
    },
    parameters: {
        layout: 'fullscreen'
    },
    render: args => {
        return html`
            <list-manager id="item-with-template-list" controls=" " view="${args.view}">
                <template template-type="list-item" truncate-lines="2" view="${args.view}"></template>
                ${templateItems} ${templateItems}
            </list-manager>
        `;
    },
    play: async ({ canvasElement, step, args, canvas }) => {
        await step('Renders the list item with the expected grid compact view', async () => {
            await waitFor(() => {
                expect(canvas.queryAllByText(args.title || '')).toHaveLength(2);
                expect(canvas.queryAllByText(args.subtitle || '')).not.toBe([]);
                expect(canvasElement?.querySelector('.listItem--grid-compact')).toBeInTheDocument();
            });
        });
    }
};

export default ListManagerItemStory;
