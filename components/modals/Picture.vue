<script setup>
    defineProps({
        picUrl: String
    })
    const emit = defineEmits(['closePic'])
</script>
<template>
    <div id="picture" @click="emit('closePic')">
        <img :src="picUrl">
    </div>
</template>
<style lang="scss">
    #picture {
        width: 100vw;
        height: 100vh;
        position: absolute;
        z-index: 999;
        background-color: rgba($color: #000000, $alpha: .6);    

        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        img {
            width: 40%;
            @media screen and (max-width: 450px) {
                width: 90%;
            }
        }
    }
</style>