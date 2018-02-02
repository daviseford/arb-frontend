$(document).ready(function () {
  const app = $('#app');
  const endpoint = 'https://24jaev6jz6.execute-api.us-east-1.amazonaws.com/dev/';
  const routes = ['cryptopia'];

  const noResults = (route) => {
    return `
          <div class="col-md-12 justify-content-center">
              <div class="alert alert-dark">No results for ${route}, refresh to try again</div>
              <button class="btn btn-dark" id="${route}_reload">reload</button>
          </div>
          `
  }

  const createMoveList = function (moves) {
    return moves.map(move => `<li>${move.from.type.toUpperCase()} -> ${move.to.type.toUpperCase()}</li>`).join('')
  };

  const createCard = function (obj) {
    return `
    <div class="col-md-4">
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
                <!--<button type="button" class="btn btn-lg btn-block btn-outline-primary">Sign up for free</button>-->
            </div>
        </div>
      </div>
      `
  }

  const renderRoute = function (route) {
    const doneFunc = function (res) {
      const route_container = $(`#${route}`)
      // todo create header with info

      if (res.length > 0) {
        const cards = res.map(createCard).join('');
        route_container.html(cards)
      } else {
        console.log('No results')
        route_container.html(noResults(route))
      }

    }


    $.get(endpoint + route)
        .done(doneFunc)

  }

  /* Add route html divs */
  app.html(routes.map(route => `<div class="row"><div id="${route}" class="card-deck mb-3 text-center"></div></div>`))

  /* Render route responses */
  routes.forEach(renderRoute)

});