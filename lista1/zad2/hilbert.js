// not customizable with commands :(
function hilbertForLogo(level, baseLength) {
    const size = 2 ** level;
    let rotation = 90;

    let previous = {
        x: 0, y: 0
    };

    let resultString = '';
    for (let i = 1; i < size * size; i++) {
        let current = hilbertXY(i, size);

        if (current.x > previous.x) { //y can't change, go right, rot = 0
            resultString += `rt ${rotation} fw ${baseLength} `;
            rotation = 0;
        } else if (current.x === previous.x) { // y must change
            if (current.y > previous.y) { // go up, rot = 90
                resultString += `rt ${rotation - 90} fw ${baseLength} `;
                rotation = 90;
            } else { //go down, rot = 270
                resultString += `rt ${rotation - 270} fw ${baseLength} `;
                rotation = 270;
            }
        } else { // y can't change, go left, rot = 180
            resultString += `rt ${rotation - 180} fw ${baseLength} `;
            rotation = 180;
        }

        previous = current;
    }

    return resultString;
}