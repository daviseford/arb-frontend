$(document).ready(function () {
  const app = $('#app');
  const endpoint = 'https://24jaev6jz6.execute-api.us-east-1.amazonaws.com/dev/';
  const routes = ['cryptopia'];


  const createMoveList = function (moves) {
    return moves.map(move => `<li>${move.from.type} -> ${move.to.type}</li>`)
  }

  const createCard = function (obj) {
    return `
      <div class="card mb-3 box-shadow">
            <div class="card-header">
                <h4 class="my-0 font-weight-normal">Card</h4>
            </div>
            <div class="card-body">
                <h1 class="card-title pricing-card-title">% ${obj.percent_increase} <small class="text-muted">(est.)</small></h1>
                <ul class="list-unstyled mt-3 mb-4">
                    <li>Moves: ${obj.num_moves}</li>
                    ${createMoveList(obj.moves)}
                </ul>
                <button type="button" class="btn btn-lg btn-block btn-outline-primary">Sign up for free</button>
            </div>
        </div>
      `
  }

  const renderRoute = function (route) {
    const doneFunc = function (res) {
      console.log(res)
      // todo create header with info

      if (res.length > 0) {
        const cards = res.map(createCard)
        $(`#${route}`).html(cards)
      }

    }


    $.get(endpoint + route)
        .done(doneFunc)

  }

  app.html(routes.map(route => `<div id="${route}" class="card-deck mb-3 text-center"></div>`))

  routes.forEach(renderRoute)

});