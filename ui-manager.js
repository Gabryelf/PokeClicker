// ==============================
// МЕНЕДЖЕР ИНТЕРФЕЙСА С ПОДДЕРЖКОЙ СЛИЯНИЯ И СБРОСА ТУТОРИАЛА
// ==============================

class UIManager {
    constructor(game, imageManager) {
        console.log('UIManager инициализируется');
        this.game = game;
        this.imageManager = imageManager;
        this.modals = {};
        this.activeTab = 'collection';
        this.isProcessingPokeball = false;
        this.hasShownEmptyPokeballNotification = false;
        
        this.initModals();
        this.createMergeModal();
        this.addTutorialResetButton();
        
        // Не сразу устанавливаем обработчики, ждем загрузки DOM
        setTimeout(() => {
            console.log('UIManager: устанавливаем обработчики');
            this.setupPokeballClickHandlers();
            this.setupTeamSlotClickHandlers();
            this.initEventListeners();
        }, 1000);
    }
    
    // НОВЫЙ МЕТОД: Добавляет кнопку сброса туториала в коллекцию
    addTutorialResetButton() {
        // Ждем, пока модальное окно коллекции будет создано
        const collectionModal = document.getElementById('collection-modal');
        if (!collectionModal) {
            console.warn('Модальное окно коллекции не найдено');
            return;
        }
        
        // Ищем хедер
        const header = collectionModal.querySelector('.modal-header');
        if (!header) {
            console.warn('Хедер модального окна не найден');
            return;
        }
        
        // Проверяем, есть ли уже кнопка
        if (header.querySelector('.tutorial-reset-btn')) {
            return;
        }
        
        // Создаем кнопку
        const resetBtn = document.createElement('button');
        resetBtn.className = 'tutorial-reset-btn';
        resetBtn.innerHTML = `
            <i class="fas fa-graduation-cap"></i>
            <span>Обучение</span>
        `;
        resetBtn.title = 'Пройти обучение заново';
        resetBtn.style.cssText = `
            background: linear-gradient(135deg, #f7971e, #ffd200);
            border: none;
            border-radius: 100px;
            padding: 6px 16px;
            color: #1a1a2e;
            font-weight: 600;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-left: auto;
            box-shadow: 0 2px 10px rgba(247, 151, 30, 0.3);
            flex-shrink: 0;
        `;
        
        // Стили при наведении
        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.style.transform = 'scale(1.05)';
            resetBtn.style.boxShadow = '0 4px 20px rgba(247, 151, 30, 0.5)';
        });
        
        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.style.transform = 'scale(1)';
            resetBtn.style.boxShadow = '0 2px 10px rgba(247, 151, 30, 0.3)';
        });
        
        // Обработчик клика
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showTutorialResetConfirmation();
        });
        
        // Вставляем кнопку в хедер
        header.appendChild(resetBtn);
        console.log('✅ Кнопка сброса туториала добавлена');
    }
    
    // НОВЫЙ МЕТОД: Показывает диалог подтверждения сброса туториала
    showTutorialResetConfirmation() {
        // Создаем оверлей
        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.3s ease;
        `;
        
        // Создаем диалог
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #f7971e;
            border-radius: 20px;
            padding: 35px 30px;
            max-width: 450px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
            animation: scaleIn 0.3s ease;
        `;
        
        dialog.innerHTML = `
            <div style="font-size: 3.5rem; margin-bottom: 15px;">
                🎓
            </div>
            <h3 style="color: #fff; margin-bottom: 10px; font-size: 1.3rem;">
                Пройти обучение заново?
            </h3>
            <p style="color: #aaa; margin-bottom: 25px; line-height: 1.6; font-size: 0.95rem;">
                Вы сможете заново пройти все шаги туториала.<br>
                Это <strong style="color: #4CAF50;">не повлияет</strong> на ваш прогресс в игре.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button class="confirmation-btn cancel-btn" style="
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 10px 30px;
                    border-radius: 100px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                ">
                    Отмена
                </button>
                <button class="confirmation-btn confirm-btn" style="
                    background: linear-gradient(135deg, #f7971e, #ffd200);
                    color: #1a1a2e;
                    border: none;
                    padding: 10px 30px;
                    border-radius: 100px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                    box-shadow: 0 4px 15px rgba(247, 151, 30, 0.3);
                ">
                    Начать обучение
                </button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Обработчики кнопок
        const cancelBtn = dialog.querySelector('.cancel-btn');
        const confirmBtn = dialog.querySelector('.confirm-btn');
        
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
        });
        
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.transform = 'scale(1.05)';
            cancelBtn.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        });
        
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.transform = 'scale(1)';
            cancelBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        confirmBtn.addEventListener('click', () => {
            // Закрываем все модальные окна
            this.closeAllModals();
            
            // Удаляем оверлей
            overlay.remove();
            
            // Сбрасываем туториал
            if (this.game && this.game.tutorialSystem) {
                this.game.tutorialSystem.resetTutorial();
                this.game.showNotification('🔄 Обучение перезапущено!', 'success');
            } else {
                // Если туториал не инициализирован, создаем новый
                localStorage.removeItem('pokemon_tutorial_completed');
                this.game.showNotification('🔄 Перезагрузка для запуска обучения...', 'info');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        });
        
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.transform = 'scale(1.05)';
            confirmBtn.style.boxShadow = '0 6px 25px rgba(247, 151, 30, 0.5)';
        });
        
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.transform = 'scale(1)';
            confirmBtn.style.boxShadow = '0 4px 15px rgba(247, 151, 30, 0.3)';
        });
        
        // Закрытие по клику на оверлей
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        // Закрытие по Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    // НОВЫЙ МЕТОД: Закрывает все модальные окна
    closeAllModals() {
        Object.values(this.modals).forEach(modal => {
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        });
        
        // Также закрываем карту, если она открыта
        const mapModal = document.getElementById('map-modal');
        if (mapModal) {
            mapModal.style.display = 'none';
        }
    }
    
    initModals() {
        const modals = ['collection', 'shop', 'team', 'hero', 'hero-upgrade', 'pokemon-center', 'gym'];
        
        modals.forEach(modalName => {
            const modal = document.getElementById(`${modalName}-modal`);
            if (modal) {
                this.modals[modalName] = modal;
                
                // Находим все кнопки закрытия в этом модальном окне
                const closeBtns = modal.querySelectorAll('.close, .close-merge, .close-map, .close-hero, .close-upgrade');
                closeBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        modal.style.display = 'none';
                    });
                });
                
                // Закрытие по клику вне модального окна
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
                
                // Предотвращаем закрытие при клике на контент
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }
            }
        });
    }
    
    initEventListeners() {
        console.log('Инициализация обработчиков событий UIManager');
        
        // Клик по врагу для атаки
        const enemyCard = document.querySelector('.enemy-card');
        if (enemyCard) {
            enemyCard.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.game.manualAttack();
            });
        }
        
        // Навигационные кнопки - прямой поиск по ID
        const collectionBtn = document.getElementById('collection-menu');
        if (collectionBtn) {
            collectionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Клик по кнопке коллекции');
                this.showModal('collection');
                // Добавляем кнопку сброса каждый раз при открытии коллекции
                setTimeout(() => {
                    this.addTutorialResetButton();
                }, 100);
            });
        } else {
            console.error('Кнопка коллекции не найдена');
        }
        
        const shopBtn = document.getElementById('shop-menu');
        if (shopBtn) {
            shopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Клик по кнопке магазина');
                this.showModal('shop');
            });
        } else {
            console.error('Кнопка магазина не найдена');
        }
        
        const mapBtn = document.getElementById('map-menu');
        if (mapBtn) {
            mapBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Клик по кнопке карты');
                if (this.game.mapModal) {
                    this.game.mapModal.show();
                } else {
                    console.error('mapModal не инициализирован');
                }
            });
        } else {
            console.error('Кнопка карты не найдена');
        }
        
        // Клик по аватару открывает выбор героя
        const avatarCircle = document.getElementById('avatar-circle');
        if (avatarCircle) {
            avatarCircle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Клик по аватару');
                this.showHeroModal();
            });
        }
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                this.game.manualAttack();
            }
        });
    }
    
    setupPokeballClickHandlers() {
        const pokeballItems = document.querySelectorAll('.pokeball-item');
        pokeballItems.forEach(item => {
            // Удаляем старые обработчики
            item.removeEventListener('click', this.pokeballClickHandler);
            // Создаем новый обработчик с привязкой к контексту
            this.pokeballClickHandler = (e) => {
                e.stopPropagation();
                const type = item.dataset.type;
                this.handlePokeballClick(type);
            };
            // Добавляем новый обработчик
            item.addEventListener('click', this.pokeballClickHandler);
        });
    }

    setupTeamSlotClickHandlers() {
        const teamSlots = document.getElementById('team-slots');
        if (teamSlots) {
            // Удаляем старые обработчики
            teamSlots.removeEventListener('click', this.teamSlotClickHandler);
            
            this.teamSlotClickHandler = (e) => {
                // Проверяем, кликнули ли на слот (включая пустые)
                const slot = e.target.closest('.team-slot');
                if (slot) {
                    // Открываем окно управления командой
                    this.showModal('team');
                }
            };
            
            teamSlots.addEventListener('click', this.teamSlotClickHandler);
        }
    }

    handlePokeballClick(type) {
        // Проверяем, не блокирует ли туториал клики
        if (this.game.tutorialSystem && this.game.tutorialSystem.isTutorialActive) {
            const step = this.game.tutorialSystem.steps[this.game.tutorialSystem.currentStep];
            if (step && step.action === 'click-pokeball') {
                // Разрешаем клик для туториала
                console.log('🎯 Клик по покеболу разрешен для туториала');
            } else {
                // Показываем подсказку, но не блокируем полностью
                this.game.showNotification('🎓 Следуй указаниям туториала!', 'info');
                return;
            }
        }
        
        if (this.isProcessingPokeball) {
            return;
        }
        
        const count = this.game.shopSystem.pokeballs[type];
        
        if (count > 0) {
            this.isProcessingPokeball = true;
            this.hasShownEmptyPokeballNotification = false;
            this.openPokeballWithAnimation(type);
        } else {
            if (!this.hasShownEmptyPokeballNotification) {
                this.game.showNotification('Купите покеболы в магазине!', 'warning');
                this.hasShownEmptyPokeballNotification = true;
            }
            this.showModal('shop');
        }
    }
    
    async openPokeballWithAnimation(type) {
        try {
            const overlay = document.createElement('div');
            overlay.className = 'pokeball-open-overlay';
            document.body.appendChild(overlay);
            
            const animContainer = document.createElement('div');
            animContainer.className = 'pokeball-open-animation';
            
            const pokeballImg = await this.imageManager.getPokeballImage(type);
            const img = document.createElement('img');
            img.src = pokeballImg.src;
            animContainer.appendChild(img);
            overlay.appendChild(animContainer);
            
            await new Promise(resolve => setTimeout(resolve, 800));
            
            overlay.remove();
            
            const pokemon = this.game.shopSystem.openPokeball(type);
            
            if (pokemon) {
                await this.showRevealedPokemon(pokemon);
                await this.updateUI();
                this.game.saveGame();
                
                if (typeof GameSoundGenerator !== 'undefined') {
                    GameSoundGenerator.playPokemonCry();
                }
            }
            
            this.isProcessingPokeball = false;
            
        } catch (e) {
            console.error('Ошибка анимации покебола:', e);
            this.isProcessingPokeball = false;
        }
    }
    
    async showRevealedPokemon(pokemon) {
        return new Promise(async (resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'pokemon-reveal-overlay';
            
            const revealContainer = document.createElement('div');
            revealContainer.className = 'pokemon-reveal-animation';
            
            try {
                const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
                const img = document.createElement('img');
                img.src = pokemonImg.src;
                revealContainer.appendChild(img);
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'pokemon-name-reveal';
                nameDiv.textContent = pokemon.name;
                revealContainer.appendChild(nameDiv);
                
                overlay.appendChild(revealContainer);
                document.body.appendChild(overlay);
                
                this.game.showNotification(`Вы получили ${pokemon.name}!`, 'success');
                
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 2000);
                
            } catch (e) {
                console.error('Ошибка показа покемона:', e);
                overlay.remove();
                resolve();
            }
        });
    }
    
    showMergeAnimation(mergeData) {
        console.log('Показ анимации слияния', mergeData);
        
        const modal = document.getElementById('merge-modal');
        if (!modal) {
            console.error('Модальное окно слияния не найдено!');
            this.createMergeModal();
            setTimeout(() => {
                this.showMergeAnimation(mergeData);
            }, 100);
            return;
        }
        
        const pokemon = mergeData.pokemon;
        
        const nameEl = modal.querySelector('.merge-name');
        if (nameEl) {
            nameEl.textContent = `${pokemon.name} #${pokemon.level}`;
        }
        
        const levelChange = modal.querySelector('.level-change');
        if (levelChange) {
            levelChange.innerHTML = `${mergeData.oldLevel} → <span class="increase">${mergeData.newLevel}</span>`;
        }
        
        const damageChange = modal.querySelector('.damage-change');
        if (damageChange) {
            damageChange.innerHTML = `${Math.floor(mergeData.oldDamage)} → <span class="increase">${Math.floor(mergeData.newDamage)}</span>`;
        }
        
        const mergeCount = modal.querySelector('.merge-count');
        if (mergeCount) {
            mergeCount.textContent = mergeData.mergeCount;
        }
        
        this.loadPokemonImage(modal.querySelector('.original'), pokemon.id);
        this.loadPokemonImage(modal.querySelector('.duplicate'), pokemon.id);
        this.loadPokemonImage(modal.querySelector('.result'), pokemon.id);
        
        modal.style.display = 'flex';
        
        const elements = modal.querySelectorAll('.merge-pokemon, .merge-plus, .merge-equals');
        elements.forEach((el, i) => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = `mergeAppear 0.5s ease forwards ${i * 0.1}s`;
        });
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 6000);
    }
    
    createMergeModal() {
        if (document.getElementById('merge-modal')) {
            console.log('Модальное окно слияния уже существует');
            return;
        }
        
        console.log('Создание модального окна слияния');
        
        const modal = document.createElement('div');
        modal.id = 'merge-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content merge-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-merge"></i> Слияние покемонов!</h2>
                    <span class="close-merge">&times;</span>
                </div>
                <div class="modal-body merge-body">
                    <div class="merge-animation">
                        <div class="merge-pokemon original"></div>
                        <div class="merge-plus">+</div>
                        <div class="merge-pokemon duplicate"></div>
                        <div class="merge-equals">=</div>
                        <div class="merge-pokemon result"></div>
                    </div>
                    <div class="merge-details">
                        <h3 class="merge-name"></h3>
                        <div class="merge-stats">
                            <div class="stat">
                                <span>Уровень</span>
                                <span class="level-change"></span>
                            </div>
                            <div class="stat">
                                <span>Урон</span>
                                <span class="damage-change"></span>
                            </div>
                            <div class="stat">
                                <span>Слияний</span>
                                <span class="merge-count"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.close-merge');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                modal.style.display = 'none';
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        this.addMergeStyles();
    }
    
    addMergeStyles() {
        if (document.getElementById('merge-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'merge-styles';
        style.textContent = `
            .merge-modal .modal-content {
                max-width: 500px;
            }
            
            .merge-animation {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin: 30px 0;
            }
            
            .merge-pokemon {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid var(--accent-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            
            .merge-pokemon img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            .merge-plus, .merge-equals {
                font-size: 2rem;
                color: var(--text-secondary);
                font-weight: bold;
            }
            
            .merge-details {
                text-align: center;
            }
            
            .merge-name {
                font-size: 1.5rem;
                margin-bottom: 20px;
                color: var(--accent-warning);
            }
            
            .merge-stats {
                display: flex;
                justify-content: center;
                gap: 30px;
            }
            
            .stat {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .stat span:first-child {
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            .stat .increase {
                color: var(--accent-success);
                font-weight: bold;
            }
            
            @keyframes mergeAppear {
                from {
                    opacity: 0;
                    transform: scale(0.5) rotate(-180deg);
                }
                to {
                    opacity: 1;
                    transform: scale(1) rotate(0);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    async loadPokemonImage(container, pokemonId) {
        try {
            const img = await this.imageManager.getPokemonImage(pokemonId);
            container.innerHTML = '';
            container.appendChild(img.cloneNode());
        } catch (e) {
            console.error('Ошибка загрузки изображения:', e);
        }
    }
    
    showModal(modalName) {
        console.log('Открытие модального окна:', modalName);
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'flex';
            this.setActiveTab(modalName);
            
            switch(modalName) {
                case 'collection':
                    this.createCollectionUI();
                    // Добавляем кнопку сброса каждый раз при открытии коллекции
                    setTimeout(() => {
                        this.addTutorialResetButton();
                    }, 100);
                    break;
                case 'shop':
                    if (this.game.shopSystem) {
                        this.game.shopSystem.createShopUI();
                    }
                    break;
                case 'team':
                    this.createTeamSelectionUI();
                    break;
                default:
                    console.log('Неизвестное модальное окно:', modalName);
            }
        } else {
            console.error('Модальное окно не найдено:', modalName);
        }
    }
    
    async updateUI() {
        console.log('Обновление UI');
        
        await this.updateTeamDisplay();
        
        if (this.game.battleSystem) {
            this.game.battleSystem.updateUI();
        }
        
        if (this.game.shopSystem) {
            this.game.shopSystem.updateMoneyDisplay();
            this.game.shopSystem.updatePokeballsDisplay();
        }
        
        const team = this.game.pokemonManager.team;
        if (team.length > 0) {
            const maxLevel = Math.max(...team.map(p => p.level));
            const playerLevelEl = document.getElementById('player-level');
            if (playerLevelEl) {
                playerLevelEl.textContent = maxLevel;
            }
        }
        
        await this.updateAvatar();
        
        if (this.game.locationSystem) {
            const locationNameEl = document.getElementById('current-location-name');
            if (locationNameEl) {
                const location = this.game.locationSystem.locations[this.game.locationSystem.currentLocation];
                locationNameEl.textContent = location ? location.name : 'Паллет Таун';
            }
        }
        
        const heroBonusEl = document.getElementById('hero-bonus-text');
        if (heroBonusEl && this.game.heroSystem) {
            const bonus = this.game.heroSystem.getHeroBonus();
            heroBonusEl.textContent = `+${bonus}%`;
        }
        
        this.setupPokeballClickHandlers();
        this.setupTeamSlotClickHandlers();
    }

    async createShopUI() {
        const shopContainer = document.getElementById('shop-items');
        if (!shopContainer) return;
        
        shopContainer.innerHTML = '';
        
        const items = [
            { type: 'NORMAL_BALL', name: 'Покебол', price: GAME_CONFIG.SHOP_PRICES.NORMAL_BALL, icon: 'NORMAL' },
            { type: 'MASTER_BALL', name: 'Мастербол', price: GAME_CONFIG.SHOP_PRICES.MASTER_BALL, icon: 'MASTER' },
            { type: 'MYTHIC_BALL', name: 'Мификбол', price: GAME_CONFIG.SHOP_PRICES.MYTHIC_BALL, icon: 'MYTHIC' }
        ];
        
        for (const item of items) {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            
            const img = document.createElement('img');
            img.className = 'shop-item-image';
            img.alt = item.name;
            img.width = 80;
            img.height = 80;
            
            try {
                const pokeballImg = await this.imageManager.getPokeballImage(item.icon);
                img.src = pokeballImg.src;
            } catch (e) {
                console.error(`❌ Ошибка загрузки изображения для ${item.name}:`, e);
                img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
            }
            
            itemElement.innerHTML = `
                <div class="shop-item-image-container">
                    <img src="${img.src}" alt="${item.name}" class="shop-item-image" width="80" height="80">
                </div>
                <div class="shop-item-info">
                    <h4>${item.name}</h4>
                    <div class="price">
                        <i class="fas fa-coins"></i>
                        <span>${item.price}</span>
                    </div>
                </div>
                <button class="buy-btn" data-type="${item.type.split('_')[0]}">Купить</button>
            `;
            
            shopContainer.appendChild(itemElement);
        }
        
        shopContainer.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ballType = e.target.dataset.type;
                this.game.shopSystem.buyPokeball(ballType);
                this.createShopUI();
            });
        });
    }
    
    setActiveTab(tabName) {
        this.activeTab = tabName;
        const tabs = ['collection', 'shop', 'team'];
        tabs.forEach(tab => {
            const btn = document.getElementById(`${tab}-menu`);
            if (btn) {
                if (tab === tabName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    }

    async createCollectionUI() {
        const collectionGrid = document.getElementById('collection-grid');
        if (!collectionGrid) return;
        
        collectionGrid.innerHTML = '';
        
        const collection = this.game.pokemonManager.collection;
        
        if (collection.length === 0) {
            collectionGrid.innerHTML = '<div class="empty-collection"><i class="fas fa-box-open"></i><p>Коллекция пуста! Откройте покеболы, кликнув на них в шапке.</p></div>';
            return;
        }
        
        // Сортируем по уровню (по убыванию)
        collection.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
        
        for (const pokemon of collection) {
            const card = await this.createPokemonCardWithButton(pokemon);
            collectionGrid.appendChild(card);
        }
    }


    async createPokemonCardWithButton(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.dataset.id = pokemon.id;
        
        const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        const isInTeam = this.game.pokemonManager.team.some(p => p.id === pokemon.id);
        
        // Создаем изображение
        const img = document.createElement('img');
        img.className = 'pokemon-image';
        img.alt = pokemon.name;
        img.width = 100;
        img.height = 100;
        
        try {
            const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            console.error(`❌ Ошибка загрузки изображения для ${pokemon.name}:`, e);
            img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
        }
        
        // Создаем HTML карточки
        card.innerHTML = `
            <div class="pokemon-image-container">
                <img src="${img.src}" alt="${pokemon.name}" class="pokemon-image" width="100" height="100">
            </div>
            <h4>${pokemon.name}</h4>
            <div class="pokemon-rarity" style="color: ${rarity.color}; border-color: ${rarity.color}">
                ${rarity.name}
            </div>
            <div class="pokemon-stats">
                <div>Уровень: ${pokemon.level}</div>
                <div>Урон: ${Math.floor(pokemon.currentDamage)}</div>
                <div>Энергия: ${Math.floor(energyPercent)}%</div>
                <div>Слияний: ${pokemon.mergeCount || 0}</div>
            </div>
            <div class="pokemon-card-actions">
                ${isInTeam ? 
                    `<button class="remove-from-team-btn" data-id="${pokemon.id}" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        width: 100%;
                    ">❌ Убрать из команды</button>` :
                    `<button class="add-to-team-btn" data-id="${pokemon.id}" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        width: 100%;
                    ">➕ В команду</button>`
                }
            </div>
            ${isInTeam ? '<div class="in-team-badge" style="background: #4CAF50; color: white; padding: 4px 12px; border-radius: 100px; font-size: 0.7rem; margin-top: 8px; display: inline-block;">✅ В команде</div>' : ''}
        `;
        
        // Добавляем обработчики
        const addBtn = card.querySelector('.add-to-team-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(addBtn.dataset.id);
                const result = this.game.addToTeam(id);
                if (result.success) {
                    this.createCollectionUI();
                    this.updateUI();
                }
            });
        }
        
        const removeBtn = card.querySelector('.remove-from-team-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(removeBtn.dataset.id);
                this.game.removeFromTeam(id);
                this.createCollectionUI();
                this.updateUI();
            });
        }
        
        return card;
    }


    async updateTeamDisplay() {
        const teamSlots = document.getElementById('team-slots');
        if (!teamSlots) return;
        
        teamSlots.innerHTML = '';
        const team = this.game.pokemonManager.team;
        const maxTeamSize = this.game.pokemonManager.maxTeamSize || 3;
        
        // Показываем покемонов в команде
        for (let i = 0; i < Math.min(team.length, maxTeamSize); i++) {
            const pokemon = team[i];
            const slot = document.createElement('div');
            slot.className = 'team-slot occupied';
            slot.dataset.id = pokemon.id;
            slot.style.setProperty('--i', Math.random() * 2);
            
            // Загружаем изображение
            let imgHtml = '';
            try {
                const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
                imgHtml = `<img src="${pokemonImg.src}" alt="${pokemon.name}" class="team-pokemon-image" width="50" height="50">`;
            } catch (e) {
                imgHtml = `<div class="team-pokemon-placeholder">?</div>`;
            }
            
            const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
            
            slot.innerHTML = `
                ${imgHtml}
                <div class="pokemon-info">
                    <span class="pokemon-name">${pokemon.name}</span>
                    <span class="pokemon-level">Lv.${pokemon.level}</span>
                </div>
                <div class="energy-bar" style="--energy-width: ${energyPercent}%"></div>
            `;
            
            teamSlots.appendChild(slot);
        }
        
        // Показываем пустые слоты
        for (let i = team.length; i < maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.dataset.empty = 'true';
            emptySlot.innerHTML = `
                <i class="fas fa-plus"></i>
                <span>Пусто</span>
            `;
            teamSlots.appendChild(emptySlot);
        }
        
        // Добавляем обработчик клика для открытия управления командой
        this.setupTeamSlotClickHandlers();
    }
    
    async createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.dataset.id = pokemon.id;
        
        const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        const img = document.createElement('img');
        img.className = 'pokemon-image';
        img.alt = pokemon.name;
        img.width = 100;
        img.height = 100;
        
        try {
            const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            console.error(`❌ Ошибка загрузки изображения для ${pokemon.name}:`, e);
            img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
        }
        
        card.innerHTML = `
            <div class="pokemon-image-container">
                <img src="${img.src}" alt="${pokemon.name}" class="pokemon-image" width="100" height="100">
            </div>
            <h4>${pokemon.name}</h4>
            <div class="pokemon-rarity" style="color: ${rarity.color}; border-color: ${rarity.color}">
                ${rarity.name}
            </div>
            <div class="pokemon-stats">
                <div>Уровень: ${pokemon.level}</div>
                <div>Урон: ${Math.floor(pokemon.currentDamage)}</div>
                <div>Энергия: ${Math.floor(energyPercent)}%</div>
                <div>Слияний: ${pokemon.mergeCount || 0}</div>
            </div>
            ${pokemon.isInTeam ? '<div class="in-team">В команде</div>' : ''}
        `;
        
        return card;
    }
    
    async createTeamSelectionUI() {
        const teamSelection = document.getElementById('team-selection');
        if (!teamSelection) return;
        
        teamSelection.innerHTML = '';
        
        const collection = this.game.pokemonManager.collection;
        const team = this.game.pokemonManager.team;
        
        if (collection.length === 0) {
            teamSelection.innerHTML = '<p style="text-align: center;">Коллекция пуста!</p>';
            return;
        }
        
        const teamSection = document.createElement('div');
        teamSection.className = 'current-team';
        teamSection.innerHTML = '<h3><i class="fas fa-users"></i> Текущая команда</h3>';
        
        const teamSlots = document.createElement('div');
        teamSlots.className = 'team-slots selection-slots';
        
        for (const pokemon of team) {
            const slot = await this.createTeamSlot(pokemon, true);
            teamSlots.appendChild(slot);
        }
        
        for (let i = team.length; i < this.game.pokemonManager.maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i><span>Пусто</span>';
            teamSlots.appendChild(emptySlot);
        }
        
        teamSection.appendChild(teamSlots);
        teamSelection.appendChild(teamSection);
        
        const totalDamage = this.game.pokemonManager.getTeamDamage();
        const damageDiv = document.createElement('div');
        damageDiv.className = 'team-damage';
        damageDiv.innerHTML = `
            <span><i class="fas fa-crosshairs"></i> Общий урон команды:</span>
            <span id="team-total-damage">${Math.floor(totalDamage)}</span>
        `;
        teamSelection.appendChild(damageDiv);
        
        const availableSection = document.createElement('div');
        availableSection.className = 'available-pokemon';
        availableSection.innerHTML = '<h3><i class="fas fa-dragon"></i> Доступные покемоны</h3>';
        
        const availableGrid = document.createElement('div');
        availableGrid.className = 'available-grid';
        
        const availablePokemon = collection.filter(p => !p.isInTeam && p.energy > 0);
        
        if (availablePokemon.length === 0) {
            availableGrid.innerHTML = '<p class="no-pokemon">Нет доступных покемонов</p>';
        } else {
            for (const pokemon of availablePokemon) {
                const pokemonCard = await this.createSelectablePokemonCard(pokemon);
                availableGrid.appendChild(pokemonCard);
            }
        }
        
        availableSection.appendChild(availableGrid);
        teamSelection.appendChild(availableSection);
        
        this.addTeamSelectionHandlers();
    }
    
    async createSelectablePokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card selectable';
        card.dataset.id = pokemon.id;
        
        const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        const img = document.createElement('img');
        img.className = 'pokemon-image';
        img.alt = pokemon.name;
        img.width = 80;
        img.height = 80;
        
        try {
            const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            console.error(`❌ Ошибка загрузки изображения для ${pokemon.name}:`, e);
        }
        
        card.innerHTML = `
            ${img.outerHTML}
            <h4>${pokemon.name}</h4>
            <div class="pokemon-rarity" style="color: ${rarity.color}; border-color: ${rarity.color}">
                Lv.${pokemon.level} ${rarity.name}
            </div>
            <div class="pokemon-stats">
                <div>Урон: ${Math.floor(pokemon.currentDamage)}</div>
                <div>Энергия: ${Math.floor(energyPercent)}%</div>
            </div>
            <button class="add-to-team-btn">➕ В команду</button>
        `;
        
        return card;
    }
    
    async createTeamSlot(pokemon, isSelected) {
        const slot = document.createElement('div');
        slot.className = `team-slot ${isSelected ? 'selected' : ''}`;
        slot.dataset.id = pokemon.id;
        
        const img = document.createElement('img');
        img.className = 'team-pokemon-image';
        img.alt = pokemon.name;
        img.width = 50;
        img.height = 50;
        
        try {
            const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            console.error(`❌ Ошибка загрузки изображения для ${pokemon.name}:`, e);
        }
        
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        slot.innerHTML = `
            ${img.outerHTML}
            <div class="pokemon-info">
                <span class="pokemon-name">${pokemon.name}</span>
                <span class="pokemon-level">Lv.${pokemon.level}</span>
            </div>
            <div class="energy-bar" style="--energy-width: ${energyPercent}%"></div>
        `;
        
        if (isSelected) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.game.removeFromTeam(pokemon.id);
                this.createTeamSelectionUI();
            });
            slot.appendChild(removeBtn);
        }
        
        const delay = Math.random() * 2;
        slot.style.setProperty('--i', delay);
        
        return slot;
    }
    
    addTeamSelectionHandlers() {
        const selectableCards = document.querySelectorAll('.pokemon-card.selectable');
        
        selectableCards.forEach(card => {
            const addButton = card.querySelector('.add-to-team-btn');
            if (addButton) {
                addButton.addEventListener('click', () => {
                    const pokemonId = parseInt(card.dataset.id);
                    this.game.addToTeam(pokemonId);
                    this.createTeamSelectionUI();
                });
            }
        });
    }
    
    async updateTeamDisplay() {
        const teamSlots = document.getElementById('team-slots');
        if (!teamSlots) return;
        
        teamSlots.innerHTML = '';
        const team = this.game.pokemonManager.team;
        
        for (const pokemon of team) {
            const slot = document.createElement('div');
            slot.className = 'team-slot';
            slot.dataset.id = pokemon.id;
            slot.style.setProperty('--i', Math.random() * 2);
            
            const img = document.createElement('img');
            img.className = 'team-pokemon-image';
            img.alt = pokemon.name;
            img.width = 50;
            img.height = 50;
            
            try {
                const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
                img.src = pokemonImg.src;
            } catch (e) {
                console.error(`❌ Ошибка загрузки изображения для ${pokemon.name}:`, e);
            }
            
            const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
            
            slot.innerHTML = `
                ${img.outerHTML}
                <div class="type-icons-mini">
                    ${this.getTypeIcons(pokemon.types, true)}
                </div>
                <div class="energy-bar" style="--energy-width: ${energyPercent}%"></div>
            `;
            teamSlots.appendChild(slot);
        }
        
        for (let i = team.length; i < this.game.pokemonManager.maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.dataset.empty = 'true';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i><span>Пусто</span>';
            teamSlots.appendChild(emptySlot);
        }
        
        this.setupTeamSlotClickHandlers();
    }
    
    getTypeIcons(types, mini = false) {
        const iconClass = mini ? 'type-icon-mini' : 'type-icon';
        return types.map(type => {
            const symbol = this.getTypeSymbol(type);
            return `<div class="${iconClass}" title="${type}">${symbol}</div>`;
        }).join('');
    }
    
    getTypeSymbol(type) {
        const symbols = {
            NORMAL: '⬤',
            FIRE: '🔥',
            WATER: '💧',
            GRASS: '🌿',
            ELECTRIC: '⚡',
            ICE: '❄️',
            FIGHTING: '👊',
            POISON: '☠️',
            GROUND: '⛰️',
            FLYING: '🦅',
            PSYCHIC: '🔮',
            BUG: '🐛',
            ROCK: '🪨',
            GHOST: '👻',
            DRAGON: '🐉'
        };
        return symbols[type] || '❓';
    }

    async updateAvatar() {
        const avatarCircle = document.getElementById('avatar-circle');
        const avatarImage = document.getElementById('avatar-image');
        const avatarName = document.getElementById('avatar-name');
        const avatarLevel = document.getElementById('avatar-level');
        
        if (!avatarCircle || !avatarImage || !avatarName || !avatarLevel) return;
        
        const heroSystem = this.game.heroSystem;
        if (!heroSystem) return;
        
        const hero = heroSystem.getHero();
        if (!hero) return;
        
        avatarName.textContent = hero.name;
        avatarLevel.textContent = heroSystem.heroLevel;
        
        try {
            avatarImage.src = hero.image;
        } catch (e) {
            console.error('Ошибка загрузки изображения героя:', e);
        }
        
        avatarCircle.addEventListener('click', () => this.showHeroModal());
    }
    
    showHeroModal() {
        const modal = document.getElementById('hero-modal');
        if (!modal) return;
        
        this.createHeroSelectionUI();
        modal.style.display = 'flex';
    }
    
    createHeroSelectionUI() {
        const container = document.getElementById('hero-selection');
        if (!container) return;
        
        const heroSystem = this.game.heroSystem;
        if (!heroSystem) return;
        
        const heroes = heroSystem.heroes;
        const currentHero = heroSystem.currentHero;
        
        container.innerHTML = `
            <div class="hero-selection-grid">
                ${Object.entries(heroes).map(([id, hero]) => `
                    <div class="hero-card ${currentHero === id ? 'selected' : ''}" data-hero-id="${id}">
                        <div class="hero-avatar" style="border-color: ${hero.color}">
                            <img src="${hero.image}" alt="${hero.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                        </div>
                        <h3>${hero.name}</h3>
                        <p class="hero-description">${hero.description}</p>
                        <div class="hero-bonus-info">
                            <span class="hero-bonus-value">+${hero.bonusValue}% за уровень</span>
                            <p>${hero.bonus}</p>
                        </div>
                        <div class="hero-favorite-pokemon">
                            ${hero.favoritePokemon.map(id => `
                                <div class="fav-pokemon-icon" title="Любимый покемон">
                                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" 
                                         alt="Pokemon" width="30" height="30"
                                         onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                                </div>
                            `).join('')}
                        </div>
                        <button class="select-hero-btn" data-hero-id="${id}">
                            ${currentHero === id ? 'Выбран' : 'Выбрать'}
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div class="hero-upgrades-section">
                <h3>Улучшения героя</h3>
                <button class="show-upgrades-btn" id="show-upgrades-btn">
                    <i class="fas fa-chart-line"></i>
                    Дерево улучшений
                </button>
            </div>
        `;
        
        container.querySelectorAll('.select-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const heroId = btn.dataset.heroId;
                if (heroSystem.changeHero(heroId)) {
                    this.createHeroSelectionUI();
                    this.updateAvatar();
                    this.updateUI();
                }
            });
        });
        
        const upgradesBtn = document.getElementById('show-upgrades-btn');
        if (upgradesBtn) {
            upgradesBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showHeroUpgrades();
            });
        }
    }
    
    showHeroUpgrades() {
        const modal = document.getElementById('hero-upgrade-modal');
        if (!modal) return;
        
        this.createUpgradeTree();
        modal.style.display = 'flex';
    }
    
    createUpgradeTree() {
        const container = document.getElementById('hero-upgrade-tree');
        if (!container) return;
        
        const heroSystem = this.game.heroSystem;
        if (!heroSystem) return;
        
        const hero = heroSystem.getHero();
        const availableUpgrades = heroSystem.getAvailableUpgrades();
        const purchased = heroSystem.getPurchasedUpgrades();
        
        let html = '<div class="upgrade-tree">';
        
        for (let tier = 1; tier <= heroSystem.heroLevel; tier++) {
            const tierUpgrades = hero.upgrades[tier] || [];
            if (tierUpgrades.length === 0) continue;
            
            html += `
                <div class="upgrade-tier">
                    <h4><i class="fas fa-star"></i> Уровень ${tier}</h4>
                    <div class="upgrade-grid">
            `;
            
            tierUpgrades.forEach(upgrade => {
                const isPurchased = purchased.includes(upgrade.id);
                const isAvailable = availableUpgrades.some(u => u.id === upgrade.id);
                
                let statusClass = '';
                if (isPurchased) statusClass = 'purchased';
                else if (isAvailable) statusClass = 'available';
                
                html += `
                    <div class="upgrade-item ${statusClass}" data-upgrade-id="${upgrade.id}">
                        <div class="upgrade-icon">${upgrade.icon}</div>
                        <div class="upgrade-name">${upgrade.name}</div>
                        <div class="upgrade-desc">${upgrade.desc}</div>
                        ${!isPurchased ? `
                            <div class="upgrade-cost">
                                <i class="fas fa-coins"></i>
                                <span>${upgrade.cost}</span>
                            </div>
                        ` : '<div class="purchased-badge">✓ Куплено</div>'}
                        ${upgrade.prerequisites ? `
                            <div class="upgrade-prerequisites">
                                Требуется: ${upgrade.prerequisites.map(p => hero.upgrades[Math.floor(p/10)]?.find(u => u.id === p)?.name || p).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
        
        container.querySelectorAll('.upgrade-item.available').forEach(item => {
            item.addEventListener('click', () => {
                const upgradeId = item.dataset.upgradeId;
                heroSystem.purchaseUpgrade(upgradeId);
                this.createUpgradeTree();
                this.updateUI();
            });
        });
    }
}

// Добавляем стили для анимаций
const uiStyles = document.createElement('style');
uiStyles.textContent = `
    .tutorial-reset-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(247, 151, 30, 0.5);
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes scaleIn {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .confirmation-btn:hover {
        transform: scale(1.05);
    }
    
    .modal-header {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .modal-header h2 {
        flex-shrink: 0;
    }
    
    .modal-header .close {
        margin-left: auto;
        flex-shrink: 0;
    }
`;

document.head.appendChild(uiStyles);

window.UIManager = UIManager;