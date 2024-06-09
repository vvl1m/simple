<script setup>
	const props = defineProps({ 
        username: String,
        avatar: String,
        description: String
    })

</script>
<template>
	<div class="user-container">
        <div class="menu-body-dialog" @click="check = true">
            <div class="menu-body-dialog-avatar" :style="{ backgroundImage: `url(${props.avatar})` }"></div>
            <div class="menu-body-dialog-info">
                <span class="menu-body-dialog-info-name">{{ props.username }}</span>
                <span class="menu-body-dialog-info-message">{{ props.description }}</span>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
    .user-container {
        display: flex;
    }
</style>