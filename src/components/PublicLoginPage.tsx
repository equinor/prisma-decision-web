import { Button, Input } from '@equinor/eds-core-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export const PublicLoginPage = () => {
	const [username, setUsername] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = username.trim();
		if (!trimmed) {
			setError('Username is required');
			return;
		}
		if (trimmed.length < 3 || trimmed.length > 50) {
			setError('Username must be between 3 and 50 characters');
			return;
		}
		sessionStorage.setItem('username', trimmed);
		navigate('/');
	};

	return (
		<div className='flex h-screen items-center justify-center'>
			<form onSubmit={handleSubmit} className='flex w-[min(400px,90%)] flex-col gap-6'>
				<div>
					<h1 className='text-3xl font-bold'>Welcome to Prisma</h1>
					<p className='text-text-tertiary'>Enter a username to get started.</p>
				</div>
				<div>
					<Input
						label='Username'
						value={username}
						maxLength={50}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setUsername(e.target.value);
							setError('');
						}}
						variant={error ? 'error' : undefined}
						helperText={error}
						autoFocus
					/>
					<p className='text-text-tertiary mt-2 text-xs'>
						Do not use your real email or personal information. This username is stored
						in the database. By continuing, you acknowledge this at your own risk.
					</p>
				</div>
				<Button type='submit'>Continue</Button>
			</form>
		</div>
	);
};
