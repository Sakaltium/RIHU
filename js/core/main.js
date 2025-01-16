var player = {

}

var testNum = 0
const RINGS = 1
const FPS = 60

var mainCanvas = document.getElementById("mainCanvas")
mainCanvas.width = window.innerWidth
mainCanvas.height = window.innerHeight

function loadData() {
    // For now, the game has no saving.
    let initRingPrices = [10]
    let initRingSpeed = [1]

    for (let i = 0; i < RINGS; i++) {
        Object.assign(player, 
            {["r" + (i+1)]: {
                price: initRingPrices[i],
                speed: initRingSpeed[i],
                progress: 0,
            }}
        )
    }
}

loadData()

function update() {
    let c = mainCanvas.getContext('2d')
    c.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
    
    for (let i = 0; i < RINGS; i++) {
        c.beginPath()
        c.arc(500, 500, 35+40*i, 0, (player["r" + (i + 1)].progress) * 2 * Math.PI, false)
        c.strokeStyle = `hsl(${360 / RINGS * i}, 50%, 50%)`
        c.lineWidth = 15
        c.stroke()
    }
}

function mainLoop() {
    for (let i = 0; i < RINGS; i++) {
        player["r" + (i + 1)].progress = (player["r" + (i + 1)].progress + player["r" + (i + 1)].speed / FPS / 10) % 1
    }
}

window.setInterval(function() {
    mainLoop()
    update()

}, 1000/FPS)