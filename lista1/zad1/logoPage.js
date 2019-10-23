function updateCords(cords) {
    const position = document.getElementById('position');
    position.textContent = `X: ${Math.round(cords.x)} Y: ${Math.round(cords.y)} R: ${Math.round(cords.r)}`;
}

window.addEventListener('load', () => {
    const betterLogo = new BetterLogo(document.getElementById('logoCanvas'));
    const commandInput = document.getElementById('commandInput');
    updateCords(betterLogo.getCoords());

    commandInput.addEventListener('keyup', (event) => {
       event.preventDefault();
       if (event.key === 'Enter') {
           let temp = commandInput.value;
           commandInput.value = '';
           betterLogo.runCommands(temp);
           updateCords(betterLogo.getCoords());
       }
    });

    document.getElementById('executeButton').addEventListener('click', () => {
            betterLogo.runCommands(commandInput.value);
    });
});


