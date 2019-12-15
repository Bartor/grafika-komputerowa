const PLAYER_ACCELERATION = window.innerWidth / 2000;
const PLAYER_MAX_SPEED = window.innerWidth / 200;
const PLAYER_DRAG = window.innerWidth / 20000;

const PROJECTILE_SPEED = window.innerWidth / 200;
const PROJECTILE_COOLDOWN = 100;

const ENEMIES_SPEED = window.innerWidth / 2000;

/**
 * this code is an utter mess, don't ever re-use
 * anything from there
 */
class SpaceInvaders {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.enemySwarm = null;

        this.lastProjectile = 0;

        this.controls = new KeyboardControl(window);
        this.controls.onKey('w', (lastTime) => this.shoot(lastTime));

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
        playerNode.setParent(this.scene.root);

        this.player = new Player(playerNode, 15, this.gl.canvas.width / 2, this.gl.canvas.height - 60,);
    }

    makeEnemies(rows = 3, columns = 10, color = [1, 0.2, 0.2, 1]) {
        const enemies = new SceneNode();
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns + (i % 2); j++) {
                let enemy = new SceneNode(new BadGuy(this.gl, this.program, 20, color));
                this.enemies.push(new Enemy(enemy, 10, (j - (i % 2) / 2) * this.gl.canvas.width / (2 * (columns)), i * this.gl.canvas.height / 15));
                enemy.setParent(enemies);
            }
        }
        this.enemySwarm = new EnemySwarm(enemies, 0, this.gl.canvas.width / 4);
        enemies.setParent(this.scene.root);
    }

    shoot(time) {
        if (time - PROJECTILE_COOLDOWN > this.lastProjectile) {
            let projectile = new SceneNode(new Square(this.gl, this.program, 5, 10, [0.0, 0.5, 1, 1]));
            this.projectiles.push(new Projectile(projectile, 0, this.player.position.x, this.player.position.y));
            projectile.setParent(this.scene.root);
            this.lastProjectile = time;
        }
    }

    tick(timefactor, lastTime = 0) {
        this.controls.tick(lastTime);
        this.player.tickCallback(timefactor, lastTime);
        this.enemySwarm.tickCallback(timefactor, lastTime);

        this.projectiles = this.projectiles.filter(projectile => {
            projectile.tickCallback(timefactor, lastTime);
            if (projectile.position.y < 0) {
                this.scene.root.removeChild(projectile.node);
                return false;
            }
            return true;
        });

        this.enemies = this.enemies.filter(enemy => {
            enemy.tickCallback(timefactor, lastTime);
            let safe = true;
            this.projectiles.forEach(projectile => {
                if (dist({
                    x: enemy.position.x + this.enemySwarm.position.x,
                    y: enemy.position.y + this.enemySwarm.position.y
                }, projectile.position) < enemy.hitRadius) {
                    safe = false;
                }
            });
            if (!safe) {
                this.enemySwarm.node.removeChild(enemy.node);
            }
            return safe;
        });

        this.scene.draw();
    }
}

/* !abstract! */
class GameObject {
    constructor(sceneNode, hitRadius = 0, x = 0, y = 0) {
        this.node = sceneNode;
        this.hitRadius = hitRadius;
        this.position = {
            x: x,
            y: y
        };
    }

    tickCallback(timefactor, lastTime = 0) {
    }
}

class Projectile extends GameObject {
    constructor(sceneNode, hitRadius, x, y) {
        super(sceneNode, hitRadius, x, y);
    }

    tickCallback(timefactor, lastTime = 0) {
        this.position.y -= PROJECTILE_SPEED * timefactor;
        this.node.localMatrix = M4.translation(this.position.x, this.position.y, -0.2);
    }
}

class Enemy extends GameObject {
    constructor(sceneNode, hitRadius = 0, x = 0, y = 0) {
        super(sceneNode, hitRadius, x, y);
    }

    tickCallback(timefactor, lastTime = 0) {
        this.node.localMatrix = M4.translation(this.position.x, this.position.y, -0.15);
    }
}

class EnemySwarm extends GameObject {
    constructor(sceneNode, hitRadius = 0, x = 0, y = 0) {
        super(sceneNode, hitRadius, x, y);
    }

    tickCallback(timefactor, lastTime = 0) {
        this.position.y += timefactor * ENEMIES_SPEED;
        this.node.localMatrix = M4.translation(this.position.x, this.position.y, -0.15);
    }
}

class Player extends GameObject {
    constructor(sceneNode, hitRadius, x = 0, y = 0) {
        super(sceneNode, hitRadius, x, y);

        this.vx = 0;

        this.controls = new KeyboardControl(window);
        this.controls.onKey('a', (timefactor) => this.vx = Math.max(this.vx - timefactor * PLAYER_ACCELERATION, -PLAYER_MAX_SPEED));
        this.controls.onKey('d', (timefactor) => this.vx = Math.min(this.vx + timefactor * PLAYER_ACCELERATION, PLAYER_MAX_SPEED));
    }

    tickCallback(timefactor, lastTime) {
        this.controls.tick(timefactor);
        this.vx > 0 ? this.vx -= Math.min(PLAYER_DRAG * timefactor, this.vx) : this.vx -= Math.max(-PLAYER_DRAG * timefactor, this.vx);
        this.position.x += this.vx;
        this.node.localMatrix = M4.translation(this.position.x, this.position.y, -0.2);
    }
}

function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
