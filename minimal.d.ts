declare const _default: {
    utils: {
        isNode: boolean;
        isBrowser: boolean;
        isWebWorker: boolean;
        isMobile: () => boolean;
        isEmpty: (obj: object) => boolean;
        isLetter: (char: string) => boolean;
        cloneObject: (o: any) => any;
        newZeroedArray: (len: number) => any[];
        bitMaskFromArray: (array: number[]) => number;
        bitMaskIncludes: (bitMask: number, value: number) => boolean;
        triangularNumber: (n: number) => number;
        roundedString: (num: number, decimals: number) => string;
        capitalize: (s: string) => string;
        fuzzyTextFromString: (s: string) => string;
        fuzzyIncludes: (haystack: string, needle: string) => boolean;
        encodeURI: (str: string) => string;
        decodeURI: (str: string) => string;
        paramFromURL: (paramName: string, URL?: string | undefined) => string | null;
        sanitizeStringForEnum: (s: string) => string;
        getAllEnumKeys: (enumType: object) => string[];
        getAllEnumValues: (enumType: object) => number[];
        getEnumKeyByEnumValue: (myEnum: any, enumValue: string | number) => string;
        getEnumValueFromFuzzyText: (myEnum: any, fuzzyText: string, exact?: boolean | undefined) => string | number;
        getEnumValuesFromFuzzyText: (myEnum: any, fuzzyText: string) => any[];
        getEnumBitmaskFromFuzzyText: (myEnum: any, fuzzyText: string) => any;
    };
    common: {
        ArmorSubclass: typeof import("./enum/ArmorSubclass").default;
        Buff: typeof import("./enum/Buff").Buff;
        Faction: typeof import("./enum/Faction").default;
        Gender: typeof import("./enum/Gender").default;
        ItemClass: typeof import("./enum/ItemClass").default;
        ItemQuality: typeof import("./enum/ItemQuality").default;
        ItemSlot: typeof import("./enum/ItemSlot").default;
        MagicSchool: typeof import("./enum/MagicSchool").default;
        PlayableClass: typeof import("./enum/PlayableClass").default;
        PlayableRace: typeof import("./enum/PlayableRace").default;
        PowerType: typeof import("./enum/PowerType").default;
        PvPRank: typeof import("./enum/PvPRank").default;
        SortOrder: typeof import("./enum/SortOrder").default;
        TargetType: typeof import("./enum/TargetType").default;
        WeaponSubclass: typeof import("./enum/WeaponSubclass").default;
        ItemSuffixType: typeof import("./enum/ItemSuffixType").default;
        Raid: typeof import("./enum/Raid").default;
        WorldBoss: typeof import("./enum/WorldBoss").default;
        factionFromRace: (race: import("./enum/PlayableRace").default) => import("./enum/Faction").default;
        gearSlotFromText: (text: string) => import("./enum/GearSlot").default;
        gearSlotFromItemSlot: (itemSlot: import("./enum/ItemSlot").default) => import("./enum/GearSlot").default;
        raidFromText: (text: string) => import("./enum/Raid").default;
        raidsFromText: (text: string) => import("./enum/Raid").default[];
        worldBossFromText: (text: string) => import("./enum/WorldBoss").default;
        worldBossesFromText: (text: string) => import("./enum/WorldBoss").default[];
        pvpRankFromText: (text: string) => import("./enum/PvPRank").default;
        playableRaceFromText: (text: string) => import("./enum/PlayableRace").default;
        playableClassFromText: (text: string) => import("./enum/PlayableClass").default;
        playableClassesFromText: (text: string) => import("./enum/PlayableClass").default[];
        itemBaseName: (itemName: string) => string;
        itemBonusTypeFromText: (text: string) => import("./enum/ItemBonusType").default;
        itemSuffixTypeFromText: (itemName: string) => import("./enum/ItemSuffixType").default;
        itemQualityFromText: (text: string) => import("./enum/ItemQuality").default;
        buffFromText: (text: string) => import("./enum/Buff").Buff;
        buffsFromText: (text: string) => import("./enum/Buff").Buff[];
        buffMaskFromText: (text: string) => number;
        buffMaskIncludes: (buffMask: number, buff: import("./enum/Buff").Buff) => boolean;
        globalCooldown: number;
        playerLevelCap: number;
        baseSpellCrit: number;
        baseSpellCritMultiplier: number;
        spellHitCap: number;
        spellCritCap: number;
        defaultSettings: (opts?: {
            playerSpec: import("./enum/PlayableSpec").default;
        } | undefined) => import("./interface/Settings").default;
        calcOptsFromSettings: (s: import("./interface/Settings").default) => import("./interface/CalcOpts").default;
        commonNumberResultFromDefault: () => import("./interface/CommonNumberResult").default;
        commonStringResultFromDefault: () => import("./interface/CommonStringResult").default;
        castDmgValuesFromDefault: () => import("./interface/CastDmgValues").default;
        castDmgObjectFromDefault: () => import("./interface/CastDmgObject").default;
        spellChanceToHit: (playerLevel: number, targetLevel: number, spellHit: number) => number;
        spellChanceToMiss: (playerLevel: number, targetLevel: number, spellHit: number) => number;
        spellChanceToCrit: (playerLevel: number, targetLevel: number, spellHit: number, spellCrit: number) => number;
        spellChanceToNormal: (playerLevel: number, targetLevel: number, spellHit: number, spellCrit: number) => number;
        spellPartialResistAvg: (playerLevel: number, playerSpellPenetration: number, targetLevel: number, targetBaseSpellResistance: number, binarySpell: boolean) => number;
        spellCritBonusMultiplier: (opts?: import("./interface/CalcOpts").default | undefined) => number;
        spellCritMultiplier: (opts?: import("./interface/CalcOpts").default | undefined) => number;
        spellCritFromIntellectDivisor: (playerClass: import("./enum/PlayableClass").default) => number;
        spellDmgMultiplier: (spellName: string, additionalMultipliers: number, opts?: import("./interface/CalcOpts").default | undefined) => import("./interface/CommonNumberResult").default;
        spellDmgBase: (spellName: string, dmg: number, opts?: import("./interface/CalcOpts").default | undefined) => number;
        spellBaseChanceToHit: (playerLevel: number, targetLevel: number) => number;
        playerManaRegen: (playerLevel: number, playerSpirit: number, playerMp5: number, opts?: import("./interface/CalcOpts").default | undefined) => import("./interface/ManaRegen").default;
        targetSpellResistanceFromLevel: (playerLevel: number, targetLevel: number, binarySpell: boolean) => number;
        targetSpellResistance: (playerLevel: number, playerSpellPenetration: number, targetLevel: number, targetBaseSpellResistance: number, binarySpell: boolean) => number;
    };
};
export default _default;
