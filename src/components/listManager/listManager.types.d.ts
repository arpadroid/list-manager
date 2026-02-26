import type { ListConfigType } from '@arpadroid/lists';
import { NavLinkConfigType } from '@arpadroid/navigation';

export type ListManagerConfigType = ListConfigType & {
    viewOptions?: NavLinkConfigType[];
    views?: string[];
};
