(function (global) {
  "use strict";

  var GOL = typeof global.GOL !== "undefined" ? global.GOL : {};

  // Sets up a namespace (nested objects) and returns the resulting object
  GOL.namespace = function (nsString) {
    var parts = nsString.split("."),
        parent = GOL,
        i, iMax;

    // Remove redundant top level namespace
    if (parts[0] === "GOL") parts.slice(1);

    for (i = 0, iMax = parts.length; i < iMax; i++) {
      // Only creaster new object if part does not exist yet
      if (typeof parent[parts[i]] === "undefined") {
        parent[parts[i]] = {};
      }

      parent = parent[parts[i]];
    }

    return parent;
  };

  global.GOL = GOL;
}(window));
