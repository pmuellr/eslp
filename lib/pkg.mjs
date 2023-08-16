// see: https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/

import { createRequire } from "module"
const require = createRequire(import.meta.url)
export const pkg = require("../package.json")
