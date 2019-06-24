let orderInformation = {};
let filteredOrderInformation = {};
let currentOrder = {};
let generated = false;

$(document).ready(() => {
  checkOrders();
  initImages();
  initButtons();
});

function initImages() {
  $('#1').click(e => {
    changeCarType(1);
    $('.ui.basic.modal').modal('show');
  });
  $('#2').click(e => {
    changeCarType(2);
    $('.ui.basic.modal').modal('show');
  });
  $('#3').click(e => {
    changeCarType(3);
    $('.ui.basic.modal').modal('show');
  });
  $('#4').click(e => {
    changeCarType(4);
    $('.ui.basic.modal').modal('show');
  });
}

function filterOrders(orderInfo, includeInProgress, includeInspection, includeSent)
{
  return orderInfo.filter((elem) => {
    return ((includeInProgress && elem.status === 'In Progress')
      || (includeInspection && elem.status === 'Completed' && elem.stage === 'Inspection')
      || (includeSent && elem.status === 'Completed' && elem.stage === 'Sent to Customer')
    );
  });
}

function updateFilteredOrdersFromPage()
{
  let filterOptionNodes = $('#filter-options').children('input');
  filteredOrderInformation = filterOrders(orderInformation,
    filterOptionNodes.filter('#in-progress')[0].checked,
    filterOptionNodes.filter('#ready-for-inspection')[0].checked,
    filterOptionNodes.filter('#sent-to-customer')[0].checked
  );
}

function initButtons() {
  $('#view-model').click((e) => {
    if (!$('#view-model').hasClass('disabled'))
      window.location.href = '/viewer/' + getPin() + '/' + currentOrder._id;
  });

  $('.ok.button').click((e) => {
    sendOrder();
  });

  $('#generate').click(e => {
    generated = true;
    sendOrder();
  });

  $('#order').click((e) => {
    $('#ready-order').modal('toggle');
  });

  $('#left').click(e => {
    let index = filteredOrderInformation.indexOf(currentOrder);
    currentOrder = --index < 0 ? filteredOrderInformation[filteredOrderInformation.length - 1] : filteredOrderInformation[index];
    updateOrderUI();
  });

  $('#right').click(e => {
    let index = filteredOrderInformation.indexOf(currentOrder);
    currentOrder = ++index == filteredOrderInformation.length ? filteredOrderInformation[0] : filteredOrderInformation[index];
    updateOrderUI();
  });

  $('#filter-options').children('input').change(() => {
    updateFilteredOrdersFromPage();
    updateCurrentOrderInfo();
    updateOrderUI();
  });
}

// gets the pin from the url
function getPin() {
  return /(\d+)(?!.*\d)/g.exec(window.location.href)[0];
}

function changeCarType(number) {
  let dom = $('#car-type').html(number.toString());
}

function sendOrder() {
  let pin = getPin();
  let type = $('#car-type').html();
  let postData = {};
  if (generated) {
    let max = $('#num-orders').val();
    max = max > 10 ? 10 : max < 1 ? 1 : max;
    let skew = $('#skew').val();
    postData = {"pin": pin, "model": type, "generated": generated, "max": max, "skew": skew}
  }
  else postData = {"pin": pin, "model": type, "generated": generated};
  $.ajax({
    type: 'POST',
    data: postData,
    timeout: 5000,
    url: GameAPI.rootURL + '/gameLogic/sendOrder',
    success: function(result) {
      //window.location.href = '/startGame/' + result.pin;
      if ($('#order').hasClass('disabled')) {
        $('#order').removeClass('disabled');
      }
      generated = false;
    },
    error: function(xhr,status,error) {
      console.log(error);
    } 
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
      orderInformation = data;
      updateFilteredOrdersFromPage();
      updateCurrentOrderInfo();
      updateOrderUI();
    },
    error: (xhr, status, error) => {
      console.log('Error: ' + error);
    }
  });

  

  setTimeout(checkOrders, 3000);
}

function updateCurrentOrderInfo()
{
  if(filteredOrderInformation.length === 0)
  {
    currentOrder = null;
  }
  else {
    if (currentOrder != null && !(jQuery.isEmptyObject(currentOrder))) {
      let findObj = filteredOrderInformation.find((elem) => {
        return elem._id === currentOrder._id;
      });

      currentOrder = (findObj ? findObj : filteredOrderInformation[0]);
    } else {
      currentOrder = filteredOrderInformation[0];
    }
  }
}

function updateOrderUI() {
  if(currentOrder === null)
  {
    $('#order-display').hide();
    $('#no-order-message').removeClass('hidden');
    $('#left,#right').addClass('disabled');
  }
  else {
    $('#order-display').show();
    $('#no-order-message').addClass('hidden');
    $('#left,#right').removeClass('disabled');

    $('#order-image').attr('src', `/../images/Option ${currentOrder.modelID}.PNG`);
    let html = '<p>Date Ordered: ' + new Date(currentOrder.createDate).toString() + '</p>';
    html += '<p>Last Modified: ' + new Date(currentOrder.lastModified).toString() + '</p>';
    if (currentOrder.status === 'Completed') {
      html += '<p>Finished: ' + new Date(currentOrder.finishedTime).toString() + '</p>';
      $('#view-model').removeClass('disabled');
    } else {
      $('#view-model').addClass('disabled');
    }
    html += '<p>Model ID: ' + currentOrder.modelID + '</p>';
    html += '<p>Stage: ' + currentOrder.stage + '</p>';
    html += '<p>Status: ' + currentOrder.status + '</p><br>';
    $('#order-info').html(html);
  }
}