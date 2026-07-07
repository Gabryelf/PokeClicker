/**
 * Система героев - полная версия с открытием героев
 * @module HeroSystem
 */

 class HeroSystem {
    constructor(game) {
        this.game = game;
        this.currentHero = 'ash';
        this.heroLevel = 1;
        this.heroExp = 0;
        this.heroUpgrades = {};
        this.favoritePokemon = [];
        this.skillPoints = 0;
        this.unlockedHeroes = ['ash']; // Только Эш доступен изначально
        this.heroUnlockConditions = {};
        
        this.heroes = {
            'ash': {
                id: 'ash',
                name: 'Эш',
                description: 'Энергичный тренер из Паллет Тауна',
                bonus: 'Увеличивает урон всех покемонов на 2% за уровень',
                bonusType: 'damage',
                bonusValue: 2,
                favoritePokemon: [25, 4, 7],
                color: '#ff4444',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                unlockCondition: null, // Доступен сразу
                unlockText: 'Доступен с начала игры',
                location: 'pallet_town',
                upgrades: {
                    1: [
                        { id: 'ash_damage_1', name: 'Сила духа', desc: '+5% к урону', cost: 100, type: 'damage', value: 5, icon: '⚡', tier: 1 },
                        { id: 'ash_speed_1', name: 'Быстрота', desc: 'Скорость атаки +15%', cost: 100, type: 'speed', value: 15, icon: '⏱️', tier: 1 }
                    ],
                    2: [
                        { id: 'ash_damage_2', name: 'Неукротимость', desc: '+10% к урону', cost: 250, type: 'damage', value: 10, icon: '💪', tier: 2, requires: ['ash_damage_1'] },
                        { id: 'ash_crit_1', name: 'Меткий глаз', desc: '+8% к критическому урону', cost: 250, type: 'crit', value: 8, icon: '🎯', tier: 2 }
                    ],
                    3: [
                        { id: 'ash_damage_3', name: 'Мастерство', desc: '+15% к урону', cost: 500, type: 'damage', value: 15, icon: '🔥', tier: 3, requires: ['ash_damage_2'] },
                        { id: 'ash_crit_2', name: 'Точный удар', desc: '+12% к критическому урону', cost: 500, type: 'crit', value: 12, icon: '🎯', tier: 3, requires: ['ash_crit_1'] },
                        { id: 'ash_health_1', name: 'Живучесть', desc: '+20% к здоровью покемонов', cost: 450, type: 'health', value: 20, icon: '❤️', tier: 3 }
                    ],
                    4: [
                        { id: 'ash_damage_4', name: 'Легендарный тренер', desc: '+25% к урону', cost: 1000, type: 'damage', value: 25, icon: '⭐', tier: 4, requires: ['ash_damage_3'] },
                        { id: 'ash_ultimate_1', name: 'Дух лидера', desc: 'Все бонусы +10%', cost: 1200, type: 'all_bonus', value: 10, icon: '👑', tier: 4, requires: ['ash_damage_3', 'ash_crit_2'] }
                    ]
                }
            },
            'misty': {
                id: 'misty',
                name: 'Мисти',
                description: 'Лидер арены Церулина, эксперт водных покемонов',
                bonus: 'Водные покемоны получают +4% к урону за уровень',
                bonusType: 'type_water',
                bonusValue: 4,
                favoritePokemon: [7, 54, 86],
                color: '#3498db',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png',
                unlockCondition: { type: 'location', value: 'cerulean_city' },
                unlockText: 'Посетите Церулин Сити',
                location: 'cerulean_city',
                upgrades: {
                    1: [
                        { id: 'misty_water_1', name: 'Водная гладь', desc: '+8% к урону водных', cost: 100, type: 'type_water', value: 8, icon: '💧', tier: 1 },
                        { id: 'misty_heal_1', name: 'Целительная вода', desc: 'Восстанавливает 10% энергии после боя', cost: 100, type: 'heal', value: 10, icon: '💚', tier: 1 }
                    ],
                    2: [
                        { id: 'misty_water_2', name: 'Водный поток', desc: '+15% к урону водных', cost: 250, type: 'type_water', value: 15, icon: '🌊', tier: 2, requires: ['misty_water_1'] },
                        { id: 'misty_heal_2', name: 'Исцеление', desc: 'Восстанавливает 20% энергии после боя', cost: 250, type: 'heal', value: 20, icon: '💚', tier: 2, requires: ['misty_heal_1'] }
                    ],
                    3: [
                        { id: 'misty_water_3', name: 'Власть воды', desc: '+25% к урону водных', cost: 500, type: 'type_water', value: 25, icon: '🌊', tier: 3, requires: ['misty_water_2'] },
                        { id: 'misty_crit_1', name: 'Точность воды', desc: '+10% критического урона для водных', cost: 450, type: 'crit_water', value: 10, icon: '🎯', tier: 3 }
                    ],
                    4: [
                        { id: 'misty_water_4', name: 'Повелительница воды', desc: '+40% к урону водных', cost: 1000, type: 'type_water', value: 40, icon: '🌊', tier: 4, requires: ['misty_water_3'] },
                        { id: 'misty_ultimate_1', name: 'Сирена', desc: 'Все водные бонусы +15%', cost: 1200, type: 'all_water', value: 15, icon: '🧜‍♀️', tier: 4, requires: ['misty_water_3'] }
                    ]
                }
            },
            'brock': {
                id: 'brock',
                name: 'Брок',
                description: 'Бывший лидер арены Пьютера, эксперт каменных покемонов',
                bonus: 'Каменные и земляные покемоны получают +3% защиты за уровень',
                bonusType: 'type_rock',
                bonusValue: 3,
                favoritePokemon: [27, 95, 74],
                color: '#e67e22',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png',
                unlockCondition: { type: 'location', value: 'pewter_city' },
                unlockText: 'Посетите Пьютер Сити',
                location: 'pewter_city',
                upgrades: {
                    1: [
                        { id: 'brock_rock_1', name: 'Каменная твердь', desc: '+10% к защите', cost: 100, type: 'defense', value: 10, icon: '🪨', tier: 1 },
                        { id: 'brock_hp_1', name: 'Выносливость', desc: '+15% к здоровью', cost: 100, type: 'health', value: 15, icon: '❤️', tier: 1 }
                    ],
                    2: [
                        { id: 'brock_rock_2', name: 'Горный оплот', desc: '+20% к защите', cost: 250, type: 'defense', value: 20, icon: '⛰️', tier: 2, requires: ['brock_rock_1'] },
                        { id: 'brock_hp_2', name: 'Железная воля', desc: '+25% к здоровью', cost: 250, type: 'health', value: 25, icon: '❤️', tier: 2, requires: ['brock_hp_1'] }
                    ],
                    3: [
                        { id: 'brock_rock_3', name: 'Несокрушимость', desc: '+35% к защите', cost: 500, type: 'defense', value: 35, icon: '🪨', tier: 3, requires: ['brock_rock_2'] },
                        { id: 'brock_regen_1', name: 'Регенерация', desc: 'Восстанавливает 5% здоровья после боя', cost: 450, type: 'regen', value: 5, icon: '💚', tier: 3 }
                    ],
                    4: [
                        { id: 'brock_rock_4', name: 'Горный король', desc: '+50% к защите', cost: 1000, type: 'defense', value: 50, icon: '🏔️', tier: 4, requires: ['brock_rock_3'] },
                        { id: 'brock_ultimate_1', name: 'Страж гор', desc: 'Все защитные бонусы +20%', cost: 1200, type: 'all_defense', value: 20, icon: '🛡️', tier: 4, requires: ['brock_rock_3'] }
                    ]
                }
            },
            'gary': {
                id: 'gary',
                name: 'Гэри',
                description: 'Соперник Эша, стратег и исследователь',
                bonus: 'Увеличивает критический урон на 3% за уровень',
                bonusType: 'crit',
                bonusValue: 3,
                favoritePokemon: [6, 130, 143],
                color: '#2ecc71',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
                unlockCondition: { type: 'location', value: 'saffron_city' },
                unlockText: 'Посетите Саффрон Сити',
                location: 'saffron_city',
                upgrades: {
                    1: [
                        { id: 'gary_crit_1', name: 'Анализ', desc: '+6% к критическому урону', cost: 100, type: 'crit', value: 6, icon: '🔍', tier: 1 },
                        { id: 'gary_exp_1', name: 'Исследователь', desc: '+20% к получаемому опыту', cost: 100, type: 'exp', value: 20, icon: '📚', tier: 1 }
                    ],
                    2: [
                        { id: 'gary_crit_2', name: 'Стратегия', desc: '+12% к критическому урону', cost: 250, type: 'crit', value: 12, icon: '📊', tier: 2, requires: ['gary_crit_1'] },
                        { id: 'gary_exp_2', name: 'Эрудит', desc: '+40% к получаемому опыту', cost: 250, type: 'exp', value: 40, icon: '📚', tier: 2, requires: ['gary_exp_1'] }
                    ],
                    3: [
                        { id: 'gary_crit_3', name: 'Тактик', desc: '+20% к критическому урону', cost: 500, type: 'crit', value: 20, icon: '🎯', tier: 3, requires: ['gary_crit_2'] },
                        { id: 'gary_luck_1', name: 'Удача', desc: '+10% шанс найти редких покемонов', cost: 450, type: 'luck', value: 10, icon: '🍀', tier: 3 }
                    ],
                    4: [
                        { id: 'gary_crit_4', name: 'Гениальный стратег', desc: '+35% к критическому урону', cost: 1000, type: 'crit', value: 35, icon: '🧠', tier: 4, requires: ['gary_crit_3'] },
                        { id: 'gary_ultimate_1', name: 'Наследие Оука', desc: 'Все бонусы +15%', cost: 1200, type: 'all_bonus', value: 15, icon: '🔬', tier: 4, requires: ['gary_crit_3'] }
                    ]
                }
            },
            'cynthia': {
                id: 'cynthia',
                name: 'Синтия',
                description: 'Чемпион лиги, специалист по драконьим покемонам',
                bonus: 'Драконьи покемоны получают +5% к урону за уровень',
                bonusType: 'type_dragon',
                bonusValue: 5,
                favoritePokemon: [149, 148, 147],
                color: '#9b59b6',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
                unlockCondition: { type: 'location', value: 'indigo_plateau' },
                unlockText: 'Посетите Плато Индиго',
                location: 'indigo_plateau',
                upgrades: {
                    1: [
                        { id: 'cynthia_dragon_1', name: 'Драконья кровь', desc: '+10% к урону драконьих', cost: 150, type: 'type_dragon', value: 10, icon: '🐉', tier: 1 },
                        { id: 'cynthia_mastery_1', name: 'Мастерство', desc: '+5% ко всем типам урона', cost: 150, type: 'all_damage', value: 5, icon: '👑', tier: 1 }
                    ],
                    2: [
                        { id: 'cynthia_dragon_2', name: 'Драконья мощь', desc: '+20% к урону драконьих', cost: 300, type: 'type_dragon', value: 20, icon: '🐉', tier: 2, requires: ['cynthia_dragon_1'] },
                        { id: 'cynthia_speed_1', name: 'Драконья грация', desc: '+15% к скорости', cost: 250, type: 'speed', value: 15, icon: '💨', tier: 2 }
                    ],
                    3: [
                        { id: 'cynthia_dragon_3', name: 'Драконья ярость', desc: '+35% к урону драконьих', cost: 600, type: 'type_dragon', value: 35, icon: '🐉', tier: 3, requires: ['cynthia_dragon_2'] },
                        { id: 'cynthia_heal_1', name: 'Драконье дыхание', desc: 'Восстанавливает 15% здоровья после боя', cost: 500, type: 'regen', value: 15, icon: '💚', tier: 3 }
                    ],
                    4: [
                        { id: 'cynthia_dragon_4', name: 'Повелительница драконов', desc: '+50% к урону драконьих', cost: 1200, type: 'type_dragon', value: 50, icon: '🐉', tier: 4, requires: ['cynthia_dragon_3'] },
                        { id: 'cynthia_ultimate_1', name: 'Наследие чемпиона', desc: 'Все бонусы +20%', cost: 1500, type: 'all_bonus', value: 20, icon: '🏆', tier: 4, requires: ['cynthia_dragon_3'] }
                    ]
                }
            }
        };
        
        this.loadProgress();
    }
    
    loadProgress() {
        var saved = localStorage.getItem('pokemon_hero_progress');
        if (saved) {
            try {
                var data = JSON.parse(saved);
                this.currentHero = data.currentHero || 'ash';
                this.heroLevel = data.heroLevel || 1;
                this.heroExp = data.heroExp || 0;
                this.heroUpgrades = data.heroUpgrades || {};
                this.favoritePokemon = data.favoritePokemon || [];
                this.skillPoints = data.skillPoints || 0;
                this.unlockedHeroes = data.unlockedHeroes || ['ash'];
            } catch (e) {
                // Игнорируем ошибки
            }
        }
    }
    
    saveProgress() {
        var data = {
            currentHero: this.currentHero,
            heroLevel: this.heroLevel,
            heroExp: this.heroExp,
            heroUpgrades: this.heroUpgrades,
            favoritePokemon: this.favoritePokemon,
            skillPoints: this.skillPoints,
            unlockedHeroes: this.unlockedHeroes
        };
        localStorage.setItem('pokemon_hero_progress', JSON.stringify(data));
    }
    
    getHero() {
        return this.heroes[this.currentHero];
    }
    
    getAllHeroes() {
        return this.heroes;
    }
    
    getUnlockedHeroes() {
        var result = {};
        for (var i = 0; i < this.unlockedHeroes.length; i++) {
            var id = this.unlockedHeroes[i];
            if (this.heroes[id]) {
                result[id] = this.heroes[id];
            }
        }
        return result;
    }
    
    getLockedHeroes() {
        var result = {};
        for (var id in this.heroes) {
            if (this.heroes.hasOwnProperty(id) && this.unlockedHeroes.indexOf(id) === -1) {
                result[id] = this.heroes[id];
            }
        }
        return result;
    }
    
    checkUnlockConditions(locationId) {
        var unlocked = false;
        for (var id in this.heroes) {
            if (this.heroes.hasOwnProperty(id) && this.unlockedHeroes.indexOf(id) === -1) {
                var hero = this.heroes[id];
                if (hero.unlockCondition && hero.unlockCondition.type === 'location') {
                    if (locationId === hero.unlockCondition.value) {
                        this.unlockHero(id);
                        unlocked = true;
                    }
                }
            }
        }
        return unlocked;
    }
    
    unlockHero(heroId) {
        if (this.unlockedHeroes.indexOf(heroId) !== -1) return false;
        if (!this.heroes[heroId]) return false;
        
        this.unlockedHeroes.push(heroId);
        this.saveProgress();
        
        var hero = this.heroes[heroId];
        if (this.game) {
            this.game.showNotification('🌟 Новый герой доступен: ' + hero.name + '!', 'success');
        }
        return true;
    }
    
    getHeroBonus() {
        var hero = this.getHero();
        if (!hero) return 0;
        
        var bonus = hero.bonusValue * this.heroLevel;
        var upgrades = this.getPurchasedUpgrades();
        for (var i = 0; i < upgrades.length; i++) {
            var upgrade = this.findUpgrade(upgrades[i]);
            if (upgrade && upgrade.type === hero.bonusType) {
                bonus += upgrade.value;
            }
            if (upgrade && upgrade.type === 'all_bonus') {
                bonus += upgrade.value * this.heroLevel / 10;
            }
        }
        return Math.floor(bonus);
    }
    
    getBonusForPokemon(pokemon) {
        var hero = this.getHero();
        if (!hero) return 1.0;
        
        var multiplier = 1.0;
        var bonus = this.getHeroBonus();
        
        if (hero.bonusType === 'damage') {
            multiplier *= (1 + bonus / 100);
        } else if (hero.bonusType === 'type_water' && pokemon.types.indexOf('WATER') !== -1) {
            multiplier *= (1 + bonus / 100);
        } else if (hero.bonusType === 'type_rock' && (pokemon.types.indexOf('ROCK') !== -1 || pokemon.types.indexOf('GROUND') !== -1)) {
            multiplier *= (1 + bonus / 100);
        } else if (hero.bonusType === 'type_dragon' && pokemon.types.indexOf('DRAGON') !== -1) {
            multiplier *= (1 + bonus / 100);
        } else if (hero.bonusType === 'crit') {
            multiplier *= (1 + bonus / 100);
        }
        
        var upgrades = this.getPurchasedUpgrades();
        for (var i = 0; i < upgrades.length; i++) {
            var upgrade = this.findUpgrade(upgrades[i]);
            if (!upgrade) continue;
            
            if (upgrade.type === 'all_damage') {
                multiplier *= (1 + upgrade.value / 100);
            } else if (upgrade.type === 'type_water' && pokemon.types.indexOf('WATER') !== -1) {
                multiplier *= (1 + upgrade.value / 100);
            } else if (upgrade.type === 'type_dragon' && pokemon.types.indexOf('DRAGON') !== -1) {
                multiplier *= (1 + upgrade.value / 100);
            } else if (upgrade.type === 'damage_rock' && (pokemon.types.indexOf('ROCK') !== -1 || pokemon.types.indexOf('GROUND') !== -1)) {
                multiplier *= (1 + upgrade.value / 100);
            }
        }
        
        if (this.favoritePokemon.indexOf(pokemon.id) !== -1) {
            multiplier *= 1.5;
        }
        
        return multiplier;
    }
    
    addExp(amount) {
        var expMultiplier = 1.0;
        var upgrades = this.getPurchasedUpgrades();
        for (var i = 0; i < upgrades.length; i++) {
            var upgrade = this.findUpgrade(upgrades[i]);
            if (upgrade && upgrade.type === 'exp') {
                expMultiplier *= (1 + upgrade.value / 100);
            }
        }
        
        amount = Math.floor(amount * expMultiplier);
        this.heroExp += amount;
        
        var expNeeded = this.heroLevel * 150 + 50;
        if (this.heroExp >= expNeeded) {
            this.heroLevel++;
            this.heroExp -= expNeeded;
            this.skillPoints += 2;
            
            if (this.game) {
                this.game.showNotification('🎉 ' + this.getHero().name + ' достиг ' + this.heroLevel + ' уровня! +2 очка навыков!', 'success');
            }
            this.checkNewUpgrades();
        }
        this.saveProgress();
    }
    
    checkNewUpgrades() {
        var hero = this.getHero();
        if (!hero) return;
        var tierUpgrades = hero.upgrades[this.heroLevel];
        if (tierUpgrades && tierUpgrades.length > 0 && this.game) {
            this.game.showNotification('📚 Доступны новые улучшения для ' + hero.name + '!', 'info');
        }
    }
    
    getAvailableUpgrades() {
        var hero = this.getHero();
        if (!hero) return [];
        
        var available = [];
        var purchased = this.getPurchasedUpgrades();
        
        for (var tier = 1; tier <= this.heroLevel; tier++) {
            var tierUpgrades = hero.upgrades[tier] || [];
            for (var i = 0; i < tierUpgrades.length; i++) {
                var upgrade = tierUpgrades[i];
                if (purchased.indexOf(upgrade.id) !== -1) continue;
                
                var requirementsMet = true;
                if (upgrade.requires) {
                    for (var j = 0; j < upgrade.requires.length; j++) {
                        if (purchased.indexOf(upgrade.requires[j]) === -1) {
                            requirementsMet = false;
                            break;
                        }
                    }
                }
                if (requirementsMet && this.skillPoints > 0) {
                    available.push(upgrade);
                }
            }
        }
        return available;
    }
    
    purchaseUpgrade(upgradeId) {
        var hero = this.getHero();
        if (!hero) return false;
        
        var upgrade = null;
        for (var tier in hero.upgrades) {
            if (hero.upgrades.hasOwnProperty(tier)) {
                for (var i = 0; i < hero.upgrades[tier].length; i++) {
                    if (hero.upgrades[tier][i].id === upgradeId) {
                        upgrade = hero.upgrades[tier][i];
                        break;
                    }
                }
                if (upgrade) break;
            }
        }
        if (!upgrade) return false;
        if (this.heroUpgrades[upgradeId]) return false;
        
        if (this.skillPoints <= 0) {
            if (this.game) {
                this.game.showNotification('❌ Нет очков навыков! Получите уровень чтобы получить очки.', 'error');
            }
            return false;
        }
        
        if (upgrade.cost && this.game && this.game.shopSystem) {
            if (this.game.shopSystem.money < upgrade.cost) {
                this.game.showNotification('❌ Недостаточно поке-баксов! Нужно: ' + upgrade.cost, 'error');
                return false;
            }
            this.game.shopSystem.spendMoney(upgrade.cost);
        }
        
        if (upgrade.requires) {
            var purchased = this.getPurchasedUpgrades();
            for (var j = 0; j < upgrade.requires.length; j++) {
                if (purchased.indexOf(upgrade.requires[j]) === -1) {
                    if (this.game) {
                        this.game.showNotification('❌ Не выполнены требования!', 'warning');
                    }
                    return false;
                }
            }
        }
        
        this.heroUpgrades[upgradeId] = true;
        this.skillPoints--;
        this.saveProgress();
        
        if (this.game) {
            this.game.showNotification('✅ Улучшение "' + upgrade.name + '" куплено! Осталось очков: ' + this.skillPoints, 'success');
        }
        return true;
    }
    
    getPurchasedUpgrades() {
        var result = [];
        for (var key in this.heroUpgrades) {
            if (this.heroUpgrades.hasOwnProperty(key) && this.heroUpgrades[key]) {
                result.push(key);
            }
        }
        return result;
    }
    
    findUpgrade(upgradeId) {
        var hero = this.getHero();
        if (!hero) return null;
        for (var tier in hero.upgrades) {
            if (hero.upgrades.hasOwnProperty(tier)) {
                for (var i = 0; i < hero.upgrades[tier].length; i++) {
                    if (hero.upgrades[tier][i].id === upgradeId) {
                        return hero.upgrades[tier][i];
                    }
                }
            }
        }
        return null;
    }
    
    changeHero(heroId) {
        if (this.unlockedHeroes.indexOf(heroId) === -1) {
            if (this.game) {
                this.game.showNotification('❌ Этот герой еще не открыт!', 'warning');
            }
            return false;
        }
        if (this.heroes[heroId]) {
            this.currentHero = heroId;
            this.saveProgress();
            if (this.game) {
                this.game.showNotification('👤 Выбран герой: ' + this.heroes[heroId].name, 'success');
            }
            return true;
        }
        return false;
    }
    
    getHeroStats() {
        var hero = this.getHero();
        if (!hero) return null;
        
        var stats = {
            name: hero.name,
            level: this.heroLevel,
            exp: this.heroExp,
            expNeeded: this.heroLevel * 150 + 50,
            skillPoints: this.skillPoints,
            bonus: this.getHeroBonus(),
            upgradesCount: this.getPurchasedUpgrades().length,
            totalUpgrades: 0,
            favoritePokemon: this.favoritePokemon,
            unlockedHeroes: this.unlockedHeroes.slice(),
            lockedHeroes: Object.keys(this.getLockedHeroes())
        };
        
        for (var tier in hero.upgrades) {
            if (hero.upgrades.hasOwnProperty(tier)) {
                stats.totalUpgrades += hero.upgrades[tier].length;
            }
        }
        
        return stats;
    }
}

window.HeroSystem = HeroSystem;