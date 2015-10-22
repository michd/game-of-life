(function (
    GOL,
    ViewModel,
    GridView,
    gameOfLifeTransform,
    gridEncoder) {
  function ViewController(rootNode) {
    var vm,
        periodOutput,
        runPauseButton,
        nextFrameButton,
        resetButton,
        editSeedButton,
        gridSizeInput,
        periodDelayInput,
        showGridCheckboxInput,
        colorizeUpdatesCheckboxInput,
        settingsUpdateButton,
        shareSeedButton,
        shareUrlContainerLabel,
        shareUrlTextarea;

        gridView = new GridView($('canvas')),
        transform = gameOfLifeTransform;

    function constructor() {
      periodOutput = $('periodOutput');
      runPauseButton = $('runPauseButton');
      nextFrameButton = $('nextFrameButton');
      resetButton = $('resetButton');
      editSeedButton = $('editSeedButton');
      gridSizeInput = $('gridSizeInput');
      periodDelayInput = $('periodDelayInput');
      //showGridCheckboxInput = $('showGridCheckboxInput');
      colorizeUpdatesCheckboxInput = $('colorizeUpdatesCheckboxInput');
      settingsUpdateButton = $('settingsUpdateButton'),
      shareSeedButton = $('shareSeedButton'),
      shareUrlContainerLabel = $('shareUrlContainerLabel'),
      shareUrlTextarea = $('shareUrlTextarea'),

      gridView = new GridView($('canvas'));

      vm = new ViewModel();
      vm.subscribe(viewModelOnPropertyChanged);
      vm.set("onPeriodRequested", viewModelOnPeriodRequested);

      // TODO: make all the event listeners their own non-anonymous functions,
      // to allow unscrubing in a potential deconstruct/dispose call
      runPauseButton.addEventListener("click", function() {
          if (!vm.get("running")) gridView.setEditable(false);

          vm.toggleRun();
        });

      nextFrameButton.addEventListener("click", function() {
          gridView.setEditable(false);
          vm.requestFrame(true);
        });

      resetButton.addEventListener("click", function() {
          vm.reset();
          gridView.updateGrid(vm.getGrid(), vm.getGrid(), vm.get("showGrid"));
        });

      editSeedButton.addEventListener("click", function () {
        vm.reset();
        gridView.updateGrid(vm.getGrid(), vm.getGrid(), vm.get("showGrid"));
        gridView.setEditable(true);
      });

      settingsUpdateButton.addEventListener("click", function() {
          vm.set("gridSize", parseInt(gridSizeInput.value, 10));
          vm.set("periodDelay", parseInt(periodDelayInput.value, 10));
          // TODO: re-enable when non-grid artifacts fixed
          //vm.set("showGrid", showGridCheckboxInput.checked);
          vm.set("colorizeUpdates", colorizeUpdatesCheckboxInput.checked);
          settingsUpdateButton.innerHTML = "Updated!"

          gridView.updateGrid(null, vm.getGrid(), vm.get("showGrid"));

          setTimeout(function() {
            settingsUpdateButton.innerHTML = "Update"
          }, 500);
        });

      shareSeedButton.addEventListener("click", function () {
        var seedGrid = vm.getSeedGrid(),
            w = vm.get("gridSize"),
            h = w,
            encodedGrid = gridEncoder.encode(seedGrid, w, h);

        shareUrlTextarea.value = [
          window.location.protocol,
          "//",
          window.location.host,
          window.location.pathname,
          "#",
          encodedGrid].join('');
        shareUrlContainerLabel.setAttribute("class", "");

        shareUrlTextarea.focus();
        shareUrlTextarea.select();
      });

      if (window.location.hash !== "") {
        loadGridFromHash();
      }

      gridView.updateGrid(null, vm.getGrid(), vm.get("showGrid"));
      gridView.subscribe(GridView.EVENT_CELL_CLICKED, gridViewOnCellClicked);
    }

    function viewModelOnPropertyChanged(args) {
      switch (args.propertyName) {
        case "running":
          return runPauseButton.setAttribute(
              "class", 
              args.value ? "running" : "");

        case "period": return periodOutput.innerHTML = args.value;

        case "gridSize":
          gridView.setSize(args.value);
          gridSizeInput.value = args.value;
          break;

        case "periodDelay": return periodDelayInput.value = args.value;

        case "showGrid":
          if (args.value)  {
            // TODO: fix artifacts when grid is disabled,
            // then re-enable this setting
            //showGridCheckboxInput.setAttribute("checked", true);
          } else {
            //showGridCheckboxInput.removeAttribute("checked");
          }

          gridView.setShowGrid(args.value);
          break;

        case "colorizeUpdates":
          if (args.value) {
            return colorizeUpdatesCheckboxInput.setAttribute("checked", true);
          }

          return colorizeUpdatesCheckboxInput.removeAttribute("checked");
      }
    }

    function viewModelOnPeriodRequested() {
      var oldGrid,
          grid = vm.getGrid();

      // We only need a clone of the grid when we need to colorize it
      // (to check differences between pixels)
      if (vm.get("colorizeUpdates")) oldGrid = vm.cloneGrid(grid);

      grid = transform(grid, vm.get('gridSize'));

      gridView.updateGrid(oldGrid, grid, vm.get("showGrid"));
      vm.setGrid(grid);
    }

    function gridViewOnCellClicked(cellCoords) {
      shareUrlContainerLabel.setAttribute("class", "hidden");

      vm.toggleSeedGridCell(cellCoords.x, cellCoords.y);
      gridView.toggleCell(
          cellCoords.x,
          cellCoords.y,
          vm.getSeedGridCell(cellCoords.x, cellCoords.y));
    }

    // Util function to retrieve a view
    function $(id) {
      return rootNode.getElementById(id);
    }

    function loadGridFromHash() {
      var encodedGrid = window.location.hash.slice(1),
          gridInfo;

      if (encodedGrid.length === 0) return;

      gridInfo = gridEncoder.decode(encodedGrid);

      vm.set("gridSize", gridInfo.width);
      vm.setSeedGrid(gridInfo.grid);

      gridView.updateGrid(null, vm.getGrid(), vm.get("showGrid"));
    }

    constructor();
  }

  GOL.namespace("ViewController");
  GOL.ViewController = ViewController;
}(
    window.GOL,
    window.GOL.ViewModel,
    window.GOL.ui.GridView,
    window.GOL.transforms.gameOfLifeTransform,
    window.GOL.sharing.gridEncoder));
