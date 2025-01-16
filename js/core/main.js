var player = {
    // hyp is the hyperoperation. 1 represents addition, 2 represents multiplication, 3 represents exponentiation, and so on. Based on whatever this number is, the game loads things differently.
    hyp: 1,

    points: {
        amount: new ExpantaNum(0),
        gen: new ExpantaNum(0),
    }
}

var testNum = 0
const RINGS = 8
const FPS = 60

var mainCanvas = document.getElementById("mainCanvas")
mainCanvas.width = document.getElementById("mainCanvasDiv").style.width.replace('px', '')
mainCanvas.height = document.getElementById("mainCanvasDiv").style.height.replace('px', '')

function loadData() {
    // For now, the game has no saving.
    if (player.hyp == 1) {
        let initRingPrices = Array.from({length: RINGS}, (_, x) => 10 * Math.pow(20, x))
        let initRingSpeeds = Array.from({length: RINGS}, () => 0.1)
        let initRingEffects = Array.from({length: RINGS}, (_, x) => 10 * Math.pow(10, x))

        for (let i = 0; i < RINGS; i++) {
            Object.assign(player, 
                {["r" + (i+1)]: {
                    price: initRingPrices[i],
                    speed: initRingSpeeds[i],
                    laps: 0,
                    lapsCeil: 1, // This is used to run the revComplete function every turn, along with laps. See comment in the mainLoop() function.
                    progress: 0,
                    effectBase: initRingEffects[i],
                    effect: 0,
                    unlocked: (i == 0) ? true : false,
                }}
            )
        }
    }
}

loadData()

function formatNormal(num) {
    var num = num.toNumber()

    if (num >= 1e12) {
        return num.toExponential(2).replace('+', '')
    } else {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    
}

function formatEN(num) {
    return num.toFixed(2)
}

function revComplete(ring) {
    player.points.amount = ExpantaNum.add(player.points.amount, ring)
}

function update() {
    let c = mainCanvas.getContext('2d')
    c.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
    
    for (let i = 0; i < RINGS; i++) {
        if (player["r" + (i + 1)].unlocked) {
            c.beginPath()
            c.arc(mainCanvas.width / 2, mainCanvas.height / 2, 35+35*i, 0, (player["r" + (i + 1)].laps) % 1 * 2 * Math.PI, false)
            c.strokeStyle = `hsl(${360 / RINGS * i}, 100%, 70%)`
            c.lineWidth = 25
            c.stroke()
        }
    }

    document.getElementById("points").innerHTML = (player.hyp == 1) ? formatNormal(player.points.amount) : formatEN(player.points.amount);
    document.getElementById("pointGen").innerHTML = (player.hyp == 1) ? formatNormal(player.points.gen) : formatEN(player.points.gen);
}

function mainLoop() {
    for (let i = 0; i < RINGS; i++) {
        if (player["r" + (i + 1)].unlocked) {
            player["r" + (i + 1)].laps = player["r" + (i + 1)].laps + player["r" + (i + 1)].speed / FPS

            if (player["r" + (i + 1)].laps >= player["r" + (i + 1)].lapsCeil) {
                revComplete(2)
            }

            player["r" + (i + 1)].lapsCeil = Math.ceil(player["r" + (i + 1)].laps)
        }
    }

}

window.setInterval(function() {
    mainLoop()
    update()

}, 1000/FPS)