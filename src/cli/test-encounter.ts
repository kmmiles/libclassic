import libclassic from '..'

const s = libclassic.defaultSettings
const r = libclassic.run(s)
console.log(JSON.stringify(r, null, 2))
