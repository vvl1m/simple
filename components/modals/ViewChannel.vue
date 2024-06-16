<script setup>
    import moment from 'moment';
    const supabase = useSupabaseClient();
    moment.locale('ru');

    let props = defineProps({
        channelId: String
    })
    const emit = defineEmits(['closeChannel'])

    const {data, error} = await supabase
        .from('channels')
        .select('*')
        .eq('id', props.channelId)
        .single();
        if (error) {
            console.log(error);
        }
    const {data:getOwner, error:getOwnerError} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.owner)
        .single();
</script>
<template>
    <!-- <ModalsUserEdit @closeUserEdit="emit('closeChannel')" v-if="channel.id == props.channelId" :channelId="props.channelId"></ModalsUserEdit> -->
    <div id="modal-background">
        <div id="modal">
            <!-- <span>Просмотр канала</span> -->

            <div id="modal-channel">
                <div id="modal-channel-body-dialog-info-avatar" :style="{ backgroundImage: `url(${data.avatar_url})` }"></div>
                <div id="modal-channel-body-dialog-info">
                    <div class="menu-body-dialog-info-name">
                        {{ data.name_channel }} 
                        <div class="menu-body-dialog-info-name-verifed" v-if="data.official"></div>
                    </div>
                    <!-- <span id="modal-channel-body-dialog">{{ data.full_name  }}</span> -->
                    <span id="modal-channel-body-dialog-info-subsCount"> {{ data.subs.length === 1 ? data.subs.length + ' подписчик' : ''  || data.subs.length < 5 ? data.subs.length + ' подписчика' : data.subs.length + ' подписчиков'  }}</span>
                </div>
            </div>

            <div id="modal-channel-description">
                <!-- <span>{{ data.description }}</span> -->
                <!-- <span>описание (вотрубе)</span> -->
            </div>
        </div>
        <div id="modal-overlay" @click="emit('closeChannel')"></div>

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
            #modal-channel {
                display: flex;
                align-items: center;
                #modal-channel-body-dialog-info-avatar {
                    width: 100px;
                    height: 100px;
                    background-size: cover;
                    background-position: center;
                    border-radius: 100%;
                    flex-shrink: 0;
                }
                #modal-channel-body-dialog-info {
                    display: flex;
                    flex-direction: column;
                    margin-left: 15px;
                    #modal-channel-body-dialog-info-name {
                        font-size: 24px;
                        font-weight: 600;
                    }
                    #modal-channel-body-dialog-info-subsCount {
                        color: rgba($color: #fff, $alpha: .5);
                        font-size: 14px;
                    }
                }
            }
            #modal-channel-description {
                margin-top: 15px;
            }
        }
    }
</style>