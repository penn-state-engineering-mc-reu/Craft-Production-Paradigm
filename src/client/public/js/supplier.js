const names = ["1x1", "2x2", "2x3x2", "1x2 Pin", 
              "2x2 Pin", "2x2x2 Pin", "2x2 Double", "Tire 1",
              "Tire 2", "Tire 3", "Rim 1", "Rim 2",
              "Rim 3", "1x2", "1x4", "1x2 Plate",
              "4x6 Plate", "6x8 Plate", "2x10 Plate", "Windshield",
              "Steering Wheel", "Lego Man"];

const TR_COLOR_ALPHA = 0.5;
const STANDARD_LEGO_COLORS = {
  defaultBrickColor: "rgb(163,162,164)" /* 194, Medium stone grey */,
  colorPalette: [
    ["rgb(245,205,47)" /* 24, Bright yellow */, "rgb(253,234,140)" /* 226, Cool yellow */],
    ["rgb(218,133,64)" /* 106, Bright orange */, "rgb(232,171,45)" /* 191, Flame yellowish orange */],
    ["rgb(196,40,27)" /* 21, Bright red */, "rgb(123,46,47)" /* 154, Dark red */],
    ["rgb(205,98,152)" /* 221, Bright purple */, "rgb(228,173,200)" /* 222, Light purple */, "rgb(146,57,120)" /* 124, Bright reddish violet */,
      "rgb(52,43,117)" /* 268, Medium lilac */],
    ["rgb(13,105,171)" /* 23, Bright blue */, "rgb(159,195,233)" /* 212, Light Royal blue */, "rgb(110,153,201)" /* 102, Medium blue */,
      "rgb(32,58,86)" /* 140, Earth blue */],
    ["rgb(116,134,156)" /* 135, Sand blue */],
    ["rgb(40,127,70)" /* 28, Dark green */, "rgb(75,151,74)" /* 37, Bright green */, "rgb(120,144,129)" /* 151, Sand green */,
      "rgb(39,70,44)" /* 141, Earth green */],
    ["rgb(164,189,70)" /* 119, Br. yellowish green */],
    ["rgb(105,64,39)" /* 192, Reddish brown */, "rgb(215,197,153)" /* 5, Brick yellow */, "rgb(149,138,115)" /* 138, Sand yellow */,
      "rgb(51,0,0)" /* 308, Dark brown */],
    ["rgb(231,139,62)" /* 312, Medium nougat */, "rgb(204,142,104)" /* 18, Nougat */, "rgb(245,193,137)" /* 283, Light nougat */,
      "rgb(160,95,52)" /* 38, Dark orange */],
    ["rgb(242,243,242)" /* 1, White */, "rgb(229,228,222)" /* 208, Light stone grey */, "rgb(163,162,164)" /* 194, Medium stone grey */,
      "rgb(99,95,97)" /* 199, Dark stone grey */],
    ["rgb(27,42,52)" /* 26, Black */],
    [`rgba(247,241,141,${TR_COLOR_ALPHA})` /* 44, Tr. Yellow */, `rgba(248,241,132,${TR_COLOR_ALPHA})` /* 49, Tr. Flu. Green */],
      /* TODO: Find 182 */
    [`rgba(217,133,108,${TR_COLOR_ALPHA})` /* 47, Tr. Flu. Reddish orange */],
    [`rgba(228,173,200,${TR_COLOR_ALPHA})` /* 113, Tr. Medi. reddish violet */, `rgba(205,84,75,${TR_COLOR_ALPHA})` /* 41, Tr. Red */],
    [`rgba(207,226,247,${TR_COLOR_ALPHA})` /* 143, Tr. Flu. Blue */, `rgba(193,223,240,${TR_COLOR_ALPHA})` /* 42, Tr. Lg blue */,
      `rgba(123,182,232,${TR_COLOR_ALPHA})` /* 43, Tr. Blue */, `rgba(165,165,203,${TR_COLOR_ALPHA})` /* 126, Tr. Bright bluish violet */],
    [`rgba(132,182,141,${TR_COLOR_ALPHA})` /* 48, Tr. Green */],
      /* TODO: Find 311 */
    [`rgba(191,183,177,${TR_COLOR_ALPHA})` /* 111, Tr. Brown */],
    [`rgba(236,236,236,${TR_COLOR_ALPHA})` /* 40, Transparent */]
  ]
}; // Based on http://www.brothers-brick.com/downloads/2010-LEGO-color-palette.pdf, with color values generated from
   // http://www.peeron.com/cgi-bin/invcgis/colorguide.cgi.

let pieceOrders = [];
let manufacturingPieces = [];
let orderInformation = {};
let currentOrder = {};
let colors = [];

$(document).ready(() => {
  generateSupplyGrid();
  initArray();
  initButtons();
  $('#request').click(e => openManufacturingModal());
  checkRequestedPieces();
  setInterval(checkRequestedPieces, 3000);
});

// gets the pin from the url
function getPin() {
  return /(\d+)(?!.*\d)/g.exec(window.location.href)[0];
}

function initArray() {
  for (let i = 0; i < names.length; i++) {
    pieceOrders[i] = 0; 
    colors[i] = STANDARD_LEGO_COLORS.defaultBrickColor;
  }
}

function initButtons() {
  initGridButtons();

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
  for (let i = 0; i < names.length; i++) {
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

    $('.' + i + '-picker').spectrum({
      showPalette: true,
      showPaletteOnly: true,
      showAlpha: true,
      palette: STANDARD_LEGO_COLORS.colorPalette,
      color: STANDARD_LEGO_COLORS.defaultBrickColor,
      change: color => {
        colors[i] = color.toRgbString();
      }
    });
  }
}

// the supply order needs to match (it can have more pieces) the manufacturer order
function checkSupplyMatchesManufacturer() {
  for (let i = 0; i < manufacturingPieces.length; i++) {
    if (pieceOrders[i] < manufacturingPieces[i]) return false;
  }
  return true;
}

function sendSupplyOrder() {
  let postData = {
    "order": pieceOrders,
    "colors": colors
  };

  $.ajax({
    type: 'POST',
    data: JSON.stringify(postData),
    contentType: 'application/json',
    url: GameAPI.rootURL + '/gameLogic/sendSupplyOrder/' + getPin(),
    success: (data) => {
      console.log('Order sent!');
      $('#ready-order').modal('toggle');
      initArray();
      generateSupplyGrid();
      initGridButtons();
    },
    error: (xhr, status, error) => {
      console.log(error);
    }
  });
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

function checkRequestedPieces() {
  $.ajax({
  type: 'GET',
  url: GameAPI.rootURL + '/gameLogic/getManufacturerRequest/' + getPin(),
  success: (data) => {
    manufacturingPieces = data;
    populateRequestData(manufacturingPieces);
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
}

/**
 * Dynamically generate all the squares to add to a supply order
 * This would have been terrible to do by hand
 */
function generateSupplyGrid() {
  let html = "";
  for (let i = 0; i < names.length / 4; i++) {
    html += '<div class="row">';
    for (let j = 0; j < 4; j++) {
      if (i * 4 + j < names.length) {
        html += '<div class="four wide column">';
        html += '<p align="left">' + names[i * 4 + j] + '</p>';
        html += `<p> <img class = "piece" src= "/../images/Lego pieces/${names[i * 4 + j]}.jpg"> </p>`;
        // Start off each piece with an order of 0
        html += '<div class="row"><div class="ui statistic"><div id="' + (i * 4 + j) + '-value' + '"class="value">0</div></div></div>'
        // add a color picker to each item
        html += '<div class="row picker"><input type="text" class="' + (i * 4 + j) + '-picker" value="#d0d3d4"/></div>'
        // Adds the plus and minus buttons to each piece
        html += '<div class="row"><div class="ui icon buttons">' +
          '<button id="'+ (i * 4 + j) + '-minus' + '" class="ui button"><i class="minus icon"></i></button>' +
          '<button id="'+ (i * 4 + j) + '-plus' + '" class="ui button"><i class="plus icon"></i></button></div></div></div>';
      }
    }
    // I want there to be vertical lines between each cube so I need to add a blank space 
    if (i + 1 >= names.length / 4) html += '<div class="five wide column"></div>';
    html += '</div>';
  }

  $('#supply-grid').html(html);
}
