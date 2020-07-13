import jsonQuery from 'json-query'
import gearItemSuffixDB from '../db/gearItemSuffix.json'

import common from './common'
import gearItem from './gearItem'
import GearItemBonus from '../interface/GearItemBonus'
import GearItemSuffix from '../interface/GearItemSuffix'

const fromItemNameAndBonusValue = (itemName: string, bonusValue: number): GearItemSuffix | undefined => {
  const itemSuffixes: GearItemSuffix[] = fromItemName(itemName)

  for (let i = 0; i < itemSuffixes.length; i++) {
    for (let x = 0; x < itemSuffixes[i].bonus.length; x++) {
      if (itemSuffixes[i].bonus[x].value === bonusValue) {
        return itemSuffixes[i]
      }
    }
  }

  return undefined
}

const fromItemName = (itemName: string): GearItemSuffix[] => {
  const suffixType = common.gearItemSuffixTypeFromText(itemName)
  const result: GearItemSuffix[] = jsonQuery(`[* type = ${suffixType}]`, { data: gearItemSuffixDB }).value
  return result
}

const fromText = (id: string, type: string, bonus: string, bonus2?: string, bonus3?: string): GearItemSuffix => {
  const _bonus: GearItemBonus[] = []
  _bonus.push(gearItem.bonusFromText(bonus))
  if (bonus2) {
    _bonus.push(gearItem.bonusFromText(bonus2))
  }
  if (bonus3) {
    _bonus.push(gearItem.bonusFromText(bonus3))
  }

  return {
    id: Number(id),
    type: common.gearItemSuffixTypeFromText(type),
    bonus: _bonus
  }
}

export default {
  fromText,
  fromItemNameAndBonusValue,
  fromItemName
}
