let pieceOrder = [];
let colors = [];
orderInformation = {};
currentOrder = {};

$(document).ready(() => {
  generateSupplyGrid();
  initArray();
  updateCostWeight();
  initButtons();
  $('#order').click(e => {
    openModal();
  });
  checkOrders();
});

// gets the pin from the url
function getPin() {
  return /(\d+)(?!.*\d)/g.exec(window.location.href)[0];
}

function initArray() {
  for (let i = 0; i < partProperties.length; i++)
  {
    pieceOrder[i] = 0;
    colors[i] = BrickColors.defaultBrickColor.colorID;
  }
}

function initButtons() {
  for (let i = 0; i < partProperties.length; i++) {
    let num = '#' + i;
    $(num + '-plus').click(e => {
      $('#error-message').addClass('hidden');
      $('#send-manufacturing-order').removeClass('disabled');

      let currentNum = parseInt($(num + '-value').html());
      $(num + '-value').html(currentNum < 10 ? ++currentNum : 10);
      pieceOrder[i] = currentNum;
      updateCostWeight();
    });
    $(num + '-minus').click(e => {
      let currentNum = parseInt($(num + '-value').html());
      $(num + '-value').html(currentNum == 0 ? 0 : --currentNum);
      pieceOrder[i] = currentNum;

      let partSum = 0;
      pieceOrder.forEach((elem) => {
        partSum += elem;
      });
      if(partSum <= 0)
      {
        $('#error-message').removeClass('hidden');
        $('#send-manufacturing-order').addClass('disabled');
      }
      updateCostWeight();
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
        }
      });
    })(i);

    $('.' + i + '-picker-container').addClass('picker-container').data('part-number', i);
  }

/*  $('.sp-palette-row .sp-thumb-el').on('click.spectrum touchstart.spectrum', function(event) {
    let partNum = parseInt($(this).closest('.picker-container').data('part-number'));
    colors[partNum] = BrickColors.allPaletteData[$(this).closest('.sp-palette-row').index()][$(this).index()].colorID;
  });*/

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

  $('#send-supplier-order').click(e => {
    sendPiecesOrder();
  });
}

/**
 * Function that runs constantly to update the orders
 */
function checkOrders() {
  $.ajax({
    type: 'GET',
    url: GameAPI.rootURL + '/gameLogic/getOrders/' + getPin(),
    cache: false,
    timeout: 5000,
    success: (data) => {
      orderInformation = data.filter((elem) => {
        return elem.stage === "Manufacturer";
      });
      // Need to find the oldest order that hasn't been finished or canceled
      let i = 0;
      if (orderInformation.length != 0) {
        while(orderInformation[i].status != 'In Progress') {
          i++;
          if (i >= orderInformation.length) break;
        } 
        currentOrder = orderInformation[i] === undefined ? orderInformation[0] : orderInformation[i];
      }
      updateOrder();
    },
    error: (xhr, status, error) => {
      console.log('Error: ' + error);
    }
  });

  setTimeout(checkOrders, 3000);
}

function sendPiecesOrder() {
  let orderData = [];

  partProperties.forEach((value, index) => {
    if(pieceOrder[index] > 0) {
      orderData.push({
        name: value.name,
        color: colors[index],
        count: pieceOrder[index],
      });
    }
  });

  let postData = {'request': orderData};
  $.ajax({
    type: 'POST',
    data: postData,
    url: GameAPI.rootURL + '/gameLogic/addSupplyOrder/' + getPin(),
    dataType: 'json',
    success: (data) => {
      initArray();
      generateSupplyGrid();
      updateCostWeight();
      initButtons();
    },
    error: (xhr, status, error) => {
      console.log(error);
    }
  });
}

/**
 * Because including other functions in es5 is shit,
 * I moved 3 functions to supplyGrid since the supplier.js also requires the same functions
 * I ended up needing to change the function for the supplier.js lol 
 * i still stand by my point that es5 sucks
 */

function openModal() {
  if (jQuery.isEmptyObject(orderInformation)) {
    $('#no-orders').modal('show');
  }
  else {
    $('#ready-order').modal('show');
  }
}

function updateOrder() {
  if(currentOrder.isCustomOrder)
  {
    $('#order-image').attr('src', `${GameAPI.rootURL}/gameLogic/getCustomOrderImage/${getPin()}/${currentOrder._id}`);
  }
  else
  {
    $('#order-image').attr('src', `/../images/Option ${currentOrder.modelID}.PNG`);
  }

  let orderNode = $('#order-info').empty();

  orderNode.append('<p>Date Ordered: ' + new Date(currentOrder.createDate).toString() + '</p>')
      .append('<p>Last Modified: ' + new Date(currentOrder.lastModified).toString() + '</p>');

  if (currentOrder.status === 'Completed') {
    orderNode.append('<p>Finished: ' + new Date(currentOrder.finishedTime).toString() + '</p>');
    $('#view-model').removeClass('disabled');
  } else {
    $('#view-model').addClass('disabled');
  }

  if(!(currentOrder.isCustomOrder)) {
    orderNode.append('<p>Model ID: ' + currentOrder.modelID + '</p>');
  }

  orderNode.append('<p>Stage: ' + currentOrder.stage + '</p>')
      .append('<p>Status: ' + currentOrder.status + '</p>');

  if(currentOrder.isCustomOrder)
  {
    orderNode.append('<span>Description:</span>')
        .append($('<p></p>').text(currentOrder.orderDesc));
  }

  orderNode.append('<br>');
}

function updateCostWeight()
{
  $('#total-cost-text').text(`$${totalPartCost(pieceOrder).toFixed(2)}`);
  $('#total-weight-text').text(totalPartWeight(pieceOrder).toFixed(2));
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
      if (i * 4 + j < partProperties.length) {
        html += '<div class="four wide column">';
        html += `<p align="left">${partProperties[partNumber].name}</p>`;
        html += `<p align="left">$${partProperties[partNumber].price.toFixed(2)} each</p>`;
        html += `<p align="left">${partProperties[partNumber].weight.toFixed(2)} grams</p>`;
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
