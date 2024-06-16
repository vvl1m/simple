<script setup>
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    
    const descinput = ref(await user.value.user_metadata.description || '');
    const remainEdit = ref(80 - descinput.value.length);
    let props = defineProps({
        userId: String
    })
    const emit = defineEmits(['closeUserEdit'])

    const changeDesc = async () => {
        console.log(descinput.value)
        const { data, error } = await supabase.auth.updateUser({
                data: {
                    description: descinput.value,
                }
            })        
        if (error) throw error;
    }
    const changeColor = () => {
        const percentage = ref(remainEdit.value / 80);
        const color = document.querySelector('#modal-userEdit-description-length');

        if (percentage.value > 0.5) {
            color.style.color = '#5cc73c';
        }
        else if (percentage.value > 0.25) {
            color.style.color = '#e69d17';
        }
        else {
            color.style.color = '#f84b4b';
        }
        document.querySelector('#modal-userEdit-description').style.height = `auto`;
        document.querySelector('#modal-userEdit-description').style.height = document.querySelector('#modal-userEdit-description').scrollHeight + 'px';
    }

    const name = ref(await user.value.user_metadata.username);
    const changeName = async () => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    username: name.value,
                }
            })        
            if (error) throw error.message;
        }
        catch (error) {
            alert(error);
        }
    }

    const nameChange = ref(false);
    const handleChangename = () => {
        document.querySelector('#modal-userEdit-body-dialog-info-name').style.transition = 'all 0.2s ease-in';
        document.querySelector('#modal-userEdit-body-dialog-info-name').style.width = '0';
        setTimeout(() => {
            document.querySelector('#modal-userEdit-body-dialog-info-name').style.display = 'none';
            nameChange.value = true;
        }, 150)

    }
    onMounted(() => {
        changeColor()
    })
</script>
<template>
    <div id="modal-userEdit-background">
        <div id="modal-user-edit">
            <span>Редактирование профиля</span>
            <div id="modal-userEdit">
                <div id="modal-userEdit-body-dialog-info-avatar" :style="{ backgroundImage: `url(${user?.user_metadata.avatar_url})` }"></div>
                <input @change="changeName()" v-model="name"  minlength="3" maxlength="20" id="modal-userEdit-body-dialog-info-nameChange" v-if="nameChange">
                <span @click="handleChangename()" id="modal-userEdit-body-dialog-info-name">@{{ user?.user_metadata.username }}</span>
            </div>

            <div id="modal-userEdit-description-block">
                <span id="modal-userEdit-description-title">О себе</span>
                <textarea v-model="descinput" @change="changeDesc()" @input="remainEdit = 80 - descinput.length; changeColor()" id="modal-userEdit-description" maxlength="80" rows="1">{{ descinput}}</textarea>
                <div id="modal-userEdit-description-length" v-text="remainEdit"></div>
            </div>
        </div>
        <div id="modal-userEdit-overlay" @click="emit('closeUserEdit')"></div>

    </div>
</template>
<style lang="scss">
    #modal-userEdit-background {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        z-index: 99;
        background-color: rgba($color: #000000, $alpha: .6);    

        display: flex;
        justify-content: center;
        align-items: center;
        #modal-userEdit-overlay {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;

            z-index: 50;
        }
        #modal-user-edit {
            z-index: 100;
            // width: 350px;
            // height: 150px;
            padding: 20px;
            border-radius: 10px;
            background-color: var(--backround);
            display: flex;
            #modal-userEdit {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 20%;
                #modal-userEdit-body-dialog-info-avatar {
                    width: 100px;
                    height: 100px;
                    background-size: cover;
                    background-position: center;
                    border-radius: 100%;
                    flex-shrink: 0;
                }
                #modal-userEdit-body-dialog-info-nameChange {
                    margin-top: 10px;
                    width: 90%;
                    padding: 10px;
                    background-color: var(--background-block);
                    border-radius: 5px;
                    color: white;
                    border: none;
                    resize: none;
                    outline: none;
                    animation: vlados .2s ease-in;
                    @keyframes vlados {
                        0% {
                            width: 0px;
                        }
                        100% {
                            width: 90%;
                        }
                    }
                }
                #modal-userEdit-body-dialog-info-name {
                    font-size: 24px;
                    font-weight: 600;
                    width: 90%;
                    border-radius: 10px;
                    margin-top: 5px;
                    padding: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color .3s ease;
                    opacity: 100%;
                    animation: widthOut .2s ease-in;
                    &:hover {
                        cursor: pointer;
                        border-radius: 10px;
                        background-color: rgba($color: #fff, $alpha: .1);
                        width: 90%;
                        transition: background-color .3s ease;
                        animation: widthIn .3s ease-in-out;
                    }
                    @keyframes widthIn {
                        0% {
                            width: 0px;
                        }
                        100% {
                            width: 90%;
                        }
                    }
                    @keyframes widthOut {
                        0% {
                            width: 90%;
                        }
                        100% {
                            width: 0px;
                        }
                    }
                }
            }

            #modal-userEdit-description-length {
                font-size: 12px;
                float: right;
                transition: color .3s ease;
            }
            #modal-userEdit-description {
                margin-top: 5px;
                width: 100%;
                padding: 10px;
                background-color: var(--background-block);
                border-radius: 5px;
                color: white;
                border: none;
                resize: none;
                &:hover {
                    background-color: rgba($color: #fff, $alpha: .1);
                }
                &:focus {
                    outline: none;
                    background-color: rgba($color: #fff, $alpha: .1);
                }
                
            }
        }
    }
</style>