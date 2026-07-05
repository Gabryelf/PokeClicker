/**
 * Точка входа в приложение
 * @module main
 */

 var game;

 document.addEventListener('DOMContentLoaded', function() {
     game = new PokemonClickerGame();
     game.init();
     
     document.addEventListener('keydown', function(e) {
         if (e.code === 'Space' && !e.repeat) {
             e.preventDefault();
             if (game && game.manualAttack) {
                 game.manualAttack();
             }
         }
     });
     
     window.addEventListener('beforeunload', function() {
         if (game && game.cleanup) {
             game.cleanup();
         }
     });
 });
 
 window.gameInstance = game;