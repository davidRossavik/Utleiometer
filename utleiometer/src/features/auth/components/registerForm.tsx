"use client";

import { useRegisterForm } from "@/features/auth/hooks/userRegisterForm";
import { SignupForm } from "@/ui/feedback/signup-form";

export function RegisterForm() {
    const form = useRegisterForm();

    return (
        <SignupForm
            username={form.username}
            email={form.email}
            password={form.password}
            errors={form.errors}
            touched={form.touched}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            onSubmit={form.handleSubmit}
        />
    );
}