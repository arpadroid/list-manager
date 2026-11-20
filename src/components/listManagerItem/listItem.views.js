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
            <arpa-node name="contentWrapper">{contentHeader}{content}{tags}</arpa-node>
            {iconRight}
        </arpa-node>

        <arpa-node name="rhs">{checkboxContainer}{nav}</arpa-node>
    `
};

export const ListCompactView = {
    id: 'list-compact',
    label: 'List Compact',
    className: 'listItem--list-compact',
    template: html`
        <arpa-node name="main" {wrapperAttr()}>
            {checkboxContainer}{icon}{image}
            <div class="listItem__contentWrapper">{titleWrapper}{subtitle}{content}</div>
            {iconRight}
        </arpa-node>
        <arpa-node name="rhs">{tags}{nav}</arpa-node>
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
                <div class="listItem__contentHeader">{titleWrapper}{subtitle}{image}{tags}</div>
                {content}
            </div>
            {iconRight}
        </arpa-node>
        <arpa-node name="rhs" defer="canRenderRhs">{checkboxContainer}{nav}</arpa-node>
    `
};

export const GridCompactView = {
    id: 'grid-compact',
    label: 'Grid Compact',
    className: 'listItem--grid-compact',
    template: html`
        <arpa-node {wrapperAttr()}>
            {icon}
            <div class="listItem__contentHeader">{titleWrapper}{subtitle}{image}{tags}</div>
            {iconRight}
        </arpa-node>
        <arpa-node name="rhs" defer="canRenderRhs">{checkboxContainer}{nav}</arpa-node>
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
