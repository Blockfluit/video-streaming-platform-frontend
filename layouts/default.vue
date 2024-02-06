<script setup>
</script>

<template>
    <div>
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
</style>