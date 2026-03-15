import type {Unit} from "$lib/server/db/interfaces";

export const units: Unit[] = [
    {unit: 'Milligram', type: 'Weight'},
    {unit: 'Gram', type: 'Weight'},
    {unit: 'Kilogram', type: 'Weight'},
    {unit: 'Ton', type: 'Weight'},
    {unit: 'Milliliter', type: 'Liquid'},
    {unit: 'Deciliter', type: 'Liquid'},
    {unit: 'Liter', type: 'Liquid'},
    {unit: 'Piece', type: 'Count'},
    {unit: 'Unit', type: 'Count'},
    {unit: 'Case', type: 'Count'},
    {unit: 'Box', type: 'Count'},
    {unit: 'Pack', type: 'Count'},
    {unit: 'Watt', type: 'Energy'},
    {unit: 'kWh', type: 'Energy'},
    {unit: 'Bit', type: 'Storage'},
    {unit: 'Kilobit', type: 'Storage'},
    {unit: 'Megabit', type: 'Storage'},
    {unit: 'Gigabit', type: 'Storage'},
    {unit: 'Terabit', type: 'Storage'},
    {unit: 'Byte', type: 'Storage'},
    {unit: 'Kilobyte', type: 'Storage'},
    {unit: 'Megabyte', type: 'Storage'},
    {unit: 'Gigabyte', type: 'Storage'},
    {unit: 'Terabyte', type: 'Storage'}
];