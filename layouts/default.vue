<script setup>
import gsap from "gsap"
const animationWrapper = ref()

onMounted(() => {
    const tl = gsap.timeline()
    tl.to(animationWrapper.value, { x: '-100%', ease: "power4.inOut", duration: 1 })
})
</script>

<template>
    <div ref="animationWrapper" class="animation">
        <img src="/icons/dellekes_logo.png" style="width: 150px" alt="logo">
    </div>
    <div ref="siteWrapper" class="wrapper">
        <SnowParticles />
        <Navbar />
        <div class="content">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.content {
    padding-top: var(--navbar-height);
}

.animation {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 999999999;
    background-color: #090909;
}
</style>