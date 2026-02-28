// ==============================
// ИСПРАВЛЕННЫЙ ПОКЕМОН-ЦЕНТР
// ==============================

class PokemonCenter {
    constructor(game) {
        this.game = game;
        this.healCost = 50;
    }
    
    show() {
        const modal = document.getElementById('pokemon-center-modal');
        if (!modal) return;
        
        this.updateUI();
        modal.style.display = 'flex';
    }
    
    updateUI() {
        const content = document.getElementById('pokemon-center-content');
        if (!content) return;
        
        const collection = this.game.pokemonManager.collection;
        
        // Считаем покемонов с низкой энергией
        const lowEnergyPokemon = collection.filter(p => p.energy < p.maxEnergy * 0.5).length;
        const totalPokemon = collection.length;
        
        // Рассчитываем стоимость лечения
        const totalHealCost = this.calculateHealCost();
        
        content.innerHTML = `
            <div class="pokemon-center-content">
                <div class="center-image">
                    <i class="fas fa-heartbeat"></i>
                </div>
                <h2>Покемон-центр</h2>
                <p class="center-description">
                    Восстановите энергию всех своих покемонов!
                </p>
                
                <div class="center-stats">
                    <div class="center-stat">
                        <div class="stat-label">Всего покемонов</div>
                        <div class="stat-value">${totalPokemon}</div>
                    </div>
                    <div class="center-stat">
                        <div class="stat-label">Нуждаются в лечении</div>
                        <div class="stat-value">${lowEnergyPokemon}</div>
                    </div>
                </div>
                
                <button class="heal-button" id="heal-all-btn" ${totalPokemon === 0 ? 'disabled' : ''}>
                    <i class="fas fa-heart"></i>
                    Вылечить всех за ${totalHealCost} ₽
                </button>
                
                ${this.getHealingEffects()}
            </div>
        `;
        
        const healBtn = document.getElementById('heal-all-btn');
        if (healBtn) {
            healBtn.addEventListener('click', () => this.healAll());
        }
    }
    
    calculateHealCost() {
        const collection = this.game.pokemonManager.collection;
        let totalMissingEnergy = 0;
        
        collection.forEach(pokemon => {
            totalMissingEnergy += pokemon.maxEnergy - pokemon.energy;
        });
        
        // Стоимость = базовая стоимость + (недостающая энергия * коэффициент)
        const cost = this.healCost + Math.floor(totalMissingEnergy * 0.5);
        return Math.max(this.healCost, Math.min(500, cost));
    }
    
    healAll() {
        const cost = this.calculateHealCost();
        
        if (this.game.shopSystem.money < cost) {
            this.game.showNotification('Недостаточно поке-баксов!', 'error');
            return;
        }
        
        // Лечим всех покемонов
        this.game.pokemonManager.collection.forEach(pokemon => {
            pokemon.energy = pokemon.maxEnergy;
        });
        
        this.game.shopSystem.spendMoney(cost);
        this.game.showNotification('Все покемоны восстановлены!', 'success');
        
        // Обновляем UI
        this.game.uiManager.updateUI();
        this.updateUI();
        this.game.saveGame();
    }
    
    getHealingEffects() {
        // Проверяем бонусы от героя
        const heroSystem = this.game.heroSystem;
        if (!heroSystem) return '';
        
        const hero = heroSystem.getHero();
        const upgrades = heroSystem.getPurchasedUpgrades();
        
        let healingBonus = '';
        if (hero && hero.name === 'Мисти' && upgrades.includes('misty_heal_1')) {
            healingBonus = `
                <div class="healing-bonus">
                    <i class="fas fa-star"></i>
                    Бонус Мисти: +5% восстановления энергии после боя
                </div>
            `;
        }
        
        return healingBonus;
    }
}

window.PokemonCenter = PokemonCenter;