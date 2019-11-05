window.addEventListener('load', () => {
    const svg = document.querySelector('svg');
    const label = document.querySelector('label');

    const resizeCords = (x, y, max) => ({
        x: x / (max - 1) * svg.width.baseVal.value,
        y: y / (max - 1) * svg.height.baseVal.value
    });

    const draw = (value) => {
        const size = 2 ** value;
        let previous = {
            x: 0, y: 0
        };

        let points = `0,0 `;
        for (let i = 1; i < size * size; i++) {
            let result = hilbertXY(i, size);
            console.log(result)
            let current = resizeCords(result.x, result.y, size);
            points += `${current.x},${current.y} `;
            previous = current;
        }

        svg.innerHTML = `<polyline points = "${points}" style="fill: none; stroke: black; stroke-width: 1px">`;
    };

    draw(1);

    document.getElementById('levelSelection').addEventListener('input', function () {
        label.textContent = `Curve's level: ${this.value}`;
        draw(this.value);
    });
});