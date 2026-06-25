import {
	flash_on,
	build_wrench,
	flower,
	pizza,
	snow,
	gas,
	dollar,
	puzzle,
	gavel,
	turbine,
	language,
	launch,
} from '@equinor/eds-icons';

export const strategyIcons = {
	flash: flash_on,
	build_wrench: build_wrench,
	flower: flower,
	pizza: pizza,
	snow: snow,
	gas: gas,
	dollar: dollar,
	puzzle: puzzle,
	gavel: gavel,
	turbine: turbine,
	language: language,
	launch: launch,
} as const;

export const strategyIconKeys = Object.keys(strategyIcons) as (keyof typeof strategyIcons)[];
