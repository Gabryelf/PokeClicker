/**
 * Покемон-центр
 * @module PokemonCenter
 */

 class PokemonCenter {
    constructor(game) {
        this.game = game;
        this.healCost = 50;
    }
    
    show() {
        var modal = document.getElementById('pokemon-center-modal');
        if (!modal) return;
        
        this.updateUI();
        modal.style.display = 'flex';
    }
    
    updateUI() {
        var content = document.getElementById('pokemon-center-content');
        if (!content) return;
        
        var collection = this.game.pokemonManager.collection;
        var lowEnergyPokemon = 0;
        for (var i = 0; i < collection.length; i++) {
            if (collection[i].energy < collection[i].maxEnergy * 0.5) {
                lowEnergyPokemon++;
            }
        }
        var totalPokemon = collection.length;
        var totalHealCost = this.calculateHealCost();
        
        content.innerHTML = '<div class="pokemon-center-content">' +
            '<div class="center-image"><i class="fas fa-heartbeat"></i></div>' +
            '<h2>Покемон-центр</h2>' +
            '<p class="center-description">Восстановите энергию всех своих покемонов!</p>' +
            '<div class="center-stats">' +
            '<div class="center-stat"><div class="stat-label">Всего покемонов</div><div class="stat-value">' + totalPokemon + '</div></div>' +
            '<div class="center-stat"><div class="stat-label">Нуждаются в лечении</div><div class="stat-value">' + lowEnergyPokemon + '</div></div>' +
            '</div>' +
            '<button class="heal-button" id="heal-all-btn" ' + (totalPokemon === 0 ? 'disabled' : '') + '>' +
            '<i class="fas fa-heart"></i> Вылечить всех за ' + totalHealCost + ' ₽</button>' +
            '</div>';
        
        var healBtn = document.getElementById('heal-all-btn');
        if (healBtn) {
            var self = this;
            healBtn.addEventListener('click', function() {
                self.healAll();
            });
        }
    }
    
    calculateHealCost() {
        var collection = this.game.pokemonManager.collection;
        var totalMissingEnergy = 0;
        for (var i = 0; i < collection.length; i++) {
            totalMissingEnergy += collection[i].maxEnergy - collection[i].energy;
        }
        var cost = this.healCost + Math.floor(totalMissingEnergy * 0.5);
        return Math.max(this.healCost, Math.min(500, cost));
    }
    
    healAll() {
        var cost = this.calculateHealCost();
        
        if (this.game.shopSystem.money < cost) {
            this.game.showNotification('Недостаточно поке-баксов!', 'error');
            return;
        }
        
        for (var i = 0; i < this.game.pokemonManager.collection.length; i++) {
            this.game.pokemonManager.collection[i].energy = this.game.pokemonManager.collection[i].maxEnergy;
        }
        
        this.game.shopSystem.spendMoney(cost);
        this.game.showNotification('Все покемоны восстановлены!', 'success');
        this.game.uiManager.updateUI();
        this.updateUI();
        this.game.saveGame();
    }
}

window.PokemonCenter = PokemonCenter;