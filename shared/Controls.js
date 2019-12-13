class KeyboardControl {
    constructor(listenedElement) {
        this.keyMap = {};
        listenedElement.addEventListener('keydown', event => {
            if (this.keyMap[event.key]) this.keyMap[event.key].active = true
        });
        listenedElement.addEventListener('keyup', event => {
            if (this.keyMap[event.key]) this.keyMap[event.key].active = false
        });
    }

    onKey(name, callback) {
        this.keyMap[name] = {
            active: false,
            callback: callback
        };
    }

    tick(...args) {
        Object.values(this.keyMap).forEach(key => {
            if (key.active) key.callback(...args);
        })
    }
}

class MouseControl {
    constructor(listenedElement) {
        this.drag = false;
        this.listeners = [];
        listenedElement.addEventListener('mousedown', () => this.drag = true);
        listenedElement.addEventListener('mouseup', () => this.drag = false);
        listenedElement.addEventListener('mouseout', () => this.drag = false);
        listenedElement.addEventListener('mousemove', event => {
            if (this.drag) {
                this.listeners.forEach(listener => listener.callback(-event.movementX/listener.xPrecision, event.movementY/listener.yPrecision));
            }
        });
    }

    addListener(callback, xPrecision, yPrecision) {
        this.listeners.push({
            callback: callback,
            xPrecision: xPrecision,
            yPrecision: yPrecision
        });
    }
}
