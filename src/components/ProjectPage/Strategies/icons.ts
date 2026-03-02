import {
	build_wrench,
	flower,
	pizza,
	snow,
	gas,
	dollar,
	flash_on,
	puzzle,
	gavel,
	turbine,
	language,
	launch,
} from '@equinor/eds-icons';

export const strategyIcons = {
	build_wrench: build_wrench,
	flower: flower,
	pizza: pizza,
	snow: snow,
	gas: gas,
	dollar: dollar,
	flash: flash_on,
	puzzle: puzzle,
	gavel: gavel,
	turbine: turbine,
	language: language,
	launch: launch,
} as const;

export const strategyIconKeys = Object.keys(strategyIcons) as (keyof typeof strategyIcons)[];
