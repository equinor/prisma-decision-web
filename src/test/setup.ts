import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// jsdom does not implement the native top-layer APIs used by EDS.
HTMLElement.prototype.showPopover = function () {
	this.style.display = 'block';
};
HTMLElement.prototype.hidePopover = function () {
	this.style.display = 'none';
};
HTMLDialogElement.prototype.showModal = function () {
	this.open = true;
};
HTMLDialogElement.prototype.close = function () {
	this.open = false;
	this.dispatchEvent(new Event('close'));
};
