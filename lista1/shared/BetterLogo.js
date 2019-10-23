/**
 * Author: Bartosz Barnaba Rajczyk
 */
const [BRACKET_OPEN, BRACKET_CLOSE, COMMAND_SEPARATOR] = ['[', ']', ' '];
const COMMAND = {
    FW: {name: 'fw', argNo: 1},
    BW: {name: 'bw', argNo: 1},
    RT: {name: 'rt', argNo: 1},
    LT: {name: 'lt', argNo: 1},
    REPEAT: {name: 'repeat', argNo: -1},
    RESET: {name: 'reset', argNo: 0},
    UP: {name: 'up', argNo: 0},
    DOWN: {name: 'down', argNo: 0},
    CENTER: {name: 'center', argNo: 0}
};

/***
 * A single BetterLogo instance. Uses all the other classes.
 */
class BetterLogo {
    constructor(canvasDomElement) {
        this.ctx = canvasDomElement.getContext('2d');
        this.height = canvasDomElement.height;
        this.width = canvasDomElement.width;

        this.x = 0;
        this.y = 0;
        this.rotation = 90;
        this.stroke = true;
    }

    move(value) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y + this.height);
        this.x += value * Math.cos(this.rotation * Math.PI/180);
        this.y -= value * Math.sin(this.rotation * Math.PI/180);
        this.ctx.lineTo(this.x, this.y + this.height);
        if (this.stroke) this.ctx.stroke();
    }

    rotate(value) {
        this.rotation = ((this.rotation - value) % 360 + 360) % 360;
    }

    runCommands(inputString) {
        const argList = inputString
            .replace(/\s+/g, ' ') // replace multiple spaces/tabs with single space
            .trim() // removes trailing spaces
            .toLocaleUpperCase() // commands are in uppercase
            .split(COMMAND_SEPARATOR);
        const context = new ExecutionContext(argList);
        context.getAtomics().forEach(atomic => atomic.execute(this));
    }

    getCoords() {
        return {
            x: this.x,
            y: -this.y,
            r: this.rotation
        };
    }
}

/**
 * A single command execution.
 */
class AtomicExecution {
    constructor(command, ...params) {
        this.command = command;
        // primitive parser, accepts only numbers now
        this.params = params.map(e => {
            let res = Number(e);
            if (isNaN(res) || !isFinite(res)) throw `Incorrect argument for ${command.name}`;
            return res;
        });
    }

    execute(betterLogo) {
        switch (this.command) {
            case COMMAND.FW:
                betterLogo.move(this.params[0]);
                break;
            case COMMAND.BW:
                betterLogo.move(-this.params[0]);
                break;
            case COMMAND.RT:
                betterLogo.rotate(this.params[0]);
                break;
            case COMMAND.LT:
                betterLogo.rotate(-this.params[0]);
                break;
            case COMMAND.UP:
                betterLogo.stroke = false;
                break;
            case COMMAND.DOWN:
                betterLogo.stroke = true;
                break;
            case COMMAND.CENTER:
                betterLogo.x = betterLogo.width/2;
                betterLogo.y = -betterLogo.height/2;
                break;
            case COMMAND.RESET:
                betterLogo.ctx.clearRect(0, 0, betterLogo.width, betterLogo.height);
                betterLogo.x = 0;
                betterLogo.y = 0;
                betterLogo.stroke = true;
                betterLogo.rotation = 90;
                break;
        }
    }
}

/**
 * A context for repeating or sequencing atomic executions.
 */
class ExecutionContext {
    constructor(argList) {
        this.parsedCommands = [];

        for (let i = 0; i < argList.length;) {
            const command = COMMAND[argList[i]];
            if (command) {
                if (command === COMMAND.REPEAT) {
                    if (argList[i + 2] !== BRACKET_OPEN) throw `Expected brackets after ${COMMAND.REPEAT.name}`;
                    let repetitions = Number(argList[i+1]);
                    if (isNaN(repetitions) || repetitions < 1) throw 'Incorrect number or repetitions';
                    let bracketNumber = 0, j = 0;
                    for (j = i + 2; j < argList.length; j++) {
                        if (argList[j] === BRACKET_OPEN) bracketNumber++;
                        if (argList[j] === BRACKET_CLOSE) bracketNumber--;
                        if (bracketNumber === 0) break;
                    }
                    if (bracketNumber !== 0) {
                        throw 'Incorrect bracketing';
                    }

                    this.parsedCommands = [...this.parsedCommands, ...new Array(repetitions).fill(new ExecutionContext(argList.slice(i + 3, j)))];
                    i = j + 1;
                } else {
                    if (i + command.argNo >= argList.length) {
                        throw `Missing args in command ${command.name}`;
                    }
                    this.parsedCommands.push(
                        new AtomicExecution(command, ...argList.slice(i + 1, i + 1 + command.argNo))
                    );
                    i += 1 + command.argNo;
                }
            } else {
                throw `Unrecognized command ${argList[i]}`;
            }
        }
    }

    getAtomics() {
        return this.parsedCommands.reduce((acc, command) => {
            if (command instanceof ExecutionContext) {
                return [...acc, ...command.getAtomics()];
            } else {
                return [...acc, command];
            }
        }, []);
    }
}