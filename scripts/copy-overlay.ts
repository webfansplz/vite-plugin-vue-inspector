import path from "path"
import fs from "fs-extra"

const overlayComponent = path.resolve(__dirname, "../src/Overlay.vue")
const outputDir = path.resolve(__dirname, "../dist")
async function start() {
  await fs.copyFile(overlayComponent, path.join(outputDir, "InspectorOverlay.vue"))
}

start()
