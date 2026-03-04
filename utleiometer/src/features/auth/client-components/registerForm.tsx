"use client";

import { useRegisterForm, type RegisterFormMessages } from "@/features/auth/hooks/useRegisterForm";
import { SignupForm, type SignupFormTexts } from "@/ui/feedback/signup-form";

type RegisterFormProps = {
    texts: SignupFormTexts;
    messages: RegisterFormMessages;
};

export function RegisterForm({ texts, messages }: RegisterFormProps) {
    const form = useRegisterForm(messages);

    return (
        <SignupForm
            username={form.username}
            email={form.email}
            password={form.password}
            confirmPassword={form.confirmPassword}
            errors={form.errors}
            touched={form.touched}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            onSubmit={form.handleSubmit}
            texts={texts}
        />
    );
}