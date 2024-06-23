<script setup>
	const user = useSupabaseUser();
	const route = useRouter();
	import localForage from "localforage";

	if (user.value === null && !route.currentRoute.value.path !== '/reset-password') {
		route.push('/login');	
	}
	else {
		localForage.getItem('background').then(function(value) {
		if (value !== null) {
			document.documentElement.style.setProperty('--image-background', `url(${URL.createObjectURL(value)})`);
		} else {
			// Загрузка изображения из папки public и сохранение его в локальное хранилище
			fetch('/back.png')
				.then(response => response.blob())
				.then(blob => {
					localForage.setItem('background', blob);
					document.documentElement.style.setProperty('--image-background', `url(${URL.createObjectURL(blob)})`);
					console.log('Изображение успешно загружено и сохранено в локальное хранилище.');
				})
				.catch(error => {
					console.error('Произошла ошибка при загрузке изображения:', error);
				});
		}
		}).catch(function(err) {
			console.error('Произошла ошибка:', err);
		});
	}
	useHead({
		title: 'Симпл Мессенджер',
		meta: [
			{
				hid: 'viewport',
				name: 'viewport',
			}
		]
	})

</script>

<template>
	<div class="container">
		<Menu v-if="user"></Menu>
		<!-- <Auth v-else></Auth> -->
	</div>
</template>
<style lang="scss">
	.container {
		display: flex;
		height: 100vh;
		// width: 100vw;

		// backdrop-filter: blur(5px);
		// background-color: rgba($color: #000000, $alpha: .5);
	}
</style>