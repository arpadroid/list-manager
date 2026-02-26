import { NavLinkConfigType } from '@arpadroid/navigation';
import { ListItemConfigType } from '@arpadroid/lists';
import ListManagerItem from './listManagerItem.js';

export type ListManagerItemConfigType = ListItemConfigType & {
    nav?: NavLinkConfigType;
};

export type ListItemViewConfigType = {
    id: string;
    label?: string;
    icon?: string;
    template?: string;
    show?: boolean;
    className?: string;
    onSelect?: (event: Event, item: ListManagerItem) => void;
};
