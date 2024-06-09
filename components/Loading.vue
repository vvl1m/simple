<script setup>
</script>
<template>
    <div id="loader">
        
    </div>
</template>
<style lang="scss">
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    #loader {
        border: 5px solid #f3f3f3;
        border-radius: 50%;
        border-top: 5px solid var(--blue);
        width: 80px;
        height: 80px;
        margin: auto;
        animation: spin 2s linear infinite;
    }
</style>