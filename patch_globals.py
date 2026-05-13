import os, re

files = [
    'src/engine/math.js', 'src/engine/audio.js', 'src/engine/input.js',
    'src/engine/render.js', 'src/engine/physics.js',
    'src/game/entities.js', 'src/game/levels.js', 'src/game/player.js'
]

for file in files:
    if not os.path.exists(file): continue
    with open(file, 'r') as f:
        lines = f.readlines()
        
    new_lines = []
    exports = []
    for line in lines:
        match_class = re.match(r'^class\s+([A-Za-z0-9_]+)\s*(?:extends\s+[A-Za-z0-9_]+)?\s*\{', line)
        if match_class:
            exports.append(match_class.group(1))
            
        match_const = re.match(r'^const\s+([A-Za-z0-9_]+)\s*=', line)
        if match_const:
            class_name = match_const.group(1)
            line = line.replace(f"const {class_name} =", f"window.{class_name} =")
            
        match_let = re.match(r'^let\s+([A-Za-z0-9_]+)\s*=', line)
        if match_let:
            class_name = match_let.group(1)
            line = line.replace(f"let {class_name} =", f"window.{class_name} =")
            
        new_lines.append(line)
        
    for ex in exports:
        new_lines.append(f"\nwindow.{ex} = {ex};\n")
        
    with open(file, 'w') as f:
        f.writelines(new_lines)
