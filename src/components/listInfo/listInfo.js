/**
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 * @typedef {import('./listInfo.types').ListInfoConfigType} ListInfoConfigType
 */
import { ArpaElement } from '@arpadroid/ui';
import ListManager from '../listManager/listManager.js';
import { mergeObjects, defineCustomElement } from '@arpadroid/tools';
const html = String.raw;
class ListInfo extends ArpaElement {
    /** @type {ListInfoConfigType} */
    _config = this._config;

    /**
     * Default component config.
     * @returns {ListInfoConfigType}
     */
    getDefaultConfig() {
        this.i18nKey = 'list-manager';
        /** @type {ListInfoConfigType} */
        const conf = {
            className: 'listInfo',
            hasPrevNext: true,
            hasRefresh: true
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    async $initializeProperties() {
        await super.$initializeProperties();
        /** @type {ListManager | null} */
        this.list = ListManager.getList(this);
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this.listResource?.on('items', () => this.reRender());
        /** @type {ListFilter} */
        this.searchFilter = this.listResource?.getSearchFilter();
        return true;
    }

    hasPrevNext() {
        if (!this.getProp('has-prev-next')) return false;
        if ((this.listResource?.getTotalPages() || 0) <= 1) return false;
        return true;
    }

    getQuery() {
        return String(this.searchFilter?.getValue() || '');
    }

    hasSearchResults() {
        return this.listResource?.hasResults() || false;
    }

    canRenderAllResultsText() {
        const { showResultsText } = this.list?.getConfig() ?? {};
        const range = this.listResource?.getItemRange() ?? [];
        return !this.getQuery() && showResultsText && range[0] && range[1];
    }

    async $preRender() {
        await this.list?.promise;
        return true;
    }

    $renderTemplate() {
        const resultTotal = this.listResource?.getTotalItems();
        const [firstItem, lastItem] = this.listResource?.getItemRange() ?? [];
        return html`
            <arpa-node
                name="noResultsText"
                tag="i18n-text"
                key="${this.i18nKey}.txtNoResults"
                class="listInfo__text"
                can-render="getQuery() && !hasSearchResults()"
            >
                <i18n-replace name="result"><strong>{getQuery()}</strong></i18n-replace>
            </arpa-node>

            <arpa-node
                name="resultsText"
                tag="i18n-text"
                key="${this.i18nKey}.txtSearchResults"
                class="listInfo__text"
                can-render="getQuery() && hasSearchResults()"
            >
                <i18n-replace name="resultCount"><strong>${resultTotal}</strong></i18n-replace>
                <i18n-replace name="result"><strong>{getQuery()}</strong></i18n-replace>
            </arpa-node>

            <arpa-node
                name="allResultsText"
                tag="i18n-text"
                key="${this.i18nKey}.txtAllResults"
                class="listInfo__text"
                can-render="canRenderAllResultsText()"
            >
                <i18n-replace name="resultCount"><strong>${resultTotal}</strong></i18n-replace>
                <i18n-replace name="pageCount"><strong>${firstItem} - ${lastItem}</strong></i18n-replace>
            </arpa-node>

            <div class="listInfo__buttons">
                <arpa-node
                    name="refreshButton"
                    tag="icon-button"
                    class="listInfo__refresh"
                    icon="refresh"
                    can-render="hasRefresh"
                    on-click="{handleRefresh}"
                >
                    <arpa-zone name="tooltip">${this.i18n('txtRefresh')}</arpa-zone>
                </arpa-node>

                <arpa-node
                    name="previousButton"
                    tag="icon-button"
                    class="listInfo__previous"
                    icon="skip_previous"
                    can-render="hasPrevNext()"
                    on-click="{handlePreviousPage}"
                >
                    <arpa-zone name="tooltip">${this.i18n('txtPrevPage')}</arpa-zone>
                </arpa-node>

                <arpa-node
                    name="nextButton"
                    tag="icon-button"
                    class="listInfo__next"
                    icon="skip_next"
                    can-render="hasPrevNext()"
                    on-click="{handleNextPage}"
                >
                    <arpa-zone name="tooltip">${this.i18n('txtNextPage')}</arpa-zone>
                </arpa-node>
            </div>
        `;
    }

    handlePreviousPage = () => this.listResource?.previousPage();

    handleNextPage = () => this.listResource?.nextPage();

    handleRefresh = () => this.listResource?.refresh();
}

defineCustomElement('list-info', ListInfo);

export default ListInfo;
