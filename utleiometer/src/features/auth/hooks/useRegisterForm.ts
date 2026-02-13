'use client';
import { useState } from 'react';
import { validateUsername, validateEmail, validatePassword } from '@/lib/validation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@/lib/firebase/client";

export type RegisterField = "username" | "email" | "password" | "confirmPassword";

type Values = { username: string, email: string, password: string };
type Errors = { username: string, email: string, password: string, confirmPassword: string };
type Field = keyof Values;

export function useRegisterForm() {
    // State for hva brukeren har skrevet
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for feilmeldinger
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    //State for om brukeren har rørt et felt
    //Viser bare feil etter de har prøvd å skrive i det
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    // Ren hjelpefunksjon som regner ut errors uten setState
    const getErrors = (values: Values, confirmPwd: string = ''): Errors => {
        const u = validateUsername(values.username);
        const e = validateEmail(values.email);
        const p = validatePassword(values.password);
        
        let confirmError = '';
        if (confirmPwd && values.password !== confirmPwd) {
            confirmError = 'Passordene må være like';
        }

        return {
            username: u.error ?? '',
            email: e.error ?? '',
            password: p.error ?? '',
            confirmPassword: confirmError,
        };
    };

    //Kjøres når brukeren skriver i et felt
    const handleChange = (field: RegisterField, value: string) => {
        //Oppdaterer verdien
        if (field === 'username') setUsername(value);
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);
        if (field === 'confirmPassword') setConfirmPassword(value);

        //Valider kun hvis feltet er rørt (en feil-oppdatering)
        if (touched[field]) {
            const values: Values = {
                username: field === 'username' ? value : username,
                email: field === 'email' ? value : email,
                password: field === 'password' ? value : password,
            };
            const confirmPwd = field === 'confirmPassword' ? value : confirmPassword;
            setErrors(getErrors(values, confirmPwd))
        }
    };

    //Kjøres når brukeren forlater et felt (onBlur)
    const handleBlur = (field: RegisterField, value: string) => {
        setTouched(prev => ({...prev, [field]: true }));
        //Valider feltet når det blir rørt
        const values: Values = {
            username: field === 'username' ? value : username,
            email: field === 'email' ? value : email,
            password: field === 'password' ? value : password,
        };
        const confirmPwd = field === 'confirmPassword' ? value : confirmPassword;

        setErrors(getErrors(values, confirmPwd))
    };

    //Sjekker om hele skjemaet er gyldig
    const isFormValid = () => {
        const errs = getErrors({ username, email, password });
        return Object.values(errs).every(e => e === '');
    };

    //Kjøres når brukeren prøver å sende inn skjemaet
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({ username: true, email: true, password: true, confirmPassword: true });

        // En feil-oppdatering ved submit
        const formErrors = getErrors({ username, email, password }, confirmPassword);
        setErrors(formErrors);
        const hasErrors = Object.values(formErrors).some(msg => msg !== '');
        if (hasErrors) return;

        // firebase-kall
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("Registered user:", {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
            });
        } catch (error: any) {
            console.error(error);
            // Parse Firebase errors til brukervenlige meldinger
            if (error.code === 'auth/email-already-in-use') {
                setErrors(prev => ({ ...prev, email: 'E-postadressen er allerede i bruk' }));
                setTouched(prev => ({ ...prev, email: true }));
            } else if (error.code === 'auth/invalid-email') {
                setErrors(prev => ({ ...prev, email: 'Ugyldig e-postadresse' }));
                setTouched(prev => ({ ...prev, email: true }));
            } else if (error.code === 'auth/weak-password') {
                setErrors(prev => ({ ...prev, password: 'Passordet er for svakt' }));
                setTouched(prev => ({ ...prev, password: true }));
            } else {
                // Generisk feilmelding for ukjente feil
                setErrors(prev => ({ ...prev, email: 'Kunne ikke registrere bruker. Prøv igjen senere.' }));
                setTouched(prev => ({ ...prev, email: true }));
            }
        };
    }

    return {
        username,
        email,
        password,
        confirmPassword,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isFormValid
    };
}