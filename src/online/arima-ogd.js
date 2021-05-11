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

    // ? w = w - data(i-mk:i-1)*2*diff/sqrt(i-mk)*lrate
    for (let j = i - mk; j < i; j++)
      w[j - i + mk] =
        w[j - i + mk] - ((data[j] * 2 * diff) / Math.sqrt(i - mk + 1)) * lrate;

    // ? SE = SE + diff^2;
    SE += Math.pow(diff, 2);
    if (i % options.t_tick == 0) list.push(Math.sqrt(SE / i));
  }
  return { RMSE: list, w: w };
}
module.exports = { train };
