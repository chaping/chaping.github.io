//菜单
var Menu = {
	preload : function(){
    	game.load.image('background','assets/background.png');
    	game.load.image('ground','assets/ground.png');
    	game.load.image('title','assets/title.png');
    	game.load.spritesheet('bird','assets/bird.png',34,24,3);
    	game.load.image('btn','assets/start-button.png');   
	},
	create : function(){
		//game.add.image(0,0,'background'); //背景图
		game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(-10,0); 
		game.add.tileSprite(0,game.height-112,game.width,112,'ground').autoScroll(-100,0); //地板
		var titleGroup = game.add.group();
		titleGroup.create(0,0,'title');
		var bird = titleGroup.create(190,10,'bird');
		bird.animations.add('fly');
		bird.animations.play('fly',12,true);
		titleGroup.x = 35;
		titleGroup.y = 100;
		game.add.tween(titleGroup).to({ y:120 },1000,null,true,0,Number.MAX_VALUE,true);
		var btn = game.add.button(game.width/2,game.height/2,'btn');
		btn.anchor.setTo(0.5,0.5);

	},
	update : function(){

	}
}

var game = new Phaser.Game(288,505,Phaser.AUTO,'game');
game.state.add('menu',Menu);
game.state.start('menu');