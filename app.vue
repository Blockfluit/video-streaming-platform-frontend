<template>
    <VitePwaManifest />
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<style> * {
     box-sizing: border-box;
 }

 html {
     background: var(--background-color-200);
     color: white;
 }

 .page-enter-active,
 .page-leave-active {
     transition: all .1s ease-in-out;
 }

 .page-enter-from,
 .page-leave-to {
     opacity: 0;
     filter: blur(0.5rem);
 }
</style>
