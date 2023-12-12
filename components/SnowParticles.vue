<script setup>
const canvas = ref()

const particleCount = 5

let ctx
let particles = new Set()
let width, height, sizeMod
let canvasKey = ref(0)

const img = getImage()

onMounted(() => {
    init()

    img.onload = () => {
        animate()
    }

    window.addEventListener("resize", init)
    window.addEventListener("mouseup", () => addParticle())

    for (let i = 0; i < particleCount; i++) {
        addParticle(Math.random() * height)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener("resize", init)
    window.removeEventListener("mouseup", () => addParticle())
})

function init() {
    ctx = canvas.value.getContext("2d")
    width = window.innerWidth
    height = window.innerHeight
    sizeMod = height / 1080

    ctx.canvas.width = width
    ctx.canvas.height = height
}

function getImage() {
    const img = new Image()
    img.src = "dellekesHubSnowflake.svg"
    img.width = 100
    img.height = 100
    return img
}

function addParticle(posY) {
    const speedFactor = (0.15 + (Math.random() * 0.3))
    const rotationFactor = speedFactor * (-0.3 + (Math.random() * 0.6))
    const sizeFactor = (-0.1 + (Math.random() * 0.2)) + 1.5

    const particle = {
        posX: Math.random() * width,
        posY: posY ?? -(img.height * sizeFactor * sizeMod),
        speedY: speedFactor,
        rotation: 0,
        rotationSpeed: rotationFactor,
        size: sizeFactor
    }

    particles.add(particle)
}

function killParticles() {
    particles.forEach(particle => {
        if (particle.posY > height) {
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
        ctx.globalAlpha = (0.2 - (particle.posY / height * 0.1))
        ctx.drawImage(img, particle.posX, particle.posY, img.width * particle.size * sizeMod, img.height * particle.size * sizeMod)
        ctx.globalAlpha = 1

        ctx.restore();
    })
}

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, width, height);

    if (particles.size < particleCount) {
        addParticle()
    }
    killParticles()
    moveParticles()
    drawParticles()
}
</script>

<template>
    <canvas :key="canvasKey"
            ref="canvas"></canvas>
</template>

<style scoped>
canvas {
    z-index: -1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px red solid;
}
</style>