(function (GOL) {
  // Algorithm for Conway's Game of Life rules
  // Given a grid (2 dimensional array of bools), this will calculate a new
  // grid of the same size by applying Conway's 4 rules for the Game of Life
  // to calculate which cell should be on and which cell should be off next.
  //
  // I've structured the code in such a way that it is easy to add files with
  // differing algorithms, making it pretty plug-and-play with the rest of the
  // code.
  //
  // This one implements the rules set forth in the Wikipedia article on
  // Conway's Game of Life;
  // see https://en.wikipedia.org/wiki/Conway's_Game_of_Life
  //
  // Important note: This implementation checks neighbours at the edge of the
  // grid by wrapping around to the other side of the grid. To disable this,
  // pass `false` as the last parameter to `isAlive`.
  //
  // TODO: make this wrapping functionality a user setting, passable as an
  // argument to the transform function, rather than hardcoded in here
  function gameOfLifeTransform(grid, size) {
    var xIndex, yIndex,
        newGrid = [];

    function isAlive(x, y, wrap) {
      if (wrap) {
        while (x < 0) x += size;
        while (x >= size) x -= size;
        while (y < 0) y += size;
        while (y >= size) y -= size;
      }

      if (x < 0 || x >= size || y < 0 || y >= size) return false;

      return grid[x][y];
    }

    // Calculates the next state for a single cell
    function calculateCell(x, y) {
      var alive = isAlive(x, y),
          neighbours = 0;

      function getNeighbourCount() {
        var i, j,
            c = 0;

        for (i = x - 1; i <= x + 1; i++) {
          for (j = y - 1; j <= y + 1; j++) {
            // Current coordinates are of this cell itself, not one of its
            // neighbours, so doesn't qualify for the neighbour check
            if (i === x && j === y) continue;

            if (isAlive(i, j, true)) c++;
          }
        }

        return c;
      }

      neighbours = getNeighbourCount();

      // Rule 1:
      // "Any live cell with fewer than two live neighbours dies, as if caused
      // by under-population."
      if (alive && neighbours < 2) return false;

      // Rule 2:
      // "Any live cell with two or three live neighbours lives on to the next
      // generation."
      if (alive && neighbours == 2 || neighbours == 3) return true;

      // Rule 3:
      // "Any live cell with more than three live neighbours dies, as if by
      // over-population."
      if (alive && neighbours > 3) return false;

      // Rule 4:
      // "Any dead cell with exactly three live neighbours becomes a live cell,
      // as if by reproduction."
      if (!alive && neighbours == 3) return true;
    }

    for (xIndex = 0; xIndex < size; xIndex++) {
      newGrid.push([]);

      for (yIndex = 0; yIndex < size; yIndex++) {
        newGrid[xIndex][yIndex] = calculateCell(xIndex, yIndex);
      }
    }

    return newGrid;
  }

  GOL.namespace("transforms.gameOfLifeTransform");
  GOL.transforms.gameOfLifeTransform = gameOfLifeTransform;
}(window.GOL));
