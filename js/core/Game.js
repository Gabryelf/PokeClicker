/**
 * Главный класс игры
 * @module Game
 */

 class PokemonClickerGame {
    constructor() {
        this.saveManager = null;
        this.pokemonManager = null;
        this.shopSystem = null;
        this.battleSystem = null;
        this.locationSystem = null;
        this.heroSystem = null;
        this.gymSystem = null;
        this.pokemonCenter = null;
        this.uiManager = null;
        this.mapModal = null;
        this.questsPanel = null;
        this.tutorialSystem = null;
        this.imageManager = null;
        this.animationManager = null;
        this.isInitialized = false;
        this.notificationQueue = [];
        this.isShowingNotification = false;
        this.energyRestoreInterval = null;
        this.autoSaveInterval = null;
    }
    
    async init() {
        try {
            this.imageManager = new ImageManager(IMAGE_CONFIG);
            await this.imageManager.preloadAll();
            
            this.saveManager = new SaveManager(CONFIG.SAVE_KEY);
            this.animationManager = new AnimationManager();
            this.pokemonManager = new PokemonManager(CONFIG);
            this.heroSystem = new HeroSystem(this);
            this.shopSystem = new ShopSystem(this.pokemonManager, this, this.imageManager);
            this.locationSystem = new LocationSystem(this);
            this.pokemonCenter = new PokemonCenter(this);
            this.gymSystem = new GymSystem(this);
            this.battleSystem = new BattleSystem(this.pokemonManager, this, this.imageManager);
            this.uiManager = new UIManager(this, this.imageManager);
            this.mapModal = new MapModal(this, this.locationSystem);
            this.questsPanel = new QuestsPanel(this, this.locationSystem);
            this.tutorialSystem = new TutorialSystem(this);
            
            this.setupEventListeners();
            this.startEnergyRestore();
            this.startAutoSave();
            SoundGenerator.init();
            
            this.isInitialized = true;
            await this.uiManager.updateUI();
            
        } catch (error) {
            console.error('Ошибка инициализации игры:', error);
            this.showErrorNotification(error.message);
        }
    }
    
    setupEventListeners() {
        var self = this;
        this.pokemonManager.onMerge(function(mergeData) {
            if (self.uiManager) {
                self.uiManager.showMergeAnimation(mergeData);
            }
            self.showNotification(
                mergeData.pokemon.name + ' достиг ' + mergeData.newLevel + ' уровня!',
                'success'
            );
            if (self.locationSystem) {
                self.locationSystem.updateQuestProgress('merge_pokemon', 1, mergeData);
            }
        });
    }
    
    manualAttack() {
        if (this.tutorialSystem && this.tutorialSystem.isTutorialActive) {
            var step = this.tutorialSystem.steps[this.tutorialSystem.currentStep];
            if (step && step.action !== 'attack-enemy') {
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
        
        var hasEnergy = false;
        for (var i = 0; i < this.pokemonManager.team.length; i++) {
            if (this.pokemonManager.team[i].energy > 0) {
                hasEnergy = true;
                break;
            }
        }
        if (!hasEnergy) {
            this.showNotification('У покемонов закончилась энергия!', 'warning');
            return;
        }
        
        var totalDamage = this.pokemonManager.getTeamDamage();
        if (this.heroSystem) {
            totalDamage = Math.floor(totalDamage * (1 + this.heroSystem.getHeroBonus() / 100));
        }
        
        var result = this.battleSystem.attackEnemy(totalDamage);
        
        if (result.damage > 0) {
            this.handleAttackResult(result);
        }
        
        this.uiManager.updateUI();
        this.saveGame();
    }
    
    handleAttackResult(result) {
        var enemyCard = document.querySelector('.enemy-card');
        if (enemyCard && this.animationManager) {
            var rect = enemyCard.getBoundingClientRect();
            this.animationManager.createDamageEffect(
                Math.floor(result.damage),
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                result.damage > 50
            );
        }
        
        SoundGenerator.playAttack();
        
        if (this.locationSystem) {
            this.locationSystem.updateQuestProgress('defeat_enemies', 1);
            this.locationSystem.updateQuestProgress('team_damage', result.damage);
        }
        
        if (this.heroSystem) {
            this.heroSystem.addExp(1);
        }
        
        if (result.defeated && result.reward) {
            this.shopSystem.addMoney(result.reward);
            this.showNotification('Победа! +' + result.reward + ' поке-баксов', 'success');
            SoundGenerator.playVictory();
            
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
    }
    
    addToTeam(pokemonId) {
        var result = this.pokemonManager.addToTeam(pokemonId);
        if (result.success) {
            this.uiManager.updateUI();
            this.saveGame();
            this.showNotification(result.pokemon.name + ' добавлен в команду!', 'success');
            SoundGenerator.playAddToTeam();
        } else {
            this.showNotification(result.message, 'error');
        }
        return result;
    }
    
    removeFromTeam(pokemonId) {
        var pokemon = this.pokemonManager.getPokemonById(pokemonId);
        var removed = this.pokemonManager.removeFromTeam(pokemonId);
        if (removed) {
            this.uiManager.updateUI();
            this.saveGame();
            if (pokemon) {
                this.showNotification(pokemon.name + ' удален из команды', 'info');
            }
        }
        return removed;
    }
    
    addStarterPokemon() {
        var starterPokemonIds = [1, 2];
        var randomId = starterPokemonIds[Math.floor(Math.random() * starterPokemonIds.length)];
        var pokemon = this.pokemonManager.addToCollection(randomId);
        if (pokemon) {
            var result = this.pokemonManager.addToTeam(pokemon.id);
            if (result.success) {
                if (this.uiManager && this.uiManager.showRevealedPokemon) {
                    this.uiManager.showRevealedPokemon(pokemon);
                }
            }
        }
    }
    
    showNotification(message, type) {
        type = type || 'info';
        this.notificationQueue.push({ message: message, type: type });
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
        var item = this.notificationQueue.shift();
        var message = item.message;
        var type = item.type;
        var container = document.getElementById('notification-container');
        if (!container) return;
        
        var notification = document.createElement('div');
        notification.className = 'notification ' + type;
        var iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        notification.innerHTML = '<i class="fas fa-' + (iconMap[type] || 'info-circle') + '"></i><div class="notification-content"><p>' + message + '</p></div>';
        
        container.appendChild(notification);
        
        var self = this;
        setTimeout(function() {
            notification.classList.add('hiding');
            setTimeout(function() {
                notification.remove();
                self.showNextNotification();
            }, 500);
        }, 3000);
    }
    
    showErrorNotification(message) {
        var container = document.getElementById('notification-container');
        if (container) {
            var notification = document.createElement('div');
            notification.className = 'notification error';
            notification.innerHTML = '<i class="fas fa-exclamation-circle"></i><div class="notification-content"><p>Ошибка: ' + message + '</p></div>';
            container.appendChild(notification);
        }
    }
    
    saveGame() {
        if (!this.saveManager) return;
        var data = {
            money: this.shopSystem ? this.shopSystem.money : CONFIG.STARTING_MONEY,
            pokeballs: this.shopSystem ? this.shopSystem.pokeballs : { ...CONFIG.STARTING_POKEBALLS },
            collection: this.pokemonManager ? this.pokemonManager.collection : [],
            team: this.pokemonManager ? this.pokemonManager.team : [],
            maxTeamSize: this.pokemonManager ? this.pokemonManager.maxTeamSize : CONFIG.MAX_TEAM_SIZE,
            currentEnemy: this.battleSystem ? this.battleSystem.currentEnemy : null
        };
        this.saveManager.save(data);
    }
    
    loadGame() {
        if (!this.saveManager) return;
        var data = this.saveManager.load();
        if (data) {
            if (this.shopSystem) {
                this.shopSystem.money = data.money;
                this.shopSystem.pokeballs = data.pokeballs;
            }
            if (this.pokemonManager) {
                this.pokemonManager.collection = data.collection || [];
                this.pokemonManager.team = data.team || [];
                this.pokemonManager.maxTeamSize = data.maxTeamSize || CONFIG.MAX_TEAM_SIZE;
                for (var i = 0; i < this.pokemonManager.team.length; i++) {
                    this.pokemonManager.team[i].isInTeam = true;
                }
            }
            if (data.currentEnemy && this.battleSystem) {
                this.battleSystem.currentEnemy = data.currentEnemy;
            }
        }
    }
    
    startEnergyRestore() {
        var self = this;
        if (this.energyRestoreInterval) clearInterval(this.energyRestoreInterval);
        this.energyRestoreInterval = setInterval(function() {
            if (self.pokemonManager) {
                self.pokemonManager.restoreEnergy();
                if (self.uiManager) {
                    self.uiManager.updateUI();
                }
            }
        }, 1000);
    }
    
    startAutoSave() {
        var self = this;
        if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = setInterval(function() {
            self.saveGame();
        }, CONFIG.AUTO_SAVE_INTERVAL || 30000);
    }
    
    cleanup() {
        if (this.energyRestoreInterval) clearInterval(this.energyRestoreInterval);
        if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
        if (this.battleSystem) {
            this.battleSystem.cleanup();
        }
        this.saveGame();
    }
}

window.PokemonClickerGame = PokemonClickerGame;