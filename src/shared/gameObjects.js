export let GameObjects = {
    GameTypes: {
        CraftProduction: {
            name: 'Craft Production',
            positions: {
                CUSTOMER: 'Customer', MANUFACTURER: 'Manufacturer', SUPPLIER: 'Supplier', ASSEMBLER: 'Assembler'
            }
        },
        MassProduction: {
            name: 'Mass Production',
            positions: {
                MANUFACTURER: 'Manufacturer', SUPPLIER: 'Supplier',
                ASSEMBLER_BODY: 'Assembler - Body', ASSEMBLER_WHEEL_AXLE: 'Assembler - Wheel and Axle',
                ASSEMBLER_INTERIOR: 'Assembler - Interior'
            }
        }
    }
};

// Slightly ugly hack for client-side use (client-side code is not organized into modules)
if(typeof(window) !== 'undefined')
{
    window.GameObjects = GameObjects;
}