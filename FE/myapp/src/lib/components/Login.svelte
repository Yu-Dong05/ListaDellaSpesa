<script>
	import { auth } from '$lib/stores.js';
	import { login } from '$lib/api.js';
	import { goto } from '$app/navigation';

	let username = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

  /**
+	 * @param {SubmitEvent} event
+	 */
	async function handleLogin(event) {
		event.preventDefault();
		if (!username || !password) {
			error = 'Inserisci username e password';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await login(username, password);
			auth.login(response.token, response.user);
			
			// Reindirizza in base al ruolo
			if (response.user.role === 'admin') {
				goto('/admin');
			} else {
				goto('/');
			}
		} catch (err) {
			error = 'Credenziali non valide';
			console.error('Login error:', err);
		} finally {
			loading = false;
		}
	}

	function fillDemoCredentials() {
		username = 'admin';
		password = 'admin123';
	}
</script>

<div class="login-container">
	<div class="login-card">
		<h1>Accesso</h1>
		<p class="subtitle">Lista della Spesa Ottimizzata</p>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<form onsubmit={handleLogin}>
			<div class="form-group">
				<label for="username">Username</label>
				<input 
					id="username"
					type="text" 
					bind:value={username}
					disabled={loading}
					required 
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input 
					id="password"
					type="password" 
					bind:value={password}
					disabled={loading}
					required 
				/>
			</div>

			<button type="submit" disabled={loading} class="login-btn">
				{loading ? 'Accesso in corso...' : 'Accedi'}
			</button>
		</form>

		<div class="demo-section">
			<p class="demo-text">Credenziali demo:</p>
			<button type="button" onclick={fillDemoCredentials} class="demo-btn">
				Usa credenziali admin
			</button>
			<div class="demo-info">
				<small>Username: admin | Password: password</small>
			</div>
		</div>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
		padding: 20px;
	}

	.login-card {
		background: white;
		padding: 40px;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0,0,0,0.2);
		width: 100%;
		max-width: 400px;
	}

	h1 {
		text-align: center;
		color: #333;
		margin-bottom: 8px;
	}

	.subtitle {
		text-align: center;
		color: #666;
		margin-bottom: 30px;
		font-style: italic;
	}

	.error {
		background: #ffebee;
		color: #c62828;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 20px;
		text-align: center;
		border: 1px solid #ffcdd2;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 6px;
		font-weight: bold;
		color: #333;
	}

	.form-group input {
		width: 100%;
		padding: 12px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	.form-group input:focus {
		outline: none;
		border-color: #4CAF50;
		box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
	}

	.form-group input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	.login-btn {
		width: 100%;
		background: #4CAF50;
		color: white;
		border: none;
		padding: 14px;
		border-radius: 6px;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.login-btn:hover:not(:disabled) {
		background: #45a049;
	}

	.login-btn:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.demo-section {
		margin-top: 30px;
		padding-top: 20px;
		border-top: 1px solid #eee;
		text-align: center;
	}

	.demo-text {
		color: #666;
		margin-bottom: 10px;
		font-size: 14px;
	}

	.demo-btn {
		background: #f5f5f5;
		color: #333;
		border: 1px solid #ddd;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		margin-bottom: 10px;
	}

	.demo-btn:hover {
		background: #e8e8e8;
	}

	.demo-info {
		color: #999;
		font-size: 12px;
	}

	@media (max-width: 480px) {
		.login-card {
			padding: 30px 20px;
		}
	}
</style>
