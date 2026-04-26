<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser();

import localForage from "localforage";

const avatar = ref("");
const description = ref("");
const onlineStatus = ref("");

const searchTerm = ref("");
const searchOpened = ref(false);
const loading = ref(true);

let props = defineProps({
    name: String,
    avatar: String,
    userId: String,
    isChannel: Boolean
});
import moment from 'moment';
import 'moment/dist/locale/ru';
moment.locale('ru');

const userData = ref(null);
const checkChat = ref(false);
const message = ref('');
const checkViewChannel = ref(false);
const channelId = ref('');

async function sendMessage() {
    const fileInput = document.querySelector('#fileInput');
    const attachFiles = [];

    if (fileInput.files.length > 0) {
        for (const file of fileInput.files) {
            const fileName = file.name;
            try {
                console.log('file', file);
                const timestamp = Date.now();
                const uniqueFileName = `${timestamp}-${fileName}`;
                const { data:checkAvaliability, error: erroCheck } = await supabase
                    .from('files_metadata')
                    .select('*')
                if (checkAvaliability.length > 50) {
                    throw new Error('Лимит по файлам превышен! (теперь файлы платные)');
                }
                const { data, error } = supabase
                    .storage
                    .from('attachs')
                    .upload(uniqueFileName, file);

                if (error) {
                    throw error;
                }
                const { data: metadata, error: metadataError } = await supabase
                    .from('files_metadata')
                    .insert([
                        {
                            file_name: uniqueFileName,
                            sender_id: user.value.id,
                            receiver_id: props.userId,
                        },
                    ])
                    .select('*');
                attachFiles.push(metadata[0].file_name);

                if (metadataError) {
                    console.error('Ошибка при загрузке файла:', metadataError.message);
                }
            } catch (error) {
                console.error('Ошибка при загрузке файла:', error.message);
                if (error.message == 'Лимит по файлам превышен! (теперь файлы платные)') {
                    alert(error.message);
                }
            }
        };
        fileInput.value = '';
    }

    if (message.value == '' && attachFiles.length == 0) {
        alert('Сообщение не может быть пустым');
    }
    else if (message.value.length > 1024) {
        alert('Сообщение слишком длинное');
    }
    else {
        const { data: messagesData, error } = await supabase
            .from('messages')
            .insert(
                { sender_id: user.value.id, receiver_id: props.userId, text: message.value, attachs: attachFiles },
            )
            .select('*');
        if (error) {
            console.error('Ошибка отправки сообщения: ', error);
        } else {
            message.value = '';
            loadMessages();
        }
    }
}

async function sendChannelMessage() {
    const { data: messagesData, error } = await supabase
        .from('messages')
        .insert(
            { sender_id: props.userId, text: message.value },
        )
        .select('*');

    if (error) {
        console.error('Ошибка отправки сообщения: ', error);
    } else {
        message.value = '';
        loadChannelData(props.userId);
    }

}

const getFileTest = async () => {
    const { data, error } = await supabase
        .from('files_metadata')
        .select('*')

    if (error) throw error;
    // console.log(data);
}
getFileTest();
const allMessages = ref([]);
const userChat = ref([]);

async function subScribe() {
    const { data, error } = supabase
        .channel('room1')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            // console.log('Change received!', payload);
            if (props.isChannel == true) {
                loadChannelData(props.userId);
            }
            else {
                loadMessages();
            }
        })
        .subscribe()

    if (error) throw error
}
subScribe();

async function loadMessages() {
    loading.value = true;
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.value.id},receiver_id.eq.${user.value.id}`);

        if (error) throw error;

        const dialogMessages = data.filter(message =>
            (message.sender_id === user.value.id && message.receiver_id === props.userId) ||
            (message.sender_id === props.userId && message.receiver_id === user.value.id)
        );

        const updatedDialogMessages = await Promise.all(dialogMessages.map(async (message) => {
            let attachs = message.attachs || [];
            attachs = await Promise.all(attachs.map(async (attach) => {
                for (let i = 0; i < 3; i++) { 
                    const { data: attachsData, error: attachsError } = await supabase
                        .storage
                        .from('attachs')
                        .createSignedUrl(attach, 3600);
                    if (!attachsError) {
                        return attachsData;
                    }
                    console.error('Ошибка при загрузке файла:', attachsError.message);
                }

                return "https://i.ibb.co/dmt4VkF/photo-2024-03-17-02-01-51.jpg";
            }));
            return { ...message, attachs };
        }));

        if (dialogMessages == 0) {
            checkChat.value = true;
        }
        else {
            checkChat.value = false;
        }

        const { data: messagesToRead, error: err } = await supabase
            .from('messages')
            .select('*')
            .eq('read_status', false)
            .eq('sender_id', props.userId)
            .eq('receiver_id', user.value.id);

        if (error) {
            throw error
        }
        else {
            for (let i = 0; i < messagesToRead.length; i++) {

                const { data, error } = await supabase
                    .from('messages')
                    .update({ read_status: true })
                    .eq('id', messagesToRead[i].id)
                if (error) throw error
            }
        }
        // Сортировка сообщений по временной метке
        allMessages.value = updatedDialogMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        //get username
        const { data: userChatData, error: userChatError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', props.userId)
            .single();
        userChat.value = userChatData.username;
        loading.value = false;
    } catch (error) {
        console.error('Ошибка загрузки сообщений: ', error);
    }
    finally {
        document.querySelector('#dialog-body').scrollTop = document.querySelector('#dialog-body').scrollHeight;
    }
}
const checkAttachs = ref(false);
const attachsArray = ref([]);
const checkAttachsFunc = () => {
    checkAttachs.value = true;

    allMessages.value.forEach(element => {
        // console.log(element.attachs);
        // console.log(element.timestamp);
        attachsArray.value.push(element.attachs);
        element.attachs.forEach(img => {
            // console.log(img);
            attachsArray.value.push(img);
        });
    });
    return attachsArray.value;
}
async function checkOnline() {
    const { data, error } = supabase
        .channel('online_room')
        .on('presence', { event: 'join' })
        .subscribe(async (status) => {
            if (status == 'SUBSCRIBED' && props.isChannel == false) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('online_at,id')
                    .eq('id', props.userId)
                    .single();
                // console.log(moment(data.online_at).format('DD.MM HH:mm:ss'));
                if (data.id == '4f723018-4bbd-48f7-b66d-82e651936ccc') {
                    onlineStatus.value = 'служебные уведомления';
                }
                else {
                    if (moment(moment()).diff(data.online_at, 'days') > 7) {
                    onlineStatus.value = moment(data.online_at).fromNow() + ' (' + moment(data.online_at).format('DD.MM.YYYY') + ')';
                    }
                    else if (moment(moment()).diff(data.online_at, 'minutes') >= 1) {
                        onlineStatus.value = moment(data.online_at).fromNow();
                    }
                    else {
                        onlineStatus.value = 'онлайн';
                    }
                }

            }
        })

    if (error) throw error
}
checkOnline();

async function loadUserData(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Ошибка загрузки данных: ', error);
    } else {
        userData.value = data;
        avatar.value = userData.value.avatar_url;
    }
}
const subscribed = ref(false);
const haveAccessToWrite = ref(false);

async function loadChannelData(channelId) {
    subscribed.value = false;
    try {
        const { data:usersSub, error:usersSubError } = await supabase
        .from('profiles')
        .select('channels')
        .eq('id', user.value.id)
        .single();

        console.log(usersSub);
    if (usersSub.channels.includes(channelId)) {
        subscribed.value = true;
    }

    const { data: channelsData, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();
    channel.value = channelsData;
    if (channel.value.owner === user.value.id) {
        haveAccessToWrite.value = true;
    }
    else {
        haveAccessToWrite.value = false;
    }
    console.log(haveAccessToWrite.value);

    const { data: channelMessages, error: channelMessagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', channelId)
        .order('timestamp', { ascending: true });
    allChannelMessages.value = channelMessages;
    }
    catch (error) {
        console.error('Ошибка загрузки данных: ', error);
    }
    finally {
        document.querySelector('#dialog-body').scrollTop = document.querySelector('#dialog-body').scrollHeight;

    }

}

const pat = /(https?:\/\/[^\s]+)/;
watch(() => props.userId, (newUserId) => {
    if (newUserId) {
        if (props.isChannel == true) {
            loadChannelData(newUserId);
        }
        else {
            loadUserData(newUserId);
            loadMessages();
            checkOnline();
        }

        searchOpened.value = false;
        message.value = '';
    }
}, { immediate: true }); // { immediate: true } для выполнения при инициализации

const emit = defineEmits(['close']);

const Url = ref('');
const checkUrl = ref(false);

const checkUser = ref(false);
const userID = ref('');

//#region NewMessage in menu
async function waitRead() {
    const { data, error } = supabase
        .channel('waitForRead')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
            if (payload.new.sender_id === user.value.id && payload.new.receiver_id === props.userId && payload.new.read_status === true) {
                loadMessages();
            }
            if (props.isChannel === true) {
                loadChannelData(props.userId);
            }
        })
        .subscribe()
    if (error) throw error
}
waitRead();
//#endregion
const imageError = (e) => {
    e.target.src = 'https://i.ibb.co/zhhMCT1/ezgif-4-bd8944caaa.gif';
}
const getPinnedImgUrl = (event) => {
    return event.target.src;
}
const blur = ref(await localForage.getItem('blur'));

const channel = ref([]);
const allChannelMessages = ref([]);

const subOnChannel = async () => {    
    const { data:usersSub, error:usersSubError } = await supabase
        .from('profiles')
        .select('channels')
        .eq('id', user.value.id)
        .single();
    const {data: channelsData, error: channelsError } = await supabase
        .from('channels')
        .select('subs')
        .eq('id', props.userId)
        .single();

    if (subscribed.value === true) {
        const { data, error } = await supabase
            .from('profiles')
            .update(
                {
                    channels: usersSub.channels.filter((item) => item !== props.userId)
                }
            )
            .eq('id', user.value.id);
        const { data: newChannelsData, error: channelsError } = await supabase
            .from('channels')
            .update({ subs: channelsData.subs.filter((item) => item !== user.value.id) })
            .eq('id', props.userId);
        subscribed.value = false;
    }
    else {
        const { data, error } = await supabase
            .from('profiles')
            .update(
                {
                    channels: [...usersSub.channels, props.userId]
                }
            )
            .eq('id', user.value.id);
        const { data: newChannelsData, error: channelsError } = await supabase
            .from('channels')
            .update({ subs: [...channelsData.subs, user.value.id] })
            .eq('id', props.userId)
            .single();

        subscribed.value = true;
    }

}
const editMessageOn = ref(false);
const openEditMessage = async (msgID,textMessage) => {
    editMessageOn.value = true;
    message.value = textMessage;

    await nextTick();
    const buttonAccept = document.querySelector('#dialog-body-chat-confirmEdit');
    console.log(buttonAccept);

    if (buttonAccept) {
        buttonAccept.addEventListener('click', () => {
            if (message.value === '') {
                editMessageOn.value = false;
                message.value = '';
                return alert('Сообщение не может быть пустым');
            }
            if (message.value === textMessage) {
                editMessageOn.value = false;
                message.value = '';
                return;
            }
            confirmEditMessage(msgID);
        })
    }

}
const confirmEditMessage = async (msgID) => {
    const { data, error } = await supabase
        .from('messages')
        .update({ text: message.value })
        .eq('id', msgID);
    editMessageOn.value = false;
    message.value = '';

    loadMessages();
}
</script>

<template>
    <ModalsPicture v-if="checkUrl" :picUrl="Url" @closePic="checkUrl = false"></ModalsPicture>
    <ModalsUser v-if="checkUser" :userId="userID" @closeUser="checkUser = false"></ModalsUser>
    <ModalsAttachs v-if="checkAttachs" :attachsArr="allMessages" @closeAttachs="checkAttachs = false"></ModalsAttachs>
    <ModalsViewChannel v-if="checkViewChannel" :channelId="channelId" @closeChannel ="checkViewChannel = false"></ModalsViewChannel>

    <div v-if="props.isChannel === false" id="dialog">
        <div id="dialog-header" :style="{ backdropFilter: blur ? 'blur(5px)' : 'none' }">
            <div id="dialog-header-back" @click="emit('close');" style="font-size: 25px; cursor: pointer;"></div>
            <!-- <div id="dialog-header-avatarBorder"> -->
            <div id="dialog-header-avatarBorder" :style="{ backgroundImage: `url(${avatar})` }"
                @click="Url = avatar, checkUrl = true"></div>
            <!-- </div> -->

            <div id="dialog-header-info">
                <div id="dialog-header-info-name" @click="checkUser = true, userID = userData.id">{{ userData?.username
                    }}
                    <div v-if="userData?.official" id="dialog-header-info-name-verifed"></div>
                </div>
                <span id="dialog-header-info-status">{{ onlineStatus }}</span>
            </div>

            <div id="dialog-header-menu">
                <div id="dialog-header-menu-search-button" @click="searchOpened = !searchOpened"></div>
                <div id="dialog-header-menu-search" v-if="searchOpened">
                    <input type="text" id="dialog-header-menu-search-input" v-model="searchTerm" placeholder="Поиск">
                </div>
            </div>
        </div>


        <!-- <Loading/> -->
        <div id="dialog-body">
            <div id="dialog-body-add" v-if="checkChat">
                <div id="dialog-body-add-info">
                    <div id="dialog-body-add-info-avatar" :style="{ backgroundImage: `url(${userData.avatar_url})` }">
                    </div>
                    <div id="dialog-body-add-info-name">{{ userData.username }}</div>
                    <div id="dialog-body-add-info-status">Ещё нет сообщений!</div>
                </div>
            </div>

            <div id="dialog-body-messages" v-else>
                <TransitionGroup name="list" tag="div">
                    <div class="dialog-body-messages-sender" v-for="msg in allMessages" :key="msg.id"
                        @mouseover="msg.showEdit = true" @mouseleave="msg.showEdit = false"
                        :style="{ 'background-color': msg.sender_id === user.id ? 'var(--blue)' : 'var(--gray)', 'align-self': msg.sender_id === user.id ? 'flex-end' : 'flex-start' }">
                        <div class="dialog-body-messages-info">
                            <span class="dialog-body-messages-info-name"
                                @click="checkUser = true, userID = msg.sender_id">{{ msg.receiver_id === user.id ?
                                userChat : user.user_metadata.username }}</span>
                            <span class="dialog-body-messages-info-date"
                                :title="moment(msg.timestamp).format('DD.MM.YYYY HH:mm')">{{
                                moment(msg.timestamp).format('HH:mm') }}</span>
                            <span class="dialog-body-messages-info-status"
                                v-show="msg.receiver_id != user.id && msg.read_status === true"></span>
                            <span class="dialog-body-messages-info-edit"
                                v-show="msg.receiver_id != user.id && msg.showEdit"
                                @click="openEditMessage(msg.id, msg.text)"
                                v-if="!editMessageOn"
                                >🖋️</span>

                        </div>

                        <div class="dialog-body-messages-message">
                            <span class="dialog-body-messages-info-message-text">{{ msg.text }}</span>
                            
                            <img class="dialog-body-messages-info-message-img" v-for="pat in msg.attachs"
                                :src="pat.signedUrl" @click="Url = pat.signedUrl, checkUrl = true">

                            <img class="dialog-body-messages-info-message-img"
                                v-if="msg.text.match(/\.(jpeg|jpg|gif|png|webp)$/) != null"
                                @click="Url = getPinnedImgUrl($event), checkUrl = true" @error="imageError"
                                :src="pat.exec(msg.text)[0]">
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </div>

        <div class="dialog-body-chat" :style="{ backdropFilter: blur ? 'blur(5px)' : 'none'}">
            <div class="dialog-body-chat-attachs" @click="checkAttachsFunc()"></div>
            <div>
                <input id="fileInput" type="file" accept="image/*" multiple>
                <label for="fileInput" id="dialog-body-chat-attach"></label>
            </div>

            <input type="text" placeholder="Введите текст" v-model="message" @keyup.enter="sendMessage">

            <div v-if="!editMessageOn" id="dialog-body-chat-send" @click="sendMessage"></div>
            <div v-else id="dialog-body-chat-confirmEdit"></div>
        </div>
    </div>

    <!-- CHANNEL DIALOG -->
    <div v-else id="dialog">
        <div id="dialog-header" :style="{ backdropFilter: blur ? 'blur(5px)' : 'none' }">
            <div id="dialog-header-back" @click="emit('close');" style="font-size: 25px; cursor: pointer;"></div>
            <!-- <div id="dialog-header-avatarBorder"> -->
            <div id="dialog-header-avatarBorder" :style="{ backgroundImage: `url(${channel?.avatar_url})` }"
                @click="Url = channel?.avatar_url, checkUrl = true"></div>
            <!-- </div> -->

            <div id="dialog-header-info">
                <div id="dialog-header-info-name" @click="channelId = channel?.id; checkViewChannel = true">{{
                    channel?.name_channel }}
                    <div v-if="channel?.official" id="dialog-header-info-name-verifed"></div>
                </div>
                <span id="dialog-header-info-status">{{channel?.subs.length === 1 ? channel?.subs.length + ' подписчик' : ''  || channel?.subs.length < 5 ? channel?.subs.length + ' подписчика' : channel?.subs.length + ' подписчиков'}}</span>
            </div>

            <div id="dialog-header-menu">
                <div id="dialog-header-menu-search-button" @click="searchOpened = !searchOpened"></div>
                <div id="dialog-header-menu-search" v-if="searchOpened">
                    <input type="text" id="dialog-header-menu-search-input" v-model="searchTerm" placeholder="Поиск">
                </div>
            </div>
        </div>


        <!-- <Loading/> -->
        <div id="dialog-body">

            <div id="dialog-body-messages">
                <TransitionGroup name="list" tag="div">
                    <div class="dialog-body-messages-sender" v-for="msg in allChannelMessages" :key="msg.id"
                        :style="{ 'background-color':'var(--blue)', 'align-self': 'flex-start' }">
                        <div class="dialog-body-messages-info">
                            <!-- <div class="dialog-body-messages-info-avatar" :style="{ backgroundImage: `url(${user.user_metadata.avatar_url})` }"></div> -->
                            <span class="dialog-body-messages-info-name"
                                @click="channelId = channel?.id; checkViewChannel = true">{{ channel?.name_channel}}</span>
                            <span class="dialog-body-messages-info-date"
                                :title="moment(msg.timestamp).format('DD.MM.YYYY HH:mm')">{{
                                moment(msg.timestamp).format('HH:mm') }}</span>

                        </div>

                        <div class="dialog-body-messages-message">
                            <span class="dialog-body-messages-info-message-text">{{ msg.text }}</span>

                            <!-- <img class="dialog-body-messages-info-message-img" v-for="pat in msg.attachs" :src="pat.signedUrl" @click="Url = pat.signedUrl, checkUrl = true">
                            
                            <img class="dialog-body-messages-info-message-img"
                                v-if="msg.text.match(/\.(jpeg|jpg|gif|png|webp)$/) != null"
                                @click="Url = getPinnedImgUrl($event), checkUrl = true" @error="imageError"
                                :src="pat.exec(msg.text)[0]"> -->
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </div>

        <div v-if="haveAccessToWrite == true" class="dialog-body-chat" :style="{ backdropFilter: blur ? 'blur(5px)' : 'none'}">
            <div class="dialog-body-chat-attachs" @click="checkAttachsFunc()"></div>
            <div>
                <input id="fileInput" type="file" accept="image/*" multiple>
                <label for="fileInput" id="dialog-body-chat-attach"></label>
            </div>

            <input type="text" placeholder="Введите текст" v-model="message" @keyup.enter="sendChannelMessage">
            <div id="dialog-body-chat-send" @click="sendChannelMessage"></div>
        </div>

        <div v-else @click="subOnChannel" class="dialog-body-chat channel"
            :style="{ backdropFilter: blur ? 'blur(5px)' : 'none' }">

            <div id="dialog-body-chat-subscribe">
                <span v-text="subscribed ? 'Отписаться' : 'Подписаться'"></span>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
#dialog-body-chat-subscribe {
    width: 100%;
    padding: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 25px;
    cursor: pointer;
    span {
        font-size: 20px;
        font-weight: 400;
        color: #FFFFFF;
        text-transform: uppercase;
    }
}
.channel {
    transition: .2s ease-in-out;
    &:hover {
        background-color: rgba(0, 0, 0, 0.8) !important;
        transition: .2s ease-in-out;
    }
}
.list-enter-active,
.list-leave-active {
    transition: all .3s ease-in-out;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(10%);
}

:root {
    --dialog-padding: 20%;
}

#dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100vh;
    background-size: cover;
    background-position: center;

    position: relative;

    // @media screen and (max-width: 450px) {
    //     display: none;
    // }
    #dialog-header {
        width: 100%;
        height: 70px;
        background-color: rgba(0, 0, 0, .7);
        backdrop-filter: blur(5px);
        background-size: cover;
        background-position: center;
        display: flex;
        flex-direction: row;
        align-items: center;
        // padding: 0 var(--dialog-padding);
        padding: 0 50px;

        // position: absolute;
        // top: 0;
        @media screen and (max-width: 450px) {
            padding: 0 10px;
            // position: fixed;
        }

        #dialog-header-close {
            font-size: 20px;
            font-weight: 500;
            cursor: pointer;
        }

        #dialog-header-avatarBorder {
            width: 50px;
            height: 50px;
            border-radius: 100%;
            // background: linear-gradient(90deg, rgba(219,0,255,1) 0%, rgb(214, 155, 211) 100%);
            background-size: cover;
            background-position: center;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            margin-left: 20px;

            #dialog-header-avatarBorder-avatar {
                width: 90%;
                height: 90%;
                border-radius: 100%;
                background-size: cover;
                background-position: center;
            }
        }

        #dialog-header-back {
            padding: 15px;
            background-image: url('/left-arrow.svg');
            background-size: cover;
            background-position: center;
        }

        #dialog-header-info {
            display: flex;
            flex-direction: column;
            flex: 1;
            margin-left: 20px;

            #dialog-header-info-name {
                font-size: 20px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                flex-direction: row;
                align-items: flex-end;
                @media screen and (max-width: 450px) {
                    max-width: 85%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-wrap: nowrap;
                }
                #dialog-header-info-name-verifed {
                    padding: 10px;
                    background-image: url('/verifed.svg');
                    background-size: 100%;
                    background-repeat: no-repeat;
                    background-position: center;
                    width: 10px;
                    margin-left: 5px;
                }
            }

            #dialog-header-info-status {
                font-size: 14px;
                color: rgba(255, 255, 255, .5);
            }
        }

        #dialog-header-menu {
            display: flex;
            flex-direction: row;
            justify-content: flex-end;

            #dialog-header-menu-search {
                input {
                    height: 40px;
                    border-radius: 10px;
                    border: none;
                    outline: none;
                    font-size: 15px;
                    color: white;
                    background-color: var(--background-block);
                    padding: 0 15px;

                    &::placeholder {
                        opacity: 1;
                        transition: .2s;
                    }

                    &:focus::placeholder {
                        transition: .2s;
                        opacity: 0;
                    }
                }
            }

            #dialog-header-menu-search-button {
                margin: 0 15px;
                background: url(/search.svg);
                background-size: cover;
                background-position: center;
                cursor: pointer;
                width: 40px;
                height: 40px;
            }
        }
    }

    #dialog-body {
        width: 100%;
        padding: 0px var(--dialog-padding) 0px var(--dialog-padding);
        height: 100%;
        overflow-y: auto;

        @media screen and (max-width: 450px) {
            padding: 0 10px;
        }

        &::-webkit-scrollbar {
            width: 8px;

            @media screen and (max-width: 450px) {
                width: 10px;
            }
        }

        &::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, .6);
            border-radius: 15px;

        }

        #dialog-body-messages {
            width: 100%;
            margin-top: 10px;
            // margin-bottom: 10px;
            display: flex;
            flex-direction: column;
        overflow-y: hidden;
            .dialog-body-messages-sender {
                max-width: 500px;
                min-width: 200px;
                width: fit-content;

                min-height: 50px;
                height: fit-content;

                background-color: #D1E8FF;
                border-radius: 15px;
                display: flex;
                flex-direction: column;

                padding: 0 15px;
                margin-bottom: 10px;

                @media screen and (max-width: 450px) {
                    max-width: 100%;
                }

                .dialog-body-messages-info {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 5px;

                    .dialog-body-messages-info-date {
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.5);
                        margin: 0 5px;
                    }

                    .dialog-body-messages-info-status {
                        font-size: 12px;
                        padding: 10px;
                        background-image: url('/checked.svg');
                        background-size: 100%;
                        background-repeat: no-repeat;
                        background-position: center;
                    }

                    .dialog-body-messages-info-edit {
                        font-size: 12px;
                        cursor: pointer;

                        @keyframes anim {
                            0% {
                                opacity: 0;
                            }

                            100% {
                                opacity: 1;
                            }
                        }
                    }

                    .dialog-body-messages-info-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 100%;
                        background-size: cover;
                        background-position: center;
                    }

                    .dialog-body-messages-info-name {
                        font-size: 14px;
                        font-weight: 500;
                        flex: 1;
                        // color: rgba(255, 255, 255, .5);
                        cursor: pointer;
                    }
                }

                .dialog-body-messages-message {
                    max-width: 530px;
                    min-width: 200px;
                    // width: fit-content;

                    min-height: 30px;
                    height: fit-content;
                    display: flex;
                    flex-wrap: wrap;
                    padding-bottom: 5px;

                    @media screen and (max-width: 450px) {
                        max-width: 100%;
                    }
                    .dialog-body-messages-messages-message-img {
                        width: 100%;

                    }
                    .dialog-body-messages-info-message-text {
                        // width: 90%;
                        height: 100%;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        overflow: hidden;
                        font-size: 16px;
                    }

                    .dialog-body-messages-info-message-img {
                        width: 100%;
                        // background: url("https://static.animecorner.me/2023/10/1696857051-55187-1024x576.jpg");
                        margin-top: 5px;
                        cursor: pointer;
                    }
                }
            }
        }

        #dialog-body-add {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;

            #dialog-body-add-info {
                width: 400px;
                height: 400px;
                border-radius: 25px;
                background-color: var(--background-block);
                font-size: 20px;
                font-weight: 500;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                @media (max-width: 450px) {
                    width: 100%;
                }

                #dialog-body-add-info-avatar {
                    width: 150px;
                    height: 150px;
                    border-radius: 100%;
                    background-size: cover;
                    background-position: center;
                }

                #dialog-body-add-info-name {
                    margin-top: 20px;
                }

                #dialog-body-add-info-status {
                    margin-top: 20px;
                    font-weight: 400;
                }
            }
        }
    }

    .dialog-body-chat {
        width: 100%;
        height: 70px;
        background-color: rgba(0, 0, 0, .7);
        backdrop-filter: blur(5px);

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        padding: 0 var(--dialog-padding);

        // position: absolute;
        // bottom: 0;

        .dialog-body-chat-attachs {
            width: 30px;
            height: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-image: url('/attachs.svg');
            background-size: 100%;
            background-repeat: no-repeat;
            background-position: center;
            cursor: pointer;
        }
        @media screen and (max-width: 450px) {
            padding: 0 10px;
        }

        input {
            width: 90%;
            height: 60%;
            border-radius: 10px;
            border: none;
            outline: none;
            font-size: 15px;
            color: rgb(255, 255, 255);
            background-color: rgb(41, 41, 41);
            padding: 0 15px;
            margin: 0 10px;

            &::placeholder {
                opacity: 1;
                transition: .2s;
                color: rgba(255, 255, 255, .5);
            }

            &:focus::placeholder {
                transition: .2s;
                opacity: 0;
                color: rgba(255, 255, 255, .5);
            }
        }

        #fileInput {
            display: none;
        }

        #dialog-body-chat-send {
            padding: 18px;
            border-radius: 100%;
            border: none;
            outline: none;
            background: url('/Vector.png');
            background-size: 75%;
            background-position: center;
            background-repeat: no-repeat;
            cursor: pointer;
        }

        #dialog-body-chat-confirmEdit {
            padding: 18px;
            border-radius: 100%;
            border: none;
            outline: none;
            background: url('/edit.svg');
            background-size: 75%;
            background-position: center;
            background-repeat: no-repeat;
            cursor: pointer;
        }

        #dialog-body-chat-attach {
            padding: 18px;
            border-radius: 100%;
            border: none;
            outline: none;
            background: url('/attach.svg');
            background-size: 75%;
            background-position: center;
            background-repeat: no-repeat;
            cursor: pointer;
        }
    }
}
</style>