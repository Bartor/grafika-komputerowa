const last2 = x => x & 0b11;
const drop2 = x => x >>> 2;

function hilbertXY(index, level) {
    let positions = [[0, 0], [0, 1], [1, 1], [1, 0]];
    let [x, y] = positions[last2(index)];
    index = drop2(index);

    for (let i = 4; i <= level; i *= 2) {
        switch (last2(index)) {
            case 0:
                [x, y] = [y, x];
                break;
            case 1:
                y += i / 2;
                break;
            case 2:
                x += i / 2;
                y += i / 2;
                break;
            case 3:
                [y, x] = [i/2 - 1 - x, i - 1 - y];
                break;
        }
        index = drop2(index);
    }

    return {
        x: x,
        y: y
    };
}