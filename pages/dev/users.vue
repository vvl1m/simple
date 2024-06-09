<script setup>
    const supabase = useSupabaseClient();
    const usersOut = ref();
    const {data: users} = await supabase
        .from('profiles')
        .select('*');
    usersOut.value = users;    
 
</script>
<template>
    <div class="parent"> 
        <div class="menu-body-dialog" v-for="user in usersOut">
            <div class="menu-body-dialog-avatar" :style="{ backgroundImage: `url(${user.avatar_url})` }"></div>
            <div class="menu-body-dialog-info">
                <span class="menu-body-dialog-info-name">{{ user.username }}</span>
                <span class="menu-body-dialog-info-message">{{ user.description }}</span>
            </div>
        </div>
        <h1 style="width: 100%; text-align: center;">users count: {{ usersOut.length}}</h1>
    </div>
</template>
<style lang="scss">
    .parent {
        width: 50%;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 10px auto;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(5px);
        border-radius: 25px;
        padding: 15px;
        flex-wrap: wrap;
        justify-content: center;
        .menu-body-dialog { 
            width: 50%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 10px 10px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: background-color 0.2s;

            border-radius: 25px;
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
    }
</style>