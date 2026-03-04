'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { VALIDATION_RULES } from '@/lib/validation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

type LoginField = 'email' | 'password';

type Values = Record<LoginField, string>;
type Errors = Record<LoginField, string>;
type Touched = Record<LoginField, boolean>;

export type LoginFormMessages = {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordInvalid: string;
  invalidCredential: string;
  invalidEmailFirebase: string;
  tooManyRequests: string;
  loginFailed: string;
};

const defaultMessages: LoginFormMessages = {
  emailRequired: 'E-post er påkrevd',
  emailInvalid: 'Ugyldig e-postadresse.',
  passwordRequired: 'Passord er påkrevd',
  passwordInvalid: 'Passord må være minst 8 tegn langt og inneholde både bokstaver og tall.',
  invalidCredential: 'Feil e-post eller passord.',
  invalidEmailFirebase: 'Ugyldig e-postadresse.',
  tooManyRequests: 'For mange forsøk. Prøv igjen senere.',
  loginFailed: 'Innlogging feilet. Prøv igjen.',
};

function getFirebaseFriendlyMessage(
  code: string | undefined,
  messages: LoginFormMessages,
): { field?: LoginField; message: string } {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return { message: messages.invalidCredential };

    case 'auth/invalid-email':
      return { field: 'email', message: messages.invalidEmailFirebase };

    case 'auth/too-many-requests':
      return { message: messages.tooManyRequests };

    default:
      return { message: messages.loginFailed };
  }
}

export function useLoginForm(messages: LoginFormMessages = defaultMessages) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<Errors>({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState<Touched>({
    email: false,
    password: false,
  });

  // Felles feilmelding fra Firebase (under knappen)
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Ren validering som returnerer error-objekt (ingen setState)
  const getErrors = (values: Values): Errors => {
    let emailError = '';
    let passwordError = '';

    if (!values.email) {
      emailError = messages.emailRequired;
    } else if (!VALIDATION_RULES.email.pattern.test(values.email)) {
      emailError = messages.emailInvalid;
    }

    if (!values.password) {
      passwordError = messages.passwordRequired;
    } else if (!VALIDATION_RULES.password.pattern.test(values.password)) {
      passwordError = messages.passwordInvalid;
    }

    return {
      email: emailError,
      password: passwordError,
    };
  };

  // Validerer + setter errors én gang (og returnerer om alt er OK)
  const validateAndSetErrors = (values: Values) => {
    const nextErrors = getErrors(values);
    setErrors(nextErrors);
    return Object.values(nextErrors).every(msg => msg === '');
  };

  const handleChange = (field: LoginField, value: string) => {
    // Nullstill firebase-feil når bruker begynner å endre
    if (formError) setFormError('');

    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    if (touched[field]) {
      const values: Values = {
        email: field === 'email' ? value : email,
        password: field === 'password' ? value : password,
      };

      // Én oppdatering av errors
      setErrors(getErrors(values));
    }
  };

  const handleBlur = (field: LoginField, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    const values: Values = {
      email: field === 'email' ? value : email,
      password: field === 'password' ? value : password,
    };

    // Én oppdatering av errors
    setErrors(getErrors(values));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    setFormError('');

    const values: Values = { email, password };

    // Én validering + én setErrors
    const ok = validateAndSetErrors(values);
    if (!ok) return;
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const { field, message } = getFirebaseFriendlyMessage(code, messages);

      if (field) {
        setErrors(prev => ({ ...prev, [field]: message }));
      } else {
        setFormError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    password,
    errors,
    touched,
    formError,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  };
}
