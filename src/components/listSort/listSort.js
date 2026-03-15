/**
 * @typedef {import('@arpadroid/ui').Icon} Icon
 * @typedef {import('@arpadroid/ui').Tooltip} Tooltip
 * @typedef {import('@arpadroid/forms').SearchField} SearchField
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@arpadroid/forms').FieldOptionConfigType} FieldOptionConfigType
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 * @typedef {import('@arpadroid/services').Router} Router
 * @typedef {import('../listManagerItem/listManagerItem.types.js').ListManagerItemConfigType} ListManagerItemConfigType
 * @typedef {import('../listManager/listManager.types').ListManagerConfigType} ListManagerConfigType
 * @typedef {import('../listManagerItem/listManagerItem.js').default} ListManagerItem
 * @typedef {import('./listSort.types').ListSortConfigType} ListSortConfigType
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('@arpadroid/navigation').NavLink} NavLink
 * @typedef {import('@arpadroid/navigation').NavList} NavList
 */

import { mapHTML, attr, defineCustomElement } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';
import ListManager from '../listManager/listManager.js';

const html = String.raw;
class ListSort extends ArpaElement {
    /** @type {ListSortConfigType} */
    _config = this._config;
    //////////////////////////////
    // #region INITIALIZATION
    /////////////////////////////

    /**
     * Returns the default configuration for the list sort component.
     * @returns {ListSortConfigType} The default configuration object.
     */
    getDefaultConfig() {
        this.bind('update', '_onRouteChange', '_onSortBySelected', '_isItemSelected');
        this.i18nKey = 'list-manager.listSort';
        return {
            iconAsc: 'keyboard_double_arrow_up',
            iconDesc: 'keyboard_double_arrow_down',
            iconSort: 'sort',
            paramAsc: 'asc',
            paramDesc: 'desc'
        };
    }

    initializeProperties() {
        /** @type {ListManager | null} */
        this.list = ListManager.getList(this);
        /** @type {Router} */
        this.router = this.list?.getRouter();
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        /** @type {ListFilter} */
        this.sortDirFilter = this.listResource?.getSortDirFilter();
        this.sortDirFilter?.on('value', dir => this.updateSortLink(dir));
        /** @type {ListFilter} */
        this.sortFilter = this.listResource?.getSortFilter();

        return true;
    }
    ////////////////////////////////
    // #endregion INITIALIZATION
    ///////////////////////////////

    ////////////////////
    // #region ACCESSORS
    ////////////////////

    getSortDir() {
        return this.listResource?.getSortDirection() || 'asc';
    }

    getSortDirIcon(dir = this.getSortDir()) {
        return dir === 'asc' ? this.getProperty('icon-asc') : this.getProperty('icon-desc');
    }

    getSortDirTooltip(dir = this.getSortDir()) {
        return this.i18n(dir === 'asc' ? 'lblSortAsc' : 'lblSortDesc');
    }
    ///////////////////////////////
    // #endregion ACCESSORS
    //////////////////////////////

    /////////////////////////////
    // #region LIFECYCLE
    ////////////////////////////

    _onConnected() {
        this.router?.on('route_changed', this._onRouteChange);
    }

    _onRouteChange() {
        this._initializeNav();
        // this.updateSortLink();
    }

    async updateSortLink(sortDir = this.getSortDir(), sortLink = this.sortLink) {
        await this.promise;
        await sortLink?.promise;
        /** @type {Icon | null | undefined} */
        const iconNode = sortLink?.querySelector('arpa-icon');
        await customElements.whenDefined('arpa-icon');
        const icon = this.getSortDirIcon(sortDir);
        iconNode?.setIcon(icon);
        sortLink?.setAttribute('param-value', sortDir === 'asc' ? 'desc' : 'asc');
        /** @type {Tooltip | null | undefined} */
        const tooltip = sortLink?.querySelector('arpa-tooltip');
        const tooltipText = this.getSortDirTooltip(sortDir);
        await tooltip?.promise;
        tooltip?.setContent(tooltipText);
    }

    /////////////////////////////
    // #endregion LIFECYCLE
    ////////////////////////////

    ///////////////////////////
    // #region RENDERING
    //////////////////////////

    render() {
        const sortDir = this.listResource?.getSortDirection() === 'asc' ? 'desc' : 'asc';

        this.innerHTML = html`<icon-menu
                class="sortMenu"
                icon="sort_by_alpha"
                tooltip="${this.i18nText('lblSortBy')}"
                zone="sort-options"
            >
                ${this.renderSortLinks()}
            </icon-menu>
            <nav-link
                class="sortDirButton iconButton__button"
                param-name="${this.list?.getParamName('sortDir')}"
                param-value="${sortDir}"
                param-clear="${this.list?.getParamName('page')}"
                icon="${this.getSortDirIcon()}"
                label="${this.i18nText('lblSortOrder')}"
                use-router
            >
                <zone name="tooltip-content">${this.getSortDirTooltip()}</zone>
            </nav-link>`;

        /** @type {NavLink | null} */
        this.sortLink = this.querySelector('.sortDirButton');
        this._initializeNav();
    }

    renderSortLinks(sortOptions = this.list?.getSortOptions() || []) {
        // @ts-ignore
        return mapHTML(sortOptions, payload => {
            const { value = '', icon = '', label = '' } = payload;
            return html`<nav-link link="${value}" icon-left="${icon}" label="${label}"></nav-link>`;
        });
    }

    async _initializeNav() {
        await customElements.whenDefined('nav-list');
        await this.promise;
        /** @type {IconMenu | null} */
        this.sortByMenu = this.querySelector('icon-menu');
        if (!this.sortByMenu) {
            console.warn('No nav node found');
            return;
        }
        await this.sortByMenu.promise;
        /** @type {NavList | null} */
        this.sortNav = this.sortByMenu?.navigation;
        if (!this.sortNav) {
            return;
        }
        if (this.sortNav?._config && typeof this._isItemSelected === 'function') {
            this.sortNav._config.isItemSelected = this._isItemSelected;
        }
        attr(this.sortNav, {
            'param-name': this.list?.getParamName('sortBy'),
            'use-router': '',
            'param-clear': this.list?.getParamName('page')
        });
        this.sortNav.on('selected', this._onSortBySelected, this._unsubscribes);
    }

    /**
     * Checks if the item is selected.
     * @param {import('@arpadroid/navigation').SelectedCallbackPayloadType} payload
     * @returns {boolean}
     */
    _isItemSelected(payload) {
        const sortByValue = this.sortFilter?.getValue();
        if (!sortByValue) return false;
        const itemValue = payload?.node?.getAttribute('param-value');
        return itemValue === sortByValue;
    }

    /**
     * When a sort option is selected.
     * @param {ListManagerItem} item
     */
    _onSortBySelected(item) {
        const icon = item.getProperty('icon') || item.getProperty('icon-right');
        this.sortByMenu?.setIcon(icon);
        this.sortByMenu?.setTooltip(
            html`<span>${this.i18n('lblSortedBy')}</span> <strong>${item.getLabelText()}</strong>`
        );
    }
    //////////////////////////
    // #endregion RENDERING
    //////////////////////////
}
defineCustomElement('list-sort', ListSort);

export default ListSort;
