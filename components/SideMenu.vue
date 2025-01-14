<script setup>
    import localForage from "localforage";

    const checkMenu = ref(false);
    const emit = defineEmits(['newBlurValue'])

    const blur = ref(await localForage.getItem('blur'));

    const supabase = useSupabaseClient()
    const user = useSupabaseUser();
    const route = useRouter();

    const checkUserEdit = ref(false);

    const props = defineProps(['path'])

    const uploading = ref(false)
    const src = ref('')
    const files = ref()
    const newFilePath = ref('')
    const sghnOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.log('Error signing out');
        } else {
            route.push('/login');
            console.log('User signed out');
        }
    }

    function cropImage(inpFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const shortestSide = Math.min(img.width, img.height);
                canvas.width = shortestSide;
                canvas.height = shortestSide;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(
                    img,
                    (img.width - shortestSide) / 2,
                    (img.height - shortestSide) / 2,
                    shortestSide,
                    shortestSide,
                    0,
                    0,
                    shortestSide,
                    shortestSide
                );

                canvas.toBlob(blob => {
                const file = new File([blob], 'cropped-image.png', {type: 'image/png'});
                resolve(file);
                }, 'image/png');
            };
            img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(inpFile);
        });
    }

    const uploadAvatar = async (evt) => {
        files.value = evt.target.files
        try {
            uploading.value = true
            document.getElementById('sidemenu-body-header-avatar').style.backgroundImage = `url("/loading.gif")`;
            if (!files.value || files.value.length === 0) {
                throw new Error('Выберите файл.')
            }
            if (files.value[0].size > 2000000) {
                throw new Error('Файл слишком большой.')
            }
            let file = files.value[0];
            cropImage(files.value[0]).then(croppedImage => {
                file = croppedImage;
            })                  
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`
            newFilePath.value = filePath;
            uploading.value = false
            const {data: publicAvatar, error: publicAvatarError} = supabase.storage.from('avatars').getPublicUrl(newFilePath.value)
            if (user.value.user_metadata.avatar_url != null) {
                const getPrevousAvatar = user.value.user_metadata.avatar_url
                const getFilepath = getPrevousAvatar.split('/').pop();
                console.log(getFilepath)
                const { error: removeError } = await supabase.storage.from('avatars').remove([getFilepath])
                if (removeError) throw removeError
            }
            src.value = publicAvatar.publicUrl
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    avatar_url: src.value,
                }
            })
        } catch (uploadError) {
            alert(uploadError.message + "abob")
            uploading.value = false
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            localForage.setItem('background', file)
                .then(function() {
                    document.documentElement.style.setProperty('--image-background', `url(${URL.createObjectURL(file)})`);
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    };

    const roomOne = supabase.channel('online_room', { config: { presence: { key: user.value.id } } })
    roomOne
        .on('presence', { event: 'join' }, ({ joinedPresences }) => {
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await roomOne.track({ online_at: new Date().toISOString() })
            const { data, error } = await supabase
                .from('profiles')
                .update({ online_at: new Date().toISOString() })
                .eq('id', user.value.id);
            if (error) throw error
            if (data) console.log(data)
            await roomOne.untrack()
          }
        });

    const name = ref(await user.value.user_metadata.username);
    const nameChange = ref(false);

    const {data:getAllNames, error:getAllNamesError} = await supabase
        .from('profiles')
        .select('username')
        
    watch (name, () => {
        if (name.value == '' || name.value.length < 3) {
            document.querySelector('#modal-userEdit-body-dialog-info-nameChange').style.border = '1px solid rgb(230, 75, 75)';
        }
        else {
            if (getAllNames.some(item => item.username === name.value)) {
                document.querySelector('#modal-userEdit-body-dialog-info-nameChange').style.border = '1px solid rgb(230, 75, 75)';
            }
            else {
                document.querySelector('#modal-userEdit-body-dialog-info-nameChange').style.border = '1px solid rgba(255, 255, 255, 0)';
            }
        }

    })

    const changeName = async () => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    username: name.value,
                }
            })        
            if (error) throw error;
        }
        catch (error) {
            console.log(error)
        }
    }

    const descinput = ref(await user.value.user_metadata.description || '');
    const remainEdit = ref(80 - descinput.value.length);

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
    watch (checkUserEdit, () => {
        if (checkUserEdit.value == true) {
            setTimeout(() => {
                changeColor();
            }, 210);
        }
    })

    const checkCreateChannel = ref(false);
</script>
<template>
    <div id="menu-header-menu" @click="checkMenu = !checkMenu"></div>

    <Teleport to="body">
        <ModalsCreateChannel v-if="checkCreateChannel" @closeCreateChannel="checkCreateChannel = false; console.log('close')" />
    </Teleport>
    <Teleport to="body">
        <Transition name="sidemenu">
        <div id="sidemenu" v-if="checkMenu">
            <div id="sidemenu-body" v-if="checkMenu">
                <div id="sidemenu-body-header">
                    <div id="sidemenu-body-header-avatar" 
                    :style="{ backgroundImage: `url(${user.user_metadata.avatar_url})` }"></div>
                    <div id="sidemenu-body-header-name">
                        {{ user.user_metadata.username }}
                        <span @click="checkUserEdit = !checkUserEdit">Редактировать профиль</span>
                    </div>
                    <span @click="checkMenu = !checkMenu" id="sidemenu-body-header-close"></span>
                </div>
                <div id="sidemenu-body-menus">
                    <div class="sidemenu-body-menus-element">
                        <label for="fileInput" id="fileInput-label">Поменять аватар</label>
                        <input id="fileInput" @change="uploadAvatar" type="file" accept="image/*">
                    </div>
                    <div class="sidemenu-body-menus-element">
                        <input id="fileInputForBackground" @change="handleFileChange" type="file" accept="image/*">
                        <label for="fileInputForBackground" id="fileInputLabel">Изменить фон</label>
                    </div>
                    <div @click="localForage.setItem('blur', !blur); blur = !blur; emit('newBlurValue')" 
                        :style="{ opacity: blur ? '100%' : '50%' }" 
                        class="sidemenu-body-menus-element">
                        <span v-text="blur ? 'Выключить размытие' : 'Включить размытие'"></span>
                    </div>
                    <div @click="checkCreateChannel = !checkCreateChannel" class="sidemenu-body-menus-element">
                        <span>Создать канал</span>
                    </div>
                    <div class="sidemenu-body-menus-element"> 
                        <div class="sidemenu-body-menus-element-exitIcon"></div>
                        <div class="sidemenu-body-menus-element-exit">
                            <span @click="sghnOut">Выход</span>
                        </div>
                    </div>  
                </div>
            </div>

            <Transition name="user">
                <div v-if="checkUserEdit" id="sidemenu-editUser">
                    <div id="sidemenu-editUser-header">
                        <div id="sidemenu-editUser-header-close" @click="checkUserEdit = !checkUserEdit; nameChange = false"></div>
                        <span>Редактирование профиля</span>
                    </div>
                    <div id="sidemenu-editUser-main">
                        <div id="sidemenu-editUser-main-avatar" @click="" :style="{ backgroundImage: `url(${user.user_metadata.avatar_url})` }"></div>
                    </div>
                    <div id="modal-userEdit">
                        <input autocomplete="off" 
                        @change="changeName()" 
                        minlength="3" 
                        maxlength="20" 
                        id="modal-userEdit-body-dialog-info-nameChange" v-if="nameChange" v-model="name">
                        <span @click="nameChange = !nameChange" id="modal-userEdit-body-dialog-info-name" v-if="!nameChange">
                            @{{ user?.user_metadata.username }}
                        </span>
                    </div>
                    <div id="modal-userEdit-description-block">
                        <span id="modal-userEdit-description-title">О себе</span>
                        <textarea 
                            v-model="descinput" 
                            @change="changeDesc()" 
                            @input="remainEdit = 80 - descinput.length; changeColor()" 
                            id="modal-userEdit-description" 
                            maxlength="80" 
                            rows="1">{{ descinput}}</textarea>
                        <div id="modal-userEdit-description-length" v-text="remainEdit"></div>
                    </div>
                </div>
            </Transition>
            </div>
        </Transition>
        <div id="sidemenu-overlay" @click="checkMenu = !checkMenu; checkUserEdit = false; nameChange = false" v-if="checkMenu"></div>
    </Teleport>

</template>
<style lang="scss">
    .sidemenu-enter-active, .sidemenu-leave-active {
        // transition: opacity .3s ease-in-out;
        transition: transform .3s ease-in;
    }
    .sidemenu-enter-from, .sidemenu-leave-to {
        transform: translateX(-100%);
    }

    .user-enter-active, .user-leave-active {
        transition: transform .3s ease-in;
    }
    .user-enter-from, .user-leave-to {
        transform: translateX(-100%);
    }

    #sidemenu-overlay {
            width: calc(100% - 450px);
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;
            z-index: 12;
            // background-color: rgba($color: #000000, $alpha: .65);

            @media screen and (max-width: 450px) {
                display: none;
            }
        }
    #menu-header-menu {
        cursor: pointer;
        width: 40px;
        padding: 15px;
        background: url('/hamburger.png');
        background-size: cover;
        background-repeat: no-repeat;
    }
    #sidemenu {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        // background-color: rgba($color: #000000, $alpha: .65);
        z-index: 10;
        #sidemenu-editUser {
            position: absolute;
            top: 0;
            // left: -400px;
            
            height: 100%;
            width: 400px;
            background-color: var(--backround);
            z-index: 11;
            @media screen and (max-width: 450px) {
                width: 90%;
            }
            #modal-userEdit {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 5px;
                #modal-userEdit-body-dialog-info-nameChange {
                    margin-top: 10px;
                    width: 90%;
                    text-align: center;
                    padding: 10px;
                    background-color: var(--background-block);
                    border-radius: 5px;
                    color: white;
                    // border: none;
                    resize: none;
                    outline: none;
                    animation: vlados .2s ease-in;
                    border: 1px solid rgba(255, 255, 255, 0);
                    transition: border .2s ease;
                    @keyframes vlados {
                        0% {
                            width: 70%;
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
                            width: 70%;
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
                            width: 70%;
                        }
                    }
                }
            }
            #modal-userEdit-description-block {
                width: 90%;
                margin: auto;
                margin-top: 10px;

                // display: flex;
                // flex-direction: column;
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
            
            #sidemenu-editUser-header {
                width: 90%;
                margin: auto;
                margin-top: 20px;
                display: flex;
                flex-direction: row;
                span {
                    margin-left: 15px;
                    font-size: 20px;
                    font-weight: 500;
                }
                #sidemenu-editUser-header-close {
                    padding: 15px;
                    background: url('/left-arrow.svg');
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    cursor: pointer;
                }
            }
            #sidemenu-editUser-main {
                width: 100%;
                margin: auto;
                margin-top: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;

                #sidemenu-editUser-main-avatar {
                    width: 100%;
                    height: 400px;
                    // border-radius: 100%;
                    background-size: cover;
                    background-position: center;
                }
            }

        }
        #sidemenu-body {
            width: 450px;
            height: 100vh;
            background-color: var(--background-block);
            display: flex;
            flex-direction: column;
            align-items: center;
            @media screen and (max-width: 450px) {
                width: 100%;
            }
            #sidemenu-body-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                // margin: auto;
                width: 80%;
                height: 60px;
                padding-top: 55px;
                span {
                    font-weight: 500;
                    cursor: pointer;
                }
                #sidemenu-body-header-close {
                    cursor: pointer;
                    // width: 40px;
                    padding: 10px;
                    background: url('/close.svg');
                    background-size: cover;
                    background-repeat: no-repeat;
                }
                #sidemenu-body-header-avatar {
                    width: 70px;
                    height: 70px;
                    border-radius: 100%;
                    background-size: cover;
                    background-position: center;
                    cursor: pointer;
                }
                #sidemenu-body-header-name {
                    font-size: 20px;
                    font-weight: 500;
                    flex-grow: 2;
                    margin-left: 15px;

                    display: flex;
                    flex-direction: column;
                    span {
                        font-size: 15px;
                        color: rgba(255, 255, 255, .5);
                        cursor: pointer;
                        transition: .2s;
                        &:hover {
                            color: rgba(255, 255, 255, 1);
                            transition: .2s;
                        }
                    }
                }
            }
            #sidemenu-body-menus {
                display: flex;
                flex-direction: column;
                // margin: auto;
                width: 80%;
                height: 60px;
                padding-top: 35px;
                margin-top: 25px;
                .sidemenu-body-menus-element {
                    margin-bottom: 15px;
                    font-size: 25px;
                    font-weight: 500;
                    cursor: pointer;

                    background-color: var(--backround);
                    padding: 10px;
                    border-radius: 10px;
                    text-align: center;
                    transition: .2s;
                    &:hover {
                        background-color: rgba(255, 255, 255, 0.1);
                        transition: .2s;
                    }
                    &:nth-last-child(1) {
                        color: rgb(230, 75, 75);
                        background-color: transparent;
                        position: absolute;
                        bottom: 0;
                        display: flex;
                        align-items: center;
                        .sidemenu-body-menus-element-exitIcon {
                            width: 20px;
                            height: 20px;
                            background: url('/exit.svg');
                            background-size: cover;
                            background-repeat: no-repeat;
                            margin-right: 10px;
                        }
                    }
                    input {
                        display: none;
                        cursor: pointer;
                    }
                    label {
                        cursor: pointer;
                    }
                }
            }
        }
    }
</style>