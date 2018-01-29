$(document).ready(function () {
  const app = $('#app');
  const endpoint = 'https://24jaev6jz6.execute-api.us-east-1.amazonaws.com/dev/';
  const routes = ['cryptopia'];


  const createMoveList = function (moves) {
    return moves.map(move => `<li>${move.from.type.toUpperCase()} -> ${move.to.type.toUpperCase()}</li>`).join('')
  }

  const createCard = function (obj) {
    return `
      <div class="card mb-4 box-shadow" style="width: 18rem;">
            <div class="card-header">
                <h4 class="my-0 font-weight-normal">${obj.src}</h4>
            </div>
            <div class="card-body">
                <h1 class="card-title pricing-card-title"><small class="text-muted">% ${obj.percent_increase}</small></h1>
                <ul class="list-unstyled mt-3 mb-4">
                    <li>Moves: ${obj.num_moves}</li>
                    ${createMoveList(obj.moves)}
                </ul>
                <!--<button type="button" class="btn btn-lg btn-block btn-outline-primary">Sign up for free</button>-->
            </div>
        </div>
      `
  }

  const renderRoute = function (route) {
    const doneFunc = function (res) {
      // todo create header with info

      if (res.length > 0) {
        const cards = res.map(createCard).join('')
        $(`#${route}`).html(cards)
      }

    }


    $.get(endpoint + route)
        .done(doneFunc)

  }

  app.html(routes.map(route => `<div id="${route}" class="card-deck mb-3 text-center"></div>`))

  routes.forEach(renderRoute)

});