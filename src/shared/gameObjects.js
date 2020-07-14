export let GameObjects = {
    GameTypes: {
        CraftProduction: {
            name: 'Craft Production',
            positions: {
                CUSTOMER: {
                    name: 'Customer',
                    getURL: pin => '/customer/' + pin
                },
                MANUFACTURER: {
                    name: 'Manufacturer',
                    getURL: pin => '/manufacturer/' + pin
                },
                SUPPLIER: {
                    name: 'Supplier',
                    getURL: pin => '/supplier/' + pin
                },
                ASSEMBLER: {
                    name: 'Assembler',
                    getURL: pin => '/builder/' + pin
                }
            },
            custOrderStages: {
                AT_CUSTOMER: {
                    name: 'Customer',
                    dispName: 'Customer'
                },
                AT_MANUFACTURER: {
                    name: 'Manufacturer',
                    dispName: 'Manufacturer'
                },
                AT_ASSEMBLER: {
                    name: 'Assembler',
                    dispName: 'Assembler'
                },
                INSPECTION: {
                    name: 'Inspection',
                    dispName: 'Inspection'
                },
                SENT_TO_CUSTOMER: {
                    name: 'Sent to Customer',
                    dispName: 'Customer'
                }
            }
        },
        MassProduction: {
            name: 'Mass Production',
            positions: {
                MANUFACTURER: {
                    name: 'Manufacturer',
                    getURL: pin => '/manufacturer/' + pin,
                    getCustOrderStage: () => GameObjects.GameTypes.MassProduction.custOrderStages.AT_MANUFACTURER
                },
                SUPPLIER: {
                    name: 'Supplier',
                    getURL: pin => '/supplier/' + pin
                },
                ASSEMBLER_BODY: {
                    name: 'Assembler - Body',
                    getURL: pin => '/builder/' + pin + '#body',
                    getCustOrderStage: () => GameObjects.GameTypes.MassProduction.custOrderStages.AT_ASSEMBLER_BODY
                },
                ASSEMBLER_WHEEL_AXLE: {
                    name: 'Assembler - Wheel and Axle',
                    getURL: pin => '/builder/' + pin + '#wheel-axle',
                    getCustOrderStage: () => GameObjects.GameTypes.MassProduction.custOrderStages.AT_ASSEMBLER_WHEEL_AXLE
                },
                ASSEMBLER_INTERIOR: {
                    name: 'Assembler - Interior',
                    getURL: pin => '/builder/' + pin + '#interior',
                    getCustOrderStage: () => GameObjects.GameTypes.MassProduction.custOrderStages.AT_ASSEMBLER_INTERIOR
                }
            },
            custOrderStages: {
                AT_MANUFACTURER: {
                    name: 'Manufacturer',
                    dispName: 'Manufacturer'
                },
                AT_ASSEMBLER_BODY: {
                    name: 'Assembler - Body',
                    dispName: 'Assembler (Body Station)'
                },
                AT_ASSEMBLER_WHEEL_AXLE: {
                    name: 'Assembler - Wheel and Axle',
                    dispName: 'Assembler (Wheel and Axle Station)'
                },
                AT_ASSEMBLER_INTERIOR: {
                    name: 'Assembler - Interior',
                    dispName: 'Assembler (Interior Station)'
                },
                SENT_TO_CUSTOMER: {
                    name: 'Sent to Customer',
                    dispName: 'Customer'
                }
            },
            getCustOrderModelDest(currentStageName)
            {
                let massStages = GameObjects.GameTypes.MassProduction.custOrderStages;
                let newStage;
                switch (currentStageName) {
                    case massStages.AT_ASSEMBLER_BODY.name:
                        newStage = massStages.AT_ASSEMBLER_WHEEL_AXLE;
                        break;
                    case massStages.AT_ASSEMBLER_WHEEL_AXLE.name:
                        newStage = massStages.AT_ASSEMBLER_INTERIOR;
                        break;
                    case massStages.AT_ASSEMBLER_INTERIOR.name:
                        newStage = massStages.SENT_TO_CUSTOMER;
                        break;
                    default:
                        throw 'Invalid order stage for updating assembled model.';
                }

                return newStage;
            }
        }
    }
};

// Slightly ugly hack for client-side use (client-side code is not organized into modules)
if(typeof(window) !== 'undefined')
{
    window.GameObjects = GameObjects;
}