// console.log("[Worker] Hi!");

onmessage = function (e) {
  let data = e.data;

  if (typeof data === "object" && (data.url || data.code)) {
    /*
      INIT MESSAGE
    */
    let model = data;

    if (model.code)
      importScripts(
        URL.createObjectURL(new Blob([model.code], { type: "text/javascript" }))
      );
    else console.error("[Worker] No script provided");

    const modelClass = new this[model.name]();
    if (!model.method) throw new Error("[Worker] Method name not specified");
    this.modelFunc = (...a) => modelClass[model.method](...a); // todo: generalize this part in order to have more methods per class

    postMessage({ _status: "loaded" });
  } else {
    /*
      CALL MESSAGE
    */

    // JavaScript model
    console.log("[Worker] Calling JavaScript model");

    // JS object or array
    console.log("[Worker] Applying inputs as object/array");
    let res = this.modelFunc(data); // todo: generalize this part in order to be able to call different methods

    // Return promise value or just regular value
    // Promise.resolve handles both cases
    Promise.resolve(res).then((r) => {
      postMessage(r);
    });
  }
};
