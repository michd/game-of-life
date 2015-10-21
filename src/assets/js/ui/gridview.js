(function (GOL, EventDispatcher) {
  // A wrapping "class" for our canvas, to abstract the raw drawing tasks
  // the rest of the code has no business with, as well as provide an interface
  // for user interaction events with the coordinate calculations already taken
  // care of.
  // Separation of concerns!
  function GridView(canvas) {
    var GRID_COLOR = "#000007",
        BORN_COLOR = "#648368",
        SURVIVED_COLOR = "#646483",
        KILLED_COLOR = "#321313",
        DEAD_COLOR = "#131332",
        CURSOR_COLOR = "#FFFFFF";

    var ctx,
        size,
        cellWidth,
        cellHeight,
        eventDispatcher = new EventDispatcher(),
        drawGrid = true,
        editable = false,
        hoverCell = null,
        self = this;

    function constructor() {
      ctx = canvas.getContext("2d");

      self.setSize(GOL.CONSTANTS.DEFAULT_SIZE);

      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
    }

    // Public
    // Colors a single cell, and optionally, draws a grid stroke
    // skipGrid is generally set to true when drawing a single cell,
    // not as part of the entire grid update
    function drawCell(x, y, color, skipGrid) {
      ctx.fillStyle = color;
      ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);

      if (drawGrid && !skipGrid)  {
        ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }

    // Public
    function toggleCell(x, y, on) {
      if (!editable) return; // Really some kind of illegal state error
      drawCell(x, y, on ? SURVIVED_COLOR : DEAD_COLOR);
    }

    // Public
    // Re-renders the entire grid, pixel by pixel
    // If an oldgrid is specified, will color changes: green for newly alive,
    // red for newly dead
    function updateGrid(oldGrid, newGrid) {
      var hasOldGrid = !!oldGrid,
          xIndex, yIndex, wasOn, isOn, color;

      ctx.fillStyle = DEAD_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (xIndex = 0; xIndex < size; xIndex++) {
        for (yIndex = 0; yIndex < size; yIndex++) {
          wasOn = hasOldGrid ? oldGrid[xIndex][yIndex] : newGrid[xIndex][yIndex];
          isOn = newGrid[xIndex][yIndex];

          if (wasOn && isOn) color = SURVIVED_COLOR;
          if (!wasOn && isOn) color = BORN_COLOR;
          if (wasOn && !isOn) color = KILLED_COLOR;
          if (!wasOn && !isOn) color = DEAD_COLOR;

          if (color !== DEAD_COLOR) drawCell(xIndex, yIndex, color, true);
        }
      }

      if (drawGrid) drawGridLines();
    }

    // Public
    function setSize(newSize) {
      if (typeof newSize !== "number") {
        throw new TypeError(
            "GridView.setSize expects a number, got " + typeof(newSize));
      }

      size = Math.round(newSize);
      cellWidth = canvas.width / size;
      cellHeight = canvas.height / size;
    }

    // Public
    // When turned on, sets up some mouse event listeners to show a cursor,
    // and report back on user interaction with the grid
    // TODO: support for click and drag so you don't need to click for each
    // cell
    function setEditable(on) {
      if (editable === !!on) return;

      editable = on;

      if (editable) {
        canvas.addEventListener("click", canvasOnClick);
        canvas.addEventListener("mousemove", canvasOnMouseMove);
        canvas.addEventListener("mouseout", canvasOnMouseOut);
      } else {
        canvas.removeEventListener("click", canvasOnClick);
        canvas.removeEventListener("mousemove", canvasOnMouseMove);
        canvas.removeEventListener("mouseout", canvasOnMouseOut);
      }

      canvas.setAttribute("class", editable ? "editing" : "");
      eventDispatcher.trigger(
          on ? GridView.EVENT_STARTED_EDITING : GridView.EVENT_STOPPED_EDITING);
    }

    // Public
    function setShowGrid(on) {
      drawGrid = !!on;

      if (drawGrid) drawGridLines();
    }

    // Private
    function drawLine(x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Private
    function drawGridLines() {
      for (var x = 1; x < size; x++) {
        drawLine(x * cellWidth, 0, x * cellWidth, canvas.height);
      }

      for (var y = 1; y < size; y++) {
        drawLine(0, y * cellHeight, canvas.height, y * cellHeight);
      }
    }

    // Private
    function getCellCoords(pixelCoords) {
      return { 
          x: Math.floor(pixelCoords.x / cellWidth),
          y: Math.floor(pixelCoords.y / cellHeight)
        };
    }
    
    // Private
    // Gets the pixel color of the pixel in the middle of the cell
    function getCellColor(coords) {
      var middleX = Math.round(coords.x * cellWidth + cellWidth / 2),
          middleY = Math.round(coords.y * cellHeight + cellHeight / 2),
          pixel = ctx.getImageData(middleX, middleY, 1, 1).data;

      return rgbToHex(pixel[0], pixel[1], pixel[2]);
    }

    // Private
    // TODO: if needed, move out to somewhere re-usable
    // Thanks, http://stackoverflow.com/a/6736135/1019228
    // One of those things I could've done myself, but I knew it was something
    // that would be common, and SO would have the most elegant solution.
    function rgbToHex(r, g, b) {
      if (r > 255 || r < 0 || g > 255 || g < 0 || b > 255 || b < 0) {
        throw new Error("Invalid color component");
      }

      r = Math.round(r) << 16;
      g = Math.round(g) << 8;
      b = Math.round(b);

      return "#" + ("000000" + (r | g | b).toString(16)).slice(-6);
    }
    
    // Private
    // TODO: if needed, move out to somewhere re-usable
    function coordsInElem(elem, clientX, clientY) {
      var elemClientRect = elem.getClientRects()[0];
      
      return { x: Math.floor(clientX - elemClientRect.left), y: Math.round(clientY - elemClientRect.top) };
    }

    // Private
    function canvasOnClick(e) {
      var cellCoords = getCellCoords(
          coordsInElem(canvas, e.clientX, e.clientY));

      hoverCell = null;
      eventDispatcher.trigger(GridView.EVENT_CELL_CLICKED, cellCoords, self);
    }

    // Private
    function canvasOnMouseMove(e) {
      var cellCoords = getCellCoords(
          coordsInElem(canvas, e.clientX, e.clientY));

      if (hoverCell) {
        if (cellCoords.x !== hoverCell.x || cellCoords.y !== hoverCell.y) {
          drawCell(hoverCell.x, hoverCell.y, hoverCell.originalColor);
        } else {
          return; // Nothing changed
        }
      }

      hoverCell = { 
        x: cellCoords.x,
        y: cellCoords.y,
        originalColor: getCellColor(cellCoords)
      };

      drawCell(hoverCell.x, hoverCell.y, CURSOR_COLOR);
    }

    // Private
    function canvasOnMouseOut(e) {
      if (!hoverCell) return;

      drawCell(hoverCell.x, hoverCell.y, hoverCell.originalColor);
      hoverCell = null;       
    }

    this.updateGrid = updateGrid;
    this.drawCell = drawCell;
    this.toggleCell = toggleCell;
    this.setSize = setSize;
    this.setShowGrid = setShowGrid;
    this.setEditable = setEditable;

    this.subscribe = eventDispatcher.subscribe;
    this.unsubscribe = eventDispatcher.unsubscribe;

    constructor();
  }

  GridView.EVENT_STARTED_EDITING = "e:GridView:StartedEditing";
  GridView.EVENT_STOPPED_EDITING = "e:GridView:StoppedEditing";
  GridView.EVENT_CELL_CLICKED = "e:GridView:CellClicked";

  GOL.namespace("ui.GridView");
  GOL.ui.GridView = GridView;
}(window.GOL, window.GOL.EventDispatcher));
