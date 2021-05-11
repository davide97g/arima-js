const fs = require("fs");
const parse = require("csv-parse");
const inputPath = "../data/seq_d1.csv";

function new_matrix(N, M) {
  let matrix = [];
  for (let i = 0; i < N; i++) {
    let row = [];
    for (let j = 0; j < M; j++) {
      row.push(0);
    }
    matrix.push(row);
  }
  return matrix;
}

function new_vector(N) {
  let vector = [];
  for (let i = 0; i < N; i++) vector.push(0);
  return vector;
}

function new_random_vector(N) {
  let v = [];
  for (let i = 0; i < N; i++) {
    v.push(Math.random());
  }
  return v;
}

function arima_ons(data, options) {
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

fs.readFile(inputPath, (err, fileData) => {
  parse(fileData, { columns: false, trim: true }, (err, rows) => {
    // Your CSV data is in an array of arrys passed to this callback as rows.
    let input = [];
    rows.forEach((row) =>
      row.forEach((value) => input.push(parseFloat(value)))
    );

    let options = {
      lrate: 0.01,
      mk: 10,
      init_w: new_random_vector(10),
      epsilon: 0.00001,
      t_tick: 1,
    };

    let res = arima_ons(input, options);
    console.info(res);
  });
});
