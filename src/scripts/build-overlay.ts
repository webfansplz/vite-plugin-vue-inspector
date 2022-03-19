import { fileURLToPath } from "url"
import { resolve, dirname } from "path"
import fs from "fs-extra"
import { $ } from "zx"
import { io } from "fsxx"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJSON = resolve(__dirname, "../../package.json")
const output = resolve(__dirname, "../overlay/index.json")

async function start() {
  io.json.spaces = 2

  const { data: pkg, save } = await io.json<{ devDependencies: Record<string, string>}>`${packageJSON}`

  const vueVersion = pkg.devDependencies.vue

  // building for vue2
  pkg.devDependencies.vue = pkg.devDependencies["vue-template-compiler"]
  await save()
  await $`pnpm i`

  const { compileOverlayV2 } = await import("../overlay/vue2")
  const v2 = compileOverlayV2()

  // building for vue3
  pkg.devDependencies.vue = vueVersion
  await save()

  await $`pnpm i`

  const { compileOverlayV3 } = await import("../overlay/vue3")
  const v3 = compileOverlayV3()

  await fs.writeFile(output, JSON.stringify({
    v2,
    v3,
  }, null, 2), "utf-8")
}

start()
