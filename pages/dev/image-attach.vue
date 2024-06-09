<script setup>
	const route = useRouter()
</script>

<template>

    <NuxtLink to="/dev/users">abob</NuxtLink>

</template>

<style lang="scss">
    // #dialog {
    //     display: flex;
    //     flex-direction: column;
    //     padding: 0 200px;

    //     width: 100%;
    //     height: 100vh;
    //     // color: rgba(255, 255, 255, .5);

    //     background: url('https://i.ibb.co/16LZC7F/kandinsky-download-1705396960143.png');
	// 	background-size: cover;
	// 	background-position: center;
    //     #dialog-header {
    //         width: 100%;
    //         height: 100px;
    //         background: var(--background-block);
    //         background-size: cover;
    //         background-position: center;
    //         display: flex;
    //         flex-direction: row;
    //         align-items: center;
    //         padding: 0 15px;
    //         #dialog-header-close {
    //             font-size: 20px;
    //             font-weight: 500;
    //             cursor: pointer;
    //         }
    //         #dialog-header-avatarBorder {
    //             width: 50px;
    //             height: 50px;
    //             border-radius: 100%;
    //             background: linear-gradient(90deg, rgba(219,0,255,1) 0%, rgb(214, 155, 211) 100%);
    //             display: flex;
    //             justify-content: center;
    //             align-items: center;
    //             cursor: pointer;
    //             margin-left: 20px;
    //             #dialog-header-avatarBorder-avatar {
    //                 width: 90%;
    //                 height: 90%;
    //                 border-radius: 100%;
    //                 background-size: cover;
    //                 background-position: center;
    //             }
    //         }
    //         #dialog-header-info {
    //             display: flex;
    //             flex-direction: column;
    //             flex-grow: 2;
    //             margin-left: 20px;
    //             #dialog-header-info-name {
    //                 font-size: 20px;
    //                 font-weight: 500;
    //             }
    //             #dialog-header-info-status {
    //                 font-size: 14px;
    //                 color: rgba(255, 255, 255, .5);
    //             }
    //         }
    //         #dialog-header-menu {
    //             display: flex;
    //             flex-direction: row;
    //             justify-content: flex-end;
    //             width: 40%;
    //             #dialog-header-menu-search {
    //                 width: 40%;
    //                 input {
    //                     height: 40px;
    //                     border-radius: 10px;
    //                     border: none;
    //                     outline: none;
    //                     font-size: 15px;
    //                     color: rgba(255, 255, 255, .5); 
    //                     background-color: var(--background-block);       
                             
    //                     &::placeholder {
    //                         opacity: 1;
    //                         transition: .2s;
    //                     }
    //                     &:focus::placeholder {
    //                         transition: .2s;
    //                         opacity: 0;
    //                     }
    //                 }
    //             }
    //             #dialog-header-menu-search-button {
    //                 padding: 20px;
    //                 margin: 0 15px;
    //                 background: url('https://grizly.club/uploads/posts/2023-08/1692155576_grizly-club-p-kartinki-belie-ikonki-bez-fona-5.png');
    //                 background-size: cover;
    //                 background-position: center;
    //                 cursor: pointer;
    //             }
    //         }
    //     }
    //     #dialog-body {
    //         width: 100%;
    //         height: 100%;
    //         overflow-y: auto;
    //         color: black;
    //         #dialog-body-messages{
    //             width: 100%;
    //             padding: 10px 15px;

    //             &::-webkit-scrollbar {
    //                 width: 0;
    //             }
    //             .dialog-body-messages-sender {
    //                 max-width: 500px;
    //                 min-width: 200px;
    //                 width: fit-content;

    //                 min-height: 50px;                 
    //                 height: fit-content;   

    //                 background-color: #D1E8FF;
    //                 border-radius: 15px;
    //                 display: flex;
    //                 flex-direction: column;

    //                 padding: 0 15px;
    //                 margin-bottom: 10px;
    //                 .dialog-body-messages-info {
    //                     display: flex;
    //                     flex-direction: row;
    //                     align-items: center;
    //                     justify-content: space-between;
    //                     padding-top: 5px;

    //                     .dialog-body-messages-info-date {
    //                         font-size: 12px;
    //                         color: rgba(0, 0, 0, .7);
    //                     }
    //                     .dialog-body-messages-info-avatar {
    //                         width: 40px;
    //                         height: 40px;
    //                         border-radius: 100%;
    //                         background-size: cover;
    //                         background-position: center;
    //                     }
    //                     .dialog-body-messages-info-name {
    //                         font-size: 14px;
    //                         font-weight: 500;
    //                         // color: rgba(255, 255, 255, .5);
    //                     }
    //                 }
    //                 .dialog-body-messages-message {
    //                     max-width: 930px;
    //                     min-width: 200px;
    //                     width: fit-content;

    //                     min-height: 30px;                 
    //                     height: fit-content;
    //                     display: flex;
    //                     flex-wrap: wrap;   
    //                     padding-bottom: 5px;
    //                     .dialog-body-messages-info-message-text {
    //                         width: 90%;
    //                         height: 100%;
    //                         white-space: pre-wrap;
    //                         word-wrap:break-word;
    //                         overflow: hidden;
    //                         font-size: 16px;
                            
    //                     }
    //                     .dialog-body-messages-info-message-img {
    //                         width:100%;
    //                         height: 250px;
    //                         margin-top: 5px;
    //                         background: url("https://static.animecorner.me/2023/10/1696857051-55187-1024x576.jpg");
    //                         background-position: center;
    //                         background-size: cover;
    //                         cursor: pointer;
    //                     }
    //                 }
    //             }
    //         }
    //         #dialog-body-add {
    //             width: 100%;
    //             height: 100%;
    //             display: flex;
    //             flex-direction: column;
    //             align-items: center;
    //             justify-content: center;
    //             #dialog-body-add-info {
    //                 width: 400px;
    //                 height: 400px;
    //                 border-radius: 25px;
    //                 background-color: var(--background-block);

    //                 font-size: 20px;
    //                 font-weight: 500;

    //                 display: flex;
    //                 flex-direction: column;
    //                 align-items: center;
    //                 justify-content: center;
    //                 #dialog-body-add-info-avatar {
    //                     width: 150px;
    //                     height: 150px;
    //                     border-radius: 100%;
    //                     background-size: cover;
    //                     background-position: center;
    //                 }
    //                 #dialog-body-add-info-name {
    //                     margin-top: 20px;
    //                 }
    //                 #dialog-body-add-info-status {
    //                     margin-top: 20px;
    //                     font-weight: 400;
    //                 }
    //             }
    //         }
            
    //     }
    //     #dialog-body-chat {
    //         width: 100%;
    //         height: 60px;
    //         background-color: var(--background-block);
    //         display: flex;
    //         flex-direction: row;
    //         align-items: center;
    //         justify-content: space-between;
    //         padding: 0 15px;
    //         input {
    //             width: 90%;
    //             height: 100%;
    //             border-radius: 10px;
    //             border: none;
    //             outline: none;
    //             font-size: 15px;
    //             color: rgba(255, 255, 255, .5);
    //             background-color: var(--background-block);
    //             &::placeholder {
    //                 opacity: 1;
    //                 transition: .2s;
    //             }
    //             &:focus::placeholder {
    //                 transition: .2s;
    //                 opacity: 0;
    //             }
    //         }
    //         #dialog-body-chat-send {
    //             padding: 20px;
    //             border-radius: 100%;
    //             border: none;
    //             outline: none;
    //             font-size: 20px;
    //             background: url('Vector.png');
    //             background-size: 75%;
    //             background-position: center;
    //             background-repeat: no-repeat;
    //             cursor: pointer;
    //         }
    //     }
    // }
</style>