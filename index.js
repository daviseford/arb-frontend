$(document).ready(function () {
  const app = $('#app');
  const endpoint = 'https://24jaev6jz6.execute-api.us-east-1.amazonaws.com/dev/';
  const routes = ['cryptopia'];

  /**
   * https://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
   * @param num
   * @returns {number}
   */
  const getNumDecimalPlaces = function (num) {
    const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    return !match ? 0 : Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
  };


  const shortestDecimalRepresentation = function (num) {
    if (typeof num === 'string') {
      num = parseFloat(num)
    }
    const decimal_places = getNumDecimalPlaces(num)
    const max = 10;
    if (decimal_places === 0) return num;
    if (decimal_places <= max) return num.toFixed(decimal_places)
    return num.toFixed(max)


  };

  const loadingScreen = (route) => {
    return `
          <div class="col-md-12 justify-content-center">
              <div class="alert alert-primary">Now connecting to ${route} and scanning for arbitrage possibilities.</div>
          </div>
          `
  }

  const noResults = (route) => {
    return `
          <div class="col-md-12 justify-content-center">
              <div class="alert alert-dark">No results for ${route}, refresh to try again</div>
              <button class="btn btn-dark" id="${route}_reload">reload</button>
          </div>
          `
  }

  const createListElement = function (move) {
    const from = `${shortestDecimalRepresentation(move.from.quantity)} ${move.from.type.toUpperCase()}`
    const to = `${shortestDecimalRepresentation(move.to.quantity)} ${move.to.type.toUpperCase()}`;
    const sep = `->`;
    return `${from} ${sep} ${to}`
  }

  const createMoveList = function (moves) {
    console.log(moves)
    return moves.map(move => `<li>${createListElement(move)}</li>`).join('')
  };

  const createCard = function (obj) {
    return `
      <div class="card mb-4 box-shadow">
            <div class="card-header">
                <h4 class="my-0 font-weight-normal">${obj.src}</h4>
            </div>
            <div class="card-body">
                <h1 class="card-title pricing-card-title">${obj.percent_increase}<small class="text-muted">%</small></h1>
                <ul class="list-unstyled mt-3 mb-4">
                    <li>Moves: ${obj.num_moves}</li>
                    ${createMoveList(obj.moves)}
                </ul>
            </div>
        </div>
      `
  }

  const reloadRoute = function (route) {
    console.log(`Reloading ${route}_reload button`)
    renderRoute(route)
  }

  const renderRoute = function (route) {
    const route_container = $(`#${route}`)
    route_container.html(loadingScreen(route))
    const doneFunc = function (res) {
      // todo create header with info

      if (res.length > 0) {
        const cards = res.map(createCard).join('');
        route_container.html(cards)
      } else {
        console.log('No results')
        route_container.html(noResults(route))
        $(`#${route}_reload`).click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          reloadRoute(route)
        })
      }
    }
    $.get(endpoint + route).done(doneFunc)

  }

  /* Add route html divs */
  app.html(routes.map(route => `<div class="row"><div id="${route}" class="col-md-12"></div></div>`))

  /* Render route responses */
  routes.forEach(renderRoute)

});