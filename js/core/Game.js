/**
 * ОБНОВЛЕННЫЙ ГЛАВНЫЙ КЛАСС ИГРЫ
 */

 class PokemonClickerGame {
    constructor() {
        // Системы
        this.saveManager = null;
        this.pokemonManager = null;
        this.shopSystem = null;
        this.battleSystem = null;
        this.uiManager = null;
        this.animationManager = null;
        this.tutorialSystem = null;
        this.locationSystem = null;
        this.mapModal = null;
        this.questsPanel = null;
        this.heroSystem = null;
        this.pokemonCenter = null;
        this.gymSystem = null;
        
        // Менеджер изображений
        this.imageManager = null;
        
        // Состояние
        this.gameState = null;
        this.isInitialized = false;
        
        // Таймеры
        this.energyRestoreInterval = null;
        this.autoSaveInterval = null;
        
        // Очередь уведомлений
        this.notificationQueue = [];
        this.isShowingNotification = false;
    }
    
    async init() {        
        try {
            console.log('🚀 Инициализация игры...');
            
            // 1. Инициализируем менеджер изображений
            this.imageManager = new ImageManager(IMAGE_CONFIG);

            // 2. Предзагружаем изображения
            await this.imageManager.preloadAll();

            // 3. Инициализируем SaveManager ДО создания всех систем
            this.saveManager = new SaveManager(CONFIG.SAVE_KEY || 'pokemon_clicker_save');
            
            // 4. Инициализируем базовые системы
            this.pokemonManager = new PokemonManager(CONFIG);
            this.animationManager = new AnimationManager();

            // 5. Инициализируем системы, которые зависят от game
            this.heroSystem = new HeroSystem(this);
            this.shopSystem = new ShopSystem(this.pokemonManager, this, this.imageManager);
            this.locationSystem = new LocationSystem(this);
            this.pokemonCenter = new PokemonCenter(this);
            this.gymSystem = new GymSystem(this);

            // 6. Инициализируем BattleSystem
            this.battleSystem = new BattleSystem(this.pokemonManager, this, this.imageManager);

            // 7. Инициализируем UI системы
            this.uiManager = new UIManager(this, this.imageManager);
            this.mapModal = new MapModal(this, this.locationSystem);
            this.questsPanel = new QuestsPanel(this, this.locationSystem);
            
            // 8. ЗАГРУЖАЕМ СОХРАНЕНИЕ ПОСЛЕ ИНИЦИАЛИЗАЦИИ ВСЕХ СИСТЕМ
            this.loadGame();
            
            // 9. Подписываемся на события слияния
            this.pokemonManager.onMerge((mergeData) => {
                console.log('🔥 Событие слияния получено!', mergeData);
                if (this.uiManager) {
                    this.uiManager.showMergeAnimation(mergeData);
                }
                this.showNotification(
                    `${mergeData.pokemon.name} достиг ${mergeData.newLevel} уровня!`,
                    'success'
                );
                if (this.locationSystem) {
                    this.locationSystem.updateQuestProgress('merge_pokemon', 1, mergeData);
                }
                // Сохраняем после слияния
                this.saveGame();
            });
            
            // 10. Инициализируем туториал
            this.tutorialSystem = new TutorialSystem(this);
            
            // 11. Обновляем UI
            await this.uiManager.updateUI();
            
            // 12. Запускаем таймеры
            this.startEnergyRestore();
            this.startAutoSave();
            
            // 13. Инициализируем звуки
            if (typeof SoundGenerator !== 'undefined') {
                SoundGenerator.init();
            }
            
            // 14. Обновляем изображения покеболов
            await updatePokeballImages(this.imageManager);
            
            // 15. Обновляем хедер
            this.updateHeaderUI();
            
            // 16. Инициализируем обработчики событий UI
            setTimeout(() => {
                if (this.uiManager) {
                    this.uiManager.initEventListeners();
                }
            }, 500);
            
            // 17. Еще раз обновляем покеболы
            setTimeout(async () => {
                await updatePokeballImages(this.imageManager);
                console.log('🔄 Повторное обновление покеболов');
            }, 1000);
            
            this.isInitialized = true;
            console.log('✅ Игра успешно инициализирована!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации игры:', error);
            this.showErrorMessage(error.message);
        }
    }

    updateHeaderUI() {
        const oldNav = document.querySelector('.nav-buttons');
        if (oldNav) oldNav.style.display = 'none';
        
        const avatarContainer = document.getElementById('avatar-container');
        if (avatarContainer) avatarContainer.style.display = 'flex';
    }
    
    showErrorMessage(message) {
        const container = document.getElementById('notification-container');
        if (container) {
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <div class="notification-content">
                    <p>Ошибка: ${message}</p>
                </div>
            `;
            container.appendChild(notification);
        }
    }
    
    loadGame() {
        if (!this.saveManager) {
            console.warn('⚠️ SaveManager не инициализирован');
            return;
        }
        
        const data = this.saveManager.load();
        if (!data) {
            console.log('📖 Сохранение не найдено, начинаем новую игру');
            // Если нет сохранения, даем стартового покемона
            if (this.pokemonManager && this.pokemonManager.collection.length === 0) {
                this.addStarterPokemon();
            }
            return;
        }
        
        console.log('📖 Загрузка сохранения...');
        
        // Восстанавливаем деньги
        if (this.shopSystem && data.money !== undefined) {
            this.shopSystem.setMoney(data.money);
            console.log('💰 Загружено денег:', data.money);
        }
        
        // Восстанавливаем покеболы
        if (this.shopSystem && data.pokeballs) {
            this.shopSystem.setPokeballs(data.pokeballs);
            console.log('🎯 Загружены покеболы:', data.pokeballs);
        }
        
        // Восстанавливаем коллекцию и команду
        if (this.pokemonManager) {
            if (data.collection) {
                this.pokemonManager.collection = data.collection.map(function(p) {
                    // Восстанавливаем isInTeam из данных команды
                    p.isInTeam = false;
                    return p;
                });
                console.log('📦 Загружено покемонов в коллекции:', this.pokemonManager.collection.length);
            }
            
            if (data.team) {
                this.pokemonManager.team = data.team.map(function(p) {
                    p.isInTeam = true;
                    return p;
                });
                console.log('👥 Загружено покемонов в команде:', this.pokemonManager.team.length);
            }
            
            if (data.maxTeamSize) {
                this.pokemonManager.maxTeamSize = data.maxTeamSize;
            }
        }
        
        // Восстанавливаем врага
        if (this.battleSystem && data.currentEnemy) {
            this.battleSystem.currentEnemy = data.currentEnemy;
            console.log('👾 Загружен текущий враг');
        }
        
        // Если коллекция пуста, даем стартового покемона
        if (this.pokemonManager && this.pokemonManager.collection.length === 0) {
            this.addStarterPokemon();
            console.log('🎁 Коллекция пуста, добавлен стартовый покемон');
        }
        
        this.gameState = data;
        console.log('✅ Сохранение загружено успешно!');
    }
    
    addStarterPokemon() {
        if (!this.pokemonManager) return;
        
        const starterPokemonIds = [1, 2, 3];
        const randomId = starterPokemonIds[Math.floor(Math.random() * starterPokemonIds.length)];
        
        const pokemon = this.pokemonManager.addToCollection(randomId);
        
        if (pokemon) {
            const result = this.pokemonManager.addToTeam(pokemon.id);
            if (result.success) {
                console.log('🎁 Добавлен стартовый покемон:', pokemon.name);
                
                if (this.uiManager && this.uiManager.showRevealedPokemon) {
                    this.uiManager.showRevealedPokemon(pokemon);
                }
            }
        }
    }
    
    saveGame() {
        if (!this.saveManager) {
            console.warn('⚠️ SaveManager не инициализирован');
            return false;
        }
        
        if (!this.shopSystem || !this.pokemonManager || !this.battleSystem) {
            console.warn('⚠️ Системы не инициализированы');
            return false;
        }
        
        const data = {
            money: this.shopSystem.money,
            pokeballs: { ...this.shopSystem.pokeballs },
            collection: this.pokemonManager.collection.map(function(p) {
                // Сохраняем только нужные данные
                return {
                    id: p.id,
                    name: p.name,
                    types: p.types ? p.types.slice() : [],
                    rarity: p.rarity,
                    baseDamage: p.baseDamage,
                    level: p.level,
                    currentDamage: p.currentDamage,
                    energy: p.energy,
                    maxEnergy: p.maxEnergy,
                    isInTeam: p.isInTeam || false,
                    imageKey: p.imageKey,
                    mergeCount: p.mergeCount || 0
                };
            }),
            team: this.pokemonManager.team.map(function(p) {
                return {
                    id: p.id,
                    name: p.name,
                    types: p.types ? p.types.slice() : [],
                    rarity: p.rarity,
                    baseDamage: p.baseDamage,
                    level: p.level,
                    currentDamage: p.currentDamage,
                    energy: p.energy,
                    maxEnergy: p.maxEnergy,
                    isInTeam: true,
                    imageKey: p.imageKey,
                    mergeCount: p.mergeCount || 0
                };
            }),
            maxTeamSize: this.pokemonManager.maxTeamSize
        };
        
        if (this.battleSystem.currentEnemy) {
            data.currentEnemy = {
                id: this.battleSystem.currentEnemy.id,
                name: this.battleSystem.currentEnemy.name,
                hp: this.battleSystem.currentEnemy.hp,
                maxHp: this.battleSystem.currentEnemy.maxHp,
                level: this.battleSystem.enemyLevel || 1,
                types: this.battleSystem.currentEnemy.types || [],
                rarity: this.battleSystem.currentEnemy.rarity || 'COMMON',
                imageKey: this.battleSystem.currentEnemy.imageKey || 'rattata'
            };
        }
        
        try {
            const success = this.saveManager.save(data);
            if (success) {
                this.gameState = data;
            }
            return success;
        } catch (e) {
            console.error('❌ Ошибка сохранения:', e);
            return false;
        }
    }
    
    manualAttack() {
        console.log('Ручная атака');
        
        if (this.tutorialSystem && this.tutorialSystem.isTutorialActive) {
            const step = this.tutorialSystem.steps[this.tutorialSystem.currentStep];
            if (step && step.action === 'attack-enemy') {
                console.log('⚔️ Атака разрешена для туториала');
            } else {
                this.showNotification('🎓 Следуй указаниям туториала!', 'warning');
                return;
            }
        }
        
        if (this.pokemonManager.team.length === 0) {
            this.showNotification('Добавь покемонов в команду для атаки!', 'warning');
            if (this.uiManager) {
                this.uiManager.showModal('team');
            }
            return;
        }
        
        const hasEnergy = this.pokemonManager.team.some(p => p.energy > 0);
        if (!hasEnergy) {
            this.showNotification('У покемонов закончилась энергия! Подождите восстановления.', 'warning');
            return;
        }
        
        let totalDamage = this.pokemonManager.getTeamDamage();
        
        if (this.heroSystem) {
            const bonus = this.heroSystem.getHeroBonus() / 100;
            totalDamage = Math.floor(totalDamage * (1 + bonus));
        }
        
        const result = this.battleSystem.attackEnemy();
        
        if (result.damage > 0) {
            const enemyCard = document.querySelector('.enemy-card');
            if (enemyCard && this.animationManager) {
                const rect = enemyCard.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                this.animationManager.createDamageEffect(
                    Math.floor(result.damage), 
                    x, 
                    y, 
                    result.damage > 50
                );
            }
            
            if (typeof SoundGenerator !== 'undefined') {
                SoundGenerator.playAttack();
            }
            
            if (this.locationSystem) {
                this.locationSystem.updateQuestProgress('defeat_enemies', 1);
                this.locationSystem.updateQuestProgress('team_damage', result.damage);
            }
            
            if (this.heroSystem) {
                this.heroSystem.addExp(1);
            }
        }
        
        if (result.defeated && result.reward) {
            this.shopSystem.addMoney(result.reward);
            this.showNotification(`Победа! +${result.reward} поке-баксов`, 'success');
            
            if (typeof SoundGenerator !== 'undefined') {
                SoundGenerator.playVictory();
            }
            
            if (result.enemy && this.animationManager) {
                this.animationManager.animateEnemyChange(
                    result.enemy,
                    this.battleSystem.currentEnemy
                );
            }
            
            if (this.locationSystem) {
                this.locationSystem.updateQuestProgress('collect_money', result.reward);
            }
        }
        
        this.uiManager.updateUI();
        this.saveGame();
    }
    
    addToTeam(pokemonId) {
        const result = this.pokemonManager.addToTeam(pokemonId);
        
        if (result.success) {
            this.uiManager.updateUI();
            this.saveGame();
            this.showNotification(`${result.pokemon.name} добавлен в команду!`, 'success');
            
            if (typeof SoundGenerator !== 'undefined') {
                SoundGenerator.playAddToTeam();
            }
        } else {
            this.showNotification(result.message, 'error');
        }
        
        return result;
    }
    
    removeFromTeam(pokemonId) {
        const pokemon = this.pokemonManager.getPokemonById(pokemonId);
        const removed = this.pokemonManager.removeFromTeam(pokemonId);
        
        if (removed) {
            this.uiManager.updateUI();
            this.saveGame();
            if (pokemon) {
                this.showNotification(`${pokemon.name} удален из команды`, 'info');
            }
        }
        
        return removed;
    }
    
    showNotification(message, type = 'info') {
        this.notificationQueue.push({ message, type });
        
        if (!this.isShowingNotification) {
            this.showNextNotification();
        }
    }
    
    showNextNotification() {
        if (this.notificationQueue.length === 0) {
            this.isShowingNotification = false;
            return;
        }
        
        this.isShowingNotification = true;
        const { message, type } = this.notificationQueue.shift();
        
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.showNextNotification();
            }, 500);
        }, 3000);
    }
    
    startEnergyRestore() {
        if (this.energyRestoreInterval) {
            clearInterval(this.energyRestoreInterval);
        }
        
        this.energyRestoreInterval = setInterval(() => {
            if (this.pokemonManager) {
                this.pokemonManager.restoreEnergy();
                if (this.uiManager) {
                    this.uiManager.updateUI();
                }
            }
        }, 1000);
    }
    
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
            console.log('💾 Автосохранение выполнено');
        }, CONFIG.AUTO_SAVE_INTERVAL || 30000);
    }
    
    cleanup() {
        if (this.energyRestoreInterval) {
            clearInterval(this.energyRestoreInterval);
        }
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        if (this.battleSystem) {
            this.battleSystem.cleanup();
        }
        
        this.saveGame();
    }
}

// Запуск игры
let game;

window.addEventListener('load', async () => {
    game = new PokemonClickerGame();
    await game.init();
    
    window.addEventListener('beforeunload', () => {
        game.cleanup();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            if (game && game.manualAttack) {
                game.manualAttack();
            }
        }
    });
});

window.Game = PokemonClickerGame;
window.gameInstance = game;