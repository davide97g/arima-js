const utils = require("./utils");
const new_matrix = utils.new_matrix;
const new_vector = utils.new_vector;

function train(data, options) {
  let mk = options.mk;
  let lrate = options.lrate;
  let w = options.init_w;
  let epsilon = options.epsilon;

  let list = [];
  let SE = 0;
  let A_trans = new_matrix(mk);
  for (let i = 0; i < mk; i++) {
    for (let j = 0; j < mk; j++) {
      if (j !== i) A_trans[i][j] = 0;
      else A_trans[i][j] = epsilon;
    }
  }

  for (let i = mk; i < data.length; i++) {
    // ! diff = w*data(i-mk:i-1)'-data(i);
    let diff = -data[i];
    for (let j = i - mk; j < i; j++) diff += w[j - i + mk] * data[j];

    // ! grad = 2*data(i-mk:i-1)*diff;
    grad = new_vector(mk);
    for (let j = i - mk; j < i; j++) grad[j - i + mk] = 2 * data[j] * diff;

    // ! let numerator = A_trans * grad.T * grad * A_trans;
    let v1 = new_vector(mk); // step 1 ==> Nx1
    for (let x = 0; x < mk; x++)
      for (let y = 0; y < mk; y++) v1[x] += A_trans[x][y] * grad[y];

    let m2 = new_matrix(mk, mk); // step 2 ==> NxN
    for (let x = 0; x < mk; x++)
      for (let y = 0; y < mk; y++) m2[x][y] += v1[x] * grad[y];

    let numerator = new_matrix(mk, mk);
    for (let x = 0; x < mk; x++)
      for (let y = 0; y < mk; y++)
        for (let z = 0; z < mk; z++)
          numerator[x][y] += m2[x][z] * A_trans[z][y];

    // ! let denominator = 1 + grad * A_trans * grad.T; // 1x1 (scalar)
    let v2 = new_vector(mk); // step 1
    for (let x = 0; x < mk; x++)
      for (let y = 0; y < mk; y++) v2[x] += grad[x] * A_trans[x][y];

    let denominator = 1;
    for (let x = 0; x < mk; x++) denominator += v2[x] * grad[x];

    // update A_trans
    //     A_trans = A_trans - A_trans * grad' * grad * A_trans/(1 + grad * A_trans * grad');
    for (let x = 0; x < mk; x++)
      for (let y = 0; y < mk; y++)
        A_trans[x][y] -= numerator[x][y] / denominator;

    //     w = w - lrate * grad * A_trans ;
    // update weights
    for (let j = 0; j < grad.length; j++)
      for (let k = 0; k < grad.length; k++)
        w[j] -= lrate * grad[j] * A_trans[k][j];

    SE += Math.pow(diff, 2);
    if (i % options.t_tick == 0) list.push(Math.sqrt(SE / i));
  }
  return { RMSE: list, w: w };
}

module.exports = { train };
