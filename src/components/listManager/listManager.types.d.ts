import { FieldOptionConfigType } from '@arpadroid/forms';
import type { ListConfigType } from '@arpadroid/lists';
import { NavLinkConfigType } from '@arpadroid/navigation';
import { Router } from '@arpadroid/services';
import { ListManagerItem } from 'src/exports';

export type ListManagerConfigType = ListConfigType & {
    actions?: FieldOptionConfigType[];
    viewOptions?: NavLinkConfigType[];
    router?: Router;
    sortByParam?: string;
    itemComponent?: typeof ListManagerItem;
    sortDefault?: string;
    sortDirParam?: string;
    sortOptions?: FieldOptionConfigType[];
};
