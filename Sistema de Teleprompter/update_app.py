from pathlib import Path
path = Path( src/App.tsx)
text = path.read_text(encoding= utf-8)
start_marker =  // Agregar cada script como un item del Run Order
end_marker =  // Activar el primer script cargado
if start_marker not in text or end_marker not in text:
    raise SystemExit( markers missing)
prefix, rest = text.split(start_marker, 1)
_, suffix = rest.split(end_marker, 1)
replacement = (
