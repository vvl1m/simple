<script setup>
onBeforeMount(() => {
	document.documentElement.style.setProperty('--image-background', `url(background-login.png)`);

	const user = useSupabaseUser();
	const route = useRouter();

	console.log(user.value)
	if (user.value === null) {
		route.push('/login');
	}
	else {
		route.push('/');
	}
})
</script>
<template>
	<Auth></Auth>
		
</template>
<style lang="scss"></style>