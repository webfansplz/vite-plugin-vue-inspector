import { fileURLToPath } from "url"
import { resolve, dirname } from "path"
import { io } from "fsxx"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJSON = resolve(__dirname, "../package.json")
const nuxtExample = resolve(__dirname, "../example/nuxt/package.json")
const vue2Example = resolve(__dirname, "../example/vue2/package.json")
const vue3Example = resolve(__dirname, "../example/vue3/package.json")

async function start() {
  io.json.spaces = 2

  const { data: pkg } = await io.json<{ name: string; version: string }>`${packageJSON}`

  const version = pkg.version
  const pkgName = pkg.name

  //  for vue2 example

  const { data: vue2Pkg, save: saveV2 } = await io.json<{ devDependencies: Record<string, string> }>`${vue2Example}`

  vue2Pkg.devDependencies[pkgName] = version
  await saveV2()

  //  for vue3 example

  const { data: vue3Pkg, save: saveV3 } = await io.json<{ devDependencies: Record<string, string> }>`${vue3Example}`

  vue3Pkg.devDependencies[pkgName] = version
  await saveV3()

  // for nuxt example
  const { data: nuxtPkg, save: saveNuxt } = await io.json<{ devDependencies: Record<string, string> }>`${nuxtExample}`

  nuxtPkg.devDependencies[pkgName] = version
  await saveNuxt()
}

start()
