# Game of Life

This is an implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life), which I threw together mostly on a Sunday afternoon. 

Check it out at [gol.michd.me](http://gol.michd.me)!

Some of the code structure and ideas may look familiar if you're used to working with C# as I am, in daily programming. It's certainly a nice language. The goal in my architectural decisions was to have a proper separation of concerns. It vaguely follows the MVC (model view controller)  pattern.

The actual algorithm implementing Conway's 4 rules lives in its own files, and is fairly plug and play for other transforming algorithms.

## Existing features
- Period display (shows the frame count into the cellular automation process)
- Run/Pause
- Frame by frame progress using a button
- Rudimentary seed editing
- Reset to seed
- Configurable delay between periods
- Configurable grid size (number of cells to a side of a square, max 200x200)
- Colorised updates indicating cells that have just become alive or died (toggle-able)

## Future ideas

These are in order of how much I want to do them (first = do first)

- Sharing of seed grids via URL (this will be really cool)
- Better editing (click and drag to draw several cell states)
- Toggle-able gridlines (This is already in code, but disabled/hidden because of artifacting issues)
- Ability to set size to some non-square size
- Resizable canvas / full-screen mode

## Contributing
You are welcome to send pull requests for any of the "future ideas" listed. Please spend some time reading the existing code and try to stick to the same code style. Most basic: indent = 2 spaces. If there's enough/any interest I'll add a proper contributing document with some standards.

Thanks for your interest!
