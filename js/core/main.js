var player = {
    // hyp is the hyperoperation. 1 represents addition, 2 represents multiplication, 3 represents exponentiation, and so on. Based on whatever this number is, the game loads things differently.

    hyp: 1,
}

var testNum = 0
const RINGS = 1
const FPS = 60

var mainCanvas = document.getElementById("mainCanvas")
mainCanvas.width = document.getElementById("mainCanvasDiv").style.width.replace('px', '')
mainCanvas.height = document.getElementById("mainCanvasDiv").style.height.replace('px', '')

function loadData() {
    // For now, the game has no saving.
    if (player.hyp == 1) {
        let initRingPrices = []
        for (let i = 0; i < RINGS; i++) {
            initRingPrices.push(Math.pow)
        }
        let initRingSpeed = [0.5, 1, 2, 3, 4, 5, 6, 7]
    
        for (let i = 0; i < RINGS; i++) {
            Object.assign(player, 
                {["r" + (i+1)]: {
                    price: initRingPrices[i],
                    speed: initRingSpeed[i],
                    laps: new ExpantaNum(0),
                }}
            )
        }
    }
}

loadData()

function update() {
    let c = mainCanvas.getContext('2d')
    c.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
    
    for (let i = 0; i < RINGS; i++) {
        c.beginPath()
        c.arc(mainCanvas.width / 2, mainCanvas.height / 2, 35+35*i, 0, (player["r" + (i + 1)].laps) % 1 * 2 * Math.PI, false)
        c.strokeStyle = `hsl(${360 / RINGS * i}, 50%, 50%)`
        c.lineWidth = 25
        c.stroke()
    }
}

function mainLoop() {
    for (let i = 0; i < RINGS; i++) {
        player["r" + (i + 1)].laps = ExpantaNum.add(player["r" + (i + 1)].laps, player["r" + (i + 1)].speed / FPS)
    }
}

window.setInterval(function() {
    mainLoop()
    update()

}, 1000/FPS)