const fs = require("fs");
const parse = require("csv-parse");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const arima_ogd = require("./arima-ogd");
const arima_ons = require("./arima-ons");

const inputPath = "../../data/input/";
const outputPath = "../../data/output/";

const utils = require("./utils");

function saveCSV(algorithm, name, data) {
  const csvWriter = createCsvWriter({
    path: outputPath + algorithm + "_" + name + ".csv",
    header: [{ id: name, title: name }],
  });

  const formatted = data.map((x) => {
    let obj = {};
    obj[name] = x;
    return obj;
  });

  csvWriter
    .writeRecords(formatted)
    .then(() => console.log(algorithm, name + ".csv file saved"));
}

function arima(algorithm, input_file) {
  fs.readFile(inputPath + input_file + ".csv", (err, fileData) => {
    parse(fileData, { columns: false, trim: true }, (err, rows) => {
      let input = [];
      rows.forEach((row) =>
        row.forEach((value) => input.push(parseFloat(value)))
      );

      // input = [];
      // for (let i = 0; i < 100000; i++)
      //   input.push(i / 100 + Math.random() / 2 + Math.sin(i / (6.28 * 5)));

      // test = [];
      // for (let i = 0; i < 100000; i++)
      //   test.push(
      //     i / 100 +
      //       Math.random() / 2 +
      //       Math.sin(i / (6.28 * 5)) +
      //       (i > 500 && i < 700 ? Math.random() * 2 : 0)
      //   );

      // console.info(input);
      // input = [];

      const test = input;

      let options = {};
      let res = null;
      let predictions = [];
      let options_best = {};
      let best = 0;
      if (algorithm == "ogd") {
        const lrates = [1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7];
        const mk_list = [15];
        for (let lrate in lrates) {
          for (let mk in mk_list) {
            options = {
              lrate: lrates[lrate],
              mk: mk_list[mk],
              init_w: utils.new_random_vector(mk_list[mk]),
              t_tick: 1,
            };
            res = arima_ogd.train(input, options);
            let sum = 0;
            for (let i = 0; i < res.w.length; i++) sum += res.w[i];
            console.info("lrate", lrates[lrate], "mk", mk_list[mk], ":", sum);
            if (Math.abs(1 - sum) < Math.abs(1 - best)) {
              options_best = options;
              best = sum;
            }
          }
        }
        console.info(
          "best",
          "lrate",
          options_best.lrate,
          "mk",
          options_best.mk
        );
        res = arima_ogd.train(input, options_best);
        // predictions only with the best combination
        predictions = arima_ogd.predict(test, res.w);
      } else if (algorithm == "ons") {
        options = {
          lrate: 0.0001,
          mk: 10,
          init_w: utils.new_random_vector(10),
          epsilon: 0.0001,
          t_tick: 1,
        };
        res = arima_ons.train(input, options);
        predictions = arima_ons.predict(input, res.w);
      }

      let sum = 0;
      for (let i = 0; i < res.w.length; i++) sum += res.w[i];
      console.info(algorithm, "w", res.w, sum);

      saveCSV(algorithm, "RMSE", res.RMSE);
      saveCSV(algorithm, "w", res.w);
      saveCSV(algorithm, "input", input);
      saveCSV(algorithm, "test", test);
      saveCSV(algorithm, "predictions", predictions);
    });
  });
}

// arima("ogd", "seq_d1");
arima("ogd", "series");
// arima("ons", "seq_d1");
