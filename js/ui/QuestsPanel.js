/**
 * Панель квестов
 * @module QuestsPanel
 */

 class QuestsPanel {
    constructor(game, locationSystem) {
        this.game = game;
        this.locationSystem = locationSystem;
        this.panel = null;
        this.isOpen = false;
        this.createPanel();
    }
    
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'quests-panel';
        this.panel.className = 'quests-panel';
        this.panel.innerHTML = `
            <div class="quests-header">
                <h3><i class="fas fa-scroll"></i> Задания в локации</h3>
                <span class="close-quests">&times;</span>
            </div>
            <div class="quests-content" id="quests-content"></div>
            <div class="quests-footer">
                <div class="reset-info">
                    <i class="fas fa-clock"></i>
                    <span>Обновляются каждый день</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
        
        var closeBtn = this.panel.querySelector('.close-quests');
        var self = this;
        closeBtn.addEventListener('click', function() {
            self.hide();
        });
        
        this.createQuestButton();
    }
    
    createQuestButton() {
        var enemyCard = document.querySelector('.enemy-card');
        if (!enemyCard) return;
        var questBtn = document.createElement('div');
        questBtn.className = 'quest-button';
        questBtn.innerHTML = '<i class="fas fa-scroll"></i><span>Задания</span>';
        var self = this;
        questBtn.addEventListener('click', function() {
            self.toggle();
        });
        enemyCard.appendChild(questBtn);
    }
    
    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    show() {
        if (!this.panel) return;
        this.panel.classList.add('open');
        this.isOpen = true;
        this.updateQuests();
    }
    
    hide() {
        if (!this.panel) return;
        this.panel.classList.remove('open');
        this.isOpen = false;
    }
    
    updateQuests() {
        var content = document.getElementById('quests-content');
        if (!content) return;
        
        var quests = this.locationSystem.getCurrentQuests();
        var location = this.locationSystem.locations[this.locationSystem.currentLocation];
        var html = '<div class="location-name">' + location.name + ' ' + location.icon + '</div>';
        
        if (quests.length === 0) {
            html += '<div class="no-quests">Нет заданий в этой локации</div>';
        } else {
            var self = this;
            for (var i = 0; i < quests.length; i++) {
                var quest = quests[i];
                var progressPercent = (quest.progress / quest.target) * 100;
                var completedClass = quest.completed ? 'completed' : '';
                var claimedClass = quest.claimed ? 'claimed' : '';
                
                html += '<div class="quest-item ' + completedClass + ' ' + claimedClass + '">' +
                    '<div class="quest-header"><h4>' + quest.name + '</h4><span class="quest-reward"><i class="fas fa-coins"></i> ' + quest.reward + '</span></div>' +
                    '<p class="quest-description">' + quest.description + '</p>' +
                    '<div class="quest-progress">' +
                    '<div class="progress-bar"><div class="progress-fill" style="width: ' + progressPercent + '%"></div></div>' +
                    '<div class="progress-text">' + quest.progress + '/' + quest.target + '</div>' +
                    '</div>';
                
                if (quest.completed && !quest.claimed) {
                    html += '<button class="claim-reward-btn" data-quest-id="' + quest.id + '"><i class="fas fa-gift"></i> Получить награду</button>';
                } else if (quest.claimed) {
                    html += '<span class="claimed-badge"><i class="fas fa-check"></i> Награда получена</span>';
                }
                
                html += '</div>';
            }
        }
        
        content.innerHTML = html;
        
        content.querySelectorAll('.claim-reward-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var questId = e.currentTarget.dataset.questId;
                self.locationSystem.claimQuestReward(questId);
                self.updateQuests();
            });
        });
    }
}

window.QuestsPanel = QuestsPanel;