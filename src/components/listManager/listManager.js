/**
 * @typedef {import('./listManager.types.js').ListManagerConfigType} ListManagerConfigType
 */


import { defineCustomElement } from '@arpadroid/tools';


const html = String.raw;

class ListManager extends List {

}

defineCustomElement('list-manager', ListManager);

export default ListManager;
