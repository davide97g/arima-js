const { new_vector } = require("./utils");

function train(data, options) {
  let mk = options.mk;
  let lrate = options.lrate;
  let w = options.init_w;

  let list = [];
  let SE = 0;

  // ? for i = mk+1:size(data,2)
  for (let i = mk; i < data.length; i++) {
    let diff = 0;

    // ? diff = w*data(i-mk:i-1)'-data(i)
    for (let j = i - mk; j < i; j++) diff += w[j - i + mk] * data[j];
    diff -= data[i];

    w_sum = 0;
    for (let j = 0; j < mk; j++) {
      w_sum += w[j];
    }

    // let r = Math.pow(1 - w_sum, 2);

    // ? w = w - data(i-mk:i-1)*2*diff/sqrt(i-mk)*lrate
    for (let j = i - mk; j < i; j++)
      w[j - i + mk] -= ((data[j] * 2 * diff) / Math.sqrt(i - mk + 1)) * lrate;
    // w[j - i + mk] -= data[j] * 2 * diff * lrate * r;

    // ? SE = SE + diff^2;
    SE += Math.pow(diff, 2);
    if (i % options.t_tick == 0) list.push(Math.sqrt(SE / i));
  }
  return { RMSE: list, w: w };
}

function train2(data, options) {
  let mk = options.mk;
  let lrate = options.lrate;
  let w = options.init_w;

  let list = [];
  let SE = 0;

  // ? for i = mk+1:size(data,2)
  for (let i = mk; i < data.length; i++) {
    // let diff = 0; // todo: vector
    let diff = new_vector(mk);

    // ? diff = w*data(i-mk:i-1)'-data(i)
    for (let j = i - mk; j < i; j++) {
      // diff += w[j - i + mk] * data[j];
      diff.push(Math.abs(w[j - i + mk] * data[j] - data[i]));
    }
    // diff -= data[i];

    w_sum = 0;
    for (let j = 0; j < mk; j++) {
      w_sum += w[j];
    }

    // let r = Math.pow(1 - w_sum, 2);

    // ? w = w - data(i-mk:i-1)*2*diff/sqrt(i-mk)*lrate
    for (let j = i - mk; j < i; j++)
      w[j - i + mk] -=
        ((data[j] * 2 * diff[j - i + mk]) / Math.sqrt(i - mk + 1)) * lrate;
    // w[j - i + mk] -= data[j] * 2 * diff * lrate * r;

    // ? SE = SE + diff^2;
    SE += Math.pow(diff, 2);
    if (i % options.t_tick == 0) list.push(Math.sqrt(SE / i));
  }
  return { RMSE: list, w: w };
}

function predict(data, w) {
  let predictions = [];
  for (let i = 0; i < w.length; i++) {
    predictions.push(data[i]);
  }

  for (let i = w.length; i < data.length; i++) {
    let p = 0;
    if (i < 97) {
      for (let j = i - w.length; j < i; j++) p += w[j - i + w.length] * data[j];
    } else {
      for (let j = i - w.length; j < i; j++) {
        p += w[j - i + w.length] * predictions[j - w.length]; // lowers with time
      }
    }
    predictions.push(p);
  }
  return predictions;
}
module.exports = { train, train2, predict };
