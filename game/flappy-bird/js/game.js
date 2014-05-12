var Boot = {
	preload : function(){
		game.load.image('loading','assets/preloader.gif');
	},
	create : function(){
		game.state.start('preload');
	}
}

var Preload = {
	preload : function(){
		game.load.onLoadComplete.addOnce(function(){
			game.state.start('menu');
		});
		var preloadSprite = game.add.sprite(50,game.height/2,'loading'); //创建显示loading进度的sprite
		game.load.setPreloadSprite(preloadSprite);
		
		//以下为要加载的资源
		game.load.image('background','assets/background.png');
    	game.load.image('ground','assets/ground.png');
    	game.load.image('title','assets/title.png');
    	game.load.spritesheet('bird','assets/bird.png',34,24,3);
    	game.load.image('btn','assets/start-button.png');   
	},
}

//菜单
var Menu = {
	create : function(){
		game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(-10,0); //背景图
		game.add.tileSprite(0,game.height-112,game.width,112,'ground').autoScroll(-100,0); //地板
		var titleGroup = game.add.group();
		titleGroup.create(0,0,'title');
		var bird = titleGroup.create(190,10,'bird');
		bird.animations.add('fly');
		bird.animations.play('fly',12,true);
		titleGroup.x = 35;
		titleGroup.y = 100;
		game.add.tween(titleGroup).to({ y:120 },1000,null,true,0,Number.MAX_VALUE,true);
		var btn = game.add.button(game.width/2,game.height/2,'btn',function(){
			game.state.start('play');
		});
		btn.anchor.setTo(0.5,0.5);

	},
	update : function(){

	}
}
var Play ={
	create : function(){
		var background = game.add.tileSprite(0,0,game.width,game.height,'background');//背景图
		var ground = this.game.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground'); //地板
		var bird = this.game.bird = game.add.sprite(100,200,'bird');
		bird.animations.add('fly');
		bird.animations.play('fly',12,true);
		game.physics.enable(bird,Phaser.Physics.ARCADE);
		bird.body.gravity.y = 800;
		game.physics.enable(ground,Phaser.Physics.ARCADE);
		ground.body.immovable = true;
	},
	update : function(){
        game.physics.arcade.collide(this.game.bird,this.game.ground);
        var cursor = game.input.keyboard.createCursorKeys();
        if(cursor.up.justPressed(1)) this.game.bird.body.velocity.y = -300;
	}
}

var game = new Phaser.Game(288,505,Phaser.AUTO,'game');
game.state.add('boot',Boot);
game.state.add('preload',Preload);
game.state.add('menu',Menu);
game.state.add('play',Play);
game.state.start('boot');

