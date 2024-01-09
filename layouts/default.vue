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
    margin-top: 80px;
}
</style>