'use client';

import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { LoginFormUI } from '@/ui/feedback/login-form';

export function LoginForm() {
  const form = useLoginForm();

  return (
    <LoginFormUI
      email={form.email}
      password={form.password}
      errors={form.errors}
      touched={form.touched}
      formError={form.formError}
      onChange={form.handleChange}
      onBlur={form.handleBlur}
      onSubmit={form.handleSubmit}
    />
  );
}
