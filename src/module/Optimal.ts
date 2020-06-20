import Tools from './Tools'
import Locked from './Locked'

import Equipment from '../class/Equipment'
import Cast from '../class/Cast'

import ClassicOptions from '../interface/ClassicOptions'
import ItemSearch from '../interface/ItemSearch'
import EquipmentArray from '../interface/EquipmentArray'

import ItemSlot from '../enum/ItemSlot'

/*
interface OptimalEquipment {
  equipment: Equipment
  items: ItemJSON[]
  enchants: EnchantJSON[]
}
*/

const sortByDPS = (a: EquipmentArray, b: EquipmentArray) => {
  return (b.dps ? b.dps : 0) - (a.dps ? a.dps : 0)
}

const itemsForSlot = (options: ClassicOptions) => {
  /* itemSearchSlot is only set when a user clicks a slot to equip an item. If that's not
   * the case then we don't need to do anything */
  let slot = options.equipment.itemSearchSlot
  if (slot === ItemSlot.None) {
    return undefined
  }

  /* We need the stat weights MINUS the slot we're getting items for. So make a private
   * copy of options, unequip the slot, and run the equipment optimization function.
   * Our stat weights will be contained in the itemSearch. */
  let tmpOptions: ClassicOptions = Tools.cloneObject(options)
  Locked.unequipItem(tmpOptions.equipment.lockedItems, slot)
  let tmpEquipment: Equipment = equipment(tmpOptions)
  let tmpItemSearch: ItemSearch = tmpEquipment.itemSearch

  /* and finally retrieve the items for this slot, using the weights
   * we just got. Copy the original version of what we overwrote above
   * and unlock the slot so it doesn't return a user locked item */
  tmpItemSearch.lockedItems = Tools.cloneObject(options.equipment.lockedItems)
  Locked.unlockItem(tmpItemSearch.lockedItems, tmpOptions.equipment.itemSearchSlot)
  return Equipment.getWeightedItemsBySlot(slot, tmpItemSearch)
}

const enchantsForSlot = (options: ClassicOptions) => {
  /* Same process as above, but for enchants */
  let slot = options.equipment.enchantSearchSlot
  if (slot === ItemSlot.None) {
    return undefined
  }

  let tmpOptions: ClassicOptions = Tools.cloneObject(options)
  Locked.unequipEnchant(tmpOptions.equipment.lockedEnchants, slot)
  let tmpEquipment: Equipment = equipment(tmpOptions)
  let tmpItemSearch: ItemSearch = tmpEquipment.itemSearch

  tmpItemSearch.lockedEnchants = Tools.cloneObject(options.equipment.lockedEnchants)
  Locked.unlockEnchant(tmpItemSearch.lockedEnchants, tmpOptions.equipment.enchantSearchSlot)
  return Equipment.getWeightedEnchantsBySlot(slot, tmpItemSearch)
}

/* TODO: If itemSearchSlot isn't none, need to ignore that slot when weighting */
const equipment = (options: ClassicOptions) => {
  let myOptions = Tools.cloneObject(options)
  let maxTries = 5
  let spellCast = undefined
  let equipmentArray = new Array<EquipmentArray>()

  console.log(`--- starting gear optimization with maximum of ${maxTries} tries ---`)
  for (let i = 0; i <= maxTries - 1; i++) {
    console.log(
      `Attempt ${i + 1}: spellHitWeight=${spellCast ? spellCast.spellHitWeight : 15}, spellCritWeight=${
        spellCast ? spellCast.spellCritWeight : 10
      }`
    )
    spellCast = new Cast(myOptions, {
      spellHitWeight: spellCast ? spellCast.spellHitWeight : undefined,
      spellCritWeight: spellCast ? spellCast.spellCritWeight : undefined,
      spellCastTime: spellCast ? spellCast.effectiveCastTime : undefined,
      spellCrit: spellCast ? spellCast.effectiveSpellCrit : undefined
    })

    equipmentArray.push({
      dps: spellCast.dps.effective.avg,
      equipment: spellCast.character.equipment
    })
  }

  console.log(`--- finished gear optimization ---`)
  equipmentArray.sort(sortByDPS)

  return equipmentArray[0].equipment
}

export default {
  sortByDPS,
  itemsForSlot,
  enchantsForSlot,
  equipment
}
