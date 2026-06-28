/**
 * Модальное окно карты
 * @module MapModal
 */

 class MapModal {
    constructor(game, locationSystem) {
        this.game = game;
        this.locationSystem = locationSystem;
        this.modal = null;
        this.mapCanvas = null;
        this.ctx = null;
        this.isOpen = false;
        this.timerInterval = null;
        
        this.createModal();
    }
    
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'map-modal';
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content map-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-map"></i> Карта региона Канто</h2>
                    <div class="location-info">
                        <span id="current-location-name">Паллет Таун</span>
                        <span id="travel-timer" class="travel-timer" style="display: none;">
                            <i class="fas fa-hourglass-half"></i>
                            <span id="timer-display">00:00</span>
                        </span>
                    </div>
                    <span class="close-map">&times;</span>
                </div>
                <div class="modal-body map-body">
                    <canvas id="map-canvas" width="800" height="600"></canvas>
                    <div id="map-legend" class="map-legend">
                        <div class="legend-item">
                            <span class="legend-dot current"></span> Текущая локация
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot available"></span> Доступно
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot locked"></span> Закрыто
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        var closeBtn = this.modal.querySelector('.close-map');
        var self = this;
        closeBtn.addEventListener('click', function() {
            self.hide();
        });
        
        this.modal.addEventListener('click', function(e) {
            if (e.target === self.modal) {
                self.hide();
            }
        });
        
        this.mapCanvas = document.getElementById('map-canvas');
        if (this.mapCanvas) {
            this.ctx = this.mapCanvas.getContext('2d');
            this.mapCanvas.addEventListener('click', function(e) {
                self.handleCanvasClick(e);
            });
        }
    }
    
    show() {
        if (!this.modal) return;
        this.modal.style.display = 'flex';
        this.isOpen = true;
        this.drawMap();
        this.updateLocationInfo();
        this.startTimerUpdate();
    }
    
    hide() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        this.isOpen = false;
        this.stopTimerUpdate();
    }
    
    drawMap() {
        if (!this.ctx || !this.mapCanvas) return;
        var ctx = this.ctx;
        var canvas = this.mapCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1a5f3a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (var i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (var j = 0; j < canvas.height; j += 40) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
            ctx.stroke();
        }
        
        var locations = this.locationSystem.locations;
        var available = this.locationSystem.availableLocations;
        var current = this.locationSystem.currentLocation;
        
        ctx.strokeStyle = '#8b6b4d';
        ctx.lineWidth = 4;
        for (var id in locations) {
            if (locations.hasOwnProperty(id)) {
                var loc = locations[id];
                var from = loc.position;
                for (var k = 0; k < loc.neighbors.length; k++) {
                    var neighborId = loc.neighbors[k];
                    var neighbor = locations[neighborId];
                    if (neighbor) {
                        var to = neighbor.position;
                        ctx.beginPath();
                        ctx.moveTo(from.x * 8, from.y * 6);
                        ctx.lineTo(to.x * 8, to.y * 6);
                        ctx.strokeStyle = '#8b6b4d';
                        ctx.stroke();
                        
                        if (available.indexOf(neighborId) === -1 && available.indexOf(id) === -1) {
                            ctx.strokeStyle = '#555';
                            ctx.setLineDash([5, 5]);
                            ctx.stroke();
                            ctx.setLineDash([]);
                        }
                    }
                }
            }
        }
        
        for (var id2 in locations) {
            if (locations.hasOwnProperty(id2)) {
                var loc2 = locations[id2];
                var x = loc2.position.x * 8;
                var y = loc2.position.y * 6;
                var status = 'locked';
                var color = '#666';
                var radius = 8;
                
                if (id2 === current) {
                    status = 'current';
                    color = '#ffd700';
                    radius = 12;
                } else if (available.indexOf(id2) !== -1) {
                    status = 'available';
                    color = '#4caf50';
                    radius = 10;
                }
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.font = 'bold 12px Inter, Arial';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(loc2.name, x, y - radius - 5);
                
                ctx.font = '16px Arial';
                ctx.fillStyle = '#fff';
                ctx.fillText(loc2.icon, x + 15, y - 5);
            }
        }
    }
    
    handleCanvasClick(e) {
        if (!this.mapCanvas) return;
        var rect = this.mapCanvas.getBoundingClientRect();
        var scaleX = this.mapCanvas.width / rect.width;
        var scaleY = this.mapCanvas.height / rect.height;
        var x = (e.clientX - rect.left) * scaleX;
        var y = (e.clientY - rect.top) * scaleY;
        var locations = this.locationSystem.locations;
        var self = this;
        
        for (var id in locations) {
            if (locations.hasOwnProperty(id)) {
                var loc = locations[id];
                var locX = loc.position.x * 8;
                var locY = loc.position.y * 6;
                var distance = Math.sqrt((x - locX) * (x - locX) + (y - locY) * (y - locY));
                if (distance < 20) {
                    self.handleLocationClick(id);
                    break;
                }
            }
        }
    }
    
    handleLocationClick(locationId) {
        var location = this.locationSystem.locations[locationId];
        if (!location) return;
        if (locationId === this.locationSystem.currentLocation) {
            this.game.showNotification('Вы уже находитесь в ' + location.name, 'info');
            return;
        }
        var result = this.locationSystem.startTravel(locationId);
        if (result) {
            this.updateLocationInfo();
            this.startTimerUpdate();
            this.drawMap();
        }
    }
    
    updateLocationInfo() {
        var locationName = document.getElementById('current-location-name');
        var timer = document.getElementById('travel-timer');
        if (locationName) {
            var current = this.locationSystem.locations[this.locationSystem.currentLocation];
            locationName.textContent = current ? current.name : 'Неизвестно';
        }
        if (timer) {
            timer.style.display = this.locationSystem.transitionInProgress ? 'inline-flex' : 'none';
        }
    }
    
    startTimerUpdate() {
        this.stopTimerUpdate();
        var self = this;
        if (this.locationSystem.transitionInProgress) {
            this.timerInterval = setInterval(function() {
                self.updateTimer();
            }, 100);
        }
    }
    
    stopTimerUpdate() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        if (!this.locationSystem.transitionEndTime) {
            this.stopTimerUpdate();
            return;
        }
        var now = Date.now();
        var remaining = Math.max(0, this.locationSystem.transitionEndTime - now);
        if (remaining <= 0) {
            this.stopTimerUpdate();
            return;
        }
        var timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            var seconds = Math.floor(remaining / 1000);
            var minutes = Math.floor(seconds / 60);
            var secs = seconds % 60;
            timerDisplay.textContent = minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
        }
        this.updateLocationInfo();
    }
}

window.MapModal = MapModal;