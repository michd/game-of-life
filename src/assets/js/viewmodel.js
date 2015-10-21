(function (GOL, PropertyCollection) {
  function ViewModel() {
    var MAX_GRID_SIZE = 200,
        MIN_GRID_SIZE = 10,
        MAX_PERIOD_DELAY = 5000,
        MIN_PERIOD_DELAY = 9;

    var propertyCollection = new PropertyCollection({
          gridSize: GOL.CONSTANTS.DEFAULT_SIZE,
          periodDelay: 200,
          showGrid: true,
          colorizeUpdates: true,
          period: 0,
          running: false,
          onPeriodRequested: null
        }),

        seedGridChanged = false,
        seedGrid = [],
        grid = [],
        timeout = null,
        self = this;

    function constructor() {
      buildDefaultSeedGrid();
      grid = self.cloneGrid(seedGrid);
    }

    // Public
    function requestFrame(oneShot) {
      var handler = self.get("onPeriodRequested");

      propertyCollection.set("period", self.get("period") + 1);

      if (handler) handler();

      if (!oneShot) {
        timeout = setTimeout(self.requestFrame, self.get("periodDelay"));
      }
    }

    // Public
    // TODO: move to util or as static method on ViewModel
    function cloneGrid(inGrid) {
      var outGrid = [],
        x, xMax, y, yMax;

      for (x = 0, xMax = inGrid.length; x < xMax; x++) {
        outGrid.push([]);
        for (y = 0, yMax = inGrid[x].length; y < yMax; y++) {
          outGrid[x].push(inGrid[x][y]);
        }
      }

      return outGrid;
    }

    // Public
    function toggleRun(on) {
      on = typeof(on) !== "undefined" ? !!on : !self.get("running");

      if (on) {
        timeout = setTimeout(self.requestFrame, self.get("periodDelay"));
        propertyCollection.set("running", true);
        return;
      }

      clearTimeout(timeout);
      timeout = null;

      propertyCollection.set("running", false);
    }

    // Public
    function reset() {
      self.toggleRun(false);

      if (!seedGridChanged) buildDefaultSeedGrid();

      grid = self.cloneGrid(seedGrid);
      propertyCollection.set("period", 0);
    }

    // Public
    // Overrides propertyCollection's set a bit for type/range checking
    function set(propertyName, value) {
      switch (propertyName) {
        case "gridSize":
          if (typeof value !== "number") {
            throw new TypeError("Expecting number for " + propertyName);
          }

          propertyCollection.set(
            propertyName,
            Math.max(
              Math.min(Math.round(value), MAX_GRID_SIZE),
              MIN_GRID_SIZE));

          resizeGrid(seedGrid);
          resizeGrid(grid);
          break;

        case "periodDelay":
          if (typeof value !== "number") {
            throw new TypeError("Expecting number for " + propertyName);
          }

          propertyCollection.set(
            propertyName,
            Math.max(
              Math.min(Math.round(value), MAX_PERIOD_DELAY),
              MIN_PERIOD_DELAY));

          break;

        case "showGrid":
        case "colorizeUpdates":
          propertyCollection.set(propertyName, !!value);
          break;

        case "period":
          // Not externally settable, here just for completeness
          break;

        case "onPeriodRequested":
          if (value !== null && typeof value !== "function") {
            throw new TypeError(
                "Expecting function or null for " + propertyName);
          }

          propertyCollection.set(propertyName, value);
          break;
       }
    }

    // Public
    function getGrid() {
      return grid;
    }

    // Public
    // TODO: make this more useful maybe, use propertyCollection, passthrough
    function setGrid(newGrid) {
      grid = newGrid;
    }

    // Public
    function toggleSeedGridCell(x, y) {
      if (x < 0 || x >= self.get("gridSize")) return;

      if (y < 0 || y >= self.get("gridSize")) return;

      seedGrid[x][y] = !seedGrid[x][y];
      grid[x][y] = seedGrid[x][y];
      seedGridChanged = true;
    }

    // Public
    function getSeedGridCell(x, y) {
      if (x < 0 || x >= self.get("gridSize")) return false;

      if (y < 0 || y >= self.get("gridSize")) return false;

      return seedGrid[x][y];
    }

    // Private
    function buildDefaultSeedGrid() {
      var x, y, i,
          size = self.get("gridSize"),
          newGrid = [];

      function insert(pattern, origin) {
        var oX = origin[0],
            oY = origin[1],
            x, y;

        for (y = 0; y < pattern.length; y++) {
          if (oY + y >= newGrid.length) break;

          for (x = 0; x < pattern[y].length; x++) {
            if (oX + x >= newGrid[y].length) break;

            newGrid[oX + x][oY + y] = pattern[y][x];
          }
        }
      }

      for (x = 0; x < size; x++) {
        newGrid.push([]);

        for (y = 0; y < size; y++) newGrid[x][y] = false;
      }

      // Seed with some patterns
      insert([
          [1, 1, 1],
          [0, 0, 1],
          [1, 1, 1]
        ], [Math.round(size / 2) - 1, Math.round(size / 4)]);

      insert([
          [1, 1, 1],
          [1, 0, 0],
          [1, 1, 1]
        ], [Math.round(size / 2) - 1, Math.round(size / 2)]);

      insert([
          [1, 1, 1],
          [0, 0, 1],
          [1, 1, 1]
        ], [
          Math.round(size / 2) - 1,
          Math.round(size / 2) + Math.round(size / 4)]);

      seedGrid = newGrid;
    }

    // Private
    function resizeGrid(grid) {
      var size = self.get("gridSize"),
          x, y;

      if (grid.length > size) {
        grid.splice(size, grid.length - size);

        for (x = 0; x < size; x++) {
          grid[x].splice(size, grid[x].length - size);
        }
      } else {
        for (x = 0; x < size; x++) {
          if (typeof grid[x] === "undefined") grid.push([]);

          for (y = 0; y < size; y++) {
            if (typeof grid[x][y] === "undefined") grid[x].push(false);
          }
        }
      }
    }

    this.requestFrame = requestFrame;
    this.cloneGrid = cloneGrid;
    this.reset = reset;
    this.toggleRun = toggleRun;
    this.subscribe = propertyCollection.subscribe;
    this.unsubscribe = propertyCollection.unsubscribe;
    this.get = propertyCollection.get;
    this.set = set;
    this.getGrid = getGrid;
    this.setGrid = setGrid;
    this.toggleSeedGridCell = toggleSeedGridCell;
    this.getSeedGridCell = getSeedGridCell;

    constructor();
  }

  GOL.namespace("ViewModel");
  GOL.ViewModel = ViewModel;
}(window.GOL, window.GOL.PropertyCollection));
