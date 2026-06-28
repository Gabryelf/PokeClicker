/**
 * Система туториала
 * @module TutorialSystem
 */

 class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.currentStep = 0;
        this.isTutorialActive = false;
        this.modal = document.getElementById('tutorial');
        this.pointerElement = null;
        this.actionHandler = null;
        this.checkInterval = null;
        this.stepTimeout = null;
        this.attackCheckInterval = null;
        this.lastEnemyHp = null;
        this.lastLocation = null;
        this.waitingForAction = false;
        this.actionCompleted = false;
        
        this.steps = [
            {
                message: '👋 Привет! Нажми "Начать", чтобы начать обучение',
                action: 'start',
                target: null,
                hint: null,
                check: null,
                showButton: true
            },
            {
                message: '🎯 Кликни на <b style="color:#ff6b6b;">красный покебол</b> вверху',
                action: 'click-pokeball',
                target: '.pokeball-item[data-type="NORMAL"]',
                hint: 'Красный покебол',
                check: 'pokemon-received',
                showButton: false
            },
            {
                message: '✨ Открой <b style="color:#f7971e;">коллекцию</b> (иконка дракона)',
                action: 'open-collection',
                target: '#collection-menu',
                hint: 'Кнопка коллекции',
                check: 'collection-opened',
                showButton: false
            },
            {
                message: '📦 Нажми <b style="color:#4CAF50;">"В команду"</b> под покемоном',
                action: 'add-to-team',
                target: '.add-to-team-btn',
                hint: 'Кнопка "В команду"',
                check: 'pokemon-in-team',
                showButton: false
            },
            {
                message: '✅ Кликни на <b style="color:#4CAF50;">покемона внизу</b>',
                action: 'click-team-slot',
                target: '.team-slot:not(.empty)',
                hint: 'Слот покемона',
                check: null,
                showButton: false
            },
            {
                message: '⚔️ <b style="color:#ff6b6b;">Атакуй</b> врага! Кликни на него',
                action: 'attack-enemy',
                target: '.enemy-card',
                hint: 'Карточка врага',
                check: 'attack-done',
                showButton: false
            },
            {
                message: '💥 Открой <b style="color:#f7971e;">карту</b> (иконка карты)',
                action: 'open-map',
                target: '#map-menu',
                hint: 'Кнопка карты',
                check: 'map-opened',
                showButton: false
            },
            {
                message: '🗺️ Выбери <b style="color:#4CAF50;">любую локацию</b> на карте',
                action: 'travel-to-location',
                target: '.location-node.available',
                hint: 'Доступная локация',
                check: 'location-changed',
                showButton: false
            },
            {
                message: '🎉 Поздравляю! Ты освоил основы!',
                action: null,
                target: null,
                hint: null,
                check: null,
                showButton: true
            }
        ];
        
        if (!this.modal) return;
        this.init();
        this.setupStyles();
    }
    
    init() {
        var completed = localStorage.getItem('pokemon_tutorial_completed');
        if (completed === 'true') {
            this.modal.style.display = 'none';
            this.isTutorialActive = false;
            return;
        }
        
        this.isTutorialActive = true;
        this.currentStep = 0;
        this.lastLocation = null;
        
        this.modal.style.cssText = `
            display: flex !important;
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            top: auto !important;
            left: auto !important;
            width: auto !important;
            max-width: 350px !important;
            background: none !important;
            backdrop-filter: none !important;
            z-index: 99999 !important;
            pointer-events: none !important;
            padding: 0 !important;
        `;
        
        var content = this.modal.querySelector('.tutorial-content');
        if (content) {
            content.style.cssText = `
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid #f7971e;
                border-radius: 16px;
                padding: 16px 20px;
                max-width: 350px;
                width: 100%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
                pointer-events: auto !important;
                margin: 0;
                position: relative;
            `;
        }
        
        var title = this.modal.querySelector('h2');
        if (title) title.style.display = 'none';
        
        var closeBtn = this.modal.querySelector('.close');
        if (closeBtn) closeBtn.style.display = 'none';
        
        this.showStep(0);
    }
    
    showStep(index) {
        if (this.stepTimeout) {
            clearTimeout(this.stepTimeout);
            this.stepTimeout = null;
        }
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.attackCheckInterval) {
            clearInterval(this.attackCheckInterval);
            this.attackCheckInterval = null;
        }
        
        this.removePointer();
        this.removeActionListeners();
        
        var allSteps = this.modal.querySelectorAll('.tutorial-step');
        allSteps.forEach(function(el) { el.remove(); });
        
        var step = this.steps[index];
        if (!step) return;
        
        var stepEl = document.createElement('div');
        stepEl.className = 'tutorial-step active';
        stepEl.id = 'tutorial-step-' + index;
        stepEl.style.cssText = 'display: block !important; animation: tutorialFadeIn 0.3s ease;';
        
        var html = '<div style="color: #e0e0e0; font-size: 0.95rem; line-height: 1.5; text-align: center;">' + step.message + '</div>';
        
        if (step.hint) {
            html += '<div style="text-align: center; color: #ffd700; font-size: 0.8rem; margin-top: 8px;">💡 ' + step.hint + '</div>';
        }
        
        if (step.showButton) {
            if (index === 0) {
                html += '<div style="text-align: center; margin-top: 12px;"><button class="tutorial-start-btn" style="background: linear-gradient(135deg, #4CAF50, #45a049); color: #fff; border: none; padding: 10px 30px; border-radius: 100px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; pointer-events: auto !important;">🚀 Начать</button></div>';
            } else if (index === this.steps.length - 1) {
                html += '<div style="text-align: center; margin-top: 12px;"><button class="tutorial-finish-btn" style="background: linear-gradient(135deg, #4CAF50, #45a049); color: #fff; border: none; padding: 10px 30px; border-radius: 100px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; pointer-events: auto !important;">✅ Завершить</button></div>';
            }
        } else if (step.action) {
            html += '<div style="text-align: center; margin-top: 8px; font-size: 0.7rem; color: #666;">👆 Выполните действие</div>';
        }
        
        stepEl.innerHTML = html;
        this.modal.querySelector('.tutorial-content').appendChild(stepEl);
        
        var startBtn = stepEl.querySelector('.tutorial-start-btn');
        if (startBtn) {
            var self = this;
            startBtn.onclick = function(e) {
                e.stopPropagation();
                self.goToNextStep();
            };
        }
        
        var finishBtn = stepEl.querySelector('.tutorial-finish-btn');
        if (finishBtn) {
            var self = this;
            finishBtn.onclick = function(e) {
                e.stopPropagation();
                self.finishTutorial();
            };
        }
        
        if (step.action && step.target && !step.showButton) {
            this.waitingForAction = true;
            this.actionCompleted = false;
            
            var self = this;
            this.stepTimeout = setTimeout(function() {
                self.showPointer(step.target);
            }, 300);
            
            this.setupActionListener(step.action, step.target, index);
            
            if (step.check === 'pokemon-received') {
                this.checkPokemonReceived();
            }
            if (step.check === 'collection-opened') {
                this.checkCollectionOpened();
            }
            if (step.check === 'pokemon-in-team') {
                this.checkPokemonInTeam();
            }
            if (step.check === 'attack-done') {
                this.checkAttackDone();
            }
            if (step.check === 'map-opened') {
                this.checkMapOpened();
            }
            if (step.check === 'location-changed') {
                this.checkLocationChanged();
            }
        } else if (!step.action && !step.showButton) {
            var self = this;
            this.stepTimeout = setTimeout(function() {
                self.goToNextStep();
            }, 2000);
        }
    }
    
    checkPokemonReceived() {
        var self = this;
        this.checkInterval = setInterval(function() {
            if (!self.game || !self.game.pokemonManager) return;
            var collection = self.game.pokemonManager.collection;
            if (collection && collection.length > 0) {
                clearInterval(self.checkInterval);
                self.checkInterval = null;
                self.actionCompleted = true;
                self.waitingForAction = false;
                self.removePointer();
                self.removeActionListeners();
                setTimeout(function() {
                    self.goToNextStep();
                }, 500);
            }
        }, 500);
    }
    
    checkCollectionOpened() {
        var self = this;
        this.checkInterval = setInterval(function() {
            var collectionModal = document.getElementById('collection-modal');
            if (collectionModal && collectionModal.style.display === 'flex') {
                clearInterval(self.checkInterval);
                self.checkInterval = null;
                self.actionCompleted = true;
                self.waitingForAction = false;
                self.removePointer();
                self.removeActionListeners();
                setTimeout(function() {
                    self.goToNextStep();
                }, 500);
            }
        }, 500);
    }
    
    checkPokemonInTeam() {
        var self = this;
        this.checkInterval = setInterval(function() {
            if (!self.game || !self.game.pokemonManager) return;
            var team = self.game.pokemonManager.team;
            if (team && team.length > 0) {
                clearInterval(self.checkInterval);
                self.checkInterval = null;
                self.actionCompleted = true;
                self.waitingForAction = false;
                self.removePointer();
                self.removeActionListeners();
                setTimeout(function() {
                    self.goToNextStep();
                }, 500);
            }
        }, 500);
    }
    
    checkAttackDone() {
        var self = this;
        this.lastEnemyHp = null;
        this.attackCheckInterval = setInterval(function() {
            if (!self.game || !self.game.battleSystem) return;
            var enemy = self.game.battleSystem.currentEnemy;
            if (!enemy) return;
            var currentHp = enemy.hp;
            if (self.lastEnemyHp !== null && currentHp < self.lastEnemyHp) {
                clearInterval(self.attackCheckInterval);
                self.attackCheckInterval = null;
                self.actionCompleted = true;
                self.waitingForAction = false;
                self.removePointer();
                self.removeActionListeners();
                setTimeout(function() {
                    self.goToNextStep();
                }, 500);
            }
            self.lastEnemyHp = currentHp;
        }, 300);
    }
    
    checkMapOpened() {
        var self = this;
        this.checkInterval = setInterval(function() {
            var mapModal = document.getElementById('map-modal');
            if (mapModal && mapModal.style.display === 'flex') {
                clearInterval(self.checkInterval);
                self.checkInterval = null;
                self.actionCompleted = true;
                self.waitingForAction = false;
                self.removePointer();
                self.removeActionListeners();
                setTimeout(function() {
                    self.goToNextStep();
                }, 500);
            }
        }, 500);
    }
    
    checkLocationChanged() {
        var self = this;
        this.lastLocation = null;
        if (this.game && this.game.locationSystem) {
            this.lastLocation = this.game.locationSystem.currentLocation;
        }
        this.checkInterval = setInterval(function() {
            if (!self.game || !self.game.locationSystem) return;
            var currentLocation = self.game.locationSystem.currentLocation;
            if (self.lastLocation !== null && currentLocation !== self.lastLocation) {
                clearInterval(self.checkInterval);
                self.checkInterval = null;
                self.actionCompleted = true;
                self.waitingForAction = false;
                self.removePointer();
                self.removeActionListeners();
                setTimeout(function() {
                    self.goToNextStep();
                }, 500);
            }
            self.lastLocation = currentLocation;
        }, 500);
    }
    
    showPointer(targetSelector) {
        this.removePointer();
        var target = document.querySelector(targetSelector);
        if (!target) return;
        
        var rect = target.getBoundingClientRect();
        this.pointerElement = document.createElement('div');
        this.pointerElement.className = 'tutorial-pointer';
        this.pointerElement.innerHTML = '<div style="font-size: 2rem; display: block; animation: pointerBounce 1s ease-in-out infinite;">👇</div>';
        var centerX = rect.left + rect.width / 2;
        var topY = rect.top - 50;
        this.pointerElement.style.cssText = 'position: fixed; top: ' + topY + 'px; left: ' + (centerX - 20) + 'px; z-index: 99998; pointer-events: none !important; text-align: center; filter: drop-shadow(0 0 10px rgba(247, 151, 30, 0.5));';
        document.body.appendChild(this.pointerElement);
    }
    
    removePointer() {
        if (this.pointerElement) {
            this.pointerElement.remove();
            this.pointerElement = null;
        }
    }
    
    setupActionListener(action, targetSelector, stepIndex) {
        this.removeActionListeners();
        var self = this;
        
        this.actionHandler = function(e) {
            if (self.actionCompleted) return;
            var target = null;
            
            switch(action) {
                case 'click-pokeball':
                    target = e.target.closest('.pokeball-item[data-type="NORMAL"]');
                    if (target) return;
                    break;
                case 'open-collection':
                    target = e.target.closest('#collection-menu');
                    if (target) return;
                    break;
                case 'add-to-team':
                    target = e.target.closest('.add-to-team-btn');
                    break;
                case 'click-team-slot':
                    target = e.target.closest('.team-slot:not(.empty)');
                    break;
                case 'attack-enemy':
                    target = e.target.closest('.enemy-card');
                    if (target) return;
                    break;
                case 'open-map':
                    target = e.target.closest('#map-menu');
                    if (target) return;
                    break;
                case 'travel-to-location':
                    target = e.target.closest('.location-node.available, .location-node');
                    if (target) return;
                    break;
                default:
                    return;
            }
            
            if (target) {
                e.stopPropagation();
                self.removeActionListeners();
                self.removePointer();
                self.actionCompleted = true;
                self.waitingForAction = false;
                if (self.game && self.game.uiManager) {
                    self.game.uiManager.updateUI();
                }
                setTimeout(function() {
                    self.goToNextStep();
                }, 300);
            }
        };
        
        document.addEventListener('click', this.actionHandler);
    }
    
    removeActionListeners() {
        if (this.actionHandler) {
            document.removeEventListener('click', this.actionHandler);
            this.actionHandler = null;
        }
    }
    
    goToNextStep() {
        var nextIndex = this.currentStep + 1;
        if (nextIndex < this.steps.length) {
            this.currentStep = nextIndex;
            this.showStep(nextIndex);
        } else {
            this.finishTutorial();
        }
    }
    
    finishTutorial() {
        if (this.stepTimeout) {
            clearTimeout(this.stepTimeout);
            this.stepTimeout = null;
        }
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.attackCheckInterval) {
            clearInterval(this.attackCheckInterval);
            this.attackCheckInterval = null;
        }
        
        this.removeActionListeners();
        this.removePointer();
        
        this.modal.style.cssText = '';
        this.modal.style.display = 'none';
        this.isTutorialActive = false;
        localStorage.setItem('pokemon_tutorial_completed', 'true');
        
        if (this.game && this.game.pokemonManager && this.game.pokemonManager.collection.length === 0) {
            this.game.addStarterPokemon();
        }
        if (this.game && this.game.uiManager) {
            this.game.uiManager.updateUI();
        }
        if (this.game && this.game.showNotification) {
            this.game.showNotification('🎊 Добро пожаловать в мир покемонов!', 'success');
        }
    }
    
    resetTutorial() {
        localStorage.removeItem('pokemon_tutorial_completed');
        
        if (this.stepTimeout) {
            clearTimeout(this.stepTimeout);
            this.stepTimeout = null;
        }
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.attackCheckInterval) {
            clearInterval(this.attackCheckInterval);
            this.attackCheckInterval = null;
        }
        
        this.removeActionListeners();
        this.removePointer();
        this.isTutorialActive = true;
        this.currentStep = 0;
        this.waitingForAction = false;
        this.actionCompleted = false;
        this.lastEnemyHp = null;
        this.lastLocation = null;
        
        this.modal.style.cssText = `
            display: flex !important;
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            top: auto !important;
            left: auto !important;
            width: auto !important;
            max-width: 350px !important;
            background: none !important;
            backdrop-filter: none !important;
            z-index: 99999 !important;
            pointer-events: none !important;
            padding: 0 !important;
        `;
        
        var content = this.modal.querySelector('.tutorial-content');
        if (content) {
            content.style.cssText = `
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid #f7971e;
                border-radius: 16px;
                padding: 16px 20px;
                max-width: 350px;
                width: 100%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
                pointer-events: auto !important;
                margin: 0;
                position: relative;
            `;
        }
        
        var oldSteps = this.modal.querySelectorAll('.tutorial-step');
        oldSteps.forEach(function(el) { el.remove(); });
        
        this.showStep(0);
    }
    
    setupStyles() {
        if (document.getElementById('tutorial-styles-final')) return;
        var style = document.createElement('style');
        style.id = 'tutorial-styles-final';
        style.textContent = `
            .tutorial-step { display: none !important; }
            .tutorial-step.active { display: block !important; }
            @keyframes tutorialFadeIn {
                from { opacity: 0; transform: translateY(10px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes pointerBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
        `;
        document.head.appendChild(style);
    }
}

window.TutorialSystem = TutorialSystem;