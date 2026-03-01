import { within } from 'storybook/test';
import { ListResource } from '@arpadroid/resources';
import ListManager from '../listManager';
import { ListManagerItem } from 'src/exports';

export type ListManagerPlaySetupResponseType = {
    listResource?: ListResource;
    listNode?: ListManager | null;
    listItem?: ListManagerItem | null;
    canvas?: ReturnType<typeof within>;
};

export type ListManagerPlaySetupPayloadType = {
    preRenderCallback: (payload: ListManagerPlaySetupResponseType) => void;
    initList?: boolean;
};
