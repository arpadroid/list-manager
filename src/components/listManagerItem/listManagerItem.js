import { defineCustomElement } from '@arpadroid/tools';
import { ListItem } from '@arpadroid/lists';

const html = String.raw;
class ListManagerItem extends ListItem {}

defineCustomElement('list-manager-item', ListManagerItem);

export default ListManagerItem;
