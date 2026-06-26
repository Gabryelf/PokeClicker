// ==============================
// ОБНОВЛЕННЫЙ ГЛАВНЫЙ КЛАСС ИГРЫ
// ==============================

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
        console.log('🚀 Инициализация Pokemon Clicker Game...');
        
        try {
            // Проверяем наличие всех необходимых классов
            if (typeof ImageManager === 'undefined') {
                throw new Error('ImageManager не определен');
            }
            
            if (typeof SaveManager === 'undefined') {
                throw new Error('SaveManager не определен');
            }
            
            if (typeof PokemonManager === 'undefined') {
                throw new Error('PokemonManager не определен');
            }
            
            if (typeof ShopSystem === 'undefined') {
                throw new Error('ShopSystem не определен');
            }
            
            if (typeof BattleSystem === 'undefined') {
                throw new Error('BattleSystem не определен');
            }
            
            if (typeof AnimationManager === 'undefined') {
                throw new Error('AnimationManager не определен');
            }
            
            if (typeof TutorialSystem === 'undefined') {
                throw new Error('TutorialSystem не определен');
            }
            
            if (typeof UIManager === 'undefined') {
                throw new Error('UIManager не определен');
            }
            
            if (typeof LocationSystem === 'undefined') {
                throw new Error('LocationSystem не определен');
            }
            
            if (typeof MapModal === 'undefined') {
                throw new Error('MapModal не определен');
            }
            
            if (typeof QuestsPanel === 'undefined') {
                throw new Error('QuestsPanel не определен');
            }
            
            if (typeof HeroSystem === 'undefined') {
                throw new Error('HeroSystem не определен');
            }
            
            if (typeof PokemonCenter === 'undefined') {
                throw new Error('PokemonCenter не определен');
            }
            
            if (typeof GymSystem === 'undefined') {
                throw new Error('GymSystem не определен');
            }
            
            // 1. Инициализируем менеджер изображений
            this.imageManager = new ImageManager(IMAGE_CONFIG);

            // 2. Предзагружаем изображения
            await this.imageManager.preloadAll();
            console.log('✅ Все изображения загружены!');

            // 3. Загружаем сохранение
            this.saveManager = new SaveManager();
            this.saveManager.clear();
            // Для сброса туториала - выполните в консоли браузера
            localStorage.removeItem('pokemon_tutorial_completed');
            
            if (window.gameInstance && window.gameInstance.tutorialSystem) {
                window.gameInstance.tutorialSystem.resetTutorial();
            }

            // 4. Инициализируем базовые системы (без зависимостей)
            this.pokemonManager = new PokemonManager();
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
            
            // 8. Подписываемся на события слияния (ЭТО ВАЖНО!)
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
            });
            
            // 9. Инициализируем туториал
            this.tutorialSystem = new TutorialSystem(this);
            
            // 10. Обновляем UI
            await this.uiManager.updateUI();
            
            // 11. Запускаем таймеры
            this.startEnergyRestore();
//AUTO SAVE            //this.startAutoSave();
            
            // 12. Инициализируем звуки
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.init();
                document.addEventListener('click', function activateSound() {
                    GameSoundGenerator.activate();
                    document.removeEventListener('click', activateSound);
                }, { once: true });
            }
            
            // 13. Обновляем изображения покеболов
            await updatePokeballImages(this.imageManager);
            
            // 14. Обновляем хедер
            this.updateHeaderUI();
            
            // 15. Инициализируем обработчики событий UI
            setTimeout(() => {
                if (this.uiManager) {
                    this.uiManager.initEventListeners();
                }
            }, 500);
            
            this.isInitialized = true;
            console.log('✅ Игра успешно инициализирована!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации игры:', error);
            this.showErrorMessage(error.message);
        }
    }

    updateHeaderUI() {
        // Убираем старые кнопки
        const oldNav = document.querySelector('.nav-buttons');
        if (oldNav) oldNav.style.display = 'none';
        
        // Показываем новый аватар
        const avatarContainer = document.getElementById('avatar-container');
        if (avatarContainer) avatarContainer.style.display = 'flex';
    }
    
    makeTeamSlotsClickable() {
        const teamSlots = document.getElementById('team-slots');
        if (teamSlots) {
            teamSlots.addEventListener('click', (e) => {
                // Проверяем, кликнули ли на слот
                const slot = e.target.closest('.team-slot');
                if (slot) {
                    // Открываем окно управления командой
                    this.uiManager.showModal('team');
                }
            });
        }
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
        if (!this.saveManager) return;
        
        this.gameState = this.saveManager.load();
        
        // Восстанавливаем состояние
        if (this.shopSystem) {
            this.shopSystem.setMoney(this.gameState.money);
            this.shopSystem.pokeballs = { ...this.gameState.pokeballs };
        }
        
        if (this.pokemonManager) {
            this.pokemonManager.collection = [...this.gameState.collection];
            this.pokemonManager.team = [...this.gameState.team];
            this.pokemonManager.maxTeamSize = this.gameState.maxTeamSize;
        }
        
        if (this.battleSystem && this.gameState.currentEnemy) {
            this.battleSystem.enemyLevel = this.gameState.currentEnemy.level;
        }
        
        const hasCompletedTutorial = localStorage.getItem('pokemon_tutorial_completed');
        if (hasCompletedTutorial && this.pokemonManager && this.pokemonManager.collection.length === 0) {
            this.addStarterPokemon();
        }
        
        if (this.pokemonManager) {
            for (const pokemon of this.pokemonManager.collection) {
                pokemon.isInTeam = this.pokemonManager.team.some(p => p.id === pokemon.id);
            }
        }
    }
    
    addStarterPokemon() {
        const starterPokemonIds = [1, 2];
        const randomId = starterPokemonIds[Math.floor(Math.random() * starterPokemonIds.length)];
        
        const pokemon = this.pokemonManager.addToCollection(randomId);
        
        if (pokemon) {
            const result = this.pokemonManager.addToTeam(pokemon.id);
            if (result.success) {
                console.log('🎁 Добавлен стартовый покемон:', pokemon.name);
                
                // Показываем анимацию получения
                if (this.uiManager && this.uiManager.showRevealedPokemon) {
                    this.uiManager.showRevealedPokemon(pokemon);
                }
            }
        }
    }
    
    saveGame() {
        if (!this.gameState || !this.shopSystem || !this.pokemonManager || !this.battleSystem) return;
        
        this.gameState.money = this.shopSystem.money;
        this.gameState.pokeballs = { ...this.shopSystem.pokeballs };
        this.gameState.collection = [...this.pokemonManager.collection];
        this.gameState.team = [...this.pokemonManager.team];
        this.gameState.maxTeamSize = this.pokemonManager.maxTeamSize;
        
        if (this.battleSystem.currentEnemy) {
            this.gameState.currentEnemy = {
                id: this.battleSystem.currentEnemy.id,
                hp: this.battleSystem.currentEnemy.hp,
                maxHp: this.battleSystem.currentEnemy.maxHp,
                level: this.battleSystem.enemyLevel
            };
        }
        
        return this.saveManager.save(this.gameState);
    }
    
    // ЕДИНСТВЕННЫЙ МЕТОД manualAttack
    manualAttack() {
        console.log('Ручная атака');
        
        if (this.tutorialSystem && this.tutorialSystem.isTutorialActive) {
            // Проверяем, ожидает ли туториал атаку
            const step = this.tutorialSystem.steps[this.tutorialSystem.currentStep];
            if (step && step.action === 'attack-enemy') {
                console.log('⚔️ Атака разрешена для туториала');
            } else {
                this.showNotification('🎓 Следуй указаниям туториала!', 'warning');
                return;
            }
        }
        
        // Проверяем, есть ли покемоны в команде
        if (this.pokemonManager.team.length === 0) {
            this.showNotification('Добавь покемонов в команду для атаки!', 'warning');
            if (this.uiManager) {
                this.uiManager.showModal('team');
            }
            return;
        }
        
        // Проверяем, есть ли энергия у покемонов
        const hasEnergy = this.pokemonManager.team.some(p => p.energy > 0);
        if (!hasEnergy) {
            this.showNotification('У покемонов закончилась энергия! Подождите восстановления.', 'warning');
            return;
        }
        
        // Применяем бонус героя к урону
        let totalDamage = this.pokemonManager.getTeamDamage();
        
        if (this.heroSystem) {
            const bonus = this.heroSystem.getHeroBonus() / 100;
            totalDamage = Math.floor(totalDamage * (1 + bonus));
        }
        
        // Атакуем
        const result = this.battleSystem.attackEnemy();
        
        if (result.damage > 0) {
            // Показываем анимацию урона
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
            
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.playAttack();
            }
            
            // Обновляем прогресс квеста
            if (this.locationSystem) {
                this.locationSystem.updateQuestProgress('defeat_enemies', 1);
                this.locationSystem.updateQuestProgress('team_damage', result.damage);
            }
            
            // Даем опыт герою за атаку
            if (this.heroSystem) {
                this.heroSystem.addExp(1);
            }
        }
        
        if (result.defeated && result.reward) {
            this.shopSystem.addMoney(result.reward);
            this.showNotification(`Победа! +${result.reward} поке-баксов`, 'success');
            
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.playVictory();
            }
            
            if (result.enemy && this.animationManager) {
                this.animationManager.animateEnemyChange(
                    result.enemy,
                    this.battleSystem.currentEnemy
                );
            }
            
            // Обновляем прогресс квеста
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
            
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.playAddToTeam();
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
        // Добавляем в очередь
        this.notificationQueue.push({ message, type });
        
        // Если не показываем уведомление сейчас, показываем
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
        
        // Удаляем через 3 секунды с анимацией
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                // Показываем следующее уведомление
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
        }, GAME_CONFIG.AUTO_SAVE_INTERVAL || 30000);
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