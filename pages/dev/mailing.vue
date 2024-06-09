<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const route = useRouter();

const send = ref('');
const {data:allUsers, error} = await supabase.from('profiles').select('*');
const authorizedUsers = ['4f723018-4bbd-48f7-b66d-82e651936ccc', '3095b545-493d-4fd9-895f-3f73519171e6'];
if (!authorizedUsers.includes(user.value.id)) {
    throw new Error('Доступ запрещен');
}

const sendMailing = async () => {
    for (let i = 0; i < allUsers.length; i++) {
        const { data, error } = await supabase
            .from('messages')
            .insert([
                {
                    sender_id: authorizedUsers[0],
                    receiver_id: allUsers[i].id,
                    text: send.value,
                    attachs: [],
                },
            ]);
    }
    alert('Рассылка завершена');
}

const {data:getAllMessages, error:allMessagesError} = await supabase.from('messages').select('text').eq('sender_id', authorizedUsers[0]);
let uniqueMessages = getAllMessages
    .map(msg => msg.text) 
    .filter((v, i, a) => a.indexOf(v) === i); 

const allMessages = ref(uniqueMessages);
</script>

<template>
    <div class="mailing-container">
        <div class="mailing">
            <h1>Рассылка</h1>
            <div class="mailing-form">
                <input type="text" v-model="send">
                <button @click="sendMailing">Отправить</button>
            </div>
        </div>
        <div class="mailing-messages">
            <h1>Сообщения</h1>
            <div class="mailing-messages-container">
                <div class="mailing-message" v-for="message in allMessages">
                    <p>{{ message }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .mailing-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        .mailing-messages {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            .mailing-messages-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                .mailing-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    p {
                        width: 500px;
                    }
                }
            }
        }

        .mailing {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            .mailing-form {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                input {
                    width: 500px;
                    height: 50px;
                    margin-bottom: 20px;
                }
                button {
                    width: 500px;
                    height: 50px;
                }
            }
        }
    }
</style>