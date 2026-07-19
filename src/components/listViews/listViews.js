/**
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/services').Router} Router
 * @typedef {import('@arpadroid/navigation').NavLink} NavLink
 * @typedef {import('../listManagerItem/listManagerItem.js').default} ListManagerItem
 * @typedef {import('./listViews.types').ListViewConfigType} ListViewConfigType
 * @typedef {import('./listViews.types').ListViewsConfigType} ListViewsConfigType
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('@arpadroid/navigation').NavList} NavList
 */
import { mergeObjects, clearLazyQueue, defineCustomElement, $map, $attr } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';
import ListManager from '../listManager/listManager.js';

export const LIST_VIEW_GRID = 'grid';
export const LIST_VIEW_GRID_COMPACT = 'grid-compact';
export const LIST_VIEW_LIST = 'list';
export const LIST_VIEW_LIST_COMPACT = 'list-compact';
const html = String.raw;
class ListViews extends ArpaElement {
    /** @type {ListViewsConfigType} */
    _config = this._config;
    getDefaultConfig() {
        this.bind('$onChange');
        /** @type {ListViewsConfigType} */
        const conf = {
            icon: 'visibility',
            className: 'listViews',
            label: 'Views',
            views: [LIST_VIEW_LIST, LIST_VIEW_LIST_COMPACT, LIST_VIEW_GRID, LIST_VIEW_GRID_COMPACT],
            links: [],
            options: undefined,
            defaultOptions: [
                {
                    title: 'List',
                    iconRight: 'view_list',
                    value: LIST_VIEW_LIST
                },
                {
                    title: 'List Compact',
                    iconRight: 'reorder',
                    value: LIST_VIEW_LIST_COMPACT
                },
                {
                    title: 'Grid',
                    iconRight: 'grid_view',
                    value: LIST_VIEW_GRID
                },
                {
                    title: 'Grid Compact',
                    iconRight: 'view_module',
                    value: LIST_VIEW_GRID_COMPACT
                }
            ]
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    hasViews() {
        return this.getViewsConfig()?.length > 1;
    }

    _preRender() {
        super._preRender();
        /** @type {ListManager | null} */
        this.list = ListManager.getList(this);
        /** @type {Router} */
        this.router = this.list?.getRouter();
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this._initializeViewFilter();
        this.router?.on('route_changed', () => this.initializeView());
        return true;
    }

    _initializeViewFilter() {
        const defaultView = this.list?.getDefaultView();
        this.viewFilter = this.listResource?.getViewFilter({
            defaultValue: defaultView ?? 'list'
        });
    }

    // #endregion

    // #region ACCESSORS

    /**
     * Returns the options.
     * @returns {ListViewConfigType[]}
     */
    getOptions() {
        const { options, defaultOptions } = this._config;
        const opt = Array.from(options ?? defaultOptions ?? []);
        this.list?.viewTemplates?.forEach(viewTemplate => {
            opt.push({
                title: viewTemplate.getAttribute('label') || '',
                iconRight: viewTemplate.getAttribute('icon') || '',
                value: viewTemplate.getAttribute('id') || ''
            });
        });
        return opt?.filter(link => link.value && this.getViewsConfig()?.includes(link.value));
    }

    /**
     * Returns whether the view is selected.
     * @param {string} view
     * @returns {boolean}
     */
    isSelected(view = 'list') {
        const val = this.viewFilter?.getValue() || 'list';
        return val === view;
    }

    getDefaultOptions() {
        return this.list?._config?.viewOptions ?? this._config?.defaultOptions;
    }

    /**
     * Returns the views config.
     * @returns {string[]}
     */
    getViewsConfig() {
        const rv = this.list?.getArrayProp('views') ?? this.getArrayProp('views') ?? [];
        return Array.isArray(rv) ? rv : [];
    }

    $renderTemplate() {
        return html`<arpa-node
            can-render="hasViews()"
            name="iconMenu"
            tag="icon-menu"
            tooltip="{label}"
            icon="{icon}"
            is-content
        >
            ${$map(this.getOptions(), payload => this.$renderItem(payload))}
        </arpa-node>`;
    }

    /**
     * Renders the item template.
     * @param {ListViewConfigType} param0
     * @returns {string}
     */
    $renderItem({ title, iconRight, value = '' }) {
        return html`<nav-link
            ${$attr({
                selected: this.isSelected(value),
                'handler-aria-current': this.isSelected(value) ? 'location' : undefined
            })}
            icon-right="${iconRight}"
            handler-data-value="${value}"
            on-click="{$onChange}"
            data-view="${value}"
        >
            ${title}
        </nav-link>`;
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        this.iconMenu = /** @type {IconMenu | null} */ (this.nodes.iconMenu);
        this.iconMenu && (await this.iconMenu?.promise);
        this.navigation = /** @type {NavList | null} */ (this.iconMenu?.navigation);
        this.initializeView(this.list?.getView());
        return true;
    }

    /**
     * Sets the view.
     * @param {string} view
     */
    async setView(view) {
        const viewExists = this.viewExists(view);
        if (!viewExists) {
            view = String(this?.viewFilter?.getDefaultValue() || '');
        }
        clearLazyQueue();
        this?.viewFilter?.setValue(view);
        this.applyView(view);
    }

    /**
     * Checks if the view exists.
     * @param {string} view
     * @returns {boolean}
     */
    viewExists(view) {
        const hasNode = Boolean(this.navigation?.querySelector(`[data-value="${view}"]`));
        return (
            hasNode ||
            Boolean(this._config?.links?.find((/** @type {ListViewConfigType} */ link) => link.value === view))
        );
    }

    /**
     * Applies the view.
     * @param {string} view
     */
    async applyView(view) {
        this.list?.setView(view);
        await this.list?.promise;
        const prevSelected = this.navigation?.querySelectorAll('[aria-current]');
        prevSelected?.forEach(node => node.removeAttribute('aria-current'));
        const selected = this.navigation?.querySelector(`[data-value="${view}"]`);
        selected?.setAttribute('aria-current', 'location');
    }

    /**
     * Initializes the view.
     * @param {string} [view]
     */
    initializeView(view = String(this.viewFilter?.getValue() || '')) {
        this.setView(view);
    }

    // #endregion

    // #region EVENTS

    /**
     * On change view callback.
     * @param {Event} event
     */
    $onChange(event) {
        const target = /** @type {HTMLElement} */ (event?.currentTarget);
        const navLink = /** @type {NavLink | null} */ (target?.closest('nav-link'));
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const value = navLink?.linkNode?.getAttribute('data-value');
        value && this.setView(value);
    }

    // #endregion
}
defineCustomElement('list-views', ListViews);

export default ListViews;
