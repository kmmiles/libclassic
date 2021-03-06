import common from '../module/common'

import Character from './Character'
import Spell from './Spell'
import Target from './Target'
import Equipment from './Equipment'
import Item from './Item'

import Settings from '../interface/Settings'
import CastDmgValues from '../interface/CastDmgValues'
import CastDmgObject from '../interface/CastDmgObject'

import MagicSchool from '../enum/MagicSchool'
import Buff from '../enum/Buff'

interface EquipmentOverride {
  equipment?: Equipment
  spellHitWeight?: number
  spellCritWeight?: number
  spellCastTime?: number
  spellCrit?: number
}

/**
 * A Spell cast by Character at Target.
 */
export default class Cast {
  settings: Settings
  spell: Spell
  target: Target
  player: Character
  // equipmentOverride: EquipmentOverride | undefined

  constructor(settings: Settings, equipmentOverride?: EquipmentOverride) {
    this.settings = settings

    /* By default gear is determined by Equipment(). We can override it by passing our own in.
     * If we don't pass our own equipment in, we can also override the stat weights used
     * by Equipment() to select the gear */
    let equipment: Equipment
    if (equipmentOverride && equipmentOverride.equipment) {
      equipment = equipmentOverride.equipment
    } else {
      equipment = new Equipment(
        settings,
        equipmentOverride && equipmentOverride.spellHitWeight !== undefined
          ? equipmentOverride.spellHitWeight
          : undefined,
        equipmentOverride && equipmentOverride.spellCritWeight !== undefined
          ? equipmentOverride.spellCritWeight
          : undefined,
        equipmentOverride && equipmentOverride.spellCastTime !== undefined
          ? equipmentOverride.spellCastTime
          : undefined,
        equipmentOverride && equipmentOverride.spellCrit !== undefined ? equipmentOverride.spellCrit : undefined
      )
    }

    this.player = new Character(this.settings, equipment)
    this.spell = new Spell(this.settings.player.rotation)
    this.target = new Target(this.settings)

    /* XXX: Kinda hacky, but update the itemSearch on the equipment to keep
       a record we can reference elsewhere without needing to reprocess it */
    equipment.itemSearch.spellHitWeight = this.spellHitWeight
    equipment.itemSearch.spellCritWeight = this.spellCritWeight
    equipment.itemSearch.spellCastTime = this.effectiveCastTime
    equipment.itemSearch.spellCrit = this.effectiveSpellCrit
  }

  get normalDmg(): CastDmgObject {
    const myObj = {} as CastDmgObject
    myObj.base = {} as CastDmgValues
    myObj.actual = {} as CastDmgValues
    myObj.effective = {} as CastDmgValues

    const _baseDmg = (dmg: number) => {
      return dmg * this.baseDmgMultiplier
    }

    const _actualDmg = (dmg: number) => {
      return dmg + this.spell.coefficient.direct * (this.effectiveSpellDamage + this.onUseSpellDamageBonus)
    }

    const _effectiveDmg = (dmg: number) => {
      return dmg * this.effectiveDmgMultiplier
    }

    myObj.base.min = _baseDmg(this.spell.minDmg)
    myObj.base.max = _baseDmg(this.spell.maxDmg)
    myObj.base.avg = _baseDmg(this.spell.avgDmg)
    myObj.base.text = `${myObj.base.avg.toFixed(0)} (${myObj.base.min.toFixed(0)} - ${myObj.base.max.toFixed(0)})`

    myObj.actual.min = _actualDmg(myObj.base.min)
    myObj.actual.max = _actualDmg(myObj.base.max)
    myObj.actual.avg = _actualDmg(myObj.base.avg)
    myObj.actual.text = `${myObj.actual.avg.toFixed(0)} (${myObj.actual.min.toFixed(0)} - ${myObj.actual.max.toFixed(
      0
    )})`

    myObj.effective.min = _effectiveDmg(myObj.actual.min)
    myObj.effective.max = _effectiveDmg(myObj.actual.max)
    myObj.effective.avg = _effectiveDmg(myObj.actual.avg)
    myObj.effective.text = `${myObj.effective.avg.toFixed(0)} (${myObj.effective.min.toFixed(
      0
    )} - ${myObj.effective.max.toFixed(0)})`

    return myObj
  }

  get critDmg(): CastDmgObject {
    const myObj = {} as CastDmgObject
    myObj.base = {} as CastDmgValues
    myObj.actual = {} as CastDmgValues
    myObj.effective = {} as CastDmgValues
    const normalObj = this.normalDmg

    const _critDmg = (dmg: number) => {
      return dmg * this.critMultiplier
    }

    myObj.base.min = _critDmg(normalObj.base.min)
    myObj.base.max = _critDmg(normalObj.base.max)
    myObj.base.avg = _critDmg(normalObj.base.avg)
    myObj.base.text = `${myObj.base.avg.toFixed(0)} (${myObj.base.min.toFixed(0)} - ${myObj.base.max.toFixed(0)})`

    myObj.actual.min = _critDmg(normalObj.actual.min)
    myObj.actual.max = _critDmg(normalObj.actual.max)
    myObj.actual.avg = _critDmg(normalObj.actual.avg)
    myObj.actual.text = `${myObj.actual.avg.toFixed(0)} (${myObj.actual.min.toFixed(0)} - ${myObj.actual.max.toFixed(
      0
    )})`

    myObj.effective.min = _critDmg(normalObj.effective.min)
    myObj.effective.max = _critDmg(normalObj.effective.max)
    myObj.effective.avg = _critDmg(normalObj.effective.avg)
    myObj.effective.text = `${myObj.effective.avg.toFixed(0)} (${myObj.effective.min.toFixed(
      0
    )} - ${myObj.effective.max.toFixed(0)})`

    return myObj
  }

  get periodicDmg(): CastDmgObject {
    const myObj = {} as CastDmgObject
    myObj.base = {} as CastDmgValues
    myObj.actual = {} as CastDmgValues
    myObj.effective = {} as CastDmgValues

    myObj.base.tick = this.spell.tickDmg > 0 ? this.spell.tickDmg * this.baseDmgMultiplier : 0
    myObj.base.total = this.spell.tickDmg > 0 ? myObj.base.tick * (this.spell.duration / this.spell.tickRate) : 0
    myObj.base.tickText = `${myObj.base.tick.toFixed(0)} every ${this.spell.tickRate} sec`
    myObj.base.totalText = `${myObj.base.total.toFixed(0)} over ${this.spell.duration} sec`

    myObj.actual.tick =
      this.spell.tickDmg > 0
        ? myObj.base.tick +
          (this.spell.coefficient.periodic / this.spell.ticks) *
            (this.effectiveSpellDamage + this.onUseSpellDamageBonus)
        : 0
    myObj.actual.total = this.spell.tickDmg > 0 ? myObj.actual.tick * (this.spell.duration / this.spell.tickRate) : 0
    myObj.actual.tickText = `${myObj.actual.tick.toFixed(0)} every ${this.spell.tickRate} sec`
    myObj.actual.totalText = `${myObj.actual.total.toFixed(0)} over ${this.spell.duration} sec`

    myObj.effective.tick = this.spell.tickDmg > 0 ? myObj.actual.tick * this.effectiveDmgMultiplier : 0
    myObj.effective.total =
      this.spell.tickDmg > 0 ? myObj.effective.tick * (this.spell.duration / this.spell.tickRate) : 0
    myObj.effective.tickText = `${myObj.effective.tick.toFixed(0)} every ${this.spell.tickRate} sec`
    myObj.effective.totalText = `${myObj.effective.total.toFixed(0)} over ${this.spell.duration} sec`

    return myObj
  }

  get dps(): CastDmgObject {
    const myObj = {} as CastDmgObject
    myObj.base = {} as CastDmgValues
    myObj.actual = {} as CastDmgValues
    myObj.effective = {} as CastDmgValues

    const _dps = (normalDmg: number, critDmg: number) => {
      return (normalDmg * this.chanceToNormal + critDmg * this.chanceToCrit) / 100 / this.effectiveCastTime
    }

    myObj.base.min = _dps(this.normalDmg.base.min, this.critDmg.base.min)
    myObj.base.max = _dps(this.normalDmg.base.max, this.critDmg.base.max)
    myObj.base.avg = _dps(this.normalDmg.base.avg, this.critDmg.base.avg)
    myObj.base.text = `${myObj.base.avg.toFixed(0)} (${myObj.base.min.toFixed(0)} - ${myObj.base.max.toFixed(0)})`

    myObj.actual.min = _dps(this.normalDmg.actual.min, this.critDmg.actual.min)
    myObj.actual.max = _dps(this.normalDmg.actual.max, this.critDmg.actual.max)
    myObj.actual.avg = _dps(this.normalDmg.actual.avg, this.critDmg.actual.avg)
    myObj.actual.text = `${myObj.actual.avg.toFixed(0)} (${myObj.actual.min.toFixed(0)} - ${myObj.actual.max.toFixed(
      0
    )})`

    myObj.effective.min = _dps(this.normalDmg.effective.min, this.critDmg.effective.min)
    myObj.effective.max = _dps(this.normalDmg.effective.max, this.critDmg.effective.max)
    myObj.effective.avg = _dps(this.normalDmg.effective.avg, this.critDmg.effective.avg)
    myObj.effective.text = `${myObj.effective.avg.toFixed(0)} (${myObj.effective.min.toFixed(
      0
    )} - ${myObj.effective.max.toFixed(0)})`

    return myObj
  }

  get periodicDPS(): CastDmgObject {
    const myObj = {} as CastDmgObject
    myObj.base = {} as CastDmgValues
    myObj.actual = {} as CastDmgValues
    myObj.effective = {} as CastDmgValues

    myObj.base.dps = this.periodicDmg.base.total > 0 ? this.periodicDmg.base.total / this.spell.duration : 0
    myObj.actual.dps = this.periodicDmg.actual.total > 0 ? this.periodicDmg.actual.total / this.spell.duration : 0
    myObj.effective.dps =
      this.periodicDmg.effective.total > 0 ? this.periodicDmg.effective.total / this.spell.duration : 0

    myObj.base.text = `${myObj.base.dps.toFixed(0)}`
    myObj.actual.text = `${myObj.actual.dps.toFixed(0)}`
    myObj.effective.text = `${myObj.effective.dps.toFixed(0)}`

    return myObj
  }

  get moonFuryBonus(): number {
    return this.spell.isMoonfire || this.spell.isStarfire || this.spell.isWrath ? this.player.moonFuryBonus : 1.0
  }

  get improvedMoonfireBonus(): number {
    return this.spell.isMoonfire && this.player.improvedMoonfireBonus
      ? 1 + this.player.improvedMoonfireBonus / 100
      : 1.0
  }

  get improvedMoonfireSpellCritBonus(): number {
    return this.spell.isMoonfire ? this.improvedMoonfireBonus : 0
  }

  get curseOfShadowDamageBonus(): number {
    return this.spell.isArcane ? this.target.curseOfShadowDamageBonus : 1.0
  }

  get curseOfShadowResistBonus(): number {
    return this.spell.isArcane ? this.target.curseOfShadowResistBonus : 0
  }

  /**
   * Effect #1	Apply Aura: Mod % Damage Taken (All)
   * Value: -75%
   * Effect #2	Apply Aura: Mod % Damage Taken (Vulnerable)
   * Value: 1100%
   *
   */
  get shimmerBonus(): number {
    const modifier = this.target.shimmer ? 1 - 0.75 : 1
    return this.target.shimmer === this.spell.magicSchool ? modifier * (1 + 11) : modifier
  }

  get stormStrikeBonus(): number {
    return this.spell.isNature ? this.target.stormStrikeBonus : 1.0
  }

  get spellDamageBonus(): number {
    return this.player.flaskOfSupremePowerBonus + this.player.greaterArcaneElixirBonus
  }

  get onUseSpellDamageBonus(): number {
    const trinket1: Item = this.player.equipment.trinket
    const trinket2 = this.player.equipment.trinket2
    let trinket: Item = trinket1

    if (trinket1 && Equipment.isOnUseEquip(trinket1.itemJSON)) {
      trinket = trinket1
    } else if (trinket2 && Equipment.isOnUseEquip(trinket2.itemJSON)) {
      trinket = trinket2
    } else {
      return 0
    }

    return Equipment.trinketEffectiveSpellDamage(
      trinket.itemJSON,
      this.settings.game.encounterLength,
      this.effectiveCastTime,
      this.effectiveSpellCrit,
      this.settings.player.talents.naturesGraceRank === 1 ? true : false
    )
  }

  get actualSpellDamage(): number {
    switch (this.spell.magicSchool) {
      case MagicSchool.Physical:
        return 0
      case MagicSchool.Arcane:
        return this.player.arcaneDamage + this.player.spellDamage
      case MagicSchool.Nature:
        return this.player.natureDamage + this.player.spellDamage
      case MagicSchool.Fire:
      case MagicSchool.Frost:
      case MagicSchool.Shadow:
      case MagicSchool.Holy:
      default:
        return this.player.spellDamage
    }
  }

  get effectiveSpellDamage(): number {
    return this.actualSpellDamage + this.spellDamageBonus
  }

  get effectiveSpellCrit(): number {
    return common.baseSpellCrit + this.player.spellCrit + this.improvedMoonfireSpellCritBonus
  }

  get effectiveTargetResistance(): number {
    const resistance = Math.min(this.target.spellResistance, 5 * this.player.level - this.targetResistanceFromLevel)
    return resistance - Math.min(this.spellPenetration, resistance) + this.targetResistanceFromLevel
  }

  /* For non-binary spells only: Each difference in level gives a 2% resistance chance that cannot
   * be negated (by spell penetration or otherwise). */
  get targetResistanceFromLevel(): number {
    if (this.spell.isBinary) {
      return 0
    }
    return (
      (this.target.level > this.player.level ? this.target.level - this.player.level : 0) *
      parseFloat((0.1333 * this.player.level).toFixed(2))
    )
  }

  /* https://dwarfpriest.wordpress.com/2008/01/07/spell-hit-spell-penetration-and-resistances/#more-176 */
  get partialResistPenalty(): number {
    return this.spell.canPartialResist ? (0.75 * this.effectiveTargetResistance) / (5 * this.player.level) : 0
  }

  get baseDmgMultiplier(): number {
    return this.moonFuryBonus * this.improvedMoonfireBonus
  }

  get effectiveDmgMultiplier(): number {
    return (
      // FIXME: the current dmg calcs are dumb...they should build base, actual and effective on top of each other..
      // this.baseDmgMultiplier *
      this.player.powerInfusionBonus *
      this.player.saygesDarkFortuneBonus *
      this.player.tracesOfSilithystBonus *
      this.target.spellVulnBonus *
      this.curseOfShadowDamageBonus *
      this.stormStrikeBonus *
      this.player.burningAdrenalineDamageBonus *
      this.shimmerBonus *
      (1 - this.partialResistPenalty)
    )
  }

  /**
   * Mitigates spell resist of SpellCast. Needs work.
   */
  get spellPenetration(): number {
    switch (this.spell.magicSchool) {
      case MagicSchool.Arcane:
      case MagicSchool.Shadow:
        return this.player.equipment.spellPenetration + this.target.curseOfShadowResistBonus
      case MagicSchool.Nature:
        return this.player.equipment.spellPenetration + this.target.thunderfuryResistBonus
      default:
        return 0
    }
  }

  /**
   * Spell cast time . Factors in talents that modify base spell cast time.
   * Doesn't account for procs like natures grace
   */
  get castTime(): number {
    switch (this.spell.baseName.toUpperCase()) {
      case 'WRATH':
        return this.spell.castTime - this.player.improvedWrathBonus
      case 'STARFIRE':
        return this.spell.castTime - this.player.improvedStarfireBonus
      default:
        return this.spell.castTime <= common.globalCooldown ? common.globalCooldown : this.spell.castTime
    }
  }

  /**
   * The amount of cast time reduced when a crit procs a bonus to it i.e. natures grace
   */
  get castTimeReductionOnCrit(): number {
    if (this.player.naturesGraceBonus === 0) return 0

    /* if natures grace would reduce the cast time below the global cooldown then
     * only reduce it by the difference of the cast time and global cooldown */
    if (this.castTime - this.player.naturesGraceBonus < common.globalCooldown) {
      return this.castTime - common.globalCooldown
    }

    return this.player.naturesGraceBonus
  }

  /**
   * Factors in cast speed, procs like natures grace, hit, crit and "human factor" (which might actually be latency?)
   */
  get effectiveCastTime(): number {
    /* burning adrenline makes all spells instant cast */
    if (common.buffMaskIncludes(this.player.buffMask, Buff.BurningAdrenaline)) {
      return common.globalCooldown + this.settings.game.castTimePenalty
    }

    return (
      Math.max(common.globalCooldown, this.castTime - this.castTimeReductionOnCrit * (this.chanceToCrit / 100)) +
      this.settings.game.castTimePenalty
    )
  }

  /**
   * Chance of hitting with a spell
   *
   */
  get chanceToHit(): number {
    return Math.min(99, this.target.hitChance + this.player.effectiveSpellHit)
  }

  /**
   * Chance of missing a spell
   *
   */
  get chanceToMiss(): number {
    return Math.max(1, 100 - this.chanceToHit)
  }

  /**
   * Chance of critting with a spell
   *
   */
  get chanceToCrit(): number {
    return this.effectiveSpellCrit * (this.chanceToHit / 100)
  }

  /**
   * Chance of landing a Normal hit i.e. not a miss and not a crit
   *
   */
  get chanceToNormal(): number {
    return this.chanceToHit - this.chanceToCrit
  }

  get critMultiplier(): number {
    switch (this.spell.baseName.toUpperCase()) {
      case 'WRATH':
      case 'STARFIRE':
      case 'MOONFIRE':
        return common.baseSpellCritMultiplier + this.player.vengeanceBonus
      default:
        return common.baseSpellCritMultiplier
    }
  }
  /**
   * The bonus multiplier of a crit, not counting the base
   */
  get critBonusMultiplier(): number {
    return this.critMultiplier - 1
  }

  /**
   * spell crit weight i.e. the amount of spell power 1 point of crit is worth.
   */
  get spellCritWeight(): number {
    return this.effectiveSpellCrit < common.spellCritCap ? this.spellCritToSpellDamage : 0
  }

  /**
   * spell hit weight i.e. the amount of spell power 1 point of hit is worth.
   */
  get spellHitWeight(): number {
    return this.chanceToMiss > 1 ? this.spellHitToSpellDamage : 0
  }

  /**
   * int weight i.e. the amount of spell power 1 point of int is worth
   */
  get intWeight(): number {
    return this.spellCritWeight > 0 ? this.spellCritWeight / 60 : 0
  }

  /**
   *
   * dc(0.83+H/100)(1+xR/100)/(T-t(0.83+H/100)(R/100))
   */

  get spellDamageToDamage(): number {
    return (
      (this.effectiveDmgMultiplier *
        this.spell.coefficient.direct *
        (this.chanceToHit / 100) *
        (1 + (this.critBonusMultiplier * this.effectiveSpellCrit) / 100)) /
      this.effectiveCastTime
    )
  }

  /**
   *
   * d(83+H)(mB+cP) * (xT+t(0.83+H/100)) / (100T-t(0.83+H/100)R)^2
   */
  get spellCritToDamage(): number {
    return (
      (this.normalDmg.effective.avg *
        this.chanceToHit *
        (this.critBonusMultiplier * this.castTime + this.castTimeReductionOnCrit * (this.chanceToHit / 100))) /
      (100 * this.effectiveCastTime) ** 2
    )
  }

  /**
   *
   * v1 d(mB+cP)(100+xR) * (100^2 T)/((100^2 T - t(83+H)R)^2)
   */
  get spellHitToDamage(): number {
    return (
      (this.normalDmg.effective.avg *
        (100 + this.critBonusMultiplier * this.effectiveSpellCrit) *
        (100 ** 2 * this.castTime)) /
      (100 ** 2 * this.effectiveCastTime) ** 2
    )
  }

  // v3 Crit:Spellpower = x(mB/c + P)/(100+xR)   *   (T + (0.83+H/100)t/x)/(T-(0.83+H/100)tR/100)
  get spellCritToSpellDamage(): number {
    return (
      (((this.critBonusMultiplier * this.normalDmg.actual.avg) /
        (100 + this.critBonusMultiplier * this.effectiveSpellCrit)) *
        (this.castTime + ((this.chanceToHit / 100) * this.castTimeReductionOnCrit) / this.critBonusMultiplier)) /
      this.effectiveCastTime
    )
  }
  /*
  // v1 Hit:Spellpower = (B/c + P)/(83 + H)
  // v2 Hit:SpellDamage = (mB/c+P)/(83+H) * (100^2 T)/(100^2 T - t(83+H)R)
  */
  get spellHitToSpellDamage(): number {
    return (
      ((this.normalDmg.actual.avg / this.chanceToHit) * (100 ** 2 * this.castTime)) /
      (100 ** 2 * this.effectiveCastTime)
    )
  }

  /**
   *
   * DPS keeping faerie fire up and spamming Spell. .
   *
   */
  get ffDPS(): number {
    const ffDuration = 40
    return (ffDuration * this.dps.effective.avg) / (ffDuration + (common.globalCooldown * 100) / this.chanceToHit)
  }
  get ffDPSLoss(): number {
    return this.dps.effective.avg - this.ffDPS
  }

  get mfDPS(): number {
    const mfDuration = 12
    return (mfDuration * this.dps.effective.avg) / (mfDuration + (common.globalCooldown * 100) / this.chanceToHit)
  }
  get mfDPSLoss(): number {
    return this.dps.effective.avg - this.mfDPS
  }

  get testRotationDPS(): number {
    // (starfireDPS - mfDPSLoss) + (moonfireDirectDPS / moonfireDotDuration) + moonfireDotDPS
    return 488 - 62 + 289 / 12 + 71
  }

  toJSON(): any {
    const proto = Object.getPrototypeOf(this)
    const jsonObj: any = Object.assign({}, this)

    Object.entries(Object.getOwnPropertyDescriptors(proto))
      /* eslint-disable @typescript-eslint/no-unused-vars */
      .filter(([key, descriptor]) => typeof descriptor.get === 'function')
      .map(([key, descriptor]) => {
        if (descriptor && key[0] !== '_') {
          try {
            const val = (this as any)[key]
            jsonObj[key] = val
          } catch (error) {
            console.error(`Error calling getter ${key}`, error)
          }
        }
      })

    return jsonObj
  }
}
