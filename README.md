# Guitar Neck Calculator

Making 3D Models for guitar design?  This calculator will create cross-sections of a guitar neck which you can import into your 3D modeling (or CAD) software to then extrude to create an accurate guitar neck.

Useful for people milling guitars via CNC.  Artists, whatever.

Features:
- Fretboard Radius
- Fretboard Thickness
- Neck Shape  (**work in progress**)
- Neck Depth
- Neck Width
- export PNG, JPG, BMP
- export DXF  (**work in progress**)

# How To Run

- Point your browser to `index.html` in this directory

or

- Start a server on <http://localhost:8000/>   (uses `python`)
  - `./startHTTP.sh`
  - open `http://localhost:8000/` in your web browser


# Development Instructions
- Install `python` if not already on your system
- Install `nodejs` if you haven't (this gives you the `npm` command)

- Install dependencies   (uses nodejs `npm`)
  - `npm install`

- Start a server on <http://localhost:8000/>   (uses `python`)
  - `npm start`

# Future Work
- TODO: All shapes are **eyeballed from my own memory**.  Need to trace in some actual neck profile shapes when i get some time in front of inkscape (see `drawCshape()` functions, and friends)
- TODO: DXF exporter is unfinished... currently you'll need to trace your vectors over the exported Image...
- TODO: Currently `Depth` is measured from the bottom of the fretboard curve.  But perhaps it should be measured from the top of the fretboard rounded surface??  I could put this on an option toggle if both are valid.


