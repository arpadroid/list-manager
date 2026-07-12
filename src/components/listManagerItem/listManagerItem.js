/**
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('@arpadroid/navigation').NavList} NavList
 * @typedef {import('@arpadroid/lists').ListItemImageSizeType} ListItemImageSizeType
 * @typedef {import('./listManagerItem.types').ListManagerItemConfigType} ListManagerItemConfigType
 * @typedef {import('./listManagerItem.types').ListItemViewConfigType} ListItemViewConfigType
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 */
import { defineCustomElement, dashedToCamel } from '@arpadroid/tools';
import { ListItem } from '@arpadroid/lists';
import { mergeObjects } from '@arpadroid/tools';
import ListItemViews from './listItem.views.js';

class ListManagerItem extends ListItem {
    /////////////////////////////
    // #region Initialization
    /////////////////////////////
    /** @type {ListManager} */
    list = this.list;
    /** @type {ListManagerItemConfigType} */
    _config = this._config;
    /**
     * Returns the default config for the component.
     * @returns {ListManagerItemConfigType}
     */
    getDefaultConfig() {
        this.bind('_onViewChange');
        /** @type {ListManagerItemConfigType} */
        const conf = {
            selectedClass: 'listManagerItem--selected',
            blueprint: ListItem.prototype.$renderTemplate.bind(this),
            className: 'listItem',
            classNames: ['listManagerItem', () => this.getViewClass()],
            listSelector: 'list-manager',
            view: 'list'
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    $initializeProperties() {
        super.$initializeProperties();
        this.grabList();

        /** @type {ListFilter} */
        this.viewsFilter = this.listResource?.filters?.views;

        const id = this.getId();
        if (typeof this.list?.hasControl === 'function' && this.list?.hasControl('multiselect')) {
            this.listResource?.on(`item_selected_${id}`, this._onSelected, this._unsubscribes);
            this.listResource?.on(`item_deselected_${id}`, this._onDeselected, this._unsubscribes);
        }

        return true;
    }

    // #endregion Initialization

    //////////////////
    // #region Has
    //////////////////

    hasNav() {
        return this.hasContent('nav');
    }

    hasSelection() {
        return (
            (typeof this.list?.hasControl === 'function' && this.list?.hasControl('multiselect')) ??
            this.listResource?.hasSelection()
        );
    }

    // #endregion Has

    //////////////////
    // #region Render
    //////////////////

    /**
     * Returns image dimensions.
     * @param {boolean} memoized - Indicates whether to use the memoized dimensions.
     * @returns {ListItemImageSizeType}
     */
    _getImageDimensions(memoized) {
        const imageSizes = this.getImageSizes();
        const view = this.getView();
        const sizeName = this.list?.hasControl('views') && view?.replace(/-/g, '_');
        return (sizeName && imageSizes[sizeName]) || super._getImageDimensions(memoized);
    }

    $renderTemplate() {
        return this.getViewTemplate();
    }

    // #endregion Rendering

    ////////////////////////
    // #region Lifecycle
    ////////////////////////

    $onConnected() {
        super.$onConnected();
        this.viewsFilter && this._initializeView();
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        this.initializeNav();
        return true;
    }

    // #endregion Lifecycle

    ////////////////////
    // #region Views
    ////////////////////

    /**
     * Returns the view configuration for the list item.
     * @param {string} viewId
     * @returns {ListItemViewConfigType}
     */
    getViewConfig(viewId = this.getView()) {
        const viewKey = dashedToCamel(viewId);
        const viewConfig = ListItemViews[viewKey] || ListItemViews[viewId];
        return viewConfig;
    }

    getView() {
        return this.getProp('view') || this.list?.getView() || 'list';
    }

    getViewTemplate(viewId = this.getView()) {
        if (viewId === 'list') {
            return super.$renderTemplate();
        }
        const viewConfig = this.getViewConfig(viewId);
        const viewTemplate = this.list?.getViewTemplate(viewId);
        if (!viewConfig && !viewTemplate) {
            console.warn(`No view configuration or template found for view: ${viewId}`);
        }
        return (
            viewConfig?.template ||
            viewTemplate?.innerHTML ||
            ListItemViews.list.template ||
            super.$renderTemplate() ||
            ''
        );
    }

    getViewClass(view = this.getProp('view')) {
        const viewConfig = this.getViewConfig(view);
        return viewConfig?.className || 'listItem--' + view;
    }

    /**
     * Initializes the view filter.
     * An item can have a view filter that changes the view of the list: grid, list, compact etc...
     */
    _initializeView() {
        const val = String(this.viewsFilter?.getValue() || 'list');
        /** @type {string} */
        this.setProp('view', val);
        this.viewsFilter?.on('value', this._onViewChange);
    }

    /**
     * Called when the view changes.
     * @param {string} view
     */
    _onViewChange(view) {
        if (this.getProp('view') !== view) {
            this.setProp('view', view);
            this?.isConnected && this.reRender();
        }
    }

    // #endregion Views

    /////////////////////////
    // #region Nav
    /////////////////////////

    async initializeNav() {
        /** @type {NavList | null} */
        this.navNode = this.querySelector('.listItem__nav');
        await customElements.whenDefined('icon-menu');
        if (!this.navNode || !this._config.nav) return;
        this.navNode?.setConfig(this._config.nav);
    }

    // #endregion Nav
}

defineCustomElement('list-manager-item', ListManagerItem);

export default ListManagerItem;
