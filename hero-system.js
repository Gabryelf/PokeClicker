// ==============================
// ИСПРАВЛЕННАЯ СИСТЕМА ГЕРОЕВ
// ==============================

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
                    ],
                    3: [
                        { id: 'ash_damage_3', name: 'Героизм', desc: '+15% к урону', cost: 500, type: 'damage', value: 15, icon: '🔥', requires: ['ash_damage_2'] },
                        { id: 'ash_energy_1', name: 'Энергия', desc: '+10% к энергии покемонов', cost: 500, type: 'energy', value: 10, icon: '✨' }
                    ],
                    4: [
                        { id: 'ash_ultimate', name: 'Аш-Грененжа', desc: 'Удваивает бонус от любимых покемонов', cost: 1000, type: 'ultimate', value: 100, icon: '🌟', requires: ['ash_damage_3', 'ash_energy_1'] }
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
                    ],
                    2: [
                        { id: 'misty_water_2', name: 'Водопад', desc: '+10% к урону водных', cost: 250, type: 'type_water', value: 10, icon: '🌊', requires: ['misty_water_1'] },
                        { id: 'misty_defense_1', name: 'Защита', desc: 'Водные покемоны получают на 10% меньше урона', cost: 250, type: 'defense', value: 10, icon: '🛡️' }
                    ],
                    3: [
                        { id: 'misty_water_3', name: 'Цунами', desc: '+15% к урону водных', cost: 500, type: 'type_water', value: 15, icon: '🌪️', requires: ['misty_water_2'] },
                        { id: 'misty_crit_1', name: 'Критический поток', desc: '+10% крит. шанс водных', cost: 500, type: 'crit_chance', value: 10, icon: '💫' }
                    ],
                    4: [
                        { id: 'misty_ultimate', name: 'Русалка', desc: 'Водные покемоны атакуют дважды', cost: 1000, type: 'ultimate', value: 2, icon: '🧜‍♀️', requires: ['misty_water_3', 'misty_crit_1'] }
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
                    ],
                    2: [
                        { id: 'brock_rock_2', name: 'Горный хребет', desc: '+10% к защите', cost: 250, type: 'defense', value: 10, icon: '⛰️', requires: ['brock_rock_1'] },
                        { id: 'brock_regenerate_1', name: 'Регенерация', desc: 'Восстанавливает 1% здоровья в секунду', cost: 250, type: 'regen', value: 1, icon: '🔄' }
                    ],
                    3: [
                        { id: 'brock_rock_3', name: 'Несокрушимость', desc: '+15% к защите', cost: 500, type: 'defense', value: 15, icon: '🗻', requires: ['brock_rock_2'] },
                        { id: 'brock_counter_1', name: 'Контратака', desc: '10% шанс отразить урон', cost: 500, type: 'counter', value: 10, icon: '⚔️' }
                    ],
                    4: [
                        { id: 'brock_ultimate', name: 'Каменный страж', desc: 'Неуязвимость на 3 секунды раз в минуту', cost: 1000, type: 'ultimate', value: 3, icon: '🛡️', requires: ['brock_rock_3', 'brock_counter_1'] }
                    ]
                }
            }
        };
        
        this.loadProgress();
    }
    
    loadProgress() {
        const saved = localStorage.getItem('pokemon_hero_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentHero = data.currentHero || 'ash';
                this.heroLevel = data.heroLevel || 1;
                this.heroExp = data.heroExp || 0;
                this.heroUpgrades = data.heroUpgrades || {};
                this.favoritePokemon = data.favoritePokemon || [];
            } catch (e) {
                console.error('Ошибка загрузки прогресса героя:', e);
            }
        }
    }
    
    saveProgress() {
        const data = {
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
        const hero = this.getHero();
        if (!hero) return 0;
        
        let bonus = hero.bonusValue * this.heroLevel;
        
        // Добавляем бонусы от улучшений
        const upgrades = this.getPurchasedUpgrades();
        upgrades.forEach(upgradeId => {
            const upgrade = this.findUpgrade(upgradeId);
            if (upgrade && upgrade.type === hero.bonusType) {
                bonus += upgrade.value;
            }
        });
        
        return bonus;
    }
    
    getBonusForPokemon(pokemon) {
        const hero = this.getHero();
        if (!hero) return 1.0;
        
        let multiplier = 1.0;
        
        // Базовый бонус героя
        if (hero.bonusType === 'damage') {
            multiplier *= (1 + this.getHeroBonus() / 100);
        } else if (hero.bonusType === 'type_water' && pokemon.types.includes('WATER')) {
            multiplier *= (1 + this.getHeroBonus() / 100);
        } else if (hero.bonusType === 'type_rock' && (pokemon.types.includes('ROCK') || pokemon.types.includes('GROUND'))) {
            multiplier *= (1 + this.getHeroBonus() / 100);
        }
        
        // Бонус от любимых покемонов
        if (this.favoritePokemon.includes(pokemon.id)) {
            multiplier *= 1.5;
        }
        
        return multiplier;
    }
    
    addExp(amount) {
        this.heroExp += amount;
        
        // Проверка на повышение уровня
        const expNeeded = this.heroLevel * 100;
        if (this.heroExp >= expNeeded) {
            this.heroLevel++;
            this.heroExp -= expNeeded;
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`Герой достиг ${this.heroLevel} уровня!`, 'success');
            }
            this.checkNewUpgrades();
        }
        
        this.saveProgress();
    }
    
    checkNewUpgrades() {
        const hero = this.getHero();
        if (!hero) return;
        
        const tierUpgrades = hero.upgrades[this.heroLevel];
        if (tierUpgrades && this.game && this.game.showNotification) {
            this.game.showNotification(`Доступны новые улучшения для ${hero.name}!`, 'info');
        }
    }
    
    getAvailableUpgrades() {
        const hero = this.getHero();
        if (!hero) return [];
        
        const available = [];
        const purchased = this.getPurchasedUpgrades();
        
        // Проходим по всем уровням до текущего уровня героя
        for (let tier = 1; tier <= this.heroLevel; tier++) {
            const tierUpgrades = hero.upgrades[tier] || [];
            
            tierUpgrades.forEach(upgrade => {
                // Проверяем, куплено ли уже
                if (purchased.includes(upgrade.id)) return;
                
                // Проверяем требования
                let requirementsMet = true;
                if (upgrade.requires) {
                    requirementsMet = upgrade.requires.every(req => purchased.includes(req));
                }
                
                if (requirementsMet) {
                    available.push(upgrade);
                }
            });
        }
        
        return available;
    }
    
    // В классе HeroSystem исправьте метод purchaseUpgrade:

    purchaseUpgrade(upgradeId) {
        const hero = this.getHero();
        if (!hero) return false;
        
        // Находим улучшение
        let upgrade = null;
        for (const tier in hero.upgrades) {
            const found = hero.upgrades[tier].find(u => u.id === upgradeId);
            if (found) {
                upgrade = found;
                break;
            }
        }
        
        if (!upgrade) return false;
        
        // Проверяем, не куплено ли уже
        if (this.heroUpgrades[upgradeId]) return false;
        
        // Проверяем, хватает ли денег
        if (this.game.shopSystem.money < upgrade.cost) {
            this.game.showNotification('Недостаточно поке-баксов!', 'error');
            return false;
        }
        
        // Проверяем требования
        if (upgrade.requires) {
            const purchased = this.getPurchasedUpgrades();
            if (!upgrade.requires.every(req => purchased.includes(req))) {
                this.game.showNotification('Не выполнены требования!', 'warning');
                return false;
            }
        }
        
        // Покупаем
        this.game.shopSystem.spendMoney(upgrade.cost);
        this.heroUpgrades[upgradeId] = true;
        
        this.saveProgress();
        if (this.game.showNotification) {
            this.game.showNotification(`Улучшение "${upgrade.name}" куплено!`, 'success');
        }
        
        return true;
    }
    
    getPurchasedUpgrades() {
        return Object.keys(this.heroUpgrades).filter(id => this.heroUpgrades[id]);
    }
    
    findUpgrade(upgradeId) {
        const hero = this.getHero();
        if (!hero) return null;
        
        for (const tier in hero.upgrades) {
            const found = hero.upgrades[tier].find(u => u.id === upgradeId);
            if (found) return found;
        }
        return null;
    }
    
    setFavoritePokemon(pokemonIds) {
        this.favoritePokemon = pokemonIds.slice(0, 3);
        this.saveProgress();
    }
    
    changeHero(heroId) {
        if (this.heroes[heroId]) {
            this.currentHero = heroId;
            this.saveProgress();
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`Выбран герой: ${this.heroes[heroId].name}`, 'success');
            }
            return true;
        }
        return false;
    }
}

window.HeroSystem = HeroSystem;