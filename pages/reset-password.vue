<script setup>
const route = useRouter()
const supabase = useSupabaseClient()
const password = ref('')
const user = useSupabaseUser()

const changePassword = async () => {
    const { error } = await supabase.auth.updateUser({
        password: password.value
    })
    if (error) throw error
    else route.push('/login')
}
</script>

<template>
    <div class="reset-password">
        <h1>Reset Password</h1>
        <form @submit.prevent="requestPasswordReset">
            <input type="password" v-model="password" placeholder="Новый пароль" />
            <input @click="changePassword" type="submit" value="Reset Password" />
        </form>
    </div>
</template>

<style lang="scss"></style>
