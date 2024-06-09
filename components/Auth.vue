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
	<div id="menuAuth" v-if="!logCheck">
		<div id="menuAuth-form">
			<div id="menuAuth-form-logo"></div>
			<div id="menuAuth-form-form">
				<input class="inputField" type="email" placeholder="Имейл" v-model="email" />
				<input class="inputField" type="password" placeholder="Пароль" name="" v-model="password">
				<span id="menuAuth-form-form-forgot">Забыли пароль?</span>
				<div class="button">
					<input
						type="submit"
						class="button-submit"
						@click="login"
						value="Войти"
					/>
				</div>
			</div>
			<div id="menuAuth-form-signup">
				<span id="menuAuth-form-signup-text">Первый раз здесь?</span>
				<span id="menuAuth-form-signup-button" @click="logCheck = !logCheck">Создать аккаунт</span>
			</div>
		</div>
		<div id="menuAuth-side">

		</div>
	</div>

	<div id="menuAuth" v-else>
		<div id="menuAuth-form">
			<div id="menuAuth-form-logo"></div>
			<div id="menuAuth-form-form" style="align-items: center;">
					<input class="inputField" type="text" placeholder="Никнейм" v-model="username" />
					<input class="inputField" type="email" placeholder="Имейл" v-model="email" />
					<input class="inputField" type="password" placeholder="Пароль" name="" v-model="password">
					<div class="button">
						<input
							type="submit"
							class="button-submit"
							@click="handleLogin"
							value="Продолжить"
						/>
					</div>
					<span @click="logCheck = !logCheck" class="back-button">Назад</span>
				</div>
			</div>
	</div>
</template>

<style lang="scss">
	#menuAuth {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100vh;
		width: 100vw;
		backdrop-filter: blur(2px);
		text-transform: uppercase;
		@media (max-width: 450px) {
			width: 100%;
		}
		#menuAuth-form {
			margin-left: 10%;
			display: flex;
			flex-direction: column;
			@media (max-width: 450px) {
				align-items: center;
				width: 80%;
			}
			#menuAuth-form-logo {
				background: url('/logo-test.png');
				width: 300px;
				height: 300px;
				background-size: contain;
				background-repeat: no-repeat;
			}
			#menuAuth-form-form {
				margin-top: 20px;
				display: flex;
				flex-direction: column;
				@media (max-width: 450px) {
					width: 80%;
					align-items: center;
				}
				.inputField {
					width: 450px;
					height: 40px;
					margin-bottom: 30px;
					font-size: 24px;
					background: none;
					outline: none;
					border: none;
					border-bottom: 5px solid white;
					color: white;
					@media (max-width: 450px) {
						width: 100%;
					}
					&::placeholder {
						opacity: 1;
						transition: .2s;
						color: #fff;
						background: none;
						text-transform: uppercase;
						font-weight: 400;
					}
					&:focus::placeholder {
						opacity: 0;
						transform: translateY(5px);
					}
				}
				#menuAuth-form-form-forgot {
					font-size: 18px;
					font-weight: 500;
					color: white;
					transition: .2s;
					&:hover {
						opacity: .5;
						cursor: pointer;
					}
				}
				.button {
					.button-submit {
						margin-top: 30px;
						background: none;
						border: none;
						outline: none;
						color: white;
						font-size: 20px;
						width: 250px;
						padding: 15px;
						border-radius: 50px;
						background-color: #1B1E20;
						text-transform: uppercase;
						font-weight: 500;
						font-size: 24px;
						&:hover {
							cursor: pointer;
							background-color: #0e0f10;
						}
					}
				}

				.back-button {
					font-size: 18px;
					font-weight: 700;
					color: white;
					text-decoration: underline;
					margin-top: 10px;
					&:hover {
						cursor: pointer;
					}
				}
			}
			#menuAuth-form-signup {
				margin-top: 100px;
				display: flex;
				flex-direction: column;
				#menuAuth-form-signup-text {
					font-size: 18px;
					font-weight: 500;
					color: white;

				}
				#menuAuth-form-signup-button {
					font-size: 18px;
					font-weight: 700;
					color: white;
					text-decoration: underline;
					margin-top: 10px;
					&:hover {
						cursor: pointer;
					}
				}
			}
		}
		#menuAuth-side {
			margin-right: 10%;
			background: url('/side.svg');
			width: 400px;
			height: 400px;
			background-size: contain;
			background-repeat: no-repeat;
			@media (max-width: 450px) {
				display: none;
			}
		}
	}
</style>