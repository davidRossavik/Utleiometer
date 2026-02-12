'use client';
import { useState } from 'react';
import { validateUsername, validateEmail, validatePassword } from '@/lib/validation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@/lib/firebase/client";

type Values = { username: string, email: string, password: string };
type Errors = { username: string, email: string, password: string };
type Field = keyof Values;

export function useRegisterForm() {
    // State for hva brukeren har skrevet
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State for feilmeldinger
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: ''
    });

    //State for om brukeren har rørt et felt
    //Viser bare feil etter de har prøvd å skrive i det
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false
    });

    // Ren hjelpefunksjon som regner ut errors uten setState
    const getErrors = (values: Values): Errors => {
        const u = validateUsername(values.username);
        const e = validateEmail(values.email);
        const p = validatePassword(values.password);

        return {
            username: u.error ?? '',
            email: e.error ?? '',
            password: p.error ?? '',
        };
    };

    //Kjøres når brukeren skriver i et felt
    const handleChange = (field: 'username' | 'email' | 'password', value: string) => {
        //Oppdaterer verdien
        if (field === 'username') setUsername(value);
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);

        //Valider kun hvis feltet er rørt (en feil-oppdatering)
        if (touched[field]) {
            const values: Values = {
                username: field === 'username' ? value : username,
                email: field === 'email' ? value : email,
                password: field === 'password' ? value : password,
            };
            setErrors(getErrors(values))
        }
    };

    //Kjøres når brukeren forlater et felt (onBlur)
    const handleBlur = (field: Field, value: string) => {
        setTouched(prev => ({...prev, [field]: true }));
        //Valider feltet når det blir rørt
        const values: Values = {
            username: field === 'username' ? value : username,
            email: field === 'email' ? value : email,
            password: field === 'password' ? value : password,
        };

        setErrors(getErrors(values))
    };

    //Sjekker om hele skjemaet er gyldig
    const isFormValid = () => {
        const errs = getErrors({ username, email, password });
        return Object.values(errs).every(e => e === '');
    };

    //Kjøres når brukeren prøver å sende inn skjemaet
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({ username: true, email: true, password: true });

        // En feil-oppdatering ved submit
        const formErrors = getErrors({ username, email, password });
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
        } catch (error) {
            console.error(error);
            alert("Kunne ikke registrere bruker (sjekk e-post/passord eller om e-post er i bruk).");
        };
    }

    return {
        username,
        email,
        password,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isFormValid
    };
}