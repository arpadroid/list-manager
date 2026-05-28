import { FieldOptionConfigType } from '@arpadroid/forms';
import type { ListConfigType } from '@arpadroid/lists';
import { NavLinkConfigType } from '@arpadroid/navigation';
import { Router } from '@arpadroid/services';
import ListManagerItem from '../listManagerItem/listManagerItem.js';

export type ListManagerConfigType = ListConfigType & {
    actions?: FieldOptionConfigType[];
    hasMiniSearch?: boolean;
    hasSelection?: boolean;
    itemComponent?: typeof ListManagerItem;
    router?: Router;
    sortByParam?: string;
    sortDefault?: string;
    sortDirParam?: string;
    sortOptions?: FieldOptionConfigType[];
    url?: string;
    viewOptions?: NavLinkConfigType[];
};
