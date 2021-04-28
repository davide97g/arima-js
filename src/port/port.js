const fetch = window["fetch"];

/**
 * Controller that communicates between worker and client
 */
export default class Port {
  /**
   *
   * @param {*} params
   */
  constructor(params) {
    console.log("[Port] Initializing Port with params: ", params);
    params.schema = params.schema || params.config;
    this.params = params;

    // Get schema then initialize a model
    if (params.schema) {
      if (typeof params.schema === "object") {
        console.log("[Port] Received schema as object: ", params.schema);
        this.init(params.schema);
      } else if (typeof params.schema === "string") {
        console.log("[Port] Received schema as string: ", params.schema);
        this.schemaUrl = params.schema.indexOf("json")
          ? params.schema
          : params.schema + ".json";
        fetch(this.schemaUrl)
          .then((res) => res.json())
          .then((res) => {
            console.log("[Port] Loaded schema:", res);
            this.init(res);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }

  /**
   * @private
   * Initialize model from schema
   * @param {*} schema
   */
  init(schema) {
    console.log("[Port] Initializing schema", schema);

    // Check if name is present, if not - get name from the file
    if (typeof schema.model.name === "undefined") {
      // Two options here
      if (schema.model.url) {
        // 1. Get the name from the file name
        schema.model.name = schema.model.url.split("/").pop().split(".")[0];
        console.log("[Port] Use name from url: ", schema.model.name);
      }
    }

    this.schema = Object.assign({}, schema);

    console.log("[Port] Init inputs, outputs and model description");

    // Update model URL if needed
    if (
      this.schema.model.url &&
      !this.schema.model.url.includes("/") &&
      this.schemaUrl &&
      this.schemaUrl.includes("/")
    ) {
      let oldModelUrl = this.schema.model.url;
      console.log(this.schemaUrl);
      this.schema.model.url =
        window.location.protocol +
        "//" +
        window.location.host +
        this.schemaUrl.split("/").slice(0, -1).join("/") +
        "/" +
        oldModelUrl;
      console.log(
        "[Port] Changed the old model URL to absolute one:",
        oldModelUrl,
        this.schema.model.url
      );
    }

    // Iniitialize model description
    if (this.modelContainer && this.schema.model) {
      if (this.schema.model.title) {
        let h = document.createElement("h4");
        h.className = "port-title";
        h.innerText = this.schema.model.title;
        this.modelContainer.appendChild(h);
      }
      if (this.schema.model.description) {
        let desc = document.createElement("p");
        desc.className = "model-info";
        desc.innerText = this.schema.model.description + " ";
        let a = document.createElement("a");
        a.innerText = "→";
        a.href = this.schema.model.url;
        desc.appendChild(a);
        this.modelContainer.appendChild(desc);
      }
    }

    // Init Model
    // ----------

    // Initialize worker with the model

    this.worker = new Worker("./src/port/worker.js");

    if (this.schema.model.url) {
      fetch(this.schema.model.url)
        .then((res) => res.text())
        .then((res) => {
          console.log("[Port] Loaded js code for worker");
          this.schema.model.code = res;
          this.worker.postMessage(this.schema.model);
        });
    }

    this.worker.onmessage = (e) => {
      const data = e.data;
      console.log("[Port] Response from worker:", data);
      if (typeof data === "object" && data._status) {
        switch (data._status) {
          case "loaded":
            // window["M"].toast({ html: "Loaded: JS model (in worker)" });
            break;
        }
      } else {
        this.output(data);
      }
    };

    this.worker.onerror = (e) => console.error("[Port] Error from worker:", e);
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
   * Send the output of the computation using a custom event
   * @private
   * @param {[]} data
   */
  output(data) {
    if (!data) throw new Error("[Port] invalid output data");
    window.dispatchEvent(new CustomEvent("output", { detail: data }));
  }
}
