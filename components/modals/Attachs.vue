<script setup>
    import moment from 'moment';
    import 'moment/dist/locale/ru';
    moment.locale('ru');
    const props = defineProps({
        attachsArr: Array
    })
    const messages = props.attachsArr;
    const emit = defineEmits(['closeAttachs'])

    const filteresMessages = messages.filter((message) => message.attachs.length != 0).sort((a, b) => b.timestamp - a.timestamp);
    const checkPic = ref(false);
    const Url = ref('');
</script>

<template>
    <ModalsPicture v-if="checkPic" :picUrl="Url" @closePic="checkPic = false"></ModalsPicture>
    <div id="modal-background">
        <div id="modal">
            <span class="modal-headerSpan" v-if="filteresMessages.length == 0">Нет вложений</span>
            <span class="modal-headerSpan" v-else>Просмотр вложений</span>
            <div v-if="filteresMessages.length != 0" id="modal-attachs">
                <div id="modal-attachs-attach" v-for="attach in filteresMessages">
                    <span v-text="moment(attach.timestamp).format('LL')"></span>
                    <span >Перейти к сообщению</span>
                    <div id="modal-attachs-attach-img">
                        <img @click="checkPic = true, Url = img.signedUrl" v-for="img in attach.attachs" :src="img.signedUrl">
                    </div>
                </div>
            </div>
        </div>
        <div id="modal-overlay-attach" @click="emit('closeAttachs')"></div>
    </div>
</template>
<style lang="scss">
    #modal-background {
        width: 100vw;
        height: 100vh;
        position: absolute;
        z-index: 99;
        background-color: rgba($color: #000000, $alpha: .6);    

        display: flex;
        justify-content: center;
        align-items: center;
        #modal-overlay-attach {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;

            z-index: 1;
        }
        #modal {
            z-index: 100;
            width: 35%;
            // height: 150px;
            padding: 25px;
            border-radius: 10px;
            background-color: var(--backround);

            // display: flex;
            overflow: auto;
            max-height: 90%;
            @media screen and (max-width: 450px) {
                width: 90%;
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

            .modal-headerSpan {
                font-size: 20px;
                font-weight: 600;
                text-align: center;
                display: flex;
                justify-content: center;
            }
            #modal-attachs {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 80%;
                margin-top: 15px;
                // overflow-y: auto;

                #modal-attachs-attach {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    span {
                        font-size: 12px;
                    }
                    #modal-attachs-attach-img {
                        width: 100%;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                        img {
                            width: 50%;
                            margin-bottom: 15px;
                            cursor: pointer;
                        }
                    }
                }
            }
        }
    }
</style>