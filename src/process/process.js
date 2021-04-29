const arima = require("arima");
const AutoCor = require("online-autocorrelation");

module.exports = class Process {
  constructor() {
    console.info("[Process] New");
    this.records = [];
    this.keys = [];
    this.data = [];
    this.arimaOpts = {};
  }

  /**
   * Compute the ARIMA model with the given parameters
   * @param {*} params
   * @returns the results of the computation
   */
  _compute(params) {
    const ts = this.records.map((row) => +row[params.column]);

    if (params.parameters === "Auto") {
      const scores = [];
      const split = ts.length - params.timesteps;
      const tsTrain = ts.slice(0, split);
      const tsTrue = ts.slice(split);
      for (let i = 0; i <= params.iterations; i++) {
        const pars = {
          p: Math.round(Math.random() * 12),
          d: Math.round(Math.random() * 3),
          q: Math.round(Math.random() * 6),
        };
        const [tsPred, err] = arima(tsTrain, params.timesteps, {
          p: pars.p,
          d: pars.d,
          q: pars.q,
          verbose: false,
        });
        const score = tsPred
          .map((v, i) => Math.abs(tsPred[i] - tsTrue[i]))
          .reduce((a, v) => a + v / tsPred.length, 0);
        console.log("Iteration:", i, score, pars);
        scores.push({
          score,
          pars,
        });
      }
      const min = scores.reduce(
        (iMax, x, i, arr) => (x.score < arr[iMax].score ? i : iMax),
        0
      );
      console.log("Best params", scores[min]);
      this.arimaOpts = scores[min].pars; // ? saving the parameters
      const forecastTest = arima(
        ts.slice(0, ts.length - params.timesteps),
        params.timesteps,
        scores[min].pars
      );
      const forecast = arima(ts, params.timesteps, scores[min].pars);
      const autocor = AutoCor(ts.length < 50 ? ts.length : 50)(ts);
      return {
        ts,
        forecast,
        forecastTest,
        autocor,
        params: scores[min].pars,
      };
    } else {
      const arimaOpts = {
        p: params.p,
        d: params.d,
        q: params.q,
      };
      this.arimaOpts = arimaOpts; // ? saving the parameters
      const forecastTest = arima(
        ts.slice(0, ts.length - params.timesteps),
        params.timesteps,
        arimaOpts
      );
      const forecast = arima(ts, params.timesteps, arimaOpts);
      const autocor = AutoCor(ts.length < 50 ? ts.length : 50)(ts);
      return { ts, forecast, forecastTest, autocor, params: arimaOpts };
    }
  }

  /**
   * Prepare the data and execute the computation with the `arima` library
   * @param {*} params
   * @returns the result of the computation
   */
  train(params) {
    if (!params.data && !this.data) {
      throw new Error("No data provided");
    }

    this.data = params.data;
    console.info("[Process] - Training with data", params.data);
    this.keys = Object.keys(params.data).filter((key) => key.length);

    this.records = [];
    this.keys.forEach((key) => {
      params.data[key].forEach((x) => {
        let record = {};
        record[key] = x;
        this.records.push(record);
      });
    });

    return this._compute(params);
  }

  /**
   * Given a set of new data it predicts the trend using the previous computation
   * @param {*} data
   * @returns {*} predictions
   */
  predict(data) {
    console.info("[Process] Predicting data", data);
    // todo: implement predict function
    return { predictions: [1, 2, 3, 4, 5] };
  }

  /**
   * Returns the arima parameters if they are present
   * @returns {*}
   */
  getModel() {
    console.info("[Process] Returning model parameters");
    return this.arimaOpts ? { params: this.arimaOpts } : null;
  }
};
