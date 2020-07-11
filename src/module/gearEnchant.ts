import enums from './enums'

import GearEnchantJSON from '../interface/GearEnchantJSON'
import GearEnchant from '../interface/GearEnchant'
import gearEnchantDefault from '../obj/gearEnchant.json'

const fromDefault = (): GearEnchant => {
  return gearEnchantDefault
}

const fromJSONArray = (gearEnchantJSONArray: GearEnchantJSON[]): GearEnchant[] => {
  const newObj: GearEnchant[] = []

  for (let x = 0; x <= gearEnchantJSONArray.length; x++) {
    newObj.push(fromJSON(gearEnchantJSONArray[x]))
  }

  return newObj
}

const fromJSON = (enchantJSON?: GearEnchantJSON): GearEnchant => {
  return {
    id: enchantJSON ? enchantJSON.id : 0,
    name: enchantJSON ? enchantJSON.name : '',
    gearSlot: enchantJSON ? enums.gearSlotFromItemSlot(enchantJSON.itemSlot) : 0,
    itemSlot: enchantJSON ? enchantJSON.itemSlot : 0,
    phase: enchantJSON ? enchantJSON.phase : 0,
    icon: enchantJSON ? enchantJSON.icon : '',
    score: 0,
    text: enchantJSON ? enchantJSON.text : '',
    exploit: enchantJSON && enchantJSON.exploit ? enchantJSON.exploit : false,
    spellHealing: enchantJSON && enchantJSON.spellHealing ? enchantJSON.spellHealing : 0,
    armor: enchantJSON && enchantJSON.armor ? enchantJSON.armor : 0,
    spellDamage: enchantJSON && enchantJSON.spellDamage ? enchantJSON.spellDamage : 0,
    arcaneDamage: enchantJSON && enchantJSON.arcaneDamage ? enchantJSON.arcaneDamage : 0,
    natureDamage: enchantJSON && enchantJSON.natureDamage ? enchantJSON.natureDamage : 0,
    spellHit: enchantJSON && enchantJSON.spellHit ? enchantJSON.spellHit : 0,
    spellCrit: enchantJSON && enchantJSON.spellCrit ? enchantJSON.spellCrit : 0,
    spellPenetration: enchantJSON && enchantJSON.spellPenetration ? enchantJSON.spellPenetration : 0,
    stamina: enchantJSON && enchantJSON.stamina ? enchantJSON.stamina : 0,
    intellect: enchantJSON && enchantJSON.intellect ? enchantJSON.intellect : 0,
    spirit: enchantJSON && enchantJSON.spirit ? enchantJSON.spirit : 0,
    mp5: enchantJSON && enchantJSON.mp5 ? enchantJSON.mp5 : 0
  }
}

export default {
  fromDefault,
  fromJSON,
  fromJSONArray
}
