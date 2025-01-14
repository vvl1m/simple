<script setup>
	const supabase = useSupabaseClient()
	const route = useRouter()

	const email = ref('')
	const password = ref('')
	const username = ref('')
	const logCheck = ref(false)

	const handleLogin = async () => {
		try {
			if (username.value == '' || email.value == '' || password.value == '') {
				throw new Error('Все поля должны быть заполнены');
			}
			const { data, error } = await supabase.auth.signUp({
				email: email.value,
				password: password.value,
				options: {
					data: {
						username: username.value,
						avatar_url: '',
						full_name: '',
						descripton: ''
					}
				}
			})
			if (error) throw error
			} catch (error) {
				alert(error.error_description || error.message)
			}
			finally {
				route.push('/')
			}
	}
	const login = async () => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email.value,
				password: password.value,
			})

			if (error) throw error
		} catch (error) {
			alert(error.error_description || error.message)
		}
		finally {
			route.push('/')
		}
	}
</script>

<template>
	<div id="menuAuth">
  		<form class="row flex-center flex" @submit.prevent="handleLogin" v-if="logCheck">
			<div class="login-div">
				<h1 id="title">Добро пожаловать!</h1>
				<div id="selector">
					<div class="selector-select" @click="logCheck = !logCheck">
						<span>Авторизация</span>
					</div>
					<div class="selector-select" :style="{backgroundColor: '#837dd6'}">
						<span>Регистрация</span>
					</div>	
				</div>
  		  		<div class="login-form">
  		  			<div id="form">
  		  				<input class="inputField" type="email" placeholder="Почта" v-model="email" />
  		  				<input class="inputField" type="password" placeholder="Пароль" name="" v-model="password">
  		  				<input class="inputField" type="text" name="" placeholder="Никнейм (изменяемый)" v-model="username">
  		  			</div>
  		  			<div class="button">
  		  				<input
  		  					type="submit"
  		  					class="button-submit"
							value="Зарегистроваться"
  		  				/>
  		  			</div>
  		  		</div>
			</div>
  		</form>

  		<form class="row flex-center flex" @submit.prevent="login" v-else>
			<div class="login-div">
				<h1 id="title">Добро пожаловать!</h1>
				<div id="selector">
					<div class="selector-select" :style="{backgroundColor: '#837dd6'}">
						<span>Авторизация</span>
					</div>
					<div class="selector-select" @click="logCheck = !logCheck">	
						<span>Регистрация</span>
					</div>	
				</div>	
  					<div class="login-form">
  						<div id="form">
  							<input class="inputField" type="email" placeholder="Почта" v-model="email" />
  							<input class="inputField" type="password" placeholder="Пароль" name="" v-model="password">
  						</div>
  						<div class="button">
  							<input
  								type="submit"
  								class="button-submit"
								value="Войти"
  							/>
  						</div>
  					</div>
			</div>
  		</form>
	</div>
</template>

<style lang="scss">
	#menuAuth {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100vw;
		backdrop-filter: blur(5px);
		@media screen and (max-width: 450px) {
			background-color: var(--backround);
			width: 100vw;
			height: 100vh;
		}
		.login-div {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 500px;
			height: 500px;
			background-color: var(--backround);
			border-radius: 10px;
			@media screen and (max-width: 450px) {
				width: 100%;
				background:none;
			}
			#title {
				font-size: 35px;
				font-weight: 500;
				margin-bottom: 25px;
			}
		}
		.login-form {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-between;
			width: 200px;
			.button {
				margin-top: 25px;
				
				.button-submit {
					border-radius: 10px;
					margin-bottom: 10px;
					font-size: 20px;
					padding: 15px 25px;
					transition: background-color .2s;
					background-color: var(--background-block);
					outline: none;
					border: none;
					color: white;
					&:hover {
						transition: background-color .1s;
						background-color: #837dd6;
						cursor: pointer;
					}
					&:focus {
						transition: background-color .1s;
						background-color: #837dd6;
					}
				}
			}
		}
		#form {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			.inputField {
				width: 250px;
				height: 40px;
				border-radius: 10px;
				margin-bottom: 10px;
				font-size: 20px;
				padding: 0 10px;
				transition: background-color .2s;
				background-color: var(--background-block);
				outline: none;
				border: none;
				color: white;
				&:focus {
					transition: background-color .1s;
					background-color: #837dd6;
				}
				&::placeholder {
                    opacity: 1;
                    transition: .2s;
                }
				&:focus::placeholder {
                    transition: .2s;
                    opacity: 0;
                }
			}
		}
		#selector {
			width: 400px;
			height: 75px;
			display: flex;
			justify-content: space-around;
			align-items: center;
			background-color: var(--background-block);
			// border-radius: 10px;
			margin-bottom: 40px;
			@media screen and (max-width: 450px) {
				width: 100%;
			}
			.selector-select {
				width: 100%;
				height: 100%;
				// border-radius: 10px;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 20px;
				font-weight: 500;
				cursor: pointer;
				transition: background-color .2s;
				@media screen and (max-width: 450px) {
					border: 1px rgb(68, 68, 68) solid;
				}
				&:hover {
					transition: background-color .1s;
					background-color: #837dd6;
				}
			}
		}
	}
</style>