# ScopeCraft Telescope Designer

ScopeCraft is a lightweight browser application for quickly mocking up telescope designs. It uses [Maker.js](https://github.com/microsoft/maker.js/) to draw parts of the telescope and [Tailwind CSS](https://tailwindcss.com/) for styling.

## Features

- Adjust mirror diameter and focal length using sliders.
- Switch between refractor and Newtonian optical layouts.
- Choose Dobsonian or Alt-Az mount styles.
- Rotate the entire design to any angle.
- Pick a custom color for the tube.
- Optional finder scope that can be toggled on or off.
- Live SVG preview that updates as you tweak settings.
- Export the current design as an SVG file.

## Getting Started

No build step is required. Simply open `index.html` in any modern web browser. The controls on the left update the drawing on the right in real time.

## Usage

1. Move the **Mirror Diameter** and **Focal Length** sliders to size the telescope optics.
2. Select the **Optical Type** and **Mount Style** from the dropdowns.
3. Drag the **Orientation** slider to rotate the whole model.
4. Use **Tube Color** to pick the stroke color for the SVG output.
5. Toggle **Show Finder Scope** if you want a small finder on top of the tube.
6. Click **Export SVG** to download the current design as an SVG file.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
