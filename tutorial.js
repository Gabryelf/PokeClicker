// ==============================
// ТУТОРИАЛ В УГЛУ ЭКРАНА - С ОТСЛЕЖИВАНИЕМ АТАКИ
// ==============================

class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.currentStep = 0;
        this.isTutorialActive = false;
        this.modal = document.getElementById('tutorial');
        this.pointerElement = null;
        this.highlightOverlay = null;
        this.actionHandler = null;
        this.stepTimeout = null;
        this.checkInterval = null;
        this.attackCheckInterval = null;
        this.lastEnemyHp = null;
        
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
                check: null,
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
        
        if (!this.modal) {
            console.error('❌ Модальное окно туториала не найдено');
            return;
        }
        
        this.init();
        this.setupStyles();
    }
    
    init() {
        const completed = localStorage.getItem('pokemon_tutorial_completed');
        if (completed === 'true') {
            this.modal.style.display = 'none';
            this.isTutorialActive = false;
            console.log('📖 Туториал уже пройден');
            return;
        }
        
        console.log('📖 Запуск туториала');
        this.isTutorialActive = true;
        this.currentStep = 0;
        
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
        
        const content = this.modal.querySelector('.tutorial-content');
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
        
        const title = this.modal.querySelector('h2');
        if (title) title.style.display = 'none';
        
        const closeBtn = this.modal.querySelector('.close');
        if (closeBtn) closeBtn.style.display = 'none';
        
        this.showStep(0);
    }
    
    showStep(index) {
        console.log('📖 Показ шага:', index);
        
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
        this.removeHighlightOverlay();
        this.removeActionListeners();
        
        const allSteps = this.modal.querySelectorAll('.tutorial-step');
        allSteps.forEach(el => el.remove());
        
        const step = this.steps[index];
        if (!step) return;
        
        const stepEl = document.createElement('div');
        stepEl.className = 'tutorial-step active';
        stepEl.id = `tutorial-step-${index}`;
        stepEl.style.cssText = `
            display: block !important;
            animation: tutorialFadeIn 0.3s ease;
        `;
        
        let html = `<div style="color: #e0e0e0; font-size: 0.95rem; line-height: 1.5; text-align: center;">${step.message}</div>`;
        
        if (step.hint) {
            html += `<div style="text-align: center; color: #ffd700; font-size: 0.8rem; margin-top: 8px;">💡 ${step.hint}</div>`;
        }
        
        if (step.showButton) {
            if (index === 0) {
                html += `
                    <div style="text-align: center; margin-top: 12px;">
                        <button class="tutorial-start-btn" style="
                            background: linear-gradient(135deg, #4CAF50, #45a049);
                            color: #fff;
                            border: none;
                            padding: 10px 30px;
                            border-radius: 100px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            pointer-events: auto !important;
                        ">
                            🚀 Начать
                        </button>
                    </div>
                `;
            } else if (index === this.steps.length - 1) {
                html += `
                    <div style="text-align: center; margin-top: 12px;">
                        <button class="tutorial-finish-btn" style="
                            background: linear-gradient(135deg, #4CAF50, #45a049);
                            color: #fff;
                            border: none;
                            padding: 10px 30px;
                            border-radius: 100px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            pointer-events: auto !important;
                        ">
                            ✅ Завершить
                        </button>
                    </div>
                `;
            }
        } else if (step.action) {
            html += `<div style="text-align: center; margin-top: 8px; font-size: 0.7rem; color: #666;">👆 Выполните действие</div>`;
        }
        
        stepEl.innerHTML = html;
        this.modal.querySelector('.tutorial-content').appendChild(stepEl);
        
        const startBtn = stepEl.querySelector('.tutorial-start-btn');
        if (startBtn) {
            startBtn.onclick = (e) => {
                e.stopPropagation();
                console.log('🚀 Начало обучения');
                this.goToNextStep();
            };
        }
        
        const finishBtn = stepEl.querySelector('.tutorial-finish-btn');
        if (finishBtn) {
            finishBtn.onclick = (e) => {
                e.stopPropagation();
                this.finishTutorial();
            };
        }
        
        if (step.action && step.target && !step.showButton) {
            this.waitingForAction = true;
            this.actionCompleted = false;
            
            this.stepTimeout = setTimeout(() => {
                this.showPointer(step.target);
                this.highlightElement(step.target);
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
        } else if (!step.action && !step.showButton) {
            this.stepTimeout = setTimeout(() => {
                this.goToNextStep();
            }, 2000);
        }
    }
    
    checkPokemonReceived() {
        console.log('🔍 Проверка получения покемона...');
        this.checkInterval = setInterval(() => {
            if (!this.game || !this.game.pokemonManager) return;
            
            const collection = this.game.pokemonManager.collection;
            if (collection && collection.length > 0) {
                console.log('✅ Покемон получен!');
                clearInterval(this.checkInterval);
                this.checkInterval = null;
                
                this.actionCompleted = true;
                this.waitingForAction = false;
                this.removePointer();
                this.removeHighlightOverlay();
                this.removeActionListeners();
                
                setTimeout(() => {
                    this.goToNextStep();
                }, 500);
            }
        }, 500);
    }
    
    checkCollectionOpened() {
        console.log('🔍 Проверка открытия коллекции...');
        this.checkInterval = setInterval(() => {
            const collectionModal = document.getElementById('collection-modal');
            if (collectionModal && collectionModal.style.display === 'flex') {
                console.log('✅ Коллекция открыта!');
                clearInterval(this.checkInterval);
                this.checkInterval = null;
                
                this.actionCompleted = true;
                this.waitingForAction = false;
                this.removePointer();
                this.removeHighlightOverlay();
                this.removeActionListeners();
                
                setTimeout(() => {
                    this.goToNextStep();
                }, 500);
            }
        }, 500);
    }
    
    checkPokemonInTeam() {
        console.log('🔍 Проверка добавления в команду...');
        this.checkInterval = setInterval(() => {
            if (!this.game || !this.game.pokemonManager) return;
            
            const team = this.game.pokemonManager.team;
            if (team && team.length > 0) {
                console.log('✅ Покемон добавлен в команду!');
                clearInterval(this.checkInterval);
                this.checkInterval = null;
                
                this.actionCompleted = true;
                this.waitingForAction = false;
                this.removePointer();
                this.removeHighlightOverlay();
                this.removeActionListeners();
                
                setTimeout(() => {
                    this.goToNextStep();
                }, 500);
            }
        }, 500);
    }
    
    checkAttackDone() {
        console.log('🔍 Проверка атаки...');
        this.lastEnemyHp = null;
        this.attackCheckInterval = setInterval(() => {
            if (!this.game || !this.game.battleSystem) return;
            
            const enemy = this.game.battleSystem.currentEnemy;
            if (!enemy) return;
            
            const currentHp = enemy.hp;
            
            // Если HP изменилось (уменьшилось) - значит атака была
            if (this.lastEnemyHp !== null && currentHp < this.lastEnemyHp) {
                console.log('✅ Атака выполнена! HP уменьшилось с', this.lastEnemyHp, 'до', currentHp);
                clearInterval(this.attackCheckInterval);
                this.attackCheckInterval = null;
                
                this.actionCompleted = true;
                this.waitingForAction = false;
                this.removePointer();
                this.removeHighlightOverlay();
                this.removeActionListeners();
                
                setTimeout(() => {
                    this.goToNextStep();
                }, 500);
            }
            
            this.lastEnemyHp = currentHp;
        }, 300);
    }
    
    checkMapOpened() {
        console.log('🔍 Проверка открытия карты...');
        this.checkInterval = setInterval(() => {
            const mapModal = document.getElementById('map-modal');
            if (mapModal && mapModal.style.display === 'flex') {
                console.log('✅ Карта открыта!');
                clearInterval(this.checkInterval);
                this.checkInterval = null;
                
                this.actionCompleted = true;
                this.waitingForAction = false;
                this.removePointer();
                this.removeHighlightOverlay();
                this.removeActionListeners();
                
                setTimeout(() => {
                    this.goToNextStep();
                }, 500);
            }
        }, 500);
    }
    
    highlightElement(targetSelector) {
        let target = document.querySelector(targetSelector);
        if (!target) {
            console.warn(`⚠️ Элемент не найден: ${targetSelector}`);
            return;
        }
        
        target.classList.add('tutorial-highlight-target');
        
        setTimeout(() => {
            target.classList.remove('tutorial-highlight-target');
        }, 5000);
    }
    
    removeHighlightOverlay() {
        document.querySelectorAll('.tutorial-highlight-target').forEach(el => {
            el.classList.remove('tutorial-highlight-target');
        });
    }
    
    showPointer(targetSelector) {
        this.removePointer();
        
        let target = document.querySelector(targetSelector);
        if (!target) {
            console.warn(`⚠️ Элемент не найден: ${targetSelector}`);
            return;
        }
        
        const rect = target.getBoundingClientRect();
        
        this.pointerElement = document.createElement('div');
        this.pointerElement.className = 'tutorial-pointer';
        this.pointerElement.innerHTML = `
            <div style="font-size: 2rem; display: block; animation: pointerBounce 1s ease-in-out infinite;">👇</div>
        `;
        
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top - 50;
        
        this.pointerElement.style.cssText = `
            position: fixed;
            top: ${topY}px;
            left: ${centerX - 20}px;
            z-index: 99998;
            pointer-events: none !important;
            text-align: center;
            filter: drop-shadow(0 0 10px rgba(247, 151, 30, 0.5));
        `;
        
        document.body.appendChild(this.pointerElement);
    }
    
    removePointer() {
        if (this.pointerElement) {
            this.pointerElement.remove();
            this.pointerElement = null;
        }
    }
    
    setupActionListener(action, targetSelector, stepIndex) {
        console.log('🎯 Настройка слушателя для:', action);
        
        this.removeActionListeners();
        
        this.actionHandler = (e) => {
            if (this.actionCompleted) return;
            
            let target = null;
            
            switch(action) {
                case 'click-pokeball':
                    target = e.target.closest('.pokeball-item[data-type="NORMAL"]');
                    if (target) {
                        console.log('🔄 Клик по покеболу, ждем получения покемона...');
                        return;
                    }
                    break;
                case 'open-collection':
                    target = e.target.closest('#collection-menu');
                    if (target) {
                        console.log('🔄 Клик по коллекции, ждем открытия...');
                        return;
                    }
                    break;
                case 'add-to-team':
                    target = e.target.closest('.add-to-team-btn');
                    break;
                case 'click-team-slot':
                    target = e.target.closest('.team-slot:not(.empty)');
                    break;
                case 'attack-enemy':
                    target = e.target.closest('.enemy-card');
                    if (target) {
                        console.log('🔄 Клик по врагу, ждем атаки...');
                        // Не завершаем шаг сразу, ждем проверки attack-done
                        return;
                    }
                    break;
                case 'open-map':
                    target = e.target.closest('#map-menu');
                    if (target) {
                        console.log('🔄 Клик по карте, ждем открытия...');
                        return;
                    }
                    break;
                case 'travel-to-location':
                    target = e.target.closest('.location-node.available, .location-node');
                    break;
                default:
                    return;
            }
            
            if (target) {
                console.log('✅ Действие выполнено!');
                e.stopPropagation();
                
                this.removeActionListeners();
                this.removePointer();
                this.removeHighlightOverlay();
                
                this.actionCompleted = true;
                this.waitingForAction = false;
                
                if (this.game && this.game.uiManager) {
                    this.game.uiManager.updateUI();
                }
                
                setTimeout(() => {
                    this.goToNextStep();
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
        const nextIndex = this.currentStep + 1;
        if (nextIndex < this.steps.length) {
            this.currentStep = nextIndex;
            this.showStep(nextIndex);
        } else {
            this.finishTutorial();
        }
    }
    
    finishTutorial() {
        console.log('🎉 Завершение обучения');
        
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
        this.removeHighlightOverlay();
        
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
        console.log('🔄 Сброс туториала');
        
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
        this.removeHighlightOverlay();
        
        this.isTutorialActive = true;
        this.currentStep = 0;
        this.waitingForAction = false;
        this.actionCompleted = false;
        this.lastEnemyHp = null;
        
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
        
        const content = this.modal.querySelector('.tutorial-content');
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
        
        const oldSteps = this.modal.querySelectorAll('.tutorial-step');
        oldSteps.forEach(el => el.remove());
        
        this.showStep(0);
    }
    
    setupStyles() {
        if (!document.getElementById('tutorial-styles-final')) {
            const style = document.createElement('style');
            style.id = 'tutorial-styles-final';
            style.textContent = `
                .tutorial-step {
                    display: none !important;
                }
                
                .tutorial-step.active {
                    display: block !important;
                }
                
                .tutorial-highlight-target {
                    animation: elementPulse 1.5s ease-in-out infinite !important;
                    position: relative;
                    z-index: 99997;
                }
                
                .tutorial-start-btn:hover,
                .tutorial-finish-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
                }
                
                @keyframes tutorialFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes pointerBounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                
                @keyframes elementPulse {
                    0%, 100% {
                        filter: brightness(1);
                        transform: scale(1);
                        box-shadow: 0 0 0 rgba(247, 151, 30, 0);
                    }
                    50% {
                        filter: brightness(1.15);
                        transform: scale(1.03);
                        box-shadow: 0 0 20px rgba(247, 151, 30, 0.3);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

window.TutorialSystem = TutorialSystem;