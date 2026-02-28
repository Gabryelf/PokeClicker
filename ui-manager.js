// ==============================
// МЕНЕДЖЕР ИНТЕРФЕЙСА С ПОДДЕРЖКОЙ СЛИЯНИЯ
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
        
        // Не сразу устанавливаем обработчики, ждем загрузки DOM
        setTimeout(() => {
            console.log('UIManager: устанавливаем обработчики');
            this.setupPokeballClickHandlers();
            this.setupTeamSlotClickHandlers();
            this.initEventListeners();
        }, 1000);
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
        // Предотвращаем множественные клики
        if (this.isProcessingPokeball) {
            console.log('⏳ Уже обрабатывается открытие покебола');
            return;
        }
        
        const count = this.game.shopSystem.pokeballs[type];
        
        if (count > 0) {
            this.isProcessingPokeball = true;
            this.hasShownEmptyPokeballNotification = false; // Сбрасываем флаг при успешном открытии
            this.openPokeballWithAnimation(type);
        } else {
            // Показываем уведомление только если оно еще не было показано в этой сессии кликов
            if (!this.hasShownEmptyPokeballNotification) {
                this.game.showNotification('Купите покеболы в магазине!', 'warning');
                this.hasShownEmptyPokeballNotification = true;
            }
            this.showModal('shop');
        }
    }
    
    async openPokeballWithAnimation(type) {
        try {
            // Создаем черный оверлей
            const overlay = document.createElement('div');
            overlay.className = 'pokeball-open-overlay';
            document.body.appendChild(overlay);
            
            // Создаем анимацию покебола
            const animContainer = document.createElement('div');
            animContainer.className = 'pokeball-open-animation';
            
            const pokeballImg = await this.imageManager.getPokeballImage(type);
            const img = document.createElement('img');
            img.src = pokeballImg.src;
            animContainer.appendChild(img);
            overlay.appendChild(animContainer);
            
            // Ждем анимацию открытия
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Удаляем анимацию покебола
            overlay.remove();
            
            // Открываем покебол и получаем покемона
            const pokemon = this.game.shopSystem.openPokeball(type);
            
            if (pokemon) {
                // Показываем полученного покемона на черном фоне
                await this.showRevealedPokemon(pokemon);
                
                // Обновляем UI
                await this.updateUI();
                this.game.saveGame();
                
                // Воспроизводим звук
                if (typeof GameSoundGenerator !== 'undefined') {
                    GameSoundGenerator.playPokemonCry();
                }
            }
            
            // Сбрасываем флаг
            this.isProcessingPokeball = false;
            
        } catch (e) {
            console.error('Ошибка анимации покебола:', e);
            this.isProcessingPokeball = false;
        }
    }
    
    async showRevealedPokemon(pokemon) {
        return new Promise(async (resolve) => {
            // Создаем черный оверлей для показа покемона
            const overlay = document.createElement('div');
            overlay.className = 'pokemon-reveal-overlay';
            
            const revealContainer = document.createElement('div');
            revealContainer.className = 'pokemon-reveal-animation';
            
            try {
                const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
                const img = document.createElement('img');
                img.src = pokemonImg.src;
                revealContainer.appendChild(img);
                
                // Добавляем имя покемона
                const nameDiv = document.createElement('div');
                nameDiv.className = 'pokemon-name-reveal';
                nameDiv.textContent = pokemon.name;
                revealContainer.appendChild(nameDiv);
                
                overlay.appendChild(revealContainer);
                document.body.appendChild(overlay);
                
                // Показываем уведомление
                this.game.showNotification(`Вы получили ${pokemon.name}!`, 'success');
                
                // Удаляем через 2 секунды
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
    
    // В классе UIManager найдите и исправьте метод showMergeAnimation:

    showMergeAnimation(mergeData) {
        console.log('Показ анимации слияния', mergeData);
        
        const modal = document.getElementById('merge-modal');
        if (!modal) {
            console.error('Модальное окно слияния не найдено!');
            // Создаем его, если не существует
            this.createMergeModal();
            // Пробуем снова через небольшую задержку
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
        
        // Загружаем изображения
        this.loadPokemonImage(modal.querySelector('.original'), pokemon.id);
        this.loadPokemonImage(modal.querySelector('.duplicate'), pokemon.id);
        this.loadPokemonImage(modal.querySelector('.result'), pokemon.id);
        
        // Показываем модальное окно
        modal.style.display = 'flex';
        
        // Анимация появления элементов
        const elements = modal.querySelectorAll('.merge-pokemon, .merge-plus, .merge-equals');
        elements.forEach((el, i) => {
            el.style.animation = 'none';
            // Форсируем перерисовку
            el.offsetHeight;
            el.style.animation = `mergeAppear 0.5s ease forwards ${i * 0.1}s`;
        });
        
        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
            modal.style.display = 'none';
        }, 6000);
    }
    
    // Улучшим метод createMergeModal для гарантии создания
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
        
        // Добавляем стили для анимации, если их нет
        this.addMergeStyles();
    }
    
    addMergeStyles() {
        // Проверяем, есть ли уже стили
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
        
        // Обновляем аватар
        await this.updateAvatar();
        
        // Обновляем название локации
        if (this.game.locationSystem) {
            const locationNameEl = document.getElementById('current-location-name');
            if (locationNameEl) {
                const location = this.game.locationSystem.locations[this.game.locationSystem.currentLocation];
                locationNameEl.textContent = location ? location.name : 'Паллет Таун';
            }
        }
        
        // Обновляем бонус героя
        const heroBonusEl = document.getElementById('hero-bonus-text');
        if (heroBonusEl && this.game.heroSystem) {
            const bonus = this.game.heroSystem.getHeroBonus();
            heroBonusEl.textContent = `+${bonus}%`;
        }
        
        // Обновляем обработчики покеболов
        this.setupPokeballClickHandlers();
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
            
            // Создаем изображение
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
                // Запасной вариант
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
        
        // Добавляем обработчики
        shopContainer.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ballType = e.target.dataset.type;
                this.game.shopSystem.buyPokeball(ballType);
                // Обновляем магазин после покупки
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
        
        collection.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
        
        for (const pokemon of collection) {
            const card = await this.createPokemonCard(pokemon);
            collectionGrid.appendChild(card);
        }
    }
    
    async createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.dataset.id = pokemon.id;
        
        const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
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
            // Запасной вариант
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
        
        // Текущая команда
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
        
        // Показываем общий урон команды
        const totalDamage = this.game.pokemonManager.getTeamDamage();
        const damageDiv = document.createElement('div');
        damageDiv.className = 'team-damage';
        damageDiv.innerHTML = `
            <span><i class="fas fa-crosshairs"></i> Общий урон команды:</span>
            <span id="team-total-damage">${Math.floor(totalDamage)}</span>
        `;
        teamSelection.appendChild(damageDiv);
        
        // Доступные покемоны
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
        
        // Заполняем слоты команды
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
        
        // Заполняем пустые слоты - теперь они кликабельны
        for (let i = team.length; i < this.game.pokemonManager.maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.dataset.empty = 'true';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i><span>Пусто</span>';
            teamSlots.appendChild(emptySlot);
        }
        
        // Обновляем обработчики для пустых слотов
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
        
        // Загружаем изображение героя
        try {
            avatarImage.src = hero.image;
        } catch (e) {
            console.error('Ошибка загрузки изображения героя:', e);
        }
        
        // Добавляем обработчик клика на аватар
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
        
        // Добавляем обработчики для выбора героя
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
        
        // Добавляем обработчик для кнопки дерева улучшений
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
        
        // Группируем по уровням
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
        
        // Добавляем обработчики для доступных улучшений
        container.querySelectorAll('.upgrade-item.available').forEach(item => {
            item.addEventListener('click', () => {
                const upgradeId = item.dataset.upgradeId;
                heroSystem.purchaseUpgrade(upgradeId);
                this.createUpgradeTree();
                this.updateUI();
            });
        });
    }
    
    // В классе UIManager найдите и исправьте метод updateUI:

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
        
        // Обновляем аватар
        await this.updateAvatar();
        
        // Обновляем название локации
        if (this.game.locationSystem) {
            const locationNameEl = document.getElementById('current-location-name');
            if (locationNameEl) {
                const location = this.game.locationSystem.locations[this.game.locationSystem.currentLocation];
                locationNameEl.textContent = location ? location.name : 'Паллет Таун';
            }
        }
        
        // Обновляем бонус героя
        const heroBonusEl = document.getElementById('hero-bonus-text');
        if (heroBonusEl && this.game.heroSystem) {
            const bonus = this.game.heroSystem.getHeroBonus();
            heroBonusEl.textContent = `+${bonus}%`;
        }
        
        // Обновляем обработчики покеболов
        this.setupPokeballClickHandlers();
        
        // Обновляем обработчики слотов команды
        this.setupTeamSlotClickHandlers();
    }
}

// Добавляем стили для анимации слияния
const mergeStyles = document.createElement('style');
mergeStyles.textContent = `
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
document.head.appendChild(mergeStyles);

window.UIManager = UIManager;