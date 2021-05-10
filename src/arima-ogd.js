const fs = require("fs");
const parse = require("csv-parse");
const inputPath = "../data/seq_d1.csv";

function arima_ogd(data, options) {
  let mk = options.mk;
  let lrate = options.lrate;
  let w = options.init_w;

  let list = [];
  let SE = 0;

  for (let i = mk + 1; i < data.length; i++) {
    let diff = 0;
    for (let j = i - mk; j < i - 1; j++)
      diff += w[j - i + mk] * data[j] - data[i];

    for (let j = i - mk; j < i - 1; j++)
      w[j - i + mk] =
        w[j - i + mk] - (data[j] * 2 * diff) / (Math.sqrt(i - mk) * lrate);

    SE = Math.pow(SE + diff, 2);
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
    // console.info(input);
    let options = {
      lrate: 0.0001,
      mk: 10,
      init_w: [0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
      t_tick: 1,
    };

    let res = arima_ogd(input, options);
    console.info(res);
  });
});
