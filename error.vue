<!-- Error page -->
<script setup>
const error = useError();
</script>
<template>
    <div class="containerError">
        <h1>{{ error.statusCode }}</h1>
        <p>{{ error.message }}</p>
        <span class="backUrlError" @click="$router.push('/')">Вернуться назад</span>
    </div>
</template>

<style lang="scss">
    .containerError {
        display: flex;
        height: 100vh;
        width: 100vw;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        .backUrlError {
            cursor: pointer;
            font-size: 20px;
            font-weight: 500;
            margin-top: 20px;
            text-decoration: underline;
        }
    }
</style>
