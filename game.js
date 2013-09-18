var body      = document.body
,   canvas    = document.createElement('canvas')
,   ctx       = canvas.getContext('2d')
,   myman     = null
,   gravity   = 0.01
,   speed     = 1.2
,   gameon    = true
,   lives     = 2 // start with
,   ticks     = 0
,   nextPlatL = 60 // min frames till next plat
,   nextPlatH = 120 // max frames till next plat
,   nextPlatD = nextPlatH - nextPlatL // time diff
,   nextPlat  = nextPlatL
,   lasttime  = Date.now()
,   currtime  = null
,   timer     = 0
,   i         = 0 // gen purpose iterator
,   keycodes  = {
        'w': 87,
        'a': 65,
        'd': 68,
        'enter': 13
    }
,   latch     = {}
,   platforms = [] 
;


// QVGA!
canvas.width = 320;
canvas.height = 240;
canvas.style.backgroundColor = 'black';
body.appendChild(canvas);

function man (opts) {

    opts = opts || {};
    
    this.pos = {};
    this.x = opts.x || canvas.width/2;
    this.y = opts.y || canvas.height/2;
    this.width = 16;
    this.height = 16;
    this.accx = 0;
    this.accy = 0;
    this.velx = 0;
    this.vely = 0;
    this.lives = lives;
    this.state = 'air';
}

man.prototype.maxAcc = .8;
man.prototype.maxVel = 3;
man.prototype.accInc = 0.2;

man.prototype.render = function () {
    ctx.save();
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
};
man.prototype.die = function () {
    this.lives -= 1;  
    if (this.lives < 1) {
        gameon = false;
    }
};
man.prototype.jump = function () {
    console.log('jump!');
    if (this.state === 'air') { return; } // no jumping!
    this.vely = -this.maxVel;
    this.accy = this.maxAcc;
    this.state = 'air';
};
man.prototype.left = function () {
        console.log('left!');

    this.accx -= this.accInc;
    if (this.accx > this.maxAcc) { this.acc = this.maxAcc; }
    if (this.accx < -this.maxAcc) { this.accx = -this.maxAcc; }
};
man.prototype.right = function () {
        console.log('right!');

    this.accx += this.accInc;
    if (this.accx > this.maxAcc) { this.acc = this.maxAcc; }
    if (this.accx < -this.maxAcc) { this.accx = -this.maxAcc; }
};
man.prototype.update = function () {
    var foundground = false;
    
    this.velx += this.accx;
    this.vely += this.accy;
    

    
    this.x = (this.state === 'air') ? this.x + this.velx : this.x + this.velx - speed;
    this.y += this.vely;
    
    if (this.y > canvas.height || this.x + this.width < 0) {
        this.die();
        console.log('die');
        return;
    }
    
    for (i=0; i<platforms.length; i++) {
        if (this.x + this.width > platforms[i].x || this.x < platforms[i].x + platforms[i].length) {
            // x lines up
            if (Math.abs(this.y + this.height - platforms[i].y) < 2) { // fudge a little
                foundground = true;
                this.state = 'ground';
                this.accy = 0;
                this.accx = 0;
                this.vely = 0;
                this.y = platforms[i].y - this.height;
            }
        }
    }
    
    /*
    if (foundground === true) {
        this.state = 'ground';
        this.accy = 0;
        this.accx = 0;
        this.vely = 0;
    } else {
        this.state = 'air';
    }
    */
    if (!foundground) {
        this.state = 'air';
    }
    
    console.log(this.state);
    
    if (this.state === 'air') {
        this.accy += gravity;
    }

};

function update () {
    if (gameon) {
        // timer stuff
        ticks++;
        currtime = Date.now()
        timer += currtime - lasttime;
        lasttime = currtime;
    
        // clear canvas
        ctx.clearRect(0,0,canvas.width, canvas.height);

        //process keys
        for(i in keycodes) {
            if (latch[keycodes[i]]) {
                switch (i) {
                    case 'w': myman.jump(); break;
                    case 'a': myman.left(); break;
                    case 'd': myman.right(); break;
                }
            }
        }
        
        //update/draw platforms
        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#f00';
        for(i=0; i<platforms.length; i++) {
            //update
            platforms[i].x -= speed;
            ctx.beginPath();
            ctx.moveTo(platforms[i].x, platforms[i].y);
            ctx.lineTo(platforms[i].x + platforms[i].length, platforms[i].y);
            ctx.stroke();
            
        }
        ctx.restore();
        
        // update man
        myman.update();
        
        //gen new platform?
        if (ticks % nextPlat === 0) {
            ticks = 0;
            nextPlat = nextPlatL + ((Math.random() * nextPlatD)>>0);
            platforms.push({x: canvas.width, y: Math.random() * canvas.height, length: 40});
        }

        // draw man
        myman.render();
        
        // draw score/timer
        ctx.fillStyle = 'white';
        ctx.fillText(timer/1000, 20,20);
        
        window.requestAnimationFrame(update);
    } else {
        // game over man, game over!
    }    
}

// keys
window.addEventListener('keydown', function (e) {
	var code = e.which || e.keyCode || e.key;
	latch[code] = true;
});
window.addEventListener('keyup', function (e) {
	var code = e.which || e.keyCode || e.key;
	delete latch[code];
});


// start game
myman = new man();
platforms.push({x: (canvas.width/2), y: canvas.height/1.5, length: 50});
update();
