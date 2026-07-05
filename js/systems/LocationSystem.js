/**
 * Система локаций
 * @module LocationSystem
 */

 class LocationSystem {
    constructor(game) {
        this.game = game;
        this.currentLocation = 'pallet_town';
        this.availableLocations = ['pallet_town'];
        this.transitionInProgress = false;
        this.transitionEndTime = null;
        this.transitionTarget = null;
        this.dailyQuests = {};
        this.lastQuestUpdate = null;
        
        this.locations = {
            'pallet_town': {
                name: 'Паллет Таун',
                description: 'Тихий городок, где начинаются приключения',
                neighbors: ['route_1'],
                icon: '🏠',
                type: 'town',
                hasPokemonCenter: true,
                hasGym: false,
                questCount: 3,
                position: { x: 40, y: 80 },
                pokemonPool: ['rattata', 'pidgey']
            },
            'route_1': {
                name: 'Маршрут 1',
                description: 'Дорога через зеленые луга',
                neighbors: ['pallet_town', 'viridian_city'],
                icon: '🛤️',
                type: 'route',
                hasPokemonCenter: false,
                hasGym: false,
                questCount: 3,
                position: { x: 40, y: 60 },
                pokemonPool: ['rattata', 'pidgey', 'spearow']
            },
            'viridian_city': {
                name: 'Веридиан Сити',
                description: 'Город с видом на вечнозеленый лес',
                neighbors: ['route_1', 'route_2'],
                icon: '🏙️',
                type: 'city',
                hasPokemonCenter: true,
                hasGym: true,
                gymId: 'viridian_city',
                questCount: 4,
                position: { x: 40, y: 40 },
                pokemonPool: ['rattata', 'pidgey']
            },
            'route_2': {
                name: 'Маршрут 2',
                description: 'Дорога к лесу',
                neighbors: ['viridian_city', 'viridian_forest'],
                icon: '🛤️',
                type: 'route',
                hasPokemonCenter: false,
                hasGym: false,
                questCount: 3,
                position: { x: 25, y: 30 },
                pokemonPool: ['rattata', 'pidgey', 'spearow', 'ekans']
            },
            'viridian_forest': {
                name: 'Веридианский лес',
                description: 'Густой лес с множеством насекомых',
                neighbors: ['route_2', 'pewter_city'],
                icon: '🌲',
                type: 'forest',
                hasPokemonCenter: false,
                hasGym: false,
                questCount: 4,
                position: { x: 25, y: 20 },
                pokemonPool: ['caterpie', 'metapod', 'weedle', 'kakuna', 'pidgey']
            },
            'pewter_city': {
                name: 'Пьютер Сити',
                description: 'Город у подножия гор',
                neighbors: ['viridian_forest', 'route_3'],
                icon: '⛰️',
                type: 'city',
                hasPokemonCenter: true,
                hasGym: true,
                gymId: 'pewter_city',
                questCount: 4,
                position: { x: 25, y: 10 },
                pokemonPool: ['rattata', 'pidgey', 'sandshrew']
            },
            'route_3': {
                name: 'Маршрут 3',
                description: 'Горная тропа',
                neighbors: ['pewter_city', 'mt_moon'],
                icon: '🛤️',
                type: 'route',
                hasPokemonCenter: false,
                hasGym: false,
                questCount: 3,
                position: { x: 40, y: 10 },
                pokemonPool: ['geodude', 'sandshrew', 'mankey']
            },
            'mt_moon': {
                name: 'Лунная гора',
                description: 'Таинственная гора с пещерами',
                neighbors: ['route_3', 'cerulean_city'],
                icon: '🌙',
                type: 'cave',
                hasPokemonCenter: false,
                hasGym: false,
                questCount: 4,
                position: { x: 55, y: 10 },
                pokemonPool: ['zubat', 'geodude', 'paras']
            },
            'cerulean_city': {
                name: 'Церулин Сити',
                description: 'Город с красивыми фонтанами',
                neighbors: ['mt_moon', 'route_4', 'route_5'],
                icon: '💧',
                type: 'city',
                hasPokemonCenter: true,
                hasGym: true,
                gymId: 'cerulean_city',
                questCount: 4,
                position: { x: 70, y: 15 },
                pokemonPool: ['rattata', 'pidgey', 'psyduck']
            },
            'vermilion_city': {
                name: 'Вермилион Сити',
                description: 'Портовый город с большим кораблем',
                neighbors: ['route_5', 'route_6'],
                icon: '⚓',
                type: 'city',
                hasPokemonCenter: true,
                hasGym: true,
                gymId: 'vermilion_city',
                questCount: 4,
                position: { x: 70, y: 45 },
                pokemonPool: ['meowth', 'pidgey', 'machop']
            },
            'saffron_city': {
                name: 'Саффрон Сити',
                description: 'Крупный город с офисами',
                neighbors: ['route_5', 'route_6', 'route_7', 'route_8'],
                icon: '🏢',
                type: 'city',
                hasPokemonCenter: true,
                hasGym: true,
                gymId: 'saffron_city',
                questCount: 4,
                position: { x: 55, y: 45 },
                pokemonPool: ['abra', 'drowzee', 'meowth']
            },
            'celadon_city': {
                name: 'Селадон Сити',
                description: 'Большой город с торговым центром',
                neighbors: ['route_7', 'route_16'],
                icon: '🛍️',
                type: 'city',
                hasPokemonCenter: true,
                hasGym: true,
                gymId: 'celadon_city',
                questCount: 4,
                position: { x: 40, y: 45 },
                pokemonPool: ['gloom', 'bellsprout', 'ekans']
            },
            'fuchsia_city': {
                name: 'Фуксия Сити',
                description: 'Город с сафари-зоной',
                neighbors: ['route_15', 'route_18', 'route_19'],
                icon: '🦒',
                type: 'city',
                hasPokemonCenter: true,
                hasGym: true,
                gymId: 'fuchsia_city',
                questCount: 4,
                position: { x: 55, y: 70 },
                pokemonPool: ['venonat', 'krabby', 'kingler']
            },
            'lavender_town': {
                name: 'Лавандовый город',
                description: 'Город с Башней Покемонов',
                neighbors: ['route_8', 'route_10'],
                icon: '🔮',
                type: 'town',
                hasPokemonCenter: true,
                hasGym: false,
                questCount: 4,
                position: { x: 70, y: 55 },
                pokemonPool: ['gastly', 'haunter', 'cubone']
            },
            'cinnabar_island': {
                name: 'Циннабар',
                description: 'Вулканический остров',
                neighbors: ['route_20', 'route_21'],
                icon: '🌋',
                type: 'island',
                hasPokemonCenter: true,
                hasGym: true,
                gymId: 'cinnabar_island',
                questCount: 4,
                position: { x: 85, y: 80 },
                pokemonPool: ['growlithe', 'ponyta', 'magmar']
            },
            'indigo_plateau': {
                name: 'Плато Индиго',
                description: 'Штаб-квартира Лиги Покемонов',
                neighbors: ['route_23'],
                icon: '🏆',
                type: 'special',
                hasPokemonCenter: true,
                hasGym: false,
                questCount: 5,
                position: { x: 55, y: 5 },
                pokemonPool: ['articuno', 'zapdos', 'moltres', 'mewtwo']
            }
        };
        
        this.questTemplates = [
            {
                id: 'catch_pokemon',
                name: 'Поймать покемона',
                description: 'Поймайте покемона в этой локации',
                reward: 50,
                progress: 0,
                target: 1
            },
            {
                id: 'defeat_enemies',
                name: 'Победить врагов',
                description: 'Победите врагов в этой локации',
                reward: 30,
                progress: 0,
                target: 5
            },
            {
                id: 'collect_money',
                name: 'Собрать поке-баксы',
                description: 'Заработайте поке-баксы в этой локации',
                reward: 40,
                progress: 0,
                target: 100
            },
            {
                id: 'use_pokeballs',
                name: 'Использовать покеболы',
                description: 'Откройте покеболы в этой локации',
                reward: 45,
                progress: 0,
                target: 3
            },
            {
                id: 'team_damage',
                name: 'Нанести урон',
                description: 'Нанесите урон врагам',
                reward: 35,
                progress: 0,
                target: 500
            }
        ];
        
        this.loadProgress();
        this.updateDailyQuests();
    }
    
    loadProgress() {
        var saved = localStorage.getItem('pokemon_location_progress');
        if (saved) {
            try {
                var data = JSON.parse(saved);
                this.currentLocation = data.currentLocation || 'pallet_town';
                this.availableLocations = data.availableLocations || ['pallet_town'];
                this.transitionEndTime = data.transitionEndTime || null;
                this.lastQuestUpdate = data.lastQuestUpdate || null;
                this.dailyQuests = data.dailyQuests || {};
                this.updateAvailableLocations();
            } catch (e) {
                // Игнорируем ошибки
            }
        }
    }
    
    saveProgress() {
        var data = {
            currentLocation: this.currentLocation,
            availableLocations: this.availableLocations,
            transitionEndTime: this.transitionEndTime,
            lastQuestUpdate: this.lastQuestUpdate,
            dailyQuests: this.dailyQuests
        };
        localStorage.setItem('pokemon_location_progress', JSON.stringify(data));
    }
    
    updateAvailableLocations() {
        var current = this.locations[this.currentLocation];
        if (current) {
            for (var i = 0; i < current.neighbors.length; i++) {
                var neighbor = current.neighbors[i];
                if (this.availableLocations.indexOf(neighbor) === -1) {
                    this.availableLocations.push(neighbor);
                }
            }
        }
    }
    
    canTravelTo(locationId) {
        if (this.availableLocations.indexOf(locationId) === -1) {
            return { allowed: false, reason: 'Локация еще не открыта' };
        }
        if (this.transitionInProgress) {
            return { allowed: false, reason: 'Переход уже выполняется' };
        }
        var current = this.locations[this.currentLocation];
        if (current.neighbors.indexOf(locationId) === -1) {
            return { allowed: false, reason: 'Можно переходить только в соседние локации' };
        }
        return { allowed: true };
    }
    
    startTravel(locationId) {
        var check = this.canTravelTo(locationId);
        if (!check.allowed) {
            this.game.showNotification(check.reason, 'warning');
            return false;
        }
        
        var travelTime = 15 * 1000;
        this.transitionInProgress = true;
        this.transitionEndTime = Date.now() + travelTime;
        this.transitionTarget = locationId;
        
        this.saveProgress();
        this.game.showNotification('Переход в ' + this.locations[locationId].name + '... ' + (travelTime/1000) + ' сек.', 'info');
        
        var self = this;
        setTimeout(function() {
            self.completeTransition(locationId);
        }, travelTime);
        
        return true;
    }
    
    completeTransition(locationId) {
        if (locationId) {
            this.currentLocation = locationId;
            this.updateAvailableLocations();
        }
        this.transitionInProgress = false;
        this.transitionEndTime = null;
        this.transitionTarget = null;
        
        this.saveProgress();
        this.updateDailyQuests();
        this.game.showNotification('Вы прибыли в ' + this.locations[this.currentLocation].name + '!', 'success');
        
        if (this.game.uiManager) {
            this.game.uiManager.updateLocationUI();
        }
    }
    
    updateDailyQuests() {
        var now = new Date();
        var today = now.toDateString();
        
        if (this.lastQuestUpdate !== today) {
            this.generateDailyQuests();
            this.lastQuestUpdate = today;
            this.saveProgress();
        }
        
        if (!this.dailyQuests[this.currentLocation]) {
            this.generateQuestsForLocation(this.currentLocation);
        }
    }
    
    generateDailyQuests() {
        var locations = Object.keys(this.locations);
        for (var i = 0; i < locations.length; i++) {
            this.generateQuestsForLocation(locations[i]);
        }
    }
    
    generateQuestsForLocation(locationId) {
        var location = this.locations[locationId];
        var questCount = location.questCount || 3;
        
        var quests = [];
        var shuffled = this.questTemplates.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        
        for (var k = 0; k < questCount; k++) {
            if (k < shuffled.length) {
                var template = {
                    id: shuffled[k].id,
                    name: shuffled[k].name,
                    description: shuffled[k].description,
                    reward: shuffled[k].reward,
                    progress: 0,
                    target: shuffled[k].target
                };
                quests.push({
                    id: template.id + '_' + locationId + '_' + Date.now() + '_' + k,
                    name: template.name,
                    description: template.description,
                    reward: template.reward,
                    progress: 0,
                    target: template.target,
                    completed: false,
                    claimed: false
                });
            }
        }
        
        this.dailyQuests[locationId] = quests;
    }
    
    getCurrentQuests() {
        return this.dailyQuests[this.currentLocation] || [];
    }
    
    updateQuestProgress(eventType, amount, data) {
        amount = amount || 1;
        var quests = this.getCurrentQuests();
        var updated = false;
        
        for (var i = 0; i < quests.length; i++) {
            var quest = quests[i];
            if (quest.completed || quest.claimed) continue;
            
            if (quest.id.indexOf(eventType) === 0) {
                quest.progress = Math.min(quest.progress + amount, quest.target);
                if (quest.progress >= quest.target && !quest.completed) {
                    quest.completed = true;
                    this.game.showNotification('Квест выполнен: ' + quest.name + '!', 'success');
                    updated = true;
                }
            }
        }
        
        if (updated) {
            this.saveProgress();
            if (this.game.uiManager) {
                this.game.uiManager.updateQuestsUI();
            }
        }
    }
    
    claimQuestReward(questId) {
        var quests = this.getCurrentQuests();
        var quest = null;
        for (var i = 0; i < quests.length; i++) {
            if (quests[i].id === questId) {
                quest = quests[i];
                break;
            }
        }
        
        if (!quest || !quest.completed || quest.claimed) {
            return false;
        }
        
        this.game.shopSystem.addMoney(quest.reward);
        quest.claimed = true;
        
        this.saveProgress();
        this.game.showNotification('+' + quest.reward + ' поке-баксов!', 'success');
        
        if (this.game.uiManager) {
            this.game.uiManager.updateQuestsUI();
        }
        
        return true;
    }
}

window.LocationSystem = LocationSystem;