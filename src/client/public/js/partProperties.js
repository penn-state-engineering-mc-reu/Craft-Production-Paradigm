window.partProperties = [
  {
    name: '1x1',
    price: 0.07,
    weight: 0.45
  },
  {
    name: '1x3',
    price: 0.05,
    weight: 0.59
  },
  {
    name: '2x2',
    price: 0.14,
    weight: 1.15
  },
  {
    name: '2x2 Slope',
    price: 0.12,
    weight: 1.15
  },
  {
    name: '2x2 Pin',
    price: 0.30, 
    weight: 1.05
  },
  {
    name: '2x3x2',
    price: 0.13, // temporary
    weight: 1.06 // temporary
  },
  {
    name: '1x2 Pin',
    price: 0.05,
    weight: 0.83 // temporary
  },
  {
    name: '1x2 Slope',
    price: 0.04,
    weight: 0.69
  },
  {
    name: '1x2 Inverted Slope',
    price: 0.04,
    weight: 0.66
  },
  {
    name: '2x2x1 Pin',
    price: 0.18,
    weight: 0.95
  },
  {
    name: '2x2x2 Pin',
    price: 0.17,
    weight: 1.31 // temporary
  },
  {
    name: '2x2 Double',
    price: 0.29,
    weight: 1.4
  },
  {
    name: 'Tire 1',
    price: 0.29,
    weight: 1.3
  },
  {
    name: 'Tire 2',
    price: 0.15,
    weight: 0.65
  },
  {
    name: 'Tire 3',
    price: 0.61,
    weight: 5.45
  },
  {
    name: 'Rim 1',
    price: 0.25,
    weight: 0.7
  },
  {
    name: 'Rim 2',
    price: 0.20,
    weight: 0.25
  },
  {
    name: 'Rim 3',
    price: 0.30,
    weight: 1.55
  },
  {
    name: '1x2',
    price: 0.11,
    weight: 0.8
  },
  {
    name: '1x4',
    price: 0.15,
    weight: 1.5
  },
  {
    name: '1x2 Plate',
    price: 0.11,
    weight: 0.32 // temporary
  },
  {
    name: '2x2 Plate',
    price: 0.18,
    weight: 0.64
  },
  {
    name: '4x6 Plate',
    price: 0.43,
    weight: 3.35
  },
  {
    name: '4x10 Plate',
    price: 0.35,
    weight: 5.55
  },
  {
    name: '2x8 Plate',
    price: 0.23,
    wieght: 2.27
  },
  {
    name: '2x6 Plate',
    price: 0.20,
    weight: 1.74
  },
  {
    name: '6x8 Plate',
    price: 0.67,
    weight: 6.63 // temporary
  },
  {
    name: '2x10 Plate',
    price: 0.25,
    weight: 2.8
  },
  {
    name: 'Windshield',
    price: 0.38,
    weight: 2.5
  },
  {
    name: 'Steering Wheel',
    price: 0.29,
    weight: 0.6
  },
  {
    name: 'Lego Man',
    price: 1.00,
    weight: 3.47 // temporary
  }
];

function totalPartCost(qtyArray)
{
  let totalCost = 0;
  qtyArray.forEach((elem, index) => {
    totalCost += (elem * window.partProperties[index].price);
  });

  return totalCost;
}

function totalPartWeight(qtyArray)
{
  let totalWeight = 0;
  qtyArray.forEach((elem, index) => {
    totalWeight += (elem * window.partProperties[index].weight);
  });

  return totalWeight;
}
