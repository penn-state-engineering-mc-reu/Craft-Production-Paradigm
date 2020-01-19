let pieceOrders = [];
let manufacturingPieces = [];
let orderInformation = {};
let currentOrder = {};
let colors = [];

$(document).ready(() => {
  $('#game-info-container').gameInfo({ positionName: 'Supplier' });
  generateSupplyGrid();
  initArray();
  initButtons();
  $('#order').click(e => openModal());
  $('#request').click(e => openManufacturingModal());
  checkOrders();
});

// gets the pin from the url
function getPin() {
  return /(\d+)(?!.*\d)/g.exec(window.location.href)[0];
}

function initArray() {
  for (let i = 0; i < partProperties.length; i++) {
    pieceOrders[i] = 0; 
    colors[i] = BrickColors.defaultBrickColor.colorID;
  }
}

function initButtons() {
  initGridButtons();
  $('#left').click(e => {
    let index = orderInformation.indexOf(currentOrder);
    currentOrder = --index < 0 ? orderInformation[orderInformation.length - 1] : orderInformation[index];
    updateOrder();
  });

  $('#right').click(e => {
    let index = orderInformation.indexOf(currentOrder);
    currentOrder = ++index == orderInformation.length ? orderInformation[0] : orderInformation[index];
    updateOrder();
  });

  $('#send-supply-order').click(e => {
    if (checkSupplyMatchesManufacturer()) {
      $('#error-message').addClass('hidden');
      sendSupplyOrder();
    }
    else {
      $('#error-message').removeClass('hidden');
    }
  });
}

/**
 * Refreshes the buttons when the supply grid gets regenerated
 */
function initGridButtons() {
  for (let i = 0; i < partProperties.length; i++) {
    let num = '#' + i;
    $(num + '-plus').click(e => {
      let currentNum = parseInt($(num + '-value').html());
      $(num + '-value').html(currentNum < 10 ? ++currentNum : 10);
      pieceOrders[i] = currentNum;
    });
    $(num + '-minus').click(e => {
      let currentNum = parseInt($(num + '-value').html());
      $(num + '-value').html(currentNum == 0 ? 0 : --currentNum);
      pieceOrders[i] = currentNum;
    });

    (function(index) {
      $('.' + index + '-picker').spectrum({
        showPalette: true,
        showPaletteOnly: true,
        showAlpha: true,
        containerClassName: index + '-picker-container',
        palette: BrickColors.spectrumPalette,
        color: BrickColors.defaultBrickColor.RGBString,
        change: function (color) {
          let activeElement = $('.' + index + '-picker-container').find('.sp-thumb-el.sp-thumb-active');
          colors[index] = BrickColors.allPaletteData[$(activeElement).closest('.sp-palette-row').index()][$(activeElement).index()].colorID;
        },
        show: function (color) {
          let paletteBoxes = $('.' + index + '-picker-container').find('.sp-thumb-el');
          paletteBoxes.each(function(index, element) {
            let colorInfo = BrickColors.allPaletteData[$(element).closest('.sp-palette-row').index()][$(element).index()];
            $(element).attr('title', `${colorInfo.colorName} (${colorInfo.colorID})`);
          });
        }
      });
    })(i);

  }
}

// the supply order needs to match (it can have more pieces) the manufacturer order
function checkSupplyMatchesManufacturer() {
  for (let i = 0; i < currentOrder.manufacturerReq.length; i++) {
    if (pieceOrders[currentOrder.manufacturerReq[i].partID] < currentOrder.manufacturerReq[i].count) return false;
  }
  return true;
}

function sendSupplyOrder() {
  let orderData = [];

  partProperties.forEach((value, index) => {
    if(pieceOrders[index] > 0) {
      orderData.push({
        partID: index,
        color: colors[index],
        count: pieceOrders[index],
      });
    }
  });

  GameAPI.sendSupplyOrder(currentOrder._id, orderData).then((data) => {
    console.log('Order sent!');
    $('#ready-order').modal('toggle');
    initArray();
    $('.value').text('0');
    for(let index = 0; index < partProperties.length; index++)
    {
      $('.' + index + '-picker').spectrum('set', BrickColors.defaultBrickColor.RGBString);
    }
  }).catch((xhr, status, error) => {
    console.log(error);
  });
}

/**
 * Function that runs constantly to update the orders
 */
function checkOrders() {
  GameAPI.getSupplyOrders().then((data) => {
    orderInformation = filterOrders(data);
    updateCurrentOrderInfo();
    updateOrder();
  }).catch((xhr, status, error) => {
    console.log('Error: ' + error);
  });

  // checkRequestedPieces();
  setTimeout(checkOrders, 3000);
}

function filterOrders(orders) {
  return (orders.filter((elem) => {
    return (elem.status === "In Progress");
  }));
}

function updateCurrentOrderInfo()
{
  if(orderInformation.length === 0)
  {
    currentOrder = null;
  }
  else {
    if (currentOrder != null && !(jQuery.isEmptyObject(currentOrder))) {
      let findObj = orderInformation.find((elem) => {
        return elem._id === currentOrder._id;
      });

      currentOrder = (findObj ? findObj : orderInformation[0]);
    } else {
      currentOrder = orderInformation[0];
    }
  }
}

/**
 * Because including other functions in es5 is shit,
 * I moved 3 functions to supplyGrid since the manufacturer.js also requires the same functions
 * I ended up needing to change the function for the supplier.js lol 
 * i still stand by my point that es5 sucks
 */

function openManufacturingModal() {
  if (manufacturingPieces.length == 0) 
    $('#no-request').modal('toggle');
  else 
    $('#ready-request').modal('toggle');
}

/*function checkRequestedPieces() {
  $.ajax({
  type: 'GET',
  url: GameAPI.rootURL + '/gameLogic/getManufacturerRequest/' + getPin() + '/' + currentOrder._id,
  success: (data) => {
    if (data.length != 0) {
      manufacturingPieces = data;
      populateRequestData(manufacturingPieces);
    }
  },
  error: (xhr, status, error) => {
    console.log(error);
  }
  });
}

function populateRequestData(data) {
  let html = "";
  data.forEach((elem, i) => {
    if (elem != 0) {
      html += '<div class="item">' + elem + ' - ' + names[i] + '</div>';
    }
  });
  $('#requested-pieces').html(html);
}*/

 function openModal() {
  if (jQuery.isEmptyObject(orderInformation)) {
    $('#no-orders').modal('show');
  }
  else {
    $('#ready-order').modal('show');
  }
}

function updateOrder() {
  let orderNode = $('#order-info').empty();

  orderNode.append($('<p></p>').text('Ordered by: ' + (currentOrder.createdBy ? currentOrder.createdBy : '<Anonymous Player>')))
      .append('<p>Date Ordered: ' + new Date(currentOrder.createDate).toString() + '</p>')
      .append('<p>Last Modified: ' + new Date(currentOrder.lastModified).toString() + '</p>')
      .append('<p>Status: ' + currentOrder.status + '</p>')
      .append('<p>Requested Parts:</p>');

  currentOrder.manufacturerReq.forEach(value => {
    orderNode.append(`<p>${value.count} ${partProperties[value.partID].name} (${BrickColors.findByColorID(value.color).colorName} (${value.color}))</p>`);
  });

  orderNode.append('<br>');
}

/**
 * Dynamically generate all the squares to add to a supply order
 * This would have been terrible to do by hand
 */
function generateSupplyGrid() {
  let html = "";
  for (let i = 0; i < partProperties.length / 4; i++) {
    html += '<div class="row">';
    for (let j = 0; j < 4; j++) {
      let partNumber = i * 4 + j;
      if (partNumber < partProperties.length) {
        html += '<div class="four wide column">';
        html += `<p align="left">${partProperties[partNumber].name}</p>`;
        html += `<p> <img class = "piece" src= "/../images/Lego pieces/${partProperties[partNumber].name}.jpg"> </p>`;
        // Start off each piece with an order of 0
        html += `<div class="row"><div class="ui statistic"><div id="${partNumber}-value" class="value">0</div></div></div>`;
        html += `<div class="row picker"><input type="text" class="${partNumber}-picker" value="${BrickColors.defaultBrickColor.RGBString}"/></div>`;
        // Adds the plus and minus buttons to each piece
        html += '<div class="row"><div class="ui icon buttons">' +
            `<button id="${partNumber}-minus" class="ui button"><i class="minus icon"></i></button>` +
            `<button id="${partNumber}-plus" class="ui button"><i class="plus icon"></i></button></div></div></div>`;
      }
    }
    // I want there to be vertical lines between each cube so I need to add a blank space 
    if (i + 1 >= partProperties.length / 4) html += '<div class="five wide column"></div>';
    html += '</div>';
  }

  $('#supply-grid').html(html);
}
