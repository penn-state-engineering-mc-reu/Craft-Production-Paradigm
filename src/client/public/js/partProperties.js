(() => {
  window.partProperties = {
    STATIONS: {
      BODY_STATION: {
        order: 0,
        internalName: 'body',
        dispName: 'Body Station'
      },
      WHEEL_AXLE_STATION: {
        order: 1,
        internalName: 'wheel-axle',
        dispName: 'Wheel and Axle Station'
      },
      INTERIOR_STATION: {
        order: 2,
        internalName: 'interior',
        dispName: 'Interior Station'
      },
    }
  };

  let stationList = window.partProperties.STATIONS;

  window.partProperties.PARTS = {
    0: {
      name: '1x1',
      price: 0.07,
      weight: 0.45,
      stations: [stationList.BODY_STATION, stationList.INTERIOR_STATION]
    },
    1: {
      name: '1x3',
      price: 0.05,
      weight: 0.59,
      stations: [stationList.BODY_STATION, stationList.INTERIOR_STATION]
    },
    2: {
      name: '2x2',
      price: 0.14,
      weight: 1.15,
      stations: [stationList.BODY_STATION, stationList.INTERIOR_STATION]
    },
    3: {
      name: '2x2 Slope',
      price: 0.14,
      weight: 1.05,
      stations: [stationList.BODY_STATION]
    },
    4: {
      name: '2x2 Pin',
      price: 0.15,
      weight: 0.70,
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    5: {
      name: '2x3x2',
      price: 0.13, // temporary
      weight: 1.06, // temporary
      stations: [stationList.BODY_STATION]
    },
    6: {
      name: '1x2 Pin',
      price: 0.05,
      weight: 0.83, // temporary
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    7: {
      name: '1x2 Slope',
      price: 0.11,
      weight: 0.65,
      stations: [stationList.BODY_STATION]
    },
    8: {
      name: '1x2 Inverted Slope',
      price: 0.11,
      weight: 0.70,
      stations: [stationList.BODY_STATION]
    },
    9: {
      name: '2x2x1 Pin',
      price: 0.18,
      weight: 0.95,
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    10: {
      name: '2x2x2 Pin',
      price: 0.17,
      weight: 1.31, // temporary
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    11: {
      name: '2x2 Double',
      price: 0.29,
      weight: 1.4,
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    12: {
      name: 'Tire 1',
      price: 0.29,
      weight: 1.3,
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    13: {
      name: 'Tire 2',
      price: 0.15,
      weight: 0.65,
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    14: {
      name: 'Tire 3',
      price: 0.61,
      weight: 5.45,
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    15: {
      name: 'Rim 1',
      price: 0.25,
      weight: 0.7,
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    16: {
      name: 'Rim 2',
      price: 0.20,
      weight: 0.25,
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    17: {
      name: 'Rim 3',
      price: 0.30,
      weight: 1.55,
      stations: [stationList.WHEEL_AXLE_STATION]
    },
    18: {
      name: '1x2',
      price: 0.11,
      weight: 0.8,
      stations: [stationList.BODY_STATION, stationList.INTERIOR_STATION]
    },
    19: {
      name: '1x4',
      price: 0.15,
      weight: 1.5,
      stations: [stationList.BODY_STATION, stationList.INTERIOR_STATION]
    },
    20: {
      name: '1x2 Plate',
      price: 0.11,
      weight: 0.32, // temporary
      stations: [stationList.BODY_STATION]
    },
    21: {
      name: '2x2 Plate',
      price: 0.11,
      weight: 0.60,
      stations: [stationList.BODY_STATION]
    },
    22: {
      name: '4x6 Plate',
      price: 0.43,
      weight: 3.35,
      stations: [stationList.BODY_STATION]
    },
    23: {
      name: '4x10 Plate',
      price: 0.54,
      weight: 5.40,
      stations: [stationList.BODY_STATION]
    },
    24: {
      name: '2x8 Plate',
      price: 0.25,
      weight: 2.25,
      stations: [stationList.BODY_STATION]
    },
    25: {
      name: '2x6 Plate',
      price: 0.19,
      weight: 1.70,
      stations: [stationList.BODY_STATION]
    },
    26: {
      name: '6x8 Plate',
      price: 0.67,
      weight: 6.63, // temporary
      stations: [stationList.BODY_STATION]
    },
    27: {
      name: '2x10 Plate',
      price: 0.25,
      weight: 2.8,
      stations: [stationList.BODY_STATION]
    },
    28: {
      name: 'Windshield',
      price: 0.38,
      weight: 2.5,
      stations: [stationList.BODY_STATION]
    },
    29: {
      name: 'Steering Wheel',
      price: 0.29,
      weight: 0.6,
      stations: [stationList.INTERIOR_STATION]
    },
    30: {
      name: 'Lego Man',
      price: 1.00,
      weight: 3.47, // temporary
      stations: [stationList.INTERIOR_STATION]
    }
  };

  partProperties.totalPartCost = function(qtyObj)
  {
    let totalCost = 0;
    Object.keys(qtyObj).forEach((partID) => {
      totalCost += (qtyObj[partID] * window.partProperties.PARTS[partID].price);
    });

    return totalCost;
  };

  partProperties.totalPartWeight = function(qtyObj)
  {
    let totalWeight = 0;
    Object.keys(qtyObj).forEach((partID) => {
      totalWeight += (qtyObj[partID] * window.partProperties.PARTS[partID].weight);
    });

    return totalWeight;
  };
})();
