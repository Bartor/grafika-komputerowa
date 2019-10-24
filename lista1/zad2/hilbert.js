/**
 * Based on https://upload.wikimedia.org/wikipedia/commons/a/a7/Hilbert_curve_production_rules%21.svg
 */

class A {
    constructor(length) {
        this.path = `fw ${length} rt 90 fw ${length} rt 90 fw ${length}`;
        this.length = length;
    }

    ofDegree(n) {
        if (n === 1) return this.path;
        else {
            return `${new D(this.length / 3).ofDegree(n - 1)} rt 90 fw ${this.length / 3} ${new A(this.length / 3).ofDegree(n - 1)} lt 90 fw ${this.length / 3} lt 90 ${new A(this.length / 3).ofDegree(n - 1)} fw ${this.length / 3} ${new B(this.length / 3).ofDegree(n - 1)} rt 90`;
        }
    }
}

class B {
    constructor(length) {
        this.path = `rt 90 fw ${length} lt 90 fw ${length} lt 90 fw ${length}`;
        this.length = length;
    }

    ofDegree(n) {
        if (n === 1) return this.path;
        else {
            return `${new C(this.length / 3).ofDegree(n - 1)} lt 90 fw ${this.length / 3} lt 90 ${new B(this.length / 3).ofDegree(n - 1)} rt 90 fw ${this.length / 3} ${new B(this.length / 3).ofDegree(n - 1)} fw ${this.length / 3} lt 90 ${new A(this.length / 3).ofDegree(n - 1)} lt 90`;
        }
    }
}

class C {
    constructor(length) {
        this.path = `fw ${length} rt 90 fw ${length} rt 90 fw ${length}`;
        this.length = length;
    }

    ofDegree(n) {
        if (n === 1) return this.path;
        else {
            return `${new B(this.length / 3).ofDegree(n - 1)} rt 90 fw ${this.length / 3} ${new C(this.length / 3).ofDegree(n - 1)} lt 90 fw ${this.length / 3} lt 90 ${new C(this.length / 3).ofDegree(n - 1)} fw ${this.length / 3} ${new D(this.length / 3).ofDegree(n - 1)} lt 90`;
        }
    }
}

class D {
    constructor(length) {
        this.path = `rt 90 fw ${length} lt 90 fw ${length} lt 90 fw ${length}`;
        this.length = length;
    }

    ofDegree(n) {
        if (n === 1) return this.path;
        else {
            return `${new A(this.length / 3).ofDegree(n - 1)} lt 90 fw ${this.length / 3} lt 90 ${new D(this.length / 3).ofDegree(n - 1)} rt 90 fw ${this.length / 3} ${new D(this.length / 3).ofDegree(n - 1)} fw ${this.length / 3} lt 90 ${new C(this.length / 3).ofDegree(n - 1)} lt 90`;
        }
    }
}