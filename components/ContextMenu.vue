<script setup>
const visible = ref(false);
const style = ref({ top: '0px', left: '0px' });
import localforage from 'localforage';

const props = defineProps({
    userId: String
})
const pinnedChats = ref([]);

localforage.getItem('pinnedChats').then(function(value) {
    if (value === null) {
      localforage.setItem('pinnedChats', []);
    }
    else {
      pinnedChats.value = JSON.parse(value);
    }
})

const showContextMenu = (event) => {
  event.preventDefault();
  style.value.top = `${event.clientY}px`;
  style.value.left = `${event.clientX}px`;
  visible.value = true;
};

const emit = defineEmits(['closeContextMenu']);
const hideContextMenu = () => {
  visible.value = false;
  emit('closeContextMenu');
};

const pinChat = () => {
  if (!pinnedChats.value.includes(props.userId)) {
    pinnedChats.value.push(props.userId);
    localforage.setItem('pinnedChats', JSON.stringify(pinnedChats.value));
  }
  else {
    pinnedChats.value.splice(pinnedChats.value.indexOf(props.userId), 1);
    localforage.setItem('pinnedChats', JSON.stringify(pinnedChats.value));
  }
};

onMounted(() => {
  window.addEventListener('click', hideContextMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', hideContextMenu);
});

defineExpose({ showContextMenu });
</script>

<template>
  <div v-if="visible" :style="style" class="context-menu">
    <ul>
      <li @click="pinChat" v-text="pinnedChats.includes(props.userId) ? 'Открепить' : 'Закрепить'"></li>
    </ul>
  </div>
</template>

<style lang="scss">
.context-menu {
    position: absolute;
    background-color: #262626;
    z-index: 1000;
    box-shadow: 0 0 3px rgba($color: #000000, $alpha: .5);
    padding: 5px;
}
.context-menu ul {
    list-style: none;
    margin: 0;
    padding: 0;
}
.context-menu li {
    padding: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    color: #adadad;
    background-color: transparent;
    transition: color .2s ease-in-out;
    transition: background-color .2s ease-in-out;
}
.context-menu li:hover {
    background-color: rgba($color: #adadad, $alpha: .5);
    color: white;
    transition: background-color .2s ease-in-out;
    transition: color .2s ease-in-out;
}
.context-menu-icon {
    padding: 15px;
    border-radius: 100%;
    border: none;
    outline: none;
    background: url('/pin.svg');
    background-size: 75%;
    background-position: center;
    background-repeat: no-repeat;
}
</style>