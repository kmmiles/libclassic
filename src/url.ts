import pako from 'pako'
import { Base64 } from 'js-base64'

import utils from './utils'
import common from './common'
import Equipment from './class/Equipment'
import ClassicOptions from './interface/ClassicOptions'
import LockedItems from './interface/LockedItems'
import LockedEnchants from './interface/LockedEnchants'
import ParaminOptions from './interface/ParaminOptions'

/* Gzip and encode string for use as a URI parameter */
const stringToParamin = (str: string, opts?: ParaminOptions): string => {
  let binaryString
  if (opts && opts.version === 1) {
    binaryString = pako.deflate(str, { to: 'string', level: 9 })
  } else {
    binaryString = pako.deflateRaw(str, { to: 'string', level: 9 })
  }

  /* base64 encode gzipped jsonString */
  const base64string = btoa(binaryString)

  /* encode base64 string for URL */
  const encoded = utils.encodeURI(base64string)

  return encoded
}

const paraminToString = (paramin: string, opts?: ParaminOptions): string => {
  let asciiString

  /* param -> URI decoded param */
  const decodedParam = utils.decodeURI(paramin)

  /* decoded param -> binary string */
  const binaryString = Base64.atob(decodedParam)

  /* binary string -> ascii string */
  if (opts && opts.version === 1) {
    asciiString = pako.inflate(binaryString, { to: 'string' })
    asciiString = JSON.parse(asciiString)
  } else {
    asciiString = pako.inflateRaw(binaryString, { to: 'string' })
  }

  return asciiString
}

const lockedFromGearParam = (param: string, opts?: ParaminOptions): Object => {
  const myString = paraminToString(param, opts)
  const arr = JSON.parse(myString)
  let lockedEnchants: LockedEnchants | undefined = undefined

  const lockedItems: LockedItems = {
    head: arr[0],
    hands: arr[1],
    neck: arr[2],
    waist: arr[3],
    shoulder: arr[4],
    legs: arr[5],
    back: arr[6],
    feet: arr[7],
    chest: arr[8],
    wrist: arr[9],
    finger: arr[10],
    finger2: arr[11],
    mainhand: arr[12],
    offhand: arr[13],
    trinket: arr[14],
    trinket2: arr[15],
    idol: arr[16]
  }

  /* if v2, add enchants here */
  if (opts && opts.version === 2) {
    lockedEnchants = {
      head: arr[17],
      hands: arr[18],
      shoulder: arr[19],
      legs: arr[20],
      back: arr[21],
      feet: arr[22],
      chest: arr[23],
      wrist: arr[24],
      mainhand: arr[25]
    }
  }

  return {
    items: lockedItems,
    enchants: lockedEnchants
  }
}

const gearParamFromLocked = (
  lockedItems: LockedItems,
  lockedEnchants: LockedEnchants | null,
  opts?: ParaminOptions
): string => {
  const lockedArr: string[] = []
  lockedArr.push(lockedItems.head)
  lockedArr.push(lockedItems.hands)
  lockedArr.push(lockedItems.neck)
  lockedArr.push(lockedItems.waist)
  lockedArr.push(lockedItems.shoulder)
  lockedArr.push(lockedItems.legs)
  lockedArr.push(lockedItems.back)
  lockedArr.push(lockedItems.feet)
  lockedArr.push(lockedItems.chest)
  lockedArr.push(lockedItems.wrist)
  lockedArr.push(lockedItems.finger)
  lockedArr.push(lockedItems.finger2)
  lockedArr.push(lockedItems.mainhand)
  lockedArr.push(lockedItems.offhand)
  lockedArr.push(lockedItems.trinket)
  lockedArr.push(lockedItems.trinket2)
  lockedArr.push(lockedItems.idol)

  /* if v2, do enchants here */
  if (opts && opts.version === 2 && lockedEnchants !== null) {
    lockedArr.push(lockedEnchants.head)
    lockedArr.push(lockedEnchants.hands)
    lockedArr.push(lockedEnchants.shoulder)
    lockedArr.push(lockedEnchants.legs)
    lockedArr.push(lockedEnchants.back)
    lockedArr.push(lockedEnchants.feet)
    lockedArr.push(lockedEnchants.chest)
    lockedArr.push(lockedEnchants.wrist)
    lockedArr.push(lockedEnchants.mainhand)
  }

  return stringToParamin(JSON.stringify(lockedArr), opts)
}

const publicURL = (equipment: Equipment): string => {
  const lockedItems: LockedItems = {
    head: equipment.head.customId,
    hands: equipment.hands.customId,
    neck: equipment.neck.customId,
    waist: equipment.waist.customId,
    shoulder: equipment.shoulder.customId,
    legs: equipment.legs.customId,
    back: equipment.back.customId,
    feet: equipment.feet.customId,
    chest: equipment.chest.customId,
    wrist: equipment.wrist.customId,
    finger: equipment.finger.customId,
    finger2: equipment.finger2.customId,
    mainhand: equipment.mainhand.customId,
    offhand: equipment.offhand.customId,
    trinket: equipment.trinket.customId,
    trinket2: equipment.trinket2.customId,
    idol: equipment.idol.customId
  }

  const lockedEnchants: LockedEnchants = {
    head: equipment.head.enchantCustomId,
    hands: equipment.hands.enchantCustomId,
    shoulder: equipment.shoulder.enchantCustomId,
    legs: equipment.legs.enchantCustomId,
    back: equipment.back.enchantCustomId,
    feet: equipment.feet.enchantCustomId,
    chest: equipment.chest.enchantCustomId,
    wrist: equipment.wrist.enchantCustomId,
    mainhand: equipment.mainhand.enchantCustomId
  }

  return gearUrl(lockedItems, lockedEnchants, { version: 2 })
}

const gearUrl = (lockedItems: LockedItems, lockedEnchants: LockedEnchants, opts?: ParaminOptions) => {
  if (opts && opts.version === 2) {
    return `gearv2=${gearParamFromLocked(lockedItems, lockedEnchants, opts)}`
  }
  return `gear=${gearParamFromLocked(lockedItems, null, opts)}`
}

const optionFromURL = (name: string): any => {
  const uri = window.location.search.substring(1)
  const params = new URLSearchParams(uri)
  const value = params.get(name.toLowerCase())

  if (value === null) {
    return null
  }

  switch (name.toLowerCase()) {
    case 'phase':
    case 'pvprank':
      return Number(value)
    case 'randomenchants':
    case 'worldbosses':
    case 'raids':
      return value === 'true' ? true : false
    case 'gear':
      return value ? lockedFromGearParam(value, { version: 1 }) : null
    case 'gearv2':
      return value ? lockedFromGearParam(value, { version: 2 }) : null
    default:
      return value
  }
}

const defaultClassicOptions = (): ClassicOptions => {
  const o: ClassicOptions = utils.cloneObject(common.defaultOptions)

  /* gear */
  const gearv1 = optionFromURL('gear')
  const gearv2 = optionFromURL('gearv2')

  if (gearv2) {
    o.equipment.lockedItems = gearv2.items
    o.equipment.lockedEnchants = gearv2.enchants
  } else if (gearv1) {
    o.equipment.lockedItems = gearv1.items
  }

  /* other options*/
  const phase = optionFromURL('phase')
  if (phase !== null && phase !== undefined) {
    o.phase = phase
  }

  const raids = optionFromURL('raids')
  if (raids !== null && raids !== undefined) {
    o.equipment.raids = raids
  }

  const worldbosses = optionFromURL('worldbosses')
  if (worldbosses !== null && worldbosses !== undefined) {
    o.equipment.worldBosses = worldbosses
  }

  const randomenchants = optionFromURL('randomenchants')
  if (randomenchants !== null && randomenchants !== undefined) {
    o.equipment.randomEnchants = randomenchants
  }

  const tailoring = optionFromURL('tailoring')
  if (tailoring !== null && tailoring !== undefined) {
    o.equipment.tailoring = tailoring
  }

  const pvprank = optionFromURL('pvprank')
  if (pvprank !== null && pvprank !== undefined) {
    o.character.pvpRank = pvprank
  }

  return o
}

export default {
  stringToParamin,
  paraminToString,
  lockedFromGearParam,
  gearParamFromLocked,
  optionFromURL,
  publicURL,
  defaultClassicOptions
}