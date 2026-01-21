// app/login/page.tsx
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Завантаження форми...</div>}>
            <LoginForm />
        </Suspense>
    );
}
