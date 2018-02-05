$(document).ready(function () {
  const app = $('#app');
  const endpoint = 'https://24jaev6jz6.execute-api.us-east-1.amazonaws.com/dev/';
  const routes = ['cryptopia', 'bittrex'];

  /**
   * https://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
   * @param num
   * @returns {number}
   */
  const getNumDecimalPlaces = (num) => {
    const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    return !match ? 0 : Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
  };

  const shortestDecimalRepresentation = (num) => {
    if (typeof num === 'string') {
      num = parseFloat(num)
    }
    const decimal_places = getNumDecimalPlaces(num);
    const max = 10;
    if (decimal_places === 0) return num;
    if (decimal_places <= max) return num.toFixed(decimal_places);
    return num.toFixed(max)
  };

  const displayError = (error) => {
    if (!error) return 'No details returned for this error.';
    if (error instanceof Error) return error.message || 'Error!';
    if (typeof error === 'object') return JSON.stringify(error);
    if (typeof error === 'string') return error;
    return error.toLocaleString()
  };

  const errorScreen = (route, err) => {
    return `<div class="col-md-12 align-items-center">
                <div class="alert alert-danger text-center">
                  There was an error getting results from <span class="text-capitalize">${route}</span>
                  <br />
                  ${displayError(err)}
                  <div class="d-flex justify-content-center">
                    <div class="btn-group"><button class="btn btn-dark" id="${route}_reload">Reload</button></div>
                  </div>
                </div>
            </div>`
  };

  const loadingScreen = (route) => {
    return `<div class="col-md-12 align-items-center">
                <div class="alert alert-primary text-center">Now connecting to <span class="text-capitalize">${route}</span> and scanning for arbitrage possibilities.</div>
            </div>`
  };

  const noResults = (route) => {
    return `<div class="col-md-12 align-items-center">
                <div class="alert alert-dark text-center">
                    <p>No results for <span class="text-capitalize">${route}</span>, reload to try again</p>
                    <div class="d-flex justify-content-center">
                        <div class="btn-group"><button class="btn btn-dark" id="${route}_reload">Reload</button></div>
                    </div>
                </div>
            </div>`
  };

  const addButtonReload = (route) => {
    $(`#${route}_reload`).click((e) => {
      e.stopPropagation();
      e.preventDefault();
      reloadRoute(route)
    })
  };

  const createListElement = (move) => {
    const from = `${shortestDecimalRepresentation(move.from.quantity)} ${move.from.type.toUpperCase()}`
    const to = `${shortestDecimalRepresentation(move.to.quantity)} ${move.to.type.toUpperCase()}`;
    const sep = `<span class="text-muted">-></span>`;
    return `${from} ${sep} ${to}`
  };

  const createMoveList = (moves) => {
    return moves.map(move => `<li class="list-group-item">${createListElement(move)}</li>`).join('')
  };

  const createCard = (obj) => {
    return `
      <div class="col-md-6 border-primary pb-2 pt-2 bg-light justify-content-center">
          <h3 class="card-title pricing-card-title text-center">
              <strong>Profit: ${obj.percent_increase}%</strong>
              <small class="text-muted"> from <span class="text-capitalize">${obj.src}</span></small>
          </h3>
          <ul class="list-group">
              <li class="list-group-item">Moves: ${obj.num_moves}</li>
              ${createMoveList(obj.moves)}
          </ul>
      </div>
      `
  };

  const reloadRoute = (route) => {
    console.log(`Reloading ${route}_reload button`);
    renderRoute(route)
  };

  const renderRoute = (route) => {
    const route_container = $(`#${route}_container`);
    route_container.html(loadingScreen(route));
    const doneFunc = (res) => {
      if (res.length > 0) {
        const cards = res.map(createCard).join('');
        route_container.html(cards)
      } else {
        console.log('No results');
        route_container.html(noResults(route));
        addButtonReload(route)
      }
    };

    const failFunc = (err) => {
      route_container.html(errorScreen(route, err))
      addButtonReload(route)
    };

    // Get the endpoint, and then render the app
    $.get(endpoint + route).done(doneFunc).fail(failFunc)

  };

  /* Add route html divs */
  app.html(routes.map(route => `<div class="row" id="${route}_container"></div>`));

  /* Render route responses */
  routes.forEach(renderRoute)

});