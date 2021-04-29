const fetch = window["fetch"];

/**
 * Controller that communicates between worker and client
 */
export default class Port {
  /**
   *
   * @param {*} config
   */
  constructor(config) {
    console.log("[Port] Initializing Port with params: ", config);
    this.config = config;

    // Get schema then initialize a model
    if (this.config) this.init(this.config.model);
  }

  /**
   * @private
   * Initialize model from config
   * @param {*} model
   */
  init(model) {
    console.log("[Port] Initializing model", model);
    this.model = model;

    this.worker = new Worker("./src/port/worker.js");

    this.worker.onmessage = (e) => {
      const data = e.data;
      console.log("[Port] Response from worker:", data);
      if (!data._status) this.output(data);
    };

    this.worker.onerror = (e) => console.error("[Port] Error from worker:", e);

    if (this.model.url) {
      fetch(this.model.url)
        .then((res) => res.text())
        .then((res) => {
          console.log("[Port] Loaded js code for worker");
          this.model.code = res;
          this.worker.postMessage(this.model);
        });
    }
  }

  /**
   * @public
   * Execute main function of the model
   * @param {*} params
   */
  run(params) {
    if (!params) throw new Error("[Port] params not specified");
    // We have all input values here, pass them to worker, window.modelFunc or tf
    this.worker.postMessage(params);
  }

  /**
   * Send the output of the computation using the input callback function
   * @private
   * @param {[]} data
   */
  output(data) {
    if (!data) throw new Error("[Port] invalid output data");
    else if (
      !this.config.callback ||
      typeof this.config.callback !== "function"
    )
      throw new Error("[Port] callback is not a function");
    else this.config.callback(data);
  }
}
