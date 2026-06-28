/**
 * Система героев
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
        
        this.heroes = {
            'ash': {
                name: 'Эш',
                description: 'Энергичный тренер из Паллет Тауна',
                bonus: 'Увеличивает урон всех покемонов на 2% за уровень',
                bonusType: 'damage',
                bonusValue: 2,
                favoritePokemon: [25, 4, 7],
                color: '#ff4444',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                upgrades: {
                    1: [
                        { id: 'ash_damage_1', name: 'Сила духа', desc: '+5% к урону', cost: 100, type: 'damage', value: 5, icon: '⚡' },
                        { id: 'ash_speed_1', name: 'Быстрота', desc: 'Авто-атака на 20% быстрее', cost: 100, type: 'speed', value: 20, icon: '⏱️' }
                    ],
                    2: [
                        { id: 'ash_damage_2', name: 'Неукротимость', desc: '+10% к урону', cost: 250, type: 'damage', value: 10, icon: '💪', requires: ['ash_damage_1'] },
                        { id: 'ash_crit_1', name: 'Меткий глаз', desc: '+5% к критическому урону', cost: 250, type: 'crit', value: 5, icon: '🎯' }
                    ]
                }
            },
            'misty': {
                name: 'Мисти',
                description: 'Лидер арены Церулина, эксперт водных покемонов',
                bonus: 'Водные покемоны получают +4% к урону за уровень',
                bonusType: 'type_water',
                bonusValue: 4,
                favoritePokemon: [7, 54, 86],
                color: '#3498db',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png',
                upgrades: {
                    1: [
                        { id: 'misty_water_1', name: 'Водная гладь', desc: '+5% к урону водных', cost: 100, type: 'type_water', value: 5, icon: '💧' },
                        { id: 'misty_heal_1', name: 'Целительная вода', desc: 'Восстанавливает 5% энергии после боя', cost: 100, type: 'heal', value: 5, icon: '💚' }
                    ]
                }
            },
            'brock': {
                name: 'Брок',
                description: 'Бывший лидер арены Пьютера, эксперт каменных покемонов',
                bonus: 'Каменные и земляные покемоны получают +3% защиты за уровень',
                bonusType: 'type_rock',
                bonusValue: 3,
                favoritePokemon: [27, 95, 74],
                color: '#e67e22',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png',
                upgrades: {
                    1: [
                        { id: 'brock_rock_1', name: 'Каменная твердь', desc: '+5% к защите', cost: 100, type: 'defense', value: 5, icon: '🪨' },
                        { id: 'brock_hp_1', name: 'Выносливость', desc: '+10% к здоровью', cost: 100, type: 'hp', value: 10, icon: '❤️' }
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
            favoritePokemon: this.favoritePokemon
        };
        localStorage.setItem('pokemon_hero_progress', JSON.stringify(data));
    }
    
    getHero() {
        return this.heroes[this.currentHero];
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
        }
        return bonus;
    }
    
    getBonusForPokemon(pokemon) {
        var hero = this.getHero();
        if (!hero) return 1.0;
        
        var multiplier = 1.0;
        if (hero.bonusType === 'damage') {
            multiplier *= (1 + this.getHeroBonus() / 100);
        } else if (hero.bonusType === 'type_water' && pokemon.types.indexOf('WATER') !== -1) {
            multiplier *= (1 + this.getHeroBonus() / 100);
        } else if (hero.bonusType === 'type_rock' && (pokemon.types.indexOf('ROCK') !== -1 || pokemon.types.indexOf('GROUND') !== -1)) {
            multiplier *= (1 + this.getHeroBonus() / 100);
        }
        
        if (this.favoritePokemon.indexOf(pokemon.id) !== -1) {
            multiplier *= 1.5;
        }
        return multiplier;
    }
    
    addExp(amount) {
        this.heroExp += amount;
        var expNeeded = this.heroLevel * 100;
        if (this.heroExp >= expNeeded) {
            this.heroLevel++;
            this.heroExp -= expNeeded;
            if (this.game) {
                this.game.showNotification('Герой достиг ' + this.heroLevel + ' уровня!', 'success');
            }
            this.checkNewUpgrades();
        }
        this.saveProgress();
    }
    
    checkNewUpgrades() {
        var hero = this.getHero();
        if (!hero) return;
        var tierUpgrades = hero.upgrades[this.heroLevel];
        if (tierUpgrades && this.game) {
            this.game.showNotification('Доступны новые улучшения для ' + hero.name + '!', 'info');
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
                if (requirementsMet) {
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
        if (this.game.shopSystem.money < upgrade.cost) {
            this.game.showNotification('Недостаточно поке-баксов!', 'error');
            return false;
        }
        if (upgrade.requires) {
            var purchased = this.getPurchasedUpgrades();
            for (var j = 0; j < upgrade.requires.length; j++) {
                if (purchased.indexOf(upgrade.requires[j]) === -1) {
                    this.game.showNotification('Не выполнены требования!', 'warning');
                    return false;
                }
            }
        }
        
        this.game.shopSystem.spendMoney(upgrade.cost);
        this.heroUpgrades[upgradeId] = true;
        this.saveProgress();
        this.game.showNotification('Улучшение "' + upgrade.name + '" куплено!', 'success');
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
        if (this.heroes[heroId]) {
            this.currentHero = heroId;
            this.saveProgress();
            if (this.game) {
                this.game.showNotification('Выбран герой: ' + this.heroes[heroId].name, 'success');
            }
            return true;
        }
        return false;
    }
}

window.HeroSystem = HeroSystem;