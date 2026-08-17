/**
 * @typedef {import("./listManagerItem.types").ListItemViewConfigType} ListItemViewConfigType
 */
const html = String.raw;

/** @type {ListItemViewConfigType} */
export const ListView = {
    id: 'list',
    label: 'List',
    className: 'listItem--list'
};

export const ListCompactView = {
    id: 'list-compact',
    label: 'List Compact',
    className: 'listItem--list-compact',
    template: html`
        <arpa-node name="main" {wrapperAttr()}>
            {checkboxContainer}{icon}{image}
            <div class="listItem__contentWrapper">{titleWrapper} {subtitle} {content}</div>
            {iconRight}
        </arpa-node>

        {tags}{nav}
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
        {rhs}
    `
};

export const GridCompactView = {
    id: 'grid-compact',
    label: 'Grid Compact',
    className: 'listItem--grid-compact',
    template: html`
        <arpa-node {wrapperAttr()}>
            {icon}
            <div class="listItem__contentHeader">{titleWrapper}{subtitle}{image}{tags}{content}</div>
            {iconRight}
        </arpa-node>
        {rhs}
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
