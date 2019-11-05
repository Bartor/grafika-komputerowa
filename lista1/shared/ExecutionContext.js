const [BRACKET_OPEN, BRACKET_CLOSE] = ['[', ']'];
// implementations in AtomicExecution
const COMMAND = {
    FW: {name: 'Forwards', argNo: 1, threeD: true, twoD: true},
    BW: {name: 'Backwards', argNo: 1, threeD: true, twoD: true},
    RT: {name: 'Right turn', argNo: 1, threeD: true, twoD: true},
    LT: {name: 'Left turn', argNo: 1, threeD: true, twoD: true},
    UT: {name: 'Up turn', argNo: 1, threeD: true, twoD: false},
    DT: {name: 'Down turn', argNo: 1, threeD: true, twoD: false},
    REPEAT: {name: 'Repeat', argNo: -1, threeD: true, twoD: true},
    RESET: {name: 'Reset', argNo: 0, threeD: false, twoD: true},
    UP: {name: 'Pen up', argNo: 0, threeD: true, twoD: true},
    DOWN: {name: 'Pen down', argNo: 0, threeD: true, twoD: true},
    CENTER: {name: 'Center', argNo: 0, threeD: false, twoD: true}
};

/**
 * A context for repeating or sequencing atomic executions.
 */
export class ExecutionContext {
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
        if (this.command.threeD && !betterLogo.is3D) {
            throw `${this.command.name} is reserved for 3D BetterLogo`;
        }
        if (!this.command.threeD && betterLogo.is3D) {
            throw `${this.command.name} is reserved for 2D BetterLogo`;
        }

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
            case COMMAND.DT:
                betterLogo.pitch(this.params[0]);
                break;
            case COMMAND.UT:
                betterLogo.pitch(-this.params[0]);
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