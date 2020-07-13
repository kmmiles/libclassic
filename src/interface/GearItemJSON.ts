import ItemSlot from '../enum/ItemSlot'
import GearItemQuality from '../enum/GearItemQuality'
import GearItemClass from '../enum/GearItemClass'
import ArmorSubclass from '../enum/ArmorSubclass'
import WeaponSubclass from '../enum/WeaponSubclass'
import PlayableClass from '../enum/PlayableClass'
import Faction from '../enum/Faction'
import PvPRank from '../enum/PvPRank'
import TargetType from '../enum/TargetType'
import ItemOnUseJSON from './GearItemOnUseJSON'

export default interface GearItemJSON {
  id: number
  suffixId?: number
  itemSlot: ItemSlot
  name?: string
  class?: GearItemClass
  subclass?: ArmorSubclass | WeaponSubclass
  quality?: GearItemQuality
  level?: number
  reqLevel?: number
  bop?: boolean
  unique?: boolean
  allowableClasses?: PlayableClass[]
  targetTypes?: TargetType
  phase?: number
  pvpRank?: PvPRank
  icon?: string
  location?: string
  boss?: string
  raid?: boolean
  worldBoss?: boolean
  faction?: Faction
  score?: number
  spellDamage?: number
  arcaneDamage?: number
  natureDamage?: number
  spellHealing?: number
  spellHit?: number
  spellCrit?: number
  spellPenetration?: number
  stamina?: number
  intellect?: number
  spirit?: number
  mp5?: number
  armor?: number
  durability?: number
  minDmg?: number
  maxDmg?: number
  speed?: number
  dps?: number
  onUse?: ItemOnUseJSON
}
