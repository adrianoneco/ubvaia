import { useState } from 'react';

export function Login({ onLogin }: { onLogin: (user: { email: string }) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de autenticação
    if (email && password) {
      setError('');
      onLogin({ email });
    } else {
      setError('Preencha todos os campos.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-muted">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-border rounded"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-border rounded"
        />
        {error && <div className="text-destructive mb-4 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 font-medium"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
