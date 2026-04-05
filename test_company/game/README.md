Game project scaffold

Engine: Godot 4 (lightweight, good 2D support, single binary export)

Structure:
- game/ (Godot project)
  - project.godot
  - scenes/
  - scripts/
  - assets/
  - exports/

Run / dev notes:
- Install Godot 4 (https://godotengine.org)
- Open the `game` folder in Godot editor
- Example next steps: create a Player scene, add simple input and movement script, add a Run target export for Linux/macOS

Decision: start with Godot 4 for fast prototyping and small build-time overhead. If a different engine is preferred, update README and move files accordingly.