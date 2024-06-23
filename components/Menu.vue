<script setup>
    import moment from 'moment';
    import 'moment/dist/locale/ru';
    moment.locale('ru');

    import localForage from "localforage";

    const supabase = useSupabaseClient()
    const user = useSupabaseUser();

    let searchTerm = '';
    const check = ref(false);
    // const checkMenu = ref(false);

    const username = ref("");
    const avatar = ref("");
    const description = ref("");

    const users = ref([]);
    const loading = ref(true);

    const selectedUserId = ref('');

    const isMobile = ref(false);
    const width = ref(450);
    
    const windowWidth = ref(window.innerWidth);

    const useIsMobile = computed(() => windowWidth.value < 450);
    if (windowWidth.value < 450) {
        isMobile.value = true;
    }
    else {
        isMobile.value = false;
    }

    watch(windowWidth, (newValue, oldValue) => {
        if (newValue < 450) {
            isMobile.value = true;
        }
        else {
            isMobile.value = false;
        }
    });

    window.addEventListener('resize', () => {
        windowWidth.value = window.innerWidth;
    });

    const returnMenu = () => {
        document.querySelector('#menu').style.right = '0';
    }
    const isChannel = ref(false);
    const selectUser = (userId) => {
        
        console.log('selectedUserId ', userId);
        selectedUserId.value = userId;
        isChannel.value = false;
        check.value = true; 

        if (useIsMobile.value) {
            document.querySelector('#menu').style.right = '100%';
        }
    }
    const selectChannel = (channelId) => {
        selectedUserId.value = channelId;
        isChannel.value = true;
        check.value = true;

        if (useIsMobile.value) {
            document.querySelector('#menu').style.right = '100%';
        }
    }

    const chats = ref([]);
    const checkChats = async () => {
        try {
            // Получение всех сообщений пользователя
            const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.value.id},receiver_id.eq.${user.value.id}`)
                .order('timestamp', { ascending: false });

            if (messagesError) {
                throw messagesError;
            }

            // Фильтрация уникальных диалогов
            const uniqueChatsSet = new Set();
            messagesData.forEach(chat => {
                uniqueChatsSet.add(chat.sender_id);
                uniqueChatsSet.add(chat.receiver_id);
            });
            uniqueChatsSet.delete(user.value.id); // Удаление собственного ID пользователя

            // Получение деталей чата и последнего сообщения
            const chatDetails = await Promise.all(Array.from(uniqueChatsSet).map(async chatId => {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, online_at, official')
                    .eq('id', chatId)
                    .single();
                
                if (profileError) {
                    throw profileError;
                }

                // Нахождение последнего сообщения для данного чата
                const lastMessage = messagesData
                    .filter(msg => msg.sender_id === chatId || msg.receiver_id === chatId)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                return {
                    ...profileData,
                    lastMessage: lastMessage.text || '',
                    lastMessageTimestamp: lastMessage.timestamp || '',
                    attachsLength: lastMessage.attachs ? lastMessage.attachs.length : 0,
                    checkedMsg: lastMessage.read_status,
                    receiver_id: lastMessage.receiver_id,
                };

            }));

            // Обновление реактивной переменной chats
            chats.value = chatDetails;
            console.log(chats.value);
            loading.value = false;

        } catch (error) {
            console.error('Ошибка при загрузке данных чата:', error);
            loading.value = false;
        }
    };
    checkChats();
    avatar.value = user.value.user_metadata.avatar_url;
    username.value = user.value.user_metadata.username;
    description.value = user.value.user_metadata.description;
    
    let { data, error } = await supabase
            .from('profiles')
            .select('*')
        if (error) throw error;
    let {data:channels, error:channelsError} = await supabase
        .from('channels')
        .select('*')
        console.log(channels);
        
        const channelsSearched = ref([]);
    const newSearchUser = () => {
        try {
            const filteredUsers = data.filter(user => user.username.startsWith(searchTerm));
            users.value = filteredUsers;

            const filteredChannels = channels.filter(channel => channel.name_channel.startsWith(searchTerm));
            channelsSearched.value = filteredChannels;
            console.log(channelsSearched.value);

        } catch (error) {
            console.error('Ошибка поиска:', error);
        } finally {
            // loading.value = false;
            //scroll to bottom 
            document.querySelector('#menu-body').scrollTop = document.querySelector('#menu-body').scrollHeight;
        }
    };


    watch(user, () => {
        avatar.value = user.value.user_metadata.avatar_url;
        username.value = user.value.user_metadata.username;
        description.value = user.value.user_metadata.description;
    })
    const Url = ref('');
    const checkUrl = ref(false);
    const { showNotification } = useNotifications();
    
    //#region NewMessage in menu
    async function subScribe() {
        const { data, error } = supabase
        .channel('newMessages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async payload => {
            // loadMessages();
            if (payload.new.receiver_id === null) {
                loadChannels();
                const bebs = document.querySelectorAll('.menu-switch-button');
                bebs[1].style.backgroundColor = '#f84b4b';
            }
            if (payload.new.receiver_id === user.value.id || payload.new.sender_id === user.value.id) {
                checkChats();
            }
            if (payload.new.receiver_id === user.value.id) {
                const {data: userSender, error} = await supabase 
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', payload.new.sender_id)
                    .single();
                if (error) throw error
                showNotification(userSender.username, {
                    body: payload.new.text,
                    icon: userSender.avatar_url,
                })
            }
        })
        .subscribe()

        if (error) throw error}
    subScribe();
    //#endregion

    async function waitRead() {
        const { data, error } = supabase
        .channel('waitForReadMenu')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
            if (payload.new.sender_id === user.value.id && payload.new.read_status === true) {
                checkChats();
            }
        })
        .subscribe()
        if (error) throw error
    }
    waitRead();

    import VueDraggableResizable from 'vue-draggable-resizable'

    const resiz = ref(null);
    const switched = ref(false);
    const onResizing = (x,y,w,h) => {
        width.value = w;
        if (width.value < 375) {
            width.value = 105;
            resiz.value.width = 105;
            switched.value = true;
            // document.querySelector('#menu').style.transition = 'all 0.3s';
            document.querySelectorAll('#menu-body-dialog').forEach(element => {
                element.classList.remove('selected');
                
            })
            document.querySelector('#menu-header-title').style.display = 'none';
            document.querySelector('#menu-header-avatar').style.display = 'none';
            document.querySelector('#menu-search').style.display = 'none';
            document.querySelector('.menu-body-sep').style.display = 'none';

        }
        else {
            switched.value = false;
            document.querySelector('#menu-header-title').style.display = 'flex';
            document.querySelector('#menu-header-avatar').style.display = 'flex';
            document.querySelector('#menu-search').style.display = 'flex';
            document.querySelector('.menu-body-sep').style.display = 'flex';
        }
    }
    const blur = ref(await localForage.getItem('blur'));

    const switchChannels = ref(false);
    const channelsUsers = ref([]);
    const lastChannelMessages = ref([]);
    const loadChannels = async () => {
        const {data,error} = await supabase
            .from('profiles')
            .select('channels')
            .eq('id', user.value.id)
            .single();
        const {data:getChannels, error:getError} = await supabase
            .from('channels')
            .select('*')
            .in('id', data.channels);
        channelsUsers.value = getChannels;

        lastChannelMessages.value = [];
        for (let i = 0; i < channelsUsers.value.length; i++) {
            const {data: lastMessage, error: lastMessageError} = await supabase
                .from('messages')
                .select('*')
                .eq('sender_id', channelsUsers.value[i].id)
                .order('timestamp', { ascending: false })
                .limit(1);
            if (lastMessage.length > 0) {
                lastChannelMessages.value.push(lastMessage[0].text);
            }
        }
        channelsUsers.value.forEach((element, index) => {
            element.lastMessage = lastChannelMessages.value[index];
        })
        console.log(channelsUsers.value);
    }
    loadChannels();
</script>

<template>        
    <ModalsPicture v-if="checkUrl" :picUrl="Url" @closePic="checkUrl = false"></ModalsPicture>

    <div id="menu-container">

    
    <VueDraggableResizable v-if="!isMobile"
        class-name-handle="handle"
        class-name="active"
        ref="resiz"
        :prevent-deactivation="true" 
        :active="true" 
        :draggable="false" 
        :resizable="isMobile ? false : true"
        :parent="true" 
        :w="width" 
        :h="'100%'"
        :max-width="550"
        :min-width="105"
        :axis="'x'" 
        :handles="['mr']"
        :z="10"
        @resizing="onResizing"
    >
    <div id="menu" :style="{width: width + 'px', backdropFilter: blur ? 'blur(5px)' : 'none' }">
        <div id="menu-header">
            <SideMenu @newBlurValue='blur = !blur'></SideMenu>
            <span id="menu-header-title">Сообщения</span>
            <!-- <span >{{ user.user_metadata.username }}</span> -->
            <div id="menu-header-avatar">
                <div id="menu-header-avatarBorder-avatar" :style="{ backgroundImage: `url(${avatar})` }" @click="Url = avatar, checkUrl = true"></div>
                <!-- <div id="menu-header-avatarBorder"></div> -->
            </div>
        </div>

        <div id="menu-search">
            <input id="menu-search-input" autocomplete="off" v-model="searchTerm" @input="newSearchUser()" type="text" placeholder="Найдите кого-нибудь">
        </div>

        <div v-if="!switched" id="menu-switch">
            <div @click="switchChannels = false;" class="menu-switch-button" :class="{ 'selected-channel': switchChannels === false}">Контакты</div>
            <div @click="switchChannels = true" class="menu-switch-button" :class="{ 'selected-channel': switchChannels === true}">Каналы</div>
        </div>
        
        <div v-else id="menu-switch">
            <div @click="switchChannels = false" class="switched-switch" :class="{ 'selected-channel-switch': switchChannels === false}"></div>
            <div @click="switchChannels = true" class="switched-switch" :class="{ 'selected-channel-switch': switchChannels === true}" ></div>
        </div>

        <Loading v-if="loading"></Loading>
        <div id="menu-body" v-else>
            <div v-if="switchChannels === false" class="menu-body-dialog" v-for="chat in chats" 
                :key="chat.id" @click="selectUser(chat.id)" 
                :class="{ 'selected': selectedUserId === chat.id}">
                    <div class="menu-body-dialog-avatar" :style="{ 
                        backgroundImage: `url(${chat.avatar_url || 'error404.gif'})`, 
                        border: `${moment(moment()).diff(chat.online_at, 'minutes') <= 5 ? '2px solid #6ed1f0' : ''}`
                    }" 
                    :class="{'selected-back': selectedUserId === chat.id && switched}"></div>
                <div class="menu-body-dialog-info" v-if="!switched">
                    <div class="menu-body-dialog-info-name">
                        {{ chat.username }} 
                        <div class="menu-body-dialog-info-name-verifed" v-if="chat.official"></div>
                    </div>
                    <span class="menu-body-dialog-info-message">
                        <b :style="{ 'color': '#fff'}">{{ chat.receiver_id === user.id ? '' : "Вы: "}} </b>
                        {{ chat.lastMessage }} {{chat.attachsLength ? `(Вложение)` : ' '  }}
                    </span>
                </div>
                <div class="menu-body-dialog-time" v-if="!switched">
                    <div class="menu-body-dialog-checked" v-show="chat.checkedMsg === true && chat.receiver_id != user.id"></div>
                    <span class="menu-body-dialog-time-time">
                        {{
                            moment(chat.lastMessageTimestamp).weekday() == moment().weekday() ? 
                            moment(chat.lastMessageTimestamp).format('HH:mm') : moment(chat.lastMessageTimestamp).format('dd')   
                        }}
                    </span>
                </div>
            </div>

            <div v-else class="menu-body-dialog" v-for="channel in channelsUsers" :key="channel.id" @click="selectChannel(channel.id)" :class="{ 'selected': selectedUserId === channel.id}">
                <!-- <div class="menu-body-dialog-avatar" :style="{ backgroundImage: `url(${user.avatar_url})` }"></div> -->
                <div class="menu-body-dialog-avatar" :style="{ backgroundImage: `url(${channel.avatar_url || 'error404.gif'})`}" :class="{'selected-back': selectedUserId === channel.id && switched}"></div>

                <div class="menu-body-dialog-info" v-if="!switched">
                    <div class="menu-body-dialog-info-name">{{ channel.name_channel }}
                        <div class="menu-body-dialog-info-name-verifed" v-if="channel.official"></div>
                    </div>
                    <span class="menu-body-dialog-info-message">{{ channel.lastMessage || 'Нет сообщений'}}</span>
                </div>

            </div>
            
            <div class="menu-body-sep">
                <hr>
                <span>Больше ничего нет</span>
            </div>

            <!-- for search -->
            <span v-if="users.length > 0 && searchTerm != ''" id="menu-error">Люди</span>
            <div class="menu-body-dialog" v-if="users.length > 0 && searchTerm != ''" v-for="user in users" :key="user.id" @click="selectUser(user.id), searchTerm = ''">
                <div class="menu-body-dialog-avatar" :style="{ backgroundImage: `url(${user.avatar_url})` }"></div>
                <div class="menu-body-dialog-info">
                    <span class="menu-body-dialog-info-name">{{ user.username }}</span>
                    <span class="menu-body-dialog-info-message">{{ user.description }}</span>
                </div>
            </div>

            <span v-if="channelsSearched.length > 0 && searchTerm != ''" id="menu-error">Каналы</span>
            <div class="menu-body-dialog" v-if="channelsSearched.length > 0 && searchTerm != ''" v-for="user in channelsSearched" :key="user.id" @click="selectChannel(user.id), searchTerm = ''">
                <div class="menu-body-dialog-avatar" :style="{ backgroundImage: `url(${user.avatar_url})` }"></div>
                <div class="menu-body-dialog-info">
                    <span class="menu-body-dialog-info-name">{{ user.name_channel }}</span>
                    <span class="menu-body-dialog-info-message">{{user.subs.length === 1 ? user.subs.length + ' подписчик' : ''  || user.subs.length < 5 ? user.subs.length + ' подписчика' : user.subs.length + ' подписчиков'}}</span>
                </div>
            </div>

            <span v-if="searchTerm != '' && users.length == 0" id="menu-error">Ничего не найдено</span>
            
        </div>
	</div>
    </VueDraggableResizable>

    <div id="menu" v-else>
        <div id="menu-header">
            <SideMenu></SideMenu>
            <span id="menu-header-title">Сообщения</span>
            <!-- <span >{{ user.user_metadata.username }}</span> -->
            <div id="menu-header-avatar">
                <div id="menu-header-avatarBorder-avatar" :style="{ backgroundImage: `url(${avatar})` }" @click="Url = avatar, checkUrl = true"></div>
                <!-- <div id="menu-header-avatarBorder"></div> -->
            </div>
        </div>

        <div id="menu-search">
            <input id="menu-search-input" v-model="searchTerm" @input="newSearchUser(), newSearchChannel(), console.log(searchTerm)" type="text" placeholder="Найдите кого-нибудь">
        </div>

        <div id="menu-switch">
            <div @click="switchChannels = false" class="menu-switch-button" :class="{ 'selected-channel': switchChannels === false}">Контакты</div>
            <div @click="switchChannels = true" class="menu-switch-button" :class="{ 'selected-channel': switchChannels === true}">Каналы</div>
        </div>

        <Loading v-if="loading"></Loading>
        <div id="menu-body" v-else>
            <div v-if="switchChannels === true" class="menu-body-dialog" 
                v-for="channel in channelsUsers" 
                :key="channel.id" @click="selectChannel(channel.id)" 
                :class="{ 'selected': selectedUserId === channel.id}">
                <div class="menu-body-dialog-avatar" 
                    :style="{ backgroundImage: `url(${channel.avatar_url || 'error404.gif'})`}" 
                    :class="{'selected-back': selectedUserId === channel.id && switched}"></div>
                <div class="menu-body-dialog-info">
                    <div class="menu-body-dialog-info-name">{{ channel.name_channel }}
                        <div class="menu-body-dialog-info-name-verifed" v-if="channel.official"></div>
                    </div>
                    <span class="menu-body-dialog-info-message">{{ channel.lastMessage || 'loading'}}</span>
                </div>
            </div>
            <div v-else class="menu-body-dialog" v-for="chat in chats" :key="chat.id" @click="selectUser(chat.id)" :class="{ 'selected': selectedUserId === chat.id}">
                    <div class="menu-body-dialog-avatar" :style="{ backgroundImage: `url(${chat.avatar_url || 'error404.gif'})` }"></div>
                <div class="menu-body-dialog-info">
                    <div class="menu-body-dialog-info-name">
                        {{ chat.username }} 
                        <div class="menu-body-dialog-info-name-verifed" v-if="chat.official"></div>
                    </div>
                    <span class="menu-body-dialog-info-message">
                        <b :style="{ 'color': '#fff'}">
                        {{ chat.receiver_id === user.id ? '' : "Вы: "}} 
                    </b>
                    {{ chat.lastMessage }} {{chat.attachsLength ? `(Вложение)` : ' '  }}</span>
                </div>
                <div class="menu-body-dialog-time">
                    <div class="menu-body-dialog-checked" v-show="chat.checkedMsg === true && chat.receiver_id != user.id"></div>
                    <span class="menu-body-dialog-time-time">
                        {{
                            moment(chat.lastMessageTimestamp).weekday() == moment().weekday() ? 
                            moment(chat.lastMessageTimestamp).format('HH:mm') : moment(chat.lastMessageTimestamp).format('dd')   
                        }}
                    </span>
                </div>
            </div>

            
            <div class="menu-body-sep">
                <hr>
                <span>Больше ничего нет</span>
            </div>

            <!-- for search -->
            <span v-if="users.length > 0 && searchTerm != ''" id="menu-error">Люди</span>
            <div class="menu-body-dialog" v-if="users.length > 0 && searchTerm != ''" v-for="user in users" :key="user.id" @click="selectUser(user.id), searchTerm = ''">
                <div class="menu-body-dialog-avatar" :style="{ backgroundImage: `url(${user.avatar_url})` }"></div>
                <div class="menu-body-dialog-info">
                    <span class="menu-body-dialog-info-name">{{ user.username }}</span>
                    <span class="menu-body-dialog-info-message">{{ user.description }}</span>
                </div>
            </div>

            <span v-if="channelsSearched.length > 0 && searchTerm != ''" id="menu-error">Каналы</span>
            <div class="menu-body-dialog" v-if="channelsSearched.length > 0 && searchTerm != ''" v-for="user in channelsSearched" :key="user.id" @click="selectChannel(user.id), searchTerm = ''">
                <div class="menu-body-dialog-avatar" :style="{ backgroundImage: `url(${user.avatar_url})` }"></div>
                <div class="menu-body-dialog-info">
                    <span class="menu-body-dialog-info-name">{{ user.name_channel }}</span>
                    <span class="menu-body-dialog-info-message">{{user.subs.length === 1 ? user.subs.length + ' подписчик' : ''  || user.subs.length < 5 ? user.subs.length + ' подписчика' : user.subs.length + ' подписчиков'}}</span>
                </div>
            </div>

            <span v-if="searchTerm != '' && users.length == 0" id="menu-error">Ничего не найдено</span>
            
        </div>
	</div>

    <ClientOnly v-if="check">
        <Dialog
            :userId = "selectedUserId"
            :isChannel = "isChannel"
            @close="check = false, selectedUserId = '', returnMenu()"
        ></Dialog>
    </ClientOnly>
    <div id="dialog-nothing" v-else-if="!isMobile">Выберите чат</div>
    </div>
</template>
<style lang="scss">
        #menu-container {
            display: flex;
            width: 100%;
            height: 100%;
            max-height:100% ;
                
            .switched-switch {
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background-color: #ffffff;
                transition: .2s ease-in-out;
                cursor: pointer;
                opacity: .5;
    
                &:hover {
                    transition: .2s ease-in-out;
                    opacity: 1;
                }
            }
    
            .selected-channel-switch {
                opacity: 1;
            }
    
            .handle {
                width: 5px;
                height: 50px;
                // max-height: 90%;
                background-color: #ffffff;
                opacity: .5;
                border-radius: 5px;
                transition: .2s ease-in-out;
    
                &:hover {
                    opacity: 1;
                    transition: .2s ease-in-out;
                }
            }
    
            .active {
                background-color: transparent;
                transition: .2s ease-in-out;
            }
    
            .unread {
                &::after {
                    content: '✖️';
                }
            }
    
            .selected {
                background-color: rgba(255, 255, 255, 0.2);
            }
    
            .selected-channel {
                background-color: var(--background-block) !important;
                color: white !important;
            }
    
            .selected-back {
                border-radius: 25% !important;
                transition: all .2s ease-in-out;
            }
    
            #dialog-nothing {
                width: 250px;
                padding: 5px;
                border-radius: 25px;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                margin: auto;
                user-select: none;
                font-size: 18px;
            }
    
            #dialog,
            #dialog-nothing {
                @media screen and (max-width: 450px) {
                    // display: none;
                    // position: absolute;
                    // z-index: 9;
                }
            }
    
            #menu {
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 100vh;
                min-width: auto;
                // background-color: var(--backround);
    
                background-color: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                transition: right 0.4s;
                right: 0%;
    
                @media screen and (max-width: 450px) {
                    width: 100vw;
                    min-width: auto;
                    height: 100vh;
                    position: absolute;
                    // right: 100%;
    
                    z-index: 9;
                }
    
                #menu-error {
                    font-size: 20px;
                    margin-top: 20px;
                    text-align: center;
                    font-weight: 300;
                    color: rgba(255, 255, 255, .5);
                }
    
                #menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    margin-top: 20px;
                    padding: 0 35px;
    
                    @media screen and (max-width: 450px) {
                        padding: 0 20px;
                    }
    
                    #menu-header-title {
                        font-size: 2em;
                        font-weight: 500;
                        flex-grow: 2;
                        margin-left: 15px;
                    }
    
                    #menu-header-avatar {
                        height: 70px;
                        width: 70px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        cursor: pointer;
    
                        #menu-header-avatarBorder {
                            width: 75px;
                            height: 75px;
                            border-radius: 100%;
                            background: linear-gradient(90deg, rgba(219, 0, 255, 1) 0%, rgb(214, 155, 211) 100%);
                            position: absolute;
                        }
    
                        #menu-header-avatarBorder-avatar {
                            width: 100%;
                            height: 100%;
                            border-radius: 100%;
                            background-size: cover;
                            background-position: center;
                            // z-index: 2;
                            // position: absolute;
                        }
                    }
                }
    
                #menu-search {
                    width: 100%;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    padding: 0 30px;
                    margin-top: 20px;
    
                    @media screen and (max-width: 450px) {
                        padding: 0 20px;
                    }
    
                    input {
                        width: 100%;
                        height: 40px;
                        border-radius: 10px;
                        border: none;
                        outline: none;
                        padding-left: 10px;
                        font-size: 15px;
                        color: rgba(255, 255, 255, .5);
                        background-color: var(--background-block);
    
                        &::placeholder {
                            opacity: 1;
                            transition: .2s;
                            text-align: center;
                        }
    
                        &:focus::placeholder {
                            transition: .2s;
                            opacity: 0;
                        }
                    }
                }
    
                #menu-switch {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    margin-top: 20px;
                    gap: 10px;
    
                    @media screen and (max-width: 450px) {}
    
                    .menu-switch-button {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        padding: 5px 10px;
                        border-radius: 10px;
                        background-color: var(--background-block-hover);
                        color: rgba(255, 255, 255, .5);
                        font-size: 15px;
                        transition: all 0.2s;
    
                        &:hover {
                            background-color: var(--background-block);
                            color: white !important;
                        }
                    }
                }
    
                #menu-body {
                    // width: 100%;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 20px;
                    overflow: auto;
    
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
    
                    @media screen and (max-width: 450px) {
                        width: 100%;
                    }
    
                    .menu-body-dialog {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        width: 95%;
                        padding: 10px 10px;
                        margin-bottom: 10px;
                        cursor: pointer;
                        transition: background-color 0.2s;
    
                        border-radius: 25px;
                        justify-content: center;
    
                        @media screen and (max-width: 450px) {
                            border-radius: 0px;
                            width: 100%;
                            padding: 10px 20px;
    
                        }
    
                        &:hover {
                            background-color: rgba(255, 255, 255, .1);
                        }
    
                        .menu-body-dialog-avatar {
                            width: 70px;
                            height: 70px;
                            border-radius: 100%;
                            flex-shrink: 0;
                            background: url("https://i.ibb.co/yQ8TcWD/ezgif-4-bd8944caaa.gif");
                            background-size: cover;
                            background-position: center;
                            // border: 1px solid rgba(255, 255, 255, .5);
                        }
    
                        .menu-body-dialog-info {
                            // width:60%;
                            display: flex;
                            flex-direction: column;
                            align-items: flex-start;
                            justify-content: center;
                            margin-left: 15px;
                            flex: 1;
                            text-overflow: ellipsis;
                            white-space: nowrap;
    
                            .menu-body-dialog-info-name {
                                font-size: 20px;
                                font-weight: 500;
                                display: flex;
                                align-items: flex-end;
    
                                .menu-body-dialog-info-name-verifed {
                                    padding: 10px;
                                    background-image: url('/verifed.svg');
                                    background-size: 100%;
                                    background-repeat: no-repeat;
                                    background-position: center;
                                    width: 10px;
                                    padding: 10px;
                                    margin-left: 5px;
                                }
                            }
    
                            .menu-body-dialog-info-message {
                                font-size: 16px;
                                width: 230px;
                                text-overflow: ellipsis;
                                color: rgba(255, 255, 255, .5);
                                overflow: hidden;
                            }
                        }
    
                        .menu-body-dialog-time {
                            font-size: 13px;
                            color: rgba(255, 255, 255, 0.5);
                            display: flex;
                            align-items: flex-start;
                            flex: 0;
                            min-width: 30px;
                            text-align: right;
                            justify-content: flex-end;
    
                            .menu-body-dialog-time-time {
                                text-wrap: nowrap;
                            }
    
                            .menu-body-dialog-checked {
                                background-image: url('/checked.svg');
                                background-size: 100%;
                                background-repeat: no-repeat;
                                background-position: center;
                                width: 10px;
                                padding: 10px;
                                margin-right: 5px;
                            }
                        }
    
                    }
    
                    .menu-body-sep {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin: 15px 0;
                        width: 100%;
    
                        hr {
                            width: 90%;
                            color: red;
                            margin-bottom: 15px;
                        }
    
                        span {
                            color: rgba(255, 255, 255, .5);
                            font-size: 15px;
                        }
                    }
                }
            }
        }
</style>