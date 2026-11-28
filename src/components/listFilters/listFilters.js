/**
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
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
 * @typedef {import('@arpadroid/navigation').NavList} NavList
 */
import { mergeObjects, $map, editURL, defineCustomElement } from '@arpadroid/tools';
import { ArpaElement, getArpaElementMatch } from '@arpadroid/ui';

const html = String.raw;
class ListFilters extends ArpaElement {
    /** @type {ListFiltersConfigType} */
    _config = this._config;

    getDefaultConfig() {
        /** @type {ListFiltersConfigType} */
        const conf = {
            className: 'listFilters',
            icon: 'filter_alt',
            perPageOptions: [5, 10, 25, 50, 100, 200],
            btnLabel: 'Filters'
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    async $initializeProperties() {
        await super.$initializeProperties();

        this.list = /** @type {ListManager | null} */ (
            getArpaElementMatch(this, el => el.classList.contains('arpaList') || el.classList.contains('gallery'))
        );
        this.router = this.list?.getRouter();
        this.listResource = this.list?.listResource;
        this.listResource?.on('payload', () => this._hasRendered && this.update());
        this.pageFilter = this.listResource?.pageFilter;
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
            tooltip-position="bottom-right"
            menu-position="bottom-right"
            button-aria="{getLabel()}"
            nav-class="listFilters__nav"
        >
            <arpa-zone name="nav">
                <div class="listFilters__content">
                    <arpa-node
                        tag="arpa-form"
                        name="form"
                        variant="compact"
                        id="${this.list?.getProp('id')}-filters-form"
                        has-submit="false"
                        class="listFilters__form"
                        $on-submit="{onSubmit}"
                    >
                        <group-field
                            class="listFilters__pagination"
                            icon="auto_stories"
                            id="pagination-filters"
                            label="Pagination"
                            open
                        >
                            <select-combo
                                id="perPage"
                                label="Per page"
                                value="{getSelectedPerPage()}"
                                variant="small"
                                $on-change="{onPerPageChange}"
                            >
                                ${$map(
                                    this.getPerPageOptions(),
                                    value => html`<select-option label="${value}" value="${value}"></select-option>`
                                )}
                            </select-combo>
                            <number-field
                                icon=""
                                id="page"
                                label="Page"
                                min="1"
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
        this.menuNode = /** @type {IconMenu} */ (this.querySelector('icon-menu'));
        await this.menuNode?.onRendered();
        /** @type {NavList | null} */
        this.comboNode = this.menuNode?.navigation;
        this.comboNode?.setAttribute('zone', 'list-filters');
        this.form = /** @type {FormComponent | undefined} */ (
            this.comboNode?.querySelector('arpa-form') || this.comboNode?.nodes.form
        );
        this.pageField = /** @type {NumberField} */ (this.form?.getField('page'));
        return true;
    }

    /**
     * Handles per page change.
     * @param {string} value
     * @param {SelectCombo} field
     * @param {Event} event
     */
    onPerPageChange(value, field, event) {
        this.form?.submitForm(event);
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
        this.perPageField = /** @type {SelectCombo} */ (this.form?.getField('perPage'));

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
