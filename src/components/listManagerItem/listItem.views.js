/**
 * @typedef {import("./listManagerItem.types").ListItemViewConfigType} ListItemViewConfigType
 */
const html = String.raw;

/** @type {ListItemViewConfigType} */
export const ListView = {
    id: 'list',
    label: 'List',
    className: 'listItem--list',
    template: html`
        <arpa-node {wrapperAttr()}>
            {icon}{image}
            <arpa-node name="contentWrapper">
                <arpa-node name="contentHeader" can-render="title || subtitle">
                    <div class="listItem__contentHeader__top">
                        <arpa-node name="titleWrapper" href="{titleLink}" tag="{getTitleTag()}">
                            {titleIcon} {title}
                        </arpa-node>
                        {checkboxContainer} {nav}
                    </div>
                    <arpa-node name="subtitle" tag="span"></arpa-node>
                </arpa-node>
                {content}{tags}
            </arpa-node>
            {iconRight}
        </arpa-node>

        <arpa-node name="rhs"></arpa-node>
    `
};

export const ListCompactView = {
    id: 'list-compact',
    label: 'List Compact',
    className: 'listItem--list-compact',
    template: html`
        <arpa-node name="main" {wrapperAttr()}>
            {icon}{image}
            <div class="listItem__contentWrapper">
                <arpa-node name="titleWrapper" href="{titleLink}" tag="{getTitleTag()}">
                    {titleIcon} {title}
                </arpa-node>
                {subtitle}{content}
            </div>
            {iconRight}
        </arpa-node>
        <arpa-node name="rhs">{tags}{checkboxContainer}{nav}</arpa-node>
    `
};

export const GridView = {
    id: 'grid',
    label: 'Grid',
    className: 'listItem--grid',
    template: html`
        <arpa-node {wrapperAttr()}>
            {icon}
            <div class="listItem__contentWrapper">
                <div class="listItem__contentHeader">
                    <arpa-node name="titleWrapper" href="{titleLink}" tag="{getTitleTag()}">
                        {titleIcon} {title}
                    </arpa-node>
                    {image}
                    <arpa-node name="subtitle" tag="div" max-lines="1"></arpa-node>
                    {content} {tags}
                </div>
            </div>
            {iconRight}
        </arpa-node>
        <arpa-node name="rhs" defer="canRenderRhs">{nav}{checkboxContainer}</arpa-node>
    `
};

export const GridCompactView = {
    id: 'grid-compact',
    label: 'Grid Compact',
    className: 'listItem--grid',
    template: html`
        <arpa-node {wrapperAttr()}>
            {icon}
            <div class="listItem__contentWrapper">
                <div class="listItem__contentHeader">
                    <arpa-node name="titleWrapper" href="{titleLink}" tag="{getTitleTag()}">
                        {titleIcon} {title}
                    </arpa-node>
                    {image}{tags}{content}
                </div>
            </div>
            {iconRight}
        </arpa-node>
        <arpa-node name="rhs" defer="canRenderRhs">{nav}{checkboxContainer}</arpa-node>
    `
};

/** @type {Record<string, ListItemViewConfigType>} */
const ListItemViews = {
    list: ListView,
    listCompact: ListCompactView,
    grid: GridView,
    gridCompact: GridCompactView
};

export default ListItemViews;
