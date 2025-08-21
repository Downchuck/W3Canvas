# Undone tasks

### `fillRect` and `strokeRect`

The `fillRect` method uses the scanline fill algorithm. However, there is a known regression where it fails when a translation is applied to the context. `strokeRect` appears to work correctly.
