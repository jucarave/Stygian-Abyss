const CHOISE_STATUS = {
    CHOOSING: 0,
    ANSWERED: 1
};

function Choise(game, mapManager, UI, ins) {
    this.game = game;
    this.mapManager = mapManager;
    this.UI = UI;
    this.ctx = UI.ctx;

    this.status = CHOISE_STATUS.CHOOSING;

    var choise = ins.choise;
    this.lines = choise.question.split("\n");
    this.answer = "";
    this.options = choise.options;
    this.sprite = game.images.c2d[choise.image];

    this.timer = 10;
    this.loopTimer();

    this.cursor = 0;
}

module.exports = Choise;

Choise.prototype.loopTimer = function() {
    var self = this;
    this.timeout = setTimeout(function(){
        if (self.status != CHOISE_STATUS.CHOOSING) { return; }

        self.timer -= 1;
        if (self.timer > 0) { 
            self.loopTimer(); 
        } else {
            self.game.keys[13] = 1;
        }
    }, 1000);
};

Choise.prototype.placePlayer = function() {
    var player = this.mapManager.player,
        offset = this.cursor * 2 - 1;

    player.rotation.b += Math.degToRad(-90 * offset);

    player.position.a += Math.cos(player.rotation.b);
    player.position.c -= Math.sin(player.rotation.b);
};

Choise.prototype.loop = function() {
    if (this.status != CHOISE_STATUS.CHOOSING) { return; }

    if (this.game.keys[37] == 1){
        this.cursor -= 1;
    } else if (this.game.keys[39] == 1){
        this.cursor += 1;
    }

    if (this.game.keys[13] == 1) {
        this.status = CHOISE_STATUS.ANSWERED;
        this.answer = this.options[this.cursor].answer.split("\n");
        this.game.keys[13] = 0;

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.placePlayer();

        // Destroy answer text after X milliseconds
        var self = this;
        setTimeout(function() {
            if (self.mapManager.choise == self) {
                self.mapManager.choise = null;
            }
        }, 3000);
    }

    this.cursor = Math.max(0, Math.min(this.cursor, 1));
};

Choise.prototype.drawQuestion = function() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0,0,this.ctx.width,this.ctx.height);

    this.ctx.save();

    // Draw question

    this.ctx.font = "20px 'ZX_SPECTRUM'";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";

    for (var i=0,len=this.lines.length;i<len;i++) {
        this.ctx.fillText(this.lines[i], (this.ctx.width/2) << 0, 16 + 10 * i);
    }

    // Draw options

    this.ctx.fillStyle = "white";

    if (this.cursor == 0) {
        var size = this.ctx.measureText(this.options[0].question);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(46, this.ctx.height - 25, size.width + 4, 11);

        this.ctx.fillStyle = "black";
    }
    
    this.ctx.textAlign = "left";
    this.ctx.fillText(this.options[0].question, 48, this.ctx.height - 16);

    this.ctx.fillStyle = "white";

    if (this.cursor == 1) {
        var size = this.ctx.measureText(this.options[1].question);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(this.ctx.width-50-size.width, this.ctx.height - 25, size.width + 4, 11);

        this.ctx.fillStyle = "black";
    }

    this.ctx.textAlign = "right";
    this.ctx.fillText(this.options[1].question, this.ctx.width-48, this.ctx.height - 16);

    // Draw image
    this.ctx.drawImage(this.sprite, this.ctx.width / 2 - this.sprite.width / 2, this.ctx.height / 2 - this.sprite.height / 2);

    // Draw timer
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, this.ctx.height - 8, this.ctx.width * (this.timer / 10), 8);

    this.ctx.restore();
};

Choise.prototype.drawAnswer = function() {
    this.UI.clear();

    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";

    for (var i=0,len=this.answer.length;i<len;i++) {
        this.ctx.fillText(this.answer[i], this.ctx.width / 2, this.ctx.height - 16 - (len - 1 - i) * 10);
    }
};

Choise.prototype.draw = function() {
    switch (this.status) {
        case CHOISE_STATUS.CHOOSING:
            this.drawQuestion();
            break;

        case CHOISE_STATUS.ANSWERED:
            this.drawAnswer();
            break;
    }
};

Choise.prototype.lockPlayer = function() {
    return this.status === CHOISE_STATUS.CHOOSING;
};