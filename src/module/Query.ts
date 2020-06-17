import Vendor from './Vendor'
import Tools from './Tools'

import SpellJSON from '../interface/SpellJSON'
import ItemJSON from '../interface/ItemJSON'
import ItemSetJSON from '../interface/ItemSetJSON'
import EnchantJSON from '../interface/EnchantJSON'
import ItemQuery from '../interface/ItemQuery'
import SpellQuery from '../interface/SpellQuery'

import ItemSlot from '../enum/ItemSlot'
import Faction from '../enum/Faction'
import PvPRank from '../enum/PvPRank'

import spellsDB from '../db/spells.json'
import itemsDB from '../db/items.json'
import enchantsDB from '../db/enchants.json'
import itemSetsDB from '../db/itemSets.json'

/* return input, deep clone it if cloneResults is true */
const _result = (o: any, cloneResults: boolean) => {
  if (cloneResults) {
    return Tools.cloneObject(o ? o : {})
  }

  return o ? o : {}
}

const item = (opts: ItemQuery): ItemJSON | undefined => {
  let _items = items(opts)
  if (_items && _items[0]) {
    return _items[0]
  }
  return undefined
}

const items = (opts: ItemQuery): ItemJSON[] => {
  let noRandomEnchants = (itemJSON: ItemJSON) => {
    if (!itemJSON || !itemJSON.customId) {
      return true
    }

    return Tools.isLetter(itemJSON.customId.charAt(0)) ? false : true
  }

  let slot2query = (slot: ItemSlot) => {
    switch (slot) {
      case ItemSlot.Finger2:
        return `[* slot=${ItemSlot.Finger}]`
      case ItemSlot.Trinket2:
        return `[* slot=${ItemSlot.Trinket}]`
      case ItemSlot.Mainhand:
        return `[* slot=${ItemSlot.Mainhand} | slot=${ItemSlot.Onehand} | slot=${ItemSlot.Twohand}]`
      case ItemSlot.Onehand:
        return `[* slot=${ItemSlot.Mainhand} | slot=${ItemSlot.Onehand}]`
      default:
        return `[* slot=${slot}]`
    }
  }

  let singleItemQuery = (query: string): ItemJSON[] => {
    let result: ItemJSON[] = []
    let x = Vendor.jsonQuery(query, { data: itemsDB }).value
    if (x) {
      result.push(x)
    }

    return _result(result, opts.cloneResults ? opts.cloneResults : false)
  }

  /* id, customId and name are unique. if one is passed just lookup and return */
  if (opts.id) {
    return singleItemQuery(`[id=${opts.id}]`)
  } else if (opts.customId) {
    return singleItemQuery(`[customId=${opts.customId}]`)
  } else if (opts.name) {
    return singleItemQuery(`[name=${opts.name}]`)
  }

  let result: ItemJSON[] = []

  /* at this point if we don't have slot just return an empty set. we don't really
   * have a use-case for returning array of items from different slots */
  if (opts.slot === undefined) {
    return result
  }

  result = Vendor.jsonQuery(slot2query(opts.slot), { data: itemsDB }).value

  if (opts.faction !== undefined) {
    result = Vendor.jsonQuery(`[* faction = ${opts.faction} | faction = ${Faction.Horde | Faction.Alliance}]`, {
      data: result
    }).value
  }

  if (opts.phase !== undefined) {
    result = Vendor.jsonQuery(`[* phase <= ${opts.phase}]`, { data: result }).value
  }

  if (opts.pvpRank !== undefined) {
    result = Vendor.jsonQuery(`[* pvpRank <= ${opts.pvpRank}]`, { data: result }).value
  }

  if (opts.worldBosses !== undefined && opts.worldBosses === false) {
    result = Vendor.jsonQuery(`[* worldBoss = false ]`, { data: result }).value
  }

  if (opts.raids !== undefined && opts.raids === false) {
    result = Vendor.jsonQuery(`[* raid = false ]`, { data: result }).value
  }

  if (opts.randomEnchants !== undefined && opts.randomEnchants === false) {
    result = result.filter(noRandomEnchants)
  }

  return _result(result, opts.cloneResults ? opts.cloneResults : false)
}

const itemSet = (opts: ItemQuery): ItemSetJSON | undefined => {
  let _itemSets = itemSets(opts)
  if (_itemSets && _itemSets[0]) {
    return _itemSets[0]
  }
  return undefined
}

const itemSets = (opts: ItemQuery): ItemSetJSON[] => {
  let singleItemSetQuery = (query: string): ItemSetJSON[] => {
    let result: ItemSetJSON[] = []
    let x = Vendor.jsonQuery(query, { data: itemSetsDB }).value
    if (x) {
      result.push(x)
    }
    return _result(result, opts.cloneResults ? opts.cloneResults : false)
  }

  let result: ItemSetJSON[] = []

  if (opts.name) {
    result = singleItemSetQuery(`[name=${opts.name}]`)
  } else {
    result = Vendor.jsonQuery(``, { data: itemSetsDB }).value
  }

  if (opts.phase !== undefined) {
    result = Vendor.jsonQuery(`[* phase <= ${opts.phase}]`, { data: result }).value
  }

  if (opts.raids !== undefined && opts.raids === false) {
    result = Vendor.jsonQuery(`[* raid = false ]`, { data: result }).value
  }

  return _result(result, opts.cloneResults ? opts.cloneResults : false)
}

const enchant = (opts: ItemQuery): EnchantJSON | undefined => {
  let _enchants = enchants(opts)
  if (_enchants && _enchants[0]) {
    return _enchants[0]
  }
  return undefined
}

const enchants = (opts: ItemQuery): EnchantJSON[] => {
  let singleEnchantQuery = (query: string): EnchantJSON[] => {
    let result: EnchantJSON[] = []
    let x = Vendor.jsonQuery(query, { data: enchantsDB }).value
    if (x) {
      result.push(x)
    }
    return _result(result, opts.cloneResults ? opts.cloneResults : false)
  }

  let noExploit = (enchantJSON: EnchantJSON) => {
    if (!enchantJSON || !enchantJSON.exploit) {
      return true
    }

    return false
  }

  /* id and name are unique. if one is passed just lookup and return */
  if (opts.id) {
    return singleEnchantQuery(`[id=${opts.id}]`)
  } else if (opts.customId) {
    return singleEnchantQuery(`[customId=${opts.customId}]`)
  } else if (opts.name) {
    return singleEnchantQuery(`[name=${opts.name}]`)
  }

  let result: EnchantJSON[] = []

  if (opts.slot === undefined) {
    return result
  }

  result = Vendor.jsonQuery(`[* slot = ${opts.slot} | slot = -2 ]`, { data: enchantsDB }).value

  if (opts.phase !== undefined) {
    result = Vendor.jsonQuery(`[* phase <= ${opts.phase}]`, { data: result }).value
  }

  if (!opts.enchantExploit) {
    result = result.filter(noExploit)
  }

  return _result(result, opts.cloneResults ? opts.cloneResults : false)
}

const spell = (opts: SpellQuery): SpellJSON | undefined => {
  let _spells = spells(opts)
  if (_spells && _spells[0]) {
    return _spells[0]
  }
  return undefined
}

const spells = (opts: SpellQuery) => {
  let singleSpellQuery = (query: string): SpellJSON[] => {
    let result: SpellJSON[] = []
    let x = Vendor.jsonQuery(query, { data: spellsDB }).value
    if (x) {
      result.push(x)
    }
    return _result(result, opts.cloneResults ? opts.cloneResults : false)
  }

  if (opts.name) {
    return singleSpellQuery(`[name=${opts.name}]`)
  }

  if (opts.baseName && opts.rank) {
    return singleSpellQuery(`[name=${opts.baseName} Rank ${opts.rank}]`)
  }

  let result: SpellJSON[] = []

  if (opts.phase !== undefined) {
    result = Vendor.jsonQuery(`[* phase <= ${opts.phase}]`, { data: spellsDB }).value
  }

  return _result(result, opts.cloneResults ? opts.cloneResults : false)
}

export default {
  item,
  items,
  itemSet,
  itemSets,
  enchant,
  enchants,
  spell,
  spells
}
