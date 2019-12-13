const PLAYER_ACCELERATION = window.innerWidth / 2000;
const PLAYER_MAX_SPEED = window.innerWidth / 200;
const PLAYER_DRAG = window.innerWidth / 20000;

class Arkanoid {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.player = null;

        const bg = new SceneNode(new Square(gl, program, gl.canvas.width, gl.canvas.height, [0, 0.05, 0.11, 1]));
        for (let i = 0; i < 200; i++) {
            let star = new SceneNode(new Star(gl, program, 2 + Math.random() * 5, [0, 0, 0, Math.random() * 0.8 + 0.2]));
            star.localMatrix = M4.multiply(M4.zRotation(Math.random()), M4.translation(gl.canvas.width * Math.random(), gl.canvas.height * Math.random(), -0.1));
            star.setParent(bg);
        }

        this.scene = new SceneEngine(bg, gl.canvas.width, gl.canvas.height);
    }

    makePlayer(color = [0.0, 0.5, 1, 1]) {
        let playerNode = new SceneNode(new GoodGuy(this.gl, this.program, 30, color));
        playerNode.setParent(this.scene);

        this.player = new Player(playerNode, this.gl.canvas.height - 60);
    }

    makeEnemies(rows = 3, columns = 10, color = [1, 0.2, 0.2, 1]) {
        const enemies = new SceneNode();
        enemies.localMatrix = M4.translation(this.gl.canvas.width/4);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns + (i % 2); j++) {
                let enemy = new SceneNode(new BadGuy(this.gl, this.program, 20, color));
                enemy.localMatrix = M4.translation((j - (i%2)/2) * this.gl.canvas.width/(2*(ENEMY_COLS)), i * this.gl.height/15);

                enemy.setParent(enemies);
            }
        }
        enemies.setParent(this.scene.root);
    }
}

/* !abstract! */
class GameObject {
    constructor(sceneNode, x = 0, y = 0) {
        this.node = sceneNode;
        this.position = {
            x: x,
            y: y
        };
    }

    loopCallback(timefactor, lastTime = 0) {
    }
}

class Player extends GameObject {
    constructor(sceneNode, x = 0, y = 0) {
        super(sceneNode, x, y);

        this.vx = 0;

        this.controls = new KeyboardControl(window);
        this.controls.onKey('a', (timefactor) => this.vx = Math.max(this.vx - timefactor * PLAYER_ACCELERATION, -PLAYER_MAX_SPEED));
        this.controls.onKey('d', (timefactor) => this.vx = Math.min(this.vx + timefactor * PLAYER_ACCELERATION, PLAYER_MAX_SPEED));
    }

    loopCallback(timefactor, lastTime) {
        this.controls.tick(timefactor);
        this.vx > 0 ? this.vx -= Math.min(PLAYER_DRAG * timefactor, this.vx) : this.vx -= Math.max(-PLAYER_DRAG * timefactor, this.vx);
        this.position.x += this.vx;
        this.node.localMatrix = M4.translation(this.position.x, this.position.y, -0.2);
    }
}
