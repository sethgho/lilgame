/**
 * A simple scrolling platformer game 
 * Randomly generated platforms scroll
 * Try to survive by staying on platforms and not getting scrolled off screen
 * 
 * Keys
 *  - 'w' jump
 *  - 'a' left
 *  - 'd' right
 * 
 * Ideas for improvements
 *  - Add lives
 *  - Extra lives based on score
 *  - Jump height based on how long you press the jump button
 *  - More platform movement
 *  - Prevent platform passthru better by projecting player next location
 */
var body      = document.body
,   canvas    = document.createElement('canvas')
,   ctx       = canvas.getContext('2d')
,   gravity   = 0.09
,   friction  = 0.90 // scales acceleration when touching a platform
,   speed     = 1.2
,   gameon    = true
    // -- platforms --
,   ticks     = 0 // a frame counter
,   nextPlatL = 60 // min frames till next plat
,   nextPlatH = 120 // max frames till next plat
,   nextPlatD = nextPlatH - nextPlatL // time diff
,   nextPlat  = nextPlatL
    // -- timer / score --
,   lasttime  = Date.now()
,   currtime  = null
,   timer     = 0
,   i         = 0 // gen purpose iterator
    // -- keys --
,   keycodes  = {
        'w': 87,
        'a': 65,
        'd': 68,
        'enter': 13
    }
,   latch     = {}
    // -- game objects --
,   myman     = null
,   platforms = [] 
;

// QVGA resolution ;)
canvas.width = 320;
canvas.height = 240;
canvas.style.backgroundColor = 'black';
body.appendChild(canvas);

// constructor
function man (opts) {

    opts = opts || {};
    
    // instance members
    this.pos = {};
    this.x = opts.x || canvas.width/1.3;
    this.y = opts.y || canvas.height/2;
    this.width = 16;
    this.height = 16;
    this.accx = 0;
    this.accy = 0;
    this.velx = 0;
    this.vely = 0;
    this.state = 'air';
}

// class members
man.prototype.maxAcc = 0.5;
man.prototype.maxVel = 3;
man.prototype.accInc = 0.08;

// class methods/functions
man.prototype.render = function () {
    ctx.save();
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
};
man.prototype.die = function () {
    gameon = false;
    man.state = "dead";
};
man.prototype.jump = function () {
    console.log('jump!');
    if (this.state === 'air') { return; } // no jumping!
    //this.vely = -this.maxVel * 4;
    this.accy = -this.maxAcc*2.3;
    this.velx -= speed; // retain platform speed effect
    //this.y -= 6;
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
    var foundground = false
    ,   currplatform
    ;

    if (this.y > canvas.height || this.x + this.width < 0) {
        this.die();
        console.log('die');
        return;
    }
    
    // See if man is on a platform
    for (i=0; i<platforms.length; i++) {
        
        // check if our horizontal lines up
        if ((this.x + this.width > platforms[i].x) &&          // right edge of man 
            (this.x < platforms[i].x + platforms[i].length)) { // left edge of man
            
            // x lines up - check vertical (y)
            if (Math.abs(this.y + this.height - platforms[i].y) < this.height) { 
            
                // fudge a little on distance (9) above to prevent passing through object
                foundground = true;
                currplatform = i;

                break; // leave for loop
            }
        }
    }
    
    // only latch to platform if we are moving downward
    if (foundground === true && this.accy >= 0) {
        this.state = 'ground';
        
        // latch our man to this platform height
        this.y = platforms[currplatform].y - this.height;
        
        // prevent pass through platform
        this.accy = 0;
        this.vely = 0;
        this.velx *= 0.5; // try to prevent sliding off landing platform
    } else {
        this.state = 'air';
        this.accy += gravity;
    }
    

    this.accx = (this.state === 'ground') ? this.accx * friction : this.accx;
    this.velx += this.accx;
    this.vely += this.accy;
    
    // just limit the x velocity
    if (this.velx > this.maxVel)  { this.velx = this.maxVel; }
    if (this.velx < -this.maxVel) { this.velx = -this.maxVel; }
    
    // if touching a platform, we gain it's velocity component
    this.x = (this.state === 'air') ? this.x + this.velx : (this.x + this.velx - speed);
    this.y += this.vely;

};

function update () {
    if (gameon) {
        // update timer
        ticks++;
        currtime = Date.now()
        timer += currtime - lasttime;
        lasttime = currtime;

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
        
        // clear canvas
        ctx.clearRect(0,0,canvas.width, canvas.height);
        
        //update/draw platforms
        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#f00';
        for(i=0; i<platforms.length; i++) {
            // move platform according to game speed
            platforms[i].x -= speed;
            
            // draw platform
            ctx.beginPath();
            ctx.moveTo(platforms[i].x, platforms[i].y);
            ctx.lineTo(platforms[i].x + platforms[i].length, platforms[i].y);
            ctx.stroke();
        }

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
        
        // debug -- draw man state
        ctx.fillStyle = 'yellow';
        ctx.fillText(myman.state, canvas.width - 50, canvas.height - 20);
        
        // pop context mods
        ctx.restore();

        // request another frame        
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


// start game - create a player, the first platform, start game loop
myman = new man();
platforms.push({x: (canvas.width/1.3), y: canvas.height/1.5, length: 50});
update();
