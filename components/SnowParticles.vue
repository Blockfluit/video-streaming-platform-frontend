<script setup>
const canvas = ref()

const fps = 60
const deltaFps = 1000 / fps
const maxParticles = 15
const avgParticles = 5

let particles = new Set()
let ctx, width, height, sizeMod
let startT = performance.now()

const img = getImage()

onMounted(() => {
    init()

    img.onload = async () => {
        animate()
    }

    window.addEventListener("resize", init)
    window.addEventListener("mouseup", clickAddParticle)
})

onBeforeUnmount(() => {
    window.removeEventListener("resize", init)
    window.removeEventListener("mouseup", clickAddParticle)
})

function init() {
    ctx = canvas.value.getContext("2d")
    width = window.innerWidth
    height = window.innerHeight
    sizeMod = 1.1 - ((1920 / width) * 0.09)

    ctx.canvas.width = width
    ctx.canvas.height = height

    particles.clear()

    for (let i = 0; i < avgParticles; i++) {
        addParticle({
            posY: (Math.random() * height)
        })
    }
}

function getImage() {
    const img = new Image()
    img.src = "dellekesHubSnowflake.svg"
    img.width = 100
    img.height = 100
    return img
}

function clickAddParticle() {
    if (particles.size > maxParticles) {
        return
    }

    addParticle({
        speedY: Math.random() + 2
    })
}

function addParticle(options) {
    if (options === undefined) options = {}

    const speedFactor = options.speedY ?? (0.2 + (Math.random() * 0.4))
    const rotationFactor = speedFactor * (-0.3 + (Math.random() * 0.6))
    const sizeFactor = (-0.1 + (Math.random() * 0.2)) + 2

    const particle = {
        posX: Math.random() * width - (img.height * sizeFactor * sizeMod),
        posY: options.posY ?? -(img.height * sizeFactor * sizeMod),
        speedY: speedFactor * 2,
        rotation: 0,
        rotationSpeed: rotationFactor * 2,
        size: sizeFactor
    }

    particles.add(particle)
}

function killParticles() {
    particles.forEach(particle => {
        if (particle.posY > height ||
            particle.posX > width) {
            particles.delete(particle)
        }
    })
}

function moveParticles() {
    particles.forEach(particle => {
        particle.posY += particle.speedY
        particle.rotation += particle.rotationSpeed
    })
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.save();

        const particleCenterX = ((img.width * particle.size * sizeMod) / 2)
        const particleCenterY = ((img.height * particle.size * sizeMod) / 2)

        ctx.translate(particle.posX + particleCenterX, particle.posY + particleCenterY)
        ctx.rotate(particle.rotation * Math.PI / 180);
        ctx.translate(-(particle.posX + particleCenterX), -(particle.posY + particleCenterY))
        ctx.globalAlpha = (0.2 - (particle.posY / height * 0.18))
        ctx.drawImage(img, particle.posX, particle.posY, img.width * particle.size * sizeMod, img.height * particle.size * sizeMod)
        ctx.globalAlpha = 1

        ctx.restore();
    })
}

function animate() {
    requestAnimationFrame(animate)

    const endT = performance.now()
    const deltaT = endT - startT;

    if (deltaT < deltaFps) return

    ctx.clearRect(0, 0, width, height);

    if (particles.size < avgParticles) {
        addParticle()
    }
    killParticles()
    moveParticles()
    drawParticles()

    startT = endT
}
</script>

<template>
    <div>
        <canvas ref="canvas"></canvas>
    </div>
</template>

<style scoped>
canvas {
    z-index: -1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>