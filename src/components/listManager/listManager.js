/**
 * @typedef {import('./listManager.types.js').ListManagerConfigType} ListManagerConfigType
 * @typedef {import('@arpadroid/messages').Messages} Messages
 * @typedef {import('@arpadroid/services').Router} Router
 * @typedef {import('@arpadroid/forms').FieldOptionConfigType} FieldOptionConfigType
 * @typedef {import('../listSort/listSort.js').default} ListSort
 *
 */

import { List } from '@arpadroid/lists';
import { defineCustomElement } from '@arpadroid/tools';
import ListControls from '../listControls/listControls.js';
import { ucFirst, mergeObjects, editURL } from '@arpadroid/tools';
import { getService } from '@arpadroid/context';
import ListManagerItem from '../listManagerItem/listManagerItem.js';

class ListManager extends List {
    /** @type {ListManagerConfigType} */
    _config = this._config;

    ///////////////////////////
    // #region Initialization
    ///////////////////////////

    /**
     * Returns the default configuration for this component.
     * @param {ListManagerConfigType} config
     * @returns {ListManagerConfigType}
     */
    getDefaultConfig(config = {}) {
        /** @type {ListManagerConfigType} */
        const conf = {
            className: 'arpaList',
            controls: ['search', 'sort', 'views', 'multiselect', 'filters'],
            defaultView: 'list',
            hasControls: undefined,
            hasInfo: false,
            hasMessages: false,
            hasMiniSearch: true,
            itemComponent: ListManagerItem,
            itemTag: 'list-manager-item',
            paramNamespace: '',
            perPageParam: 'perPage',
            searchParam: 'search',
            showResultsText: true,
            sortByParam: 'sortBy',
            sortDefault: undefined,
            sortDirParam: 'sortDir',
            sortOptions: [],
            tagName: 'list-manager',
            templateChildren: {
                messages: { canRender: 'has-messages', tag: 'arpa-messages', id: '{id}-messages' },
                info: { tag: 'list-info', canRender: 'has-info' },
                ...super.getTemplateChildren(),
                controls: {
                    tag: 'list-controls',
                    content: ' ',
                    canRender: () => this.hasControls(),
                    attr: { controls: () => this.getArrayProperty('controls')?.toString() || '' }
                }
            }
        };
        return mergeObjects(super.getDefaultConfig(conf), config);
    }

    /**
     * Sets the configuration for the component.
     * @param {ListManagerConfigType} config
     * @returns {ListManagerConfigType}
     * @throws {Error} If the component has no id.
     */
    setConfig(config = {}) {
        super.setConfig(config);
        if (this.hasResource()) {
            /** @type {Router} */
            this.router = this.getRouter();
        }
        return this._config;
    }

    instantiateResource(id = this.getId()) {
        return super.instantiateResource(id, {
            router: this.router
        });
    }

    _initializeTemplates() {
        super._initializeTemplates();
        this.viewTemplates = this._selectViewTemplates();
        this.viewTemplates.forEach(template => template.remove());
    }

    // #endregion

    /////////////////
    // #region has
    /////////////////

    /**
     * Returns true if the list has any controls enabled.
     * @returns {boolean}
     */
    hasControls() {
        if (this._config.hasControls === false) return false;
        if (this.getControls().length === 0) return false;
        return this.hasZone('controls') || !this.hasHeaderControls();
    }

    /**
     * Returns true if the list has a specific control.
     * @param {string} control
     * @returns {boolean}
     */
    hasControl(control) {
        if (this.getRenderMode() === 'minimal') return false;
        return this.getControls()?.includes(control);
    }

    hasHeaderControls() {
        return this.getControls()?.length === 1;
    }

    // #endregion

    /////////////////
    // #region Get
    /////////////////

    /**
     * Returns the parent list component from a given element.
     * @param {Element} element
     * @returns {ListManager | null}
     */
    static getList(element) {
        return element.closest('list-manager');
    }

    getTemplateVars() {
        return {
            ...super.getTemplateVars(),
            headerControls: this.renderHeaderControls()
        };
    }

    /**
     * Returns the router service.
     * @returns {Router}
     */
    getRouter() {
        return /** @type {Router} */ (this._config?.router || getService('router'));
    }

    /**
     * Returns the list of controls assigned to the list.
     * @returns {string[]}
     */
    getControls() {
        const arr = this.getArrayProperty('controls');
        return Array.isArray(arr) ? arr : [];
    }

    /**
     * Returns the different options by which the list items can be sorted.
     * @returns {FieldOptionConfigType[]}
     */
    getSortOptions() {
        return this.getProperty('sort-options');
    }

    /**
     * Returns the control element given its name.
     * @param {string} control
     * @returns {HTMLElement | undefined | null}
     */
    getControl(control) {
        return this.controls?.getControl(control);
    }

    /**
     * Returns the default sort option value.
     * @returns {string}
     */
    getSortDefault() {
        return this.getProperty('sort-default');
    }

    // #endregion Get

    /////////////////
    // #region Set
    /////////////////

    /**
     * @todo - Fix / finish this function. For starters FieldOptionConfigType is wrong.
     * Sets the sort options for the list.
     * @param {FieldOptionConfigType[]} options
     * @param {string} defaultValue
     */
    async setSortOptions(options, defaultValue) {
        this._config.sortOptions = options;
        this._config.sortDefault = defaultValue;
        /** @type {ListSort | undefined} */
        const listSort = /** @type {ListSort | undefined} */ (this.controls?.search?.listSort);
        const sortField = listSort?.sortByMenu;
        // sortField?.setOptions(options, defaultValue);
    }

    // #endregion Set

    ////////////////////
    // #region Render
    ////////////////////

    renderHeaderControls() {
        if (!this.hasHeaderControls()) return '';
        /** @type {string[]} */
        const controls = /** @type {string[]} */ (this.getArrayProperty('controls') || []);
        const control = controls?.[0];
        if (!control) return '';
        const fn = /** @type {keyof ListControls} */ (`render${ucFirst(control)}`);
        const method = /** @type {((...args: any[]) => string) | undefined} */ (ListControls.prototype[fn]);
        if (typeof method === 'function') return method(this);
        return '';
    }

    // #endregion Render

    //////////////////////
    // #region Lifecycle
    //////////////////////

    async _initializeNodes() {
        await super._initializeNodes();
        /** @type {ListControls | null} */
        this.controls = this.querySelector('list-controls');
        /** @type {Messages | null} */
        this.messages = this.querySelector('arpa-messages');

        return true;
    }

    // #endregion Lifecycle

    ///////////////////
    // #region Events
    ///////////////////

    /**
     * Handles the pager change event.
     * @param {import('@arpadroid/ui').PagerCallbackPayloadType} payload
     */
    onPagerChange(payload) {
        super.onPagerChange(payload);
        const { page } = payload;
        const newURL = editURL(window.location.href, { [this.getParamName('page')]: String(page) });
        this.router?.go(newURL);
    }

    // #endregion Events

    //////////////////
    // #region Views
    //////////////////

    /**
     * Sets the view for the list.
     * @param {string} view
     */
    setView(view) {
        this.getViewFilter()?.setValue(view);
    }

    getDefaultView() {
        return this.getProperty('default-view');
    }

    getViewFilter() {
        return this.listResource?.getViewFilter({
            defaultValue: this.getDefaultView()
        });
    }

    getView() {
        return this.getViewFilter()?.getValue() || this.getDefaultView();
    }

    /**
     * Returns the view template for a given view.
     * @param {string} view
     * @returns {HTMLTemplateElement | undefined}
     */
    getViewTemplate(view) {
        return this.viewTemplates?.find(template => template.getAttribute('id') === view);
    }

    /**
     * Selects the view templates for the element.
     * @returns {HTMLTemplateElement[]} The selected view templates.
     */
    _selectViewTemplates() {
        return Array.from(this.querySelectorAll(':scope > template[template-type="view"]'));
    }

    // #endregion Views
}

defineCustomElement('list-manager', ListManager);

export default ListManager;
