/**
 * Система арен
 * @module GymSystem
 */

 class GymSystem {
    constructor(game) {
        this.game = game;
        this.gyms = {
            'pewter_city': {
                name: 'Арена Пьютера',
                leader: 'Брок',
                type: 'ROCK',
                badge: 'Каменный значок',
                level: 10,
                reward: 500,
                pokemon: [
                    { name: 'Джеодьюд', level: 8, types: ['ROCK', 'GROUND'], imageKey: 'geodude' },
                    { name: 'Оникс', level: 10, types: ['ROCK', 'GROUND'], imageKey: 'onix' }
                ],
                defeated: false
            },
            'cerulean_city': {
                name: 'Арена Церулина',
                leader: 'Мисти',
                type: 'WATER',
                badge: 'Капля',
                level: 15,
                reward: 750,
                pokemon: [
                    { name: 'Старью', level: 12, types: ['WATER'], imageKey: 'staryu' },
                    { name: 'Старми', level: 15, types: ['WATER', 'PSYCHIC'], imageKey: 'starmie' }
                ],
                defeated: false
            },
            'vermilion_city': {
                name: 'Арена Вермилиона',
                leader: 'Лейтенант Сёрдж',
                type: 'ELECTRIC',
                badge: 'Оранжевый',
                level: 20,
                reward: 1000,
                pokemon: [
                    { name: 'Вольторб', level: 18, types: ['ELECTRIC'], imageKey: 'voltorb' },
                    { name: 'Пикачу', level: 20, types: ['ELECTRIC'], imageKey: 'pikachu' },
                    { name: 'Райчу', level: 22, types: ['ELECTRIC'], imageKey: 'raichu' }
                ],
                defeated: false
            }
        };
        
        this.badges = [];
        this.currentGym = null;
        this.gymBattleInProgress = false;
        
        this.loadProgress();
    }
    
    loadProgress() {
        var saved = localStorage.getItem('pokemon_gym_progress');
        if (saved) {
            try {
                var data = JSON.parse(saved);
                this.badges = data.badges || [];
                if (data.gyms) {
                    for (var gymId in data.gyms) {
                        if (data.gyms.hasOwnProperty(gymId) && this.gyms[gymId]) {
                            this.gyms[gymId].defeated = data.gyms[gymId].defeated;
                        }
                    }
                }
            } catch (e) {
                // Игнорируем ошибки
            }
        }
    }
    
    saveProgress() {
        var gymsData = {};
        for (var gymId in this.gyms) {
            if (this.gyms.hasOwnProperty(gymId)) {
                gymsData[gymId] = {
                    defeated: this.gyms[gymId].defeated
                };
            }
        }
        var data = {
            badges: this.badges,
            gyms: gymsData
        };
        localStorage.setItem('pokemon_gym_progress', JSON.stringify(data));
    }
    
    showGym(locationId) {
        var gym = this.gyms[locationId];
        if (!gym) return false;
        
        this.currentGym = gym;
        
        var modal = document.getElementById('gym-modal');
        if (!modal) return false;
        
        this.updateGymUI();
        modal.style.display = 'flex';
        return true;
    }
    
    updateGymUI() {
        if (!this.currentGym) return;
        
        var gym = this.currentGym;
        var gymName = document.getElementById('gym-name');
        var content = document.getElementById('gym-content');
        
        if (gymName) gymName.textContent = gym.name;
        if (!content) return;
        
        var playerLevel = this.game.battleSystem.getPlayerLevel();
        var isAvailable = playerLevel >= gym.level;
        var isDefeated = gym.defeated;
        
        var html = '<div class="gym-content">' +
            '<div class="gym-header">' +
            '<div class="gym-badge" style="background: ' + this.getTypeColor(gym.type) + '">' +
            this.getTypeIcon(gym.type) +
            '</div>' +
            '<h3 class="gym-leader">Лидер: ' + gym.leader + '</h3>' +
            '<p class="gym-description">Тип: ' + gym.type + ' | Требуемый уровень: ' + gym.level + '</p>' +
            '</div>';
        
        if (!isAvailable) {
            html += '<div class="gym-unavailable"><i class="fas fa-lock"></i><p>Ваш уровень (' + playerLevel + ') недостаточен для этой арены</p></div>';
        } else if (isDefeated) {
            html += '<div class="gym-defeated"><i class="fas fa-check-circle" style="color: var(--accent-success);"></i><h3>Арена побеждена!</h3><p>Вы получили ' + gym.badge + '!</p></div>';
        } else {
            html += '<div class="gym-battle-area"><h4>Покемоны лидера:</h4>';
            for (var i = 0; i < gym.pokemon.length; i++) {
                var p = gym.pokemon[i];
                html += '<div class="gym-enemy"><div class="gym-enemy-image"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + this.getPokemonId(p.name) + '.png" alt="' + p.name + '" onerror="this.src=\'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png\'"></div>' +
                    '<div class="gym-enemy-info"><div class="gym-enemy-name">' + p.name + '</div><div class="gym-enemy-level">Уровень ' + p.level + '</div><div class="gym-enemy-types">';
                for (var j = 0; j < p.types.length; j++) {
                    html += '<span class="type-badge" style="background: ' + this.getTypeColor(p.types[j]) + '">' + p.types[j] + '</span>';
                }
                html += '</div></div></div>';
            }
            html += '<button class="gym-battle-btn" id="start-gym-battle" ' + (this.gymBattleInProgress ? 'disabled' : '') + '><i class="fas fa-sword"></i>Начать битву!</button></div>';
            
            html += '<div class="gym-rewards"><h4>Награда за победу:</h4>' +
                '<div class="reward-item"><i class="fas fa-coins" style="color: var(--accent-warning);"></i><span>' + gym.reward + ' поке-баксов</span></div>' +
                '<div class="reward-item"><i class="fas fa-medal" style="color: ' + this.getTypeColor(gym.type) + '"></i><span>' + gym.badge + '</span></div>' +
                '<div class="reward-item"><i class="fas fa-star" style="color: var(--accent-primary);"></i><span>Опыт героя: 100</span></div>' +
                '</div>';
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        var battleBtn = document.getElementById('start-gym-battle');
        if (battleBtn) {
            var self = this;
            battleBtn.addEventListener('click', function() {
                self.startGymBattle();
            });
        }
    }
    
    startGymBattle() {
        if (!this.currentGym || this.gymBattleInProgress) return;
        var gym = this.currentGym;
        
        if (this.game.pokemonManager.team.length === 0) {
            this.game.showNotification('У вас нет покемонов в команде!', 'warning');
            return;
        }
        
        this.gymBattleInProgress = true;
        var victory = true;
        var self = this;
        
        this.game.showNotification('Битва с ' + gym.leader + ' началась!', 'info');
        
        (function battleSequence(index) {
            if (index >= gym.pokemon.length) {
                self.gymBattleInProgress = false;
                if (victory) {
                    self.handleGymVictory(gym);
                } else {
                    self.game.showNotification('Поражение! У ваших покемонов кончилась энергия.', 'error');
                }
                self.updateGymUI();
                return;
            }
            
            var enemy = gym.pokemon[index];
            var tempEnemy = {
                name: enemy.name,
                level: enemy.level,
                hp: 100 * enemy.level,
                maxHp: 100 * enemy.level,
                types: enemy.types.slice()
            };
            
            function attackEnemy() {
                if (tempEnemy.hp <= 0 || self.game.pokemonManager.team.length === 0) {
                    if (tempEnemy.hp <= 0) {
                        battleSequence(index + 1);
                    } else {
                        victory = false;
                        self.gymBattleInProgress = false;
                        self.game.showNotification('Поражение! У ваших покемонов кончилась энергия.', 'error');
                        self.updateGymUI();
                    }
                    return;
                }
                
                var damage = self.game.pokemonManager.useEnergy();
                if (damage <= 0) {
                    victory = false;
                    self.gymBattleInProgress = false;
                    self.game.showNotification('Поражение! У ваших покемонов кончилась энергия.', 'error');
                    self.updateGymUI();
                    return;
                }
                
                tempEnemy.hp -= damage;
                
                if (tempEnemy.hp <= 0) {
                    battleSequence(index + 1);
                } else {
                    setTimeout(attackEnemy, 200);
                }
            }
            
            attackEnemy();
        })(0);
    }
    
    handleGymVictory(gym) {
        gym.defeated = true;
        
        if (this.badges.indexOf(gym.badge) === -1) {
            this.badges.push(gym.badge);
        }
        
        this.game.shopSystem.addMoney(gym.reward);
        
        if (this.game.heroSystem) {
            this.game.heroSystem.addExp(100);
        }
        
        this.game.showNotification('Победа! Вы получили ' + gym.badge + '!', 'success');
        this.saveProgress();
        this.game.saveGame();
    }
    
    getPokemonId(name) {
        var map = {
            'Джеодьюд': 74,
            'Оникс': 95,
            'Старью': 120,
            'Старми': 121,
            'Вольторб': 100,
            'Пикачу': 25,
            'Райчу': 26
        };
        return map[name] || 25;
    }
    
    getTypeColor(type) {
        var colors = {
            'NORMAL': '#6c757d',
            'FIRE': '#ff4444',
            'WATER': '#3498db',
            'GRASS': '#2ecc71',
            'ELECTRIC': '#f1c40f',
            'ICE': '#00d2d3',
            'FIGHTING': '#e67e22',
            'POISON': '#9b59b6',
            'GROUND': '#b76e1e',
            'FLYING': '#87ceeb',
            'PSYCHIC': '#e84393',
            'BUG': '#27ae60',
            'ROCK': '#7f8c8d',
            'GHOST': '#8e44ad',
            'DRAGON': '#8e44ad'
        };
        return colors[type] || '#6c757d';
    }
    
    getTypeIcon(type) {
        var icons = {
            'NORMAL': '⬤',
            'FIRE': '🔥',
            'WATER': '💧',
            'GRASS': '🌿',
            'ELECTRIC': '⚡',
            'ICE': '❄️',
            'FIGHTING': '👊',
            'POISON': '☠️',
            'GROUND': '⛰️',
            'FLYING': '🦅',
            'PSYCHIC': '🔮',
            'BUG': '🐛',
            'ROCK': '🪨',
            'GHOST': '👻',
            'DRAGON': '🐉'
        };
        return icons[type] || '🏆';
    }
    
    getBadgesCount() {
        return this.badges.length;
    }
}

window.GymSystem = GymSystem;