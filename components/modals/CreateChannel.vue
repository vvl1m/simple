<script setup>
const emit = defineEmits(['closeCreateChannel'])
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const nameChannel = ref('');
const urlChannel = ref('');
const urlAvatar = ref('');

const nameAllowed = ref(false)
const urlAllowed = ref(false)
const avatarAllowed = ref(false)

const createChannel = async () => {
    const { data, error } = await supabase
        .from('channels')
        .insert([
            { 
                name_channel: nameChannel.value, 
                url_channel: urlChannel.value,
                owner: user.value.id,
                avatar_url: urlAvatar.value,
                subs: [user.value.id],
            },
        ])
        .select('*')
        .single();
    const { data: getUserChannels, error: checkError } = await supabase
        .from('profiles')
        .select('channels')
        .eq('id', user.value.id)
        .single();
    const userChannels = getUserChannels.channels;
    const { data: addChannel, error: channelsError } = await supabase
        .from('profiles')
        .update({ channels: [...userChannels, data.id] })
        .eq('id', user.value.id)
}
watch (nameChannel, () => {
    if (nameChannel.value == '') {
        document.querySelector('#nameChannelInput').style.border = '1px solid rgb(230, 75, 75)';
        nameAllowed.value = false;
    }
    else {
        document.querySelector('#nameChannelInput').style.border = '1px solid rgba(255, 255, 255, 0)';
        nameAllowed.value = true;
    }
})
watch(urlChannel, () => {
    const cyrillicPattern = /[а-яА-ЯЁё]/;
    if (urlChannel.value == '' || cyrillicPattern.test(urlChannel.value) || urlChannel.value.length < 3) {
        document.querySelector('#urlChannelInput').style.border = '1px solid rgb(230, 75, 75)';
        urlAllowed.value = false;
    }
    else {
        document.querySelector('#urlChannelInput').style.border = '1px solid rgba(255, 255, 255, 0)';
        urlAllowed.value = true;
    }
})

watch (urlAvatar, () => {
    if (urlAvatar.value == '') {
        document.querySelector('#urlAvatarInput').style.border = '1px solid rgb(230, 75, 75)';
        avatarAllowed.value = false;
    }
    else {
        document.querySelector('#urlAvatarInput').style.border = '1px solid rgba(255, 255, 255, 0)';
        avatarAllowed.value = true;
    }
})  

watch ([nameAllowed, urlAllowed, avatarAllowed], () => {
    if (!nameAllowed.value || !urlAllowed.value || !avatarAllowed.value) {
        document.querySelector('#modal-channel-edit-button').setAttribute('disabled', '');
    }
    else {
        document.querySelector('#modal-channel-edit-button').removeAttribute('disabled');
    }
})
</script>
<template>
    <div id="modal-channel-background">
        <div id="modal-channel-edit">
            <span>Создание канала</span>
            <div id="modal-channel-edit-form" >
                <input v-model="nameChannel" type="text" id="nameChannelInput" class="modal-channel-edit-input" placeholder="Название канала" autocomplete="off">
                <input v-model="urlChannel" type="text" id="urlChannelInput" class="modal-channel-edit-input" placeholder="Ссылка на канал" autocomplete="off">
                <input v-model="urlAvatar" type="text" id="urlAvatarInput" class="modal-channel-edit-input" placeholder="Ссылка на картинку" autocomplete="off">
            </div>
            <button @click="createChannel" id="modal-channel-edit-button" disabled>Создать</button>
        </div>

        <div id="modal-channel-overlay" @click="emit('closeCreateChannel')"></div>
    </div>
</template>
<style lang="scss">
    #modal-channel-background {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        z-index: 99;
        background-color: rgba($color: #000000, $alpha: .6);

        display: flex;
        justify-content: center;
        align-items: center;

        #modal-channel-edit {
            z-index: 100;
            width: 20%;
            height: auto;
            padding: 20px;
            border-radius: 10px;
            background-color: var(--backround);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            span {
                font-size: 24px;
                font-weight: 600;
            }
            #modal-channel-edit-form {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                margin-top: 10px;   

                .modal-channel-edit-input {
                    font-size: 14px;
                    width: 90%;
                    margin-top: 10px;
                    padding: 10px;
                    background-color: var(--background-block);
                    border-radius: 5px;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0);
                    resize: none;
                    outline: none;
                    transition: border .3s ease;
                    &:hover {
                        background-color: rgba($color: #fff, $alpha: .1);
                    }
                    &:focus {
                        outline: none;
                        background-color: rgba($color: #fff, $alpha: .1);
                    }
                    &::placeholder {
                        color: white;
                        opacity: .5;
                        transition: .3s ease;
                    }
                    &:focus::placeholder {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                }
            }
            #modal-channel-edit-button {
                margin-top: 10px;
                width: 90%;
                padding: 10px;
                background-color: var(--background-block);
                border-radius: 5px;
                color: white;
                border: none;
                outline: none;
                cursor: pointer;
                &:hover {
                    background-color: rgba($color: #ffffff, $alpha: .2);
                }
                &:disabled {
                    opacity: .5;
                    cursor: not-allowed;
                }
            }
        }

        #modal-channel-overlay {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;

            z-index: 50;
        }
    }
</style>