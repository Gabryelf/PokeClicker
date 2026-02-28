// ==============================
// СИСТЕМА АРЕН
// ==============================

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
            },
            'celadon_city': {
                name: 'Арена Селадона',
                leader: 'Эрика',
                type: 'GRASS',
                badge: 'Радужный',
                level: 25,
                reward: 1250,
                pokemon: [
                    { name: 'Танжэла', level: 22, types: ['GRASS'], imageKey: 'tangela' },
                    { name: 'Виплибелл', level: 24, types: ['GRASS', 'POISON'], imageKey: 'weepinbell' },
                    { name: 'Виктрибелл', level: 26, types: ['GRASS', 'POISON'], imageKey: 'victreebel' }
                ],
                defeated: false
            },
            'fuchsia_city': {
                name: 'Арена Фуксии',
                leader: 'Кога',
                type: 'POISON',
                badge: 'Розовый',
                level: 30,
                reward: 1500,
                pokemon: [
                    { name: 'Кроага', level: 28, types: ['POISON'], imageKey: 'kroaga' },
                    { name: 'Мак', level: 30, types: ['POISON', 'FIGHTING'], imageKey: 'muk' }
                ],
                defeated: false
            },
            'saffron_city': {
                name: 'Арена Саффрона',
                leader: 'Сабина',
                type: 'PSYCHIC',
                badge: 'Золотой',
                level: 35,
                reward: 2000,
                pokemon: [
                    { name: 'Абра', level: 32, types: ['PSYCHIC'], imageKey: 'abra' },
                    { name: 'Кадабра', level: 34, types: ['PSYCHIC'], imageKey: 'kadabra' },
                    { name: 'Алаказам', level: 36, types: ['PSYCHIC'], imageKey: 'alakazam' }
                ],
                defeated: false
            },
            'cinnabar_island': {
                name: 'Арена Циннабара',
                leader: 'Блейн',
                type: 'FIRE',
                badge: 'Вулканический',
                level: 40,
                reward: 2500,
                pokemon: [
                    { name: 'Гроулит', level: 38, types: ['FIRE'], imageKey: 'growlithe' },
                    { name: 'Арканайн', level: 40, types: ['FIRE'], imageKey: 'arcanine' },
                    { name: 'Магмар', level: 42, types: ['FIRE'], imageKey: 'magmar' }
                ],
                defeated: false
            },
            'viridian_city': {
                name: 'Арена Веридиана',
                leader: 'Джованни',
                type: 'GROUND',
                badge: 'Изумрудный',
                level: 45,
                reward: 3000,
                pokemon: [
                    { name: 'Райхорн', level: 43, types: ['GROUND', 'ROCK'], imageKey: 'rhyhorn' },
                    { name: 'Райдон', level: 45, types: ['GROUND', 'ROCK'], imageKey: 'rhydon' },
                    { name: 'Нидокинг', level: 47, types: ['POISON', 'GROUND'], imageKey: 'nidoking' }
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
        const saved = localStorage.getItem('pokemon_gym_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.badges = data.badges || [];
                
                // Восстанавливаем статус арен
                if (data.gyms) {
                    Object.keys(this.gyms).forEach(gymId => {
                        if (data.gyms[gymId]) {
                            this.gyms[gymId].defeated = data.gyms[gymId].defeated;
                        }
                    });
                }
            } catch (e) {
                console.error('Ошибка загрузки прогресса арен:', e);
            }
        }
    }
    
    saveProgress() {
        const gymsData = {};
        Object.keys(this.gyms).forEach(gymId => {
            gymsData[gymId] = {
                defeated: this.gyms[gymId].defeated
            };
        });
        
        const data = {
            badges: this.badges,
            gyms: gymsData
        };
        localStorage.setItem('pokemon_gym_progress', JSON.stringify(data));
    }
    
    showGym(locationId) {
        const gym = this.gyms[locationId];
        if (!gym) return false;
        
        this.currentGym = gym;
        
        const modal = document.getElementById('gym-modal');
        if (!modal) return false;
        
        this.updateGymUI();
        modal.style.display = 'flex';
        return true;
    }
    
    updateGymUI() {
        if (!this.currentGym) return;
        
        const gym = this.currentGym;
        const gymName = document.getElementById('gym-name');
        const content = document.getElementById('gym-content');
        
        if (gymName) gymName.textContent = gym.name;
        if (!content) return;
        
        // Проверяем, доступна ли арена
        const playerLevel = this.game.battleSystem.getPlayerLevel();
        const isAvailable = playerLevel >= gym.level;
        const isDefeated = gym.defeated;
        
        content.innerHTML = `
            <div class="gym-content">
                <div class="gym-header">
                    <div class="gym-badge" style="background: ${this.getTypeColor(gym.type)}">
                        ${this.getTypeIcon(gym.type)}
                    </div>
                    <h3 class="gym-leader">Лидер: ${gym.leader}</h3>
                    <p class="gym-description">Тип: ${gym.type} | Требуемый уровень: ${gym.level}</p>
                </div>
                
                ${!isAvailable ? `
                    <div class="gym-unavailable">
                        <i class="fas fa-lock"></i>
                        <p>Ваш уровень (${playerLevel}) недостаточен для этой арены</p>
                    </div>
                ` : isDefeated ? `
                    <div class="gym-defeated">
                        <i class="fas fa-check-circle" style="color: var(--accent-success);"></i>
                        <h3>Арена побеждена!</h3>
                        <p>Вы получили ${gym.badge}!</p>
                    </div>
                ` : `
                    <div class="gym-battle-area">
                        <h4>Покемоны лидера:</h4>
                        ${gym.pokemon.map(p => `
                            <div class="gym-enemy">
                                <div class="gym-enemy-image">
                                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.getPokemonId(p.name)}.png" 
                                         alt="${p.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                                </div>
                                <div class="gym-enemy-info">
                                    <div class="gym-enemy-name">${p.name}</div>
                                    <div class="gym-enemy-level">Уровень ${p.level}</div>
                                    <div class="gym-enemy-types">
                                        ${p.types.map(t => `<span class="type-badge" style="background: ${this.getTypeColor(t)}">${t}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        
                        <button class="gym-battle-btn" id="start-gym-battle" ${this.gymBattleInProgress ? 'disabled' : ''}>
                            <i class="fas fa-sword"></i>
                            Начать битву!
                        </button>
                    </div>
                    
                    <div class="gym-rewards">
                        <h4>Награда за победу:</h4>
                        <div class="reward-item">
                            <i class="fas fa-coins" style="color: var(--accent-warning);"></i>
                            <span>${gym.reward} поке-баксов</span>
                        </div>
                        <div class="reward-item">
                            <i class="fas fa-medal" style="color: ${this.getTypeColor(gym.type)}"></i>
                            <span>${gym.badge}</span>
                        </div>
                        <div class="reward-item">
                            <i class="fas fa-star" style="color: var(--accent-primary);"></i>
                            <span>Опыт героя: 100</span>
                        </div>
                    </div>
                `}
            </div>
        `;
        
        const battleBtn = document.getElementById('start-gym-battle');
        if (battleBtn) {
            battleBtn.addEventListener('click', () => this.startGymBattle());
        }
    }
    
    async startGymBattle() {
        if (!this.currentGym || this.gymBattleInProgress) return;
        
        const gym = this.currentGym;
        
        // Проверяем, есть ли покемоны в команде
        if (this.game.pokemonManager.team.length === 0) {
            this.game.showNotification('У вас нет покемонов в команде!', 'warning');
            return;
        }
        
        this.gymBattleInProgress = true;
        
        // Симулируем битву с несколькими покемонами
        let victory = true;
        let totalDamage = 0;
        
        this.game.showNotification(`Битва с ${gym.leader} началась!`, 'info');
        
        for (const enemy of gym.pokemon) {
            // Создаем временного врага
            const tempEnemy = {
                name: enemy.name,
                level: enemy.level,
                hp: 100 * enemy.level,
                maxHp: 100 * enemy.level,
                types: enemy.types
            };
            
            // Бьемся с этим покемоном
            while (tempEnemy.hp > 0 && this.game.pokemonManager.team.length > 0) {
                const damage = this.game.pokemonManager.useEnergy();
                if (damage <= 0) break;
                
                tempEnemy.hp -= damage;
                totalDamage += damage;
                
                // Анимация
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            if (this.game.pokemonManager.team.length === 0) {
                victory = false;
                break;
            }
        }
        
        this.gymBattleInProgress = false;
        
        if (victory) {
            this.handleGymVictory(gym);
        } else {
            this.game.showNotification('Поражение! У ваших покемонов кончилась энергия.', 'error');
        }
        
        this.updateGymUI();
    }
    
    handleGymVictory(gym) {
        // Отмечаем арену как побежденную
        gym.defeated = true;
        
        // Добавляем значок
        if (!this.badges.includes(gym.badge)) {
            this.badges.push(gym.badge);
        }
        
        // Даем награду
        this.game.shopSystem.addMoney(gym.reward);
        
        // Опыт герою
        if (this.game.heroSystem) {
            this.game.heroSystem.addExp(100);
        }
        
        this.game.showNotification(`Победа! Вы получили ${gym.badge}!`, 'success');
        
        // Сохраняем прогресс
        this.saveProgress();
        this.game.saveGame();
    }
    
    getPokemonId(name) {
        const map = {
            'Джеодьюд': 74,
            'Оникс': 95,
            'Старью': 120,
            'Старми': 121,
            'Вольторб': 100,
            'Пикачу': 25,
            'Райчу': 26,
            'Танжэла': 114,
            'Виплибелл': 70,
            'Виктрибелл': 71,
            'Кроага': 0, // Заглушка
            'Мак': 89,
            'Абра': 63,
            'Кадабра': 64,
            'Алаказам': 65,
            'Гроулит': 58,
            'Арканайн': 59,
            'Магмар': 126,
            'Райхорн': 111,
            'Райдон': 112,
            'Нидокинг': 34
        };
        return map[name] || 25;
    }
    
    getTypeColor(type) {
        const colors = {
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
        const icons = {
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