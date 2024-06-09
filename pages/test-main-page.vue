<script setup>
	// const route = useRoute();
	// const supabase = useSupabaseClient();
	// const user = useSupabaseUser();
	const link = ref('');
	const linkCheck = ref(false);

	const test = (url) => {
		if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
			console.log('image');
			linkCheck.value = true
		}
		else {
			console.log('not image');
			linkCheck.value = false
		}
	}

    import VueDraggableResizable from 'vue-draggable-resizable'

</script>

<template>
	<!-- <div class="container" style="background-color: aliceblue; color: black;"> -->
		<!-- <input type="text" v-model="link" @change="test(link)"> -->
		<VueDraggableResizable>
			<div class="image">
			<!-- <img src="https://i.ibb.co/MNp9GVR/photo-2024-02-19-14-43-17.jpg"> -->
			<p>abib</p>
		</div>
		</VueDraggableResizable>

	<!-- </div> -->

</template>
<style lang="scss">
	.container {
		display: flex;
		height: 100vh;
		width: 100vw;
		input {
			width: 20%;
			height: 3%;
		}
	}
</style>