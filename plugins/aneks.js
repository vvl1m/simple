export default defineNuxtPlugin(() => {
    const supabase = useSupabaseClient();
    async function insertMessage(textMessage) {
        const { data: lastMessage, error } = await supabase
            .from('messages')
            .select('text')
            .eq('sender_id', '05b29192-f930-4f56-bb22-23b353308584')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        if (textMessage != lastMessage.text) {
            const { data, error } = await supabase
                .from('messages')
                .insert([
                    { sender_id: '05b29192-f930-4f56-bb22-23b353308584', text: textMessage },
                ]);
        }
        else {
            console.log('Анекдот уже был отправлен');
        }
    }
    const checkAneks = async () => {
        const item = ref('');

        fetch('http://80.78.243.251:8080/https://www.anekdot.ru/rss/export_j.xml')
            .then(response => response.text())
            .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
            .then(data => {
                const GetItem = data.querySelector("item");
                item.value = GetItem.querySelector("description").textContent.replace(/<[^>]*>/g, "");
                item.value = item.value;
                insertMessage(item.value);
            })
            .catch(err => console.log('Ошибка:', err))
    }
    const checkLastTimestamp = async () => {
        const { data: lastTimestamp, error } = await supabase
            .from('messages')
            .select('timestamp')
            .eq('sender_id', '05b29192-f930-4f56-bb22-23b353308584')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        let timestamp = lastTimestamp.timestamp;
        let dateFromTimestamp = new Date(timestamp);
        let currentDate = new Date();

        let differenceInHours = (currentDate - dateFromTimestamp) / 1000 / 60 / 60;
        console.log(differenceInHours);

        if (differenceInHours >= 24) {
            checkAneks();
        }
        else {
            console.log('24 часа не прошло');
        }
    }
    checkLastTimestamp();
})