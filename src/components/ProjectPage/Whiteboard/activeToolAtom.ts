import { atom } from 'jotai';

export const activeToolAtom = atom<
	'pan' | 'selection' | 'rectangle' | 'text' | 'arrow' | 'freehand'
>('pan');
