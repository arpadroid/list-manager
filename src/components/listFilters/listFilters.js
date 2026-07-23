/**
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/forms').Field} Field
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@arpadroid/forms').NumberField} NumberField
 * @typedef {import('../listManager/listManager.js').default} ListManager
 * @typedef {import('@arpadroid/services').Router} Router
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('./listFilters.types').ListFiltersConfigType} ListFiltersConfigType
 * @typedef {import('./listFilters.types').ListFiltersSubmitPayloadType} ListFiltersSubmitPayloadType
 * @typedef {import('@arpadroid/forms').FormSubmitType} FormSubmitType
 */
import { mergeObjects, attrString, $map, editURL, defineCustomElement } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';

const html = String.raw;
class ListFilters extends ArpaElement {
    /** @type {ListFiltersConfigType} */
    _config = this._config;

    getDefaultConfig() {
        this.bind('onSubmit');
        /** @type {ListFiltersConfigType} */
        const conf = {
            className: 'listFilters',
            icon: 'filter_alt',
            perPageOptions: [5, 10, 25, 50, 100, 200],
            btnLabel: 'Filters'
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    $initializeProperties() {
        super.$initializeProperties();
        /** @type {ListManager | null} */
        this.list = this.closest('.arpaList, .gallery');
        /** @type {Router} */
        this.router = this.list?.getRouter();
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this.listResource?.on('payload', () => this._hasRendered && this.update());
        /** @type {ListFilter} */
        this.pageFilter = this.listResource?.pageFilter;
        /** @type {ListFilter} */
        this.perPageFilter = this.listResource?.perPageFilter;
        return true;
    }

    getPerPageOptions() {
        return this.list?.getProp('perPageOptions') || this.getProp('perPageOptions');
    }

    getLabel() {
        return this.getProp('btnLabel') || this.getProp('label') || 'Filters';
    }

    getPage() {
        return this.pageFilter?.getValue() || this.getProp('page') || 1;
    }

    getSelectedPerPage() {
        return this.perPageFilter?.getValue() || this.getProp('perPage') || 5;
    }

    $renderTemplate() {
        return html`<icon-menu
            icon="{icon}"
            tooltip="{getLabel()}"
            button-aria="{getLabel()}"
            nav-class="listFilters__nav"
        >
            <arpa-zone name="nav">
                <div class="listFilters__content">
                    <arpa-node
                        name="form"
                        tag="arpa-form"
                        variant="compact"
                        id="${this.list?.getId()}-filters-form"
                        has-submit="false"
                        class="listFilters__form"
                    >
                        <group-field
                            class="listFilters__pagination"
                            icon="auto_stories"
                            id="pagination-filters"
                            label="Pagination"
                            open
                        >
                            <select-combo id="perPage" label="Per page" value="{getSelectedPerPage()}" variant="small">
                                ${$map(
                                    this.getPerPageOptions(),
                                    value => html`<select-option label="${value}" value="${value}"></select-option>`
                                )}
                            </select-combo>
                            <number-field
                                icon=""
                                id="page"
                                label="Page"
                                ${attrString({ min: 1, max: this.listResource?.getTotalPages() })}
                                value="${this.pageFilter?.getValue() || ''}"
                                variant="small"
                            ></number-field>
                        </group-field>
                    </arpa-node>
                </div>
            </arpa-zone>
        </icon-menu>`;
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        await this._initializeIconMenu();
        this._initializeForm();
        return true;
    }

    async _initializeIconMenu() {
        /** @type {IconMenu | null} */
        this.menuNode = this.querySelector('icon-menu');
        await this.menuNode?.promise;
        await this.menuNode?.navigation?.promise;
        this.comboNode = this.menuNode?.navigation?.itemsNode;
        this.comboNode?.setAttribute('zone', 'list-filters');
        return true;
    }

    async _initializeForm() {
        await customElements.whenDefined('arpa-form');
        this.form = /** @type {FormComponent | undefined} */ (this?.comboNode?.querySelector('arpa-form'));
        await this.form?.promise;
        this.form?.onSubmit(this.onSubmit);
        this.pageField = /** @type {NumberField} */ (this.form?.getField('page'));
        this.perPageField = /** @type {SelectCombo} */ (this.form?.getField('perPage'));
        this.perPageField?.on(
            'change',
            (/** @type {unknown} */ value, /** @type {Field} */ field, /** @type {Event} */ event) =>
                this.form?.submitForm(event)
        );
    }

    /**
     * Updates the list filters.
     * @param {ListResource} [listResource]
     */
    async update(listResource = this.listResource) {
        await this.promise;
        this.pageField?.setValue(listResource?.getPage());
        this.pageField?.setMax(listResource?.getTotalPages() || 1);
        const perPage = listResource?.getPerPage();
        perPage && this.perPageField?.setValue(perPage?.toString());
    }

    /**
     * Called when the form is submitted.
     * @param {Record<string, any>} payload
     * @returns {boolean}
     */
    onSubmit(payload = {}) {
        if (payload.perPage != this.perPageFilter?.getValue()) {
            payload.page = 1;
            this.pageField?.setValue(1);
        }
        if (this.router) {
            const newURL = editURL(window.location.href, {
                [this.list?.getParamName('page') || 'page']: payload.page,
                [this.list?.getParamName('perPage') || 'perPage']: payload.perPage
            });
            this.router?.go(newURL);
        }
        return false;
    }

    // #endregion
}

defineCustomElement('list-filters', ListFilters);

export default ListFilters;
