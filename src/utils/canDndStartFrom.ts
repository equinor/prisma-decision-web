export function canDndStartFrom(target: EventTarget | null | undefined): boolean {
	if (!(target instanceof Element)) return true;
	let el: Element | null = target;
	while (el) {
		if (el.getAttribute && el.getAttribute('data-no-dnd')) {
			return false;
		}
		el = el.parentElement;
	}
	return true;
}
