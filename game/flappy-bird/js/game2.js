var game = new Phaser.Game(288,505,Phaser.AUTO,'game'); //实例化game

game.States = {}; //存放state对象

game.States.boot = function(){
	this.preload = function(){
		game.load.image('loading','assets/preloader.gif');
	};
	this.create = function(){
		game.state.start('preload'); //跳转到资源加载页面
	};
}

game.States.preload = function(){
	this.preload = function(){
		var preloadSprite = game.add.sprite(50,game.height/2,'loading'); //创建显示loading进度的sprite
		game.load.setPreloadSprite(preloadSprite);
		//以下为要加载的资源
		game.load.image('background','assets/background.png'); //背景
    	game.load.image('ground','assets/ground.png'); //地面
    	game.load.image('title','assets/title.png'); //游戏标题
    	game.load.spritesheet('bird','assets/bird.png',34,24,3); //鸟
    	game.load.image('btn','assets/start-button.png');  //按钮
    	game.load.spritesheet('pipe','assets/pipes.png',54,320,2); //管道
    	game.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');
    	game.load.audio('fly_sound', 'assets/flap.wav');//飞翔的音效
    	game.load.audio('score_sound', 'assets/score.wav');//得分的音效
    	game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); //撞击管道的音效
    	game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效
	}
	this.create = function(){
		game.state.start('menu');
	}
}

game.States.menu = function(){
	this.create = function(){
		game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(-10,0); //背景图
		game.add.tileSprite(0,game.height-112,game.width,112,'ground').autoScroll(-100,0); //地板
		var titleGroup = game.add.group(); //创建存放标题的组
		titleGroup.create(0,0,'title'); //标题
		var bird = titleGroup.create(190, 10, 'bird'); //添加bird到组里
		bird.animations.add('fly'); //添加动画
		bird.animations.play('fly',12,true); //播放动画
		titleGroup.x = 35;
		titleGroup.y = 100;
		game.add.tween(titleGroup).to({ y:120 },1000,null,true,0,Number.MAX_VALUE,true); //标题的缓动动画
		var btn = game.add.button(game.width/2,game.height/2,'btn',function(){//开始按钮
			game.state.start('play');
		});
		btn.anchor.setTo(0.5,0.5);
	}
}

game.States.play = function(){
	this.create = function(){
		this.bg = game.add.tileSprite(0,0,game.width,game.height,'background');//背景图
		this.pipeGroup = game.add.group();
		this.pipeGroup.enableBody = true;
		this.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground'); //地板
		this.bird = game.add.sprite(100,200,'bird'); //鸟
		this.bird.animations.add('fly');
		this.bird.animations.play('fly',12,true);
		game.physics.enable(this.bird,Phaser.Physics.ARCADE); //开启鸟的物理系统
		this.bird.body.gravity.y = 1000; //鸟的重力
		game.physics.enable(this.ground,Phaser.Physics.ARCADE);//地面
		this.ground.body.immovable = true; //固定不动

		this.soundFly = game.add.sound('fly_sound');
		this.soundScore = game.add.sound('score_sound');
		this.soundHitPipe = game.add.sound('hit_pipe_sound');
		this.soundHitGround = game.add.sound('hit_ground_sound');
		this.score = 0;
		this.scoreText = game.add.bitmapText(game.world.centerX-20, 30, 'flappy_font', '0', 36)
		game.time.events.loop(2000, this.generatePipes, this);
		this.statrGame();
	};
	this.update = function(){
		game.physics.arcade.collide(this.bird,this.ground, this.hitGround, null, this); //与地面碰撞
		game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this); //与管道碰撞
		this.pipeGroup.forEachExists(this.checkScore,this); //分数检测和更新
		var pointer = game.input.mousePointer;
		if(!this.gameIsOver && pointer.justPressed(30)){
			this.bird.body.velocity.y = -300;
			this.soundFly.play();
		}
	}

	this.statrGame = function(){
		this.gameIsOver = false;
		this.bg.autoScroll(-10,0);
		this.ground.autoScroll(-100,0);
		game.time.events.start();
	}

	this.stopGame = function(){
		this.bg.stopScroll();
		this.ground.stopScroll();
		this.pipeGroup.forEachExists(function(pipe){
			pipe.body.velocity.x = 0;
		}, this);
		this.bird.animations.stop('fly', 0);
		game.time.events.stop(true);
	}

	this.hitPipe = function(){
		if(this.gameIsOver) return;
		this.soundHitPipe.play();
		this.gameOver();
	}
	this.hitGround = function(){
		if(this.gameIsOver) return;
		this.soundHitGround.play();
		this.gameOver();
	}
	this.gameOver = function(){
		this.gameIsOver = true;
		this.stopGame();
	};

	this.generatePipes = function(gap){ //制造管道
		gap = gap || 100; //上下管道之间的间隙宽度
		var position = (505 - 320 - gap) + Math.floor((505 - 112 - 30 - gap - 505 + 320 + gap) * Math.random());
		var topPipeY = position-360;
		var bottomPipeY = position+gap;

		if(this.resetPipe(topPipeY,bottomPipeY)) return;

		var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup);
		var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup);
		this.pipeGroup.setAll('checkWorldBounds',true);
		this.pipeGroup.setAll('outOfBoundsKill',true);
		this.pipeGroup.setAll('body.velocity.x', -100);
	}

	this.resetPipe = function(topPipeY,bottomPipeY){//重置出了边界的管道，做到回收利用
		var i = 0;
		this.pipeGroup.forEachDead(function(pipe){
			if(pipe.y<=0){ //topPipe
				pipe.reset(game.width, topPipeY);
				pipe.hasScored = false; //重置为未得分
			}else{
				pipe.reset(game.width, bottomPipeY);
			}
			pipe.body.velocity.x = -100;
			i++;
		}, this);
		return i == 2; //如果 i==2 代表有一组管道已经出了边界，可以回收这组管道了
	}

	this.checkScore = function(pipe){//负责分数的检测和更新
		if(!pipe.hasScored && pipe.y<=0 && pipe.x<=game.width/2-17-54){
			pipe.hasScored = true;
			this.scoreText.text = ++this.score;
			this.soundScore.play();
			return true;
		}
		return false;
	}
}

//添加state到游戏
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);
game.state.start('boot'); //启动游戏

