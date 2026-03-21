export type UnitType = 'Weight' | 'Liquid' | 'Count' | 'Energy' | 'Storage';

export interface Unit {
    type: UnitType,
    unit: string
}

export const units: Unit[] = [
    {type: 'Weight', unit: 'Milligram'},
    {type: 'Weight', unit: 'Gram'},
    {type: 'Weight', unit: 'Kilogram'},
    {type: 'Weight', unit: 'Ton'},
    {type: 'Liquid', unit: 'Milliliter'},
    {type: 'Liquid', unit: 'Deciliter'},
    {type: 'Liquid', unit: 'Liter'},
    {type: 'Count', unit: 'Piece'},
    {type: 'Count', unit: 'Unit'},
    {type: 'Count', unit: 'Case'},
    {type: 'Count', unit: 'Box'},
    {type: 'Count', unit: 'Pack'},
    {type: 'Energy', unit: 'Watt'},
    {type: 'Energy', unit: 'kWh'},
    {type: 'Storage', unit: 'Bit'},
    {type: 'Storage', unit: 'Kilobit'},
    {type: 'Storage', unit: 'Megabit'},
    {type: 'Storage', unit: 'Gigabit'},
    {type: 'Storage', unit: 'Terabit'},
    {type: 'Storage', unit: 'Byte'},
    {type: 'Storage', unit: 'Kilobyte'},
    {type: 'Storage', unit: 'Megabyte'},
    {type: 'Storage', unit: 'Gigabyte'},
    {type: 'Storage', unit: 'Terabyte'}
];