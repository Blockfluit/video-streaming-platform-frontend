<script setup>
import gsap from "gsap"
const animationWrapper = ref()

onBeforeMount(() => {
    gsap.to('body', { overflowX: 'hidden', overflowY: 'hidden' })
})

onMounted(() => {
    const tl = gsap.timeline()
    tl.to(animationWrapper.value, { x: '-100%', ease: "power4.inOut", duration: 1 }, 1)
        .to('body', { overflowY: 'auto' }, 1)
})
</script>

<template>
    <div ref="animationWrapper" class="animation">
        <img src="/icons/dellekes_logo.png" style="width: 50px; position: absolute;" alt="logo">
        <img src="/animations/loader.svg" style="width: 85px;" alt="loader">
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
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 999999999;
    background-color: #090909;
}
</style>