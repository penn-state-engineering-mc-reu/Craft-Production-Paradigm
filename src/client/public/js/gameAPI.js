const GameAPI = {
  rootURL: 'https://manufacturing-sim-game-api.herokuapp.com',
  /**
   * @returns {JQueryXHR}
   */
  // gets the pin from the url
  getPin() {
    return /(\d+)(?!.*\d)/g.exec(window.location.href)[0];
  },
  getGameInfo(pin) {
    pin = (pin ? pin : GameAPI.getPin());

    return $.ajax({
      type: 'GET',
      url: GameAPI.rootURL + '/startGame/getGameInfo/' + pin,
      timeout: 3000
    });
  },
  getPlayerName(gameInfo, position) {
    position = (position ? position : sessionStorage.position);
    let findResult = gameInfo.positions.find(value => value.positionName === position);

    return (findResult !== undefined ? findResult.playerName : undefined);
  },
  removeActivePlayer(pin, position) {
    pin = (pin ? pin : GameAPI.getPin());
    position = (position ? position : sessionStorage.position);

    return $.ajax({
      type: 'GET',
      timeout: 5000,
      url: GameAPI.rootURL + '/startGame/removeActivePlayer/' + pin + '/' + position,
      success: (result) => window.location.href = '/',
      error: (error) => console.log(error)
    });
  },
  getCustOrders(pin) {
    pin = (pin ? pin : GameAPI.getPin());

    return $.ajax({
      type: 'GET',
      url: GameAPI.rootURL + '/gameLogic/getOrders/' + pin,
      cache: false,
      timeout: 5000
    });
  },
  forwardManufacturerOrder(orderID, pin)
  {
    pin = (pin ? pin : GameAPI.getPin());

    return $.ajax({
      type: 'POST',
      url: GameAPI.rootURL + '/gameLogic/forwardManufacturerOrder/' + pin + '/' + orderID,
      timeout: 5000
    });
  },
  addSupplyOrder(orderData, pin)
  {
    pin = (pin ? pin : GameAPI.getPin());

    let postData = {'request': orderData};
    return $.ajax({
      type: 'POST',
      url: GameAPI.rootURL + '/gameLogic/addSupplyOrder/' + pin,
      data: JSON.stringify(postData),
      contentType: 'application/json'
    });
  }
};