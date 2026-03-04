'use client';

import { useLoginForm, type LoginFormMessages } from '@/features/auth/hooks/useLoginForm';
import { LoginFormUI, type LoginFormTexts } from '@/ui/feedback/login-form';

type LoginFormProps = {
  texts: LoginFormTexts;
  messages: LoginFormMessages;
};

export function LoginForm({ texts, messages }: LoginFormProps) {
  const form = useLoginForm(messages);

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
      isSubmitting={form.isSubmitting}
      texts={texts}
    />
  );
}
