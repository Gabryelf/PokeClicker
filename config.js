// ==============================
// КОНФИГ С 50+ ПОКЕМОНАМИ
// ==============================

const CONFIG = {
    // Настройки сохранений
    SAVE_KEY: 'pokemon_clicker_save',
    AUTO_SAVE_INTERVAL: 30000, // 30 секунд
    
    // Базовые значения
    STARTING_MONEY: 100,
    STARTING_POKEBALLS: {
        NORMAL: 5,
        MASTER: 0,
        MYTHIC: 0
    },
    
    // Настройки боя
    BASE_ENEMY_HP: 100,
    ENEMY_HP_MULTIPLIER: 1.5,
    REWARD_MULTIPLIER: 10,
    
    // Авто-атака
    AUTO_ATTACK_INTERVAL: 3000,
    
    // Максимальный уровень врага относительно уровня игрока
    MAX_ENEMY_LEVEL_MULTIPLIER: 2, // Враг может быть до 2-х уровней выше игрока
    MIN_ENEMY_LEVEL: 1,
    
    // Ограничения редкости по уровню игрока
    RARITY_LEVEL_REQUIREMENTS: {
        COMMON: 0,      // Доступно с 1 уровня
        UNCOMMON: 2,    // Доступно с 2 уровня
        RARE: 5,        // Доступно с 5 уровня
        EPIC: 10,       // Доступно с 10 уровня
        SPECIAL: 15,    // Доступно с 15 уровня
        LEGENDARY: 20   // Доступно с 20 уровня
    },
    
    // Типы покемонов
    POKEMON_TYPES: {
        NORMAL: { strong: [], weak: ['FIGHTING'] },
        FIRE: { strong: ['GRASS', 'ICE', 'BUG'], weak: ['WATER', 'ROCK', 'GROUND'] },
        WATER: { strong: ['FIRE', 'GROUND', 'ROCK'], weak: ['ELECTRIC', 'GRASS'] },
        GRASS: { strong: ['WATER', 'GROUND', 'ROCK'], weak: ['FIRE', 'ICE', 'POISON', 'FLYING', 'BUG'] },
        ELECTRIC: { strong: ['WATER', 'FLYING'], weak: ['GROUND'] },
        ICE: { strong: ['GRASS', 'GROUND', 'FLYING', 'DRAGON'], weak: ['FIRE', 'FIGHTING', 'ROCK'] },
        FIGHTING: { strong: ['NORMAL', 'ICE', 'ROCK'], weak: ['FLYING', 'PSYCHIC'] },
        POISON: { strong: ['GRASS'], weak: ['GROUND', 'PSYCHIC'] },
        GROUND: { strong: ['FIRE', 'ELECTRIC', 'POISON', 'ROCK'], weak: ['WATER', 'GRASS', 'ICE'] },
        FLYING: { strong: ['GRASS', 'FIGHTING', 'BUG'], weak: ['ELECTRIC', 'ICE', 'ROCK'] },
        PSYCHIC: { strong: ['FIGHTING', 'POISON'], weak: ['BUG', 'GHOST'] },
        BUG: { strong: ['GRASS', 'PSYCHIC'], weak: ['FIRE', 'FLYING', 'ROCK'] },
        ROCK: { strong: ['FIRE', 'ICE', 'FLYING', 'BUG'], weak: ['WATER', 'GRASS', 'FIGHTING', 'GROUND'] },
        GHOST: { strong: ['PSYCHIC', 'GHOST'], weak: ['GHOST'] },
        DRAGON: { strong: ['DRAGON'], weak: ['ICE', 'DRAGON'] }
    },
    
    // Редкости покемонов
    RARITIES: {
        COMMON: { name: 'Обычный', color: '#6c757d', weight: 40, damageMultiplier: 1.0 },
        UNCOMMON: { name: 'Повсеместный', color: '#28a745', weight: 25, damageMultiplier: 1.2 },
        RARE: { name: 'Редкий', color: '#007bff', weight: 15, damageMultiplier: 1.5 },
        EPIC: { name: 'Эпический', color: '#9c27b0', weight: 10, damageMultiplier: 2.0 },
        SPECIAL: { name: 'Специальный', color: '#ff5722', weight: 7, damageMultiplier: 2.5 },
        LEGENDARY: { name: 'Легендарный', color: '#ffd700', weight: 3, damageMultiplier: 3.5 }
    },
    
    // Шансы выпадения из покеболов (зависят от уровня игрока)
    POKEBALL_RATES: {
        NORMAL: {
            COMMON: 70,
            UNCOMMON: 25,
            RARE: 5,
            EPIC: 0,
            SPECIAL: 0,
            LEGENDARY: 0
        },
        MASTER: {
            COMMON: 30,
            UNCOMMON: 35,
            RARE: 25,
            EPIC: 8,
            SPECIAL: 2,
            LEGENDARY: 0
        },
        MYTHIC: {
            COMMON: 10,
            UNCOMMON: 20,
            RARE: 30,
            EPIC: 25,
            SPECIAL: 12,
            LEGENDARY: 3
        }
    },
    
    // Цены в магазине
    SHOP_PRICES: {
        NORMAL_BALL: 10,
        MASTER_BALL: 100,
        MYTHIC_BALL: 500,
        ENERGY_RESTORE: 50,
        TEAM_EXPANDER: 1000
    },
    
    // Максимальный размер команды
    MAX_TEAM_SIZE: 3,
    
    // Энергия покемонов
    MAX_ENERGY: 100,
    ENERGY_DECAY_PER_ATTACK: 1,
    ENERGY_RESTORE_PER_SECOND: 0.1,
    
    // Данные покемонов (50+ штук)
    POKEMON_DATA: {
        // 1-10: Канто стартеры и обычные (COMMON)
        1: { name: 'Бульбазавр', rarity: 'COMMON', types: ['GRASS', 'POISON'], baseDamage: 5, imageKey: 'bulbasaur' },
        2: { name: 'Чармандер', rarity: 'COMMON', types: ['FIRE'], baseDamage: 6, imageKey: 'charmander' },
        3: { name: 'Сквиртл', rarity: 'COMMON', types: ['WATER'], baseDamage: 5, imageKey: 'squirtle' },
        4: { name: 'Раттата', rarity: 'COMMON', types: ['NORMAL'], baseDamage: 3, imageKey: 'rattata' },
        5: { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], baseDamage: 4, imageKey: 'pidgey' },
        6: { name: 'Спироу', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], baseDamage: 4, imageKey: 'spearow' },
        7: { name: 'Эканс', rarity: 'COMMON', types: ['POISON'], baseDamage: 4, imageKey: 'ekans' },
        8: { name: 'Пикачу', rarity: 'COMMON', types: ['ELECTRIC'], baseDamage: 5, imageKey: 'pikachu' },
        9: { name: 'Сэндшрю', rarity: 'COMMON', types: ['GROUND'], baseDamage: 4, imageKey: 'sandshrew' },
        10: { name: 'Нидорин', rarity: 'COMMON', types: ['POISON'], baseDamage: 5, imageKey: 'nidoran' },
        
        // 11-20: UNCOMMON
        11: { name: 'Вулпикс', rarity: 'UNCOMMON', types: ['FIRE'], baseDamage: 8, imageKey: 'vulpix' },
        12: { name: 'Джигглипафф', rarity: 'UNCOMMON', types: ['NORMAL'], baseDamage: 7, imageKey: 'jigglypuff' },
        13: { name: 'Зубат', rarity: 'UNCOMMON', types: ['POISON', 'FLYING'], baseDamage: 7, imageKey: 'zubat' },
        14: { name: 'Одиш', rarity: 'UNCOMMON', types: ['GRASS', 'POISON'], baseDamage: 8, imageKey: 'oddish' },
        15: { name: 'Парас', rarity: 'UNCOMMON', types: ['BUG', 'GRASS'], baseDamage: 7, imageKey: 'paras' },
        16: { name: 'Венонат', rarity: 'UNCOMMON', types: ['BUG', 'POISON'], baseDamage: 8, imageKey: 'venonat' },
        17: { name: 'Диглетт', rarity: 'UNCOMMON', types: ['GROUND'], baseDamage: 7, imageKey: 'diglett' },
        18: { name: 'Мяут', rarity: 'UNCOMMON', types: ['NORMAL'], baseDamage: 8, imageKey: 'meowth' },
        19: { name: 'Псидак', rarity: 'UNCOMMON', types: ['WATER'], baseDamage: 8, imageKey: 'psyduck' },
        20: { name: 'Манки', rarity: 'UNCOMMON', types: ['FIGHTING'], baseDamage: 9, imageKey: 'mankey' },
        
        // 21-30: RARE
        21: { name: 'Гроулит', rarity: 'RARE', types: ['FIRE'], baseDamage: 12, imageKey: 'growlithe' },
        22: { name: 'Поливаг', rarity: 'RARE', types: ['WATER'], baseDamage: 12, imageKey: 'poliwag' },
        23: { name: 'Абра', rarity: 'RARE', types: ['PSYCHIC'], baseDamage: 13, imageKey: 'abra' },
        24: { name: 'Мачоп', rarity: 'RARE', types: ['FIGHTING'], baseDamage: 14, imageKey: 'machop' },
        25: { name: 'Беллспраут', rarity: 'RARE', types: ['GRASS', 'POISON'], baseDamage: 12, imageKey: 'bellsprout' },
        26: { name: 'Тентакул', rarity: 'RARE', types: ['WATER', 'POISON'], baseDamage: 13, imageKey: 'tentacool' },
        27: { name: 'Джеодьюд', rarity: 'RARE', types: ['ROCK', 'GROUND'], baseDamage: 14, imageKey: 'geodude' },
        28: { name: 'Понита', rarity: 'RARE', types: ['FIRE'], baseDamage: 13, imageKey: 'ponyta' },
        29: { name: 'Слоупок', rarity: 'RARE', types: ['WATER', 'PSYCHIC'], baseDamage: 12, imageKey: 'slowpoke' },
        30: { name: 'Магнемит', rarity: 'RARE', types: ['ELECTRIC'], baseDamage: 13, imageKey: 'magnemite' },
        
        // 31-40: EPIC
        31: { name: 'Фарфетчд', rarity: 'EPIC', types: ['NORMAL', 'FLYING'], baseDamage: 18, imageKey: 'farfetchd' },
        32: { name: 'Додуо', rarity: 'EPIC', types: ['NORMAL', 'FLYING'], baseDamage: 18, imageKey: 'doduo' },
        33: { name: 'Сил', rarity: 'EPIC', types: ['WATER'], baseDamage: 19, imageKey: 'seel' },
        34: { name: 'Гример', rarity: 'EPIC', types: ['POISON'], baseDamage: 18, imageKey: 'grimer' },
        35: { name: 'Шеллдер', rarity: 'EPIC', types: ['WATER'], baseDamage: 19, imageKey: 'shellder' },
        36: { name: 'Гастли', rarity: 'EPIC', types: ['GHOST', 'POISON'], baseDamage: 20, imageKey: 'gastly' },
        37: { name: 'Оникс', rarity: 'EPIC', types: ['ROCK', 'GROUND'], baseDamage: 22, imageKey: 'onix' },
        38: { name: 'Дроузи', rarity: 'EPIC', types: ['PSYCHIC'], baseDamage: 19, imageKey: 'drowzee' },
        39: { name: 'Крабби', rarity: 'EPIC', types: ['WATER'], baseDamage: 20, imageKey: 'krabby' },
        40: { name: 'Вольторб', rarity: 'EPIC', types: ['ELECTRIC'], baseDamage: 19, imageKey: 'voltorb' },
        
        // 41-45: SPECIAL
        41: { name: 'Экзеггьют', rarity: 'SPECIAL', types: ['GRASS', 'PSYCHIC'], baseDamage: 28, imageKey: 'exeggcute' },
        42: { name: 'Кьюбон', rarity: 'SPECIAL', types: ['GROUND'], baseDamage: 30, imageKey: 'cubone' },
        43: { name: 'Ликитунг', rarity: 'SPECIAL', types: ['NORMAL'], baseDamage: 32, imageKey: 'lickitung' },
        44: { name: 'Кангасхан', rarity: 'SPECIAL', types: ['NORMAL'], baseDamage: 35, imageKey: 'kangaskhan' },
        45: { name: 'Хорси', rarity: 'SPECIAL', types: ['WATER'], baseDamage: 29, imageKey: 'horsea' },
        
        // 46-50: LEGENDARY
        46: { name: 'Артикуно', rarity: 'LEGENDARY', types: ['ICE', 'FLYING'], baseDamage: 70, imageKey: 'articuno' },
        47: { name: 'Запдос', rarity: 'LEGENDARY', types: ['ELECTRIC', 'FLYING'], baseDamage: 75, imageKey: 'zapdos' },
        48: { name: 'Молтрес', rarity: 'LEGENDARY', types: ['FIRE', 'FLYING'], baseDamage: 72, imageKey: 'moltres' },
        49: { name: 'Мьюту', rarity: 'LEGENDARY', types: ['PSYCHIC'], baseDamage: 90, imageKey: 'mewtwo' },
        50: { name: 'Мью', rarity: 'LEGENDARY', types: ['PSYCHIC'], baseDamage: 80, imageKey: 'mew' }
    },
    
    // Данные противников (локации и возможные покемоны)
    ENEMY_DATA: {
        // Паллет Таун и начальные маршруты (только COMMON)
        'pallet_town': [
            { name: 'Раттата', rarity: 'COMMON', types: ['NORMAL'], imageKey: 'rattata' },
            { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'pidgey' }
        ],
        'route_1': [
            { name: 'Раттата', rarity: 'COMMON', types: ['NORMAL'], imageKey: 'rattata' },
            { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'pidgey' },
            { name: 'Спироу', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'spearow' }
        ],
        'viridian_city': [
            { name: 'Раттата', rarity: 'COMMON', types: ['NORMAL'], imageKey: 'rattata' },
            { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'pidgey' }
        ],
        'route_2': [
            { name: 'Раттата', rarity: 'COMMON', types: ['NORMAL'], imageKey: 'rattata' },
            { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'pidgey' },
            { name: 'Спироу', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'spearow' },
            { name: 'Эканс', rarity: 'COMMON', types: ['POISON'], imageKey: 'ekans' }
        ],
        'viridian_forest': [
            { name: 'Катерпи', rarity: 'COMMON', types: ['BUG'], imageKey: 'caterpie' },
            { name: 'Метапод', rarity: 'COMMON', types: ['BUG'], imageKey: 'metapod' },
            { name: 'Видл', rarity: 'COMMON', types: ['BUG', 'POISON'], imageKey: 'weedle' },
            { name: 'Какуна', rarity: 'COMMON', types: ['BUG', 'POISON'], imageKey: 'kakuna' },
            { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'pidgey' }
        ],
        'pewter_city': [
            { name: 'Раттата', rarity: 'COMMON', types: ['NORMAL'], imageKey: 'rattata' },
            { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'pidgey' },
            { name: 'Сэндшрю', rarity: 'COMMON', types: ['GROUND'], imageKey: 'sandshrew' }
        ],
        'route_3': [
            { name: 'Джеодьюд', rarity: 'RARE', types: ['ROCK', 'GROUND'], imageKey: 'geodude' },
            { name: 'Сэндшрю', rarity: 'COMMON', types: ['GROUND'], imageKey: 'sandshrew' },
            { name: 'Манки', rarity: 'UNCOMMON', types: ['FIGHTING'], imageKey: 'mankey' }
        ],
        'mt_moon': [
            { name: 'Зубат', rarity: 'UNCOMMON', types: ['POISON', 'FLYING'], imageKey: 'zubat' },
            { name: 'Джеодьюд', rarity: 'RARE', types: ['ROCK', 'GROUND'], imageKey: 'geodude' },
            { name: 'Парас', rarity: 'UNCOMMON', types: ['BUG', 'GRASS'], imageKey: 'paras' }
        ],
        'cerulean_city': [
            { name: 'Раттата', rarity: 'COMMON', types: ['NORMAL'], imageKey: 'rattata' },
            { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'pidgey' },
            { name: 'Псидак', rarity: 'UNCOMMON', types: ['WATER'], imageKey: 'psyduck' }
        ],
        'route_4': [
            { name: 'Эканс', rarity: 'COMMON', types: ['POISON'], imageKey: 'ekans' },
            { name: 'Сэндшрю', rarity: 'COMMON', types: ['GROUND'], imageKey: 'sandshrew' },
            { name: 'Одиш', rarity: 'UNCOMMON', types: ['GRASS', 'POISON'], imageKey: 'oddish' }
        ],
        'route_5': [
            { name: 'Мяут', rarity: 'UNCOMMON', types: ['NORMAL'], imageKey: 'meowth' },
            { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'pidgey' },
            { name: 'Беллспраут', rarity: 'RARE', types: ['GRASS', 'POISON'], imageKey: 'bellsprout' }
        ],
        'vermilion_city': [
            { name: 'Мяут', rarity: 'UNCOMMON', types: ['NORMAL'], imageKey: 'meowth' },
            { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], imageKey: 'pidgey' },
            { name: 'Мачоп', rarity: 'RARE', types: ['FIGHTING'], imageKey: 'machop' }
        ],
        'route_6': [
            { name: 'Псидак', rarity: 'UNCOMMON', types: ['WATER'], imageKey: 'psyduck' },
            { name: 'Гроулит', rarity: 'RARE', types: ['FIRE'], imageKey: 'growlithe' },
            { name: 'Шеллдер', rarity: 'EPIC', types: ['WATER'], imageKey: 'shellder' }
        ],
        'saffron_city': [
            { name: 'Абра', rarity: 'RARE', types: ['PSYCHIC'], imageKey: 'abra' },
            { name: 'Дроузи', rarity: 'EPIC', types: ['PSYCHIC'], imageKey: 'drowzee' },
            { name: 'Мяут', rarity: 'UNCOMMON', types: ['NORMAL'], imageKey: 'meowth' }
        ],
        'celadon_city': [
            { name: 'Глоом', rarity: 'RARE', types: ['GRASS', 'POISON'], imageKey: 'gloom' },
            { name: 'Беллспраут', rarity: 'RARE', types: ['GRASS', 'POISON'], imageKey: 'bellsprout' },
            { name: 'Эканс', rarity: 'COMMON', types: ['POISON'], imageKey: 'ekans' }
        ],
        'fuchsia_city': [
            { name: 'Венонат', rarity: 'UNCOMMON', types: ['BUG', 'POISON'], imageKey: 'venonat' },
            { name: 'Крабби', rarity: 'EPIC', types: ['WATER'], imageKey: 'krabby' },
            { name: 'Кинглер', rarity: 'SPECIAL', types: ['WATER'], imageKey: 'kingler' }
        ],
        'lavender_town': [
            { name: 'Гастли', rarity: 'EPIC', types: ['GHOST', 'POISON'], imageKey: 'gastly' },
            { name: 'Хонтер', rarity: 'SPECIAL', types: ['GHOST', 'POISON'], imageKey: 'haunter' },
            { name: 'Кьюбон', rarity: 'SPECIAL', types: ['GROUND'], imageKey: 'cubone' }
        ],
        'cinnabar_island': [
            { name: 'Гроулит', rarity: 'RARE', types: ['FIRE'], imageKey: 'growlithe' },
            { name: 'Понита', rarity: 'RARE', types: ['FIRE'], imageKey: 'ponyta' },
            { name: 'Магмар', rarity: 'SPECIAL', types: ['FIRE'], imageKey: 'magmar' }
        ],
        'indigo_plateau': [
            { name: 'Артикуно', rarity: 'LEGENDARY', types: ['ICE', 'FLYING'], imageKey: 'articuno' },
            { name: 'Запдос', rarity: 'LEGENDARY', types: ['ELECTRIC', 'FLYING'], imageKey: 'zapdos' },
            { name: 'Молтрес', rarity: 'LEGENDARY', types: ['FIRE', 'FLYING'], imageKey: 'moltres' },
            { name: 'Мьюту', rarity: 'LEGENDARY', types: ['PSYCHIC'], imageKey: 'mewtwo' }
        ]
    },
    
    // Данные покеболов
    POKEBALL_DATA: {
        NORMAL: {
            name: 'Покебол',
            description: 'Обычный покебол. Шанс получить обычного или необычного покемона.',
            price: 10,
            color: '#ff4444',
            imageKey: 'NORMAL'
        },
        MASTER: {
            name: 'Мастербол',
            description: 'Редкий покебол. Высокий шанс получить редких и эпических покемонов.',
            price: 100,
            color: '#9c27b0',
            imageKey: 'MASTER'
        },
        MYTHIC: {
            name: 'Ультрабол',
            description: 'Легендарный покебол. Максимальный шанс получить легендарных покемонов.',
            price: 500,
            color: '#ffd700',
            imageKey: 'MYTHIC'
        }
    }
};

window.GAME_CONFIG = CONFIG;