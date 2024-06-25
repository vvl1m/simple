<script setup>
    import moment from 'moment';
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    moment.locale('ru');

    let props = defineProps({
        userId: String
    })
    const emit = defineEmits(['closeUser'])

    const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', props.userId)
        .single();


    const onlineStatus = ref('');
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

</script>
<template>
    <!-- <ModalsUserEdit @closeUserEdit="emit('closeUser')" v-if="user.id == props.userId" :userId="props.userId"></ModalsUserEdit> -->
    <div id="modal-background">
        <div id="modal">
            <div id="modal-user">
                <div id="modal-user-body-dialog-info-avatar" :style="{ backgroundImage: `url(${data.avatar_url})` }"></div>
                <div id="modal-user-body-dialog-info">
                    <div class="menu-body-dialog-info-name">
                        {{ data.username }} 
                        <div class="menu-body-dialog-info-name-verifed" v-if="data.official"></div>
                    </div>
                    <!-- <span id="modal-user-body-dialog">{{ data.full_name  }}</span> -->
                    <span id="modal-user-body-dialog-info-lastSeen"> {{ onlineStatus  }}</span>
                </div>
            </div>

            <div id="modal-user-description">
                <span>{{ data.description }}</span>
            </div>
        </div>
        <div id="modal-overlay" @click="emit('closeUser')"></div>

    </div>
</template>
<style lang="scss">
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
    #modal-background {
        width: 100vw;
        height: 100vh;
        position: absolute;
        z-index: 99;
        background-color: rgba($color: #000000, $alpha: .6);    

        display: flex;
        justify-content: center;
        align-items: center;
        #modal-overlay {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;

            z-index: 1;
        }
        #modal {
            z-index: 100;
            width: 25%;
            // height: 150px;
            padding: 25px;
            border-radius: 10px;
            background-color: var(--backround);

            // display: flex;
            @media screen and (max-width: 450px) {
                width: 90% !important;
            }
            #modal-user {
                display: flex;
                align-items: center;
                #modal-user-body-dialog-info-avatar {
                    width: 100px;
                    height: 100px;
                    background-size: cover;
                    background-position: center;
                    border-radius: 100%;
                    flex-shrink: 0;
                }
                #modal-user-body-dialog-info {
                    display: flex;
                    flex-direction: column;
                    margin-left: 15px;
                    #modal-user-body-dialog-info-name {
                        font-size: 24px;
                        font-weight: 600;
                    }
                    #modal-user-body-dialog-info-lastSeen {
                        color: rgba($color: #fff, $alpha: .5);
                        font-size: 14px;
                    }
                }
            }
            #modal-user-description {
                margin-top: 15px;
            }
        }
    }
</style>