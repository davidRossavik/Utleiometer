'use client';
import { useState } from 'react';
import { validateUsername, validateEmail, validatePassword } from '@/lib/validation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@/lib/firebase/client";

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

    //Funksjonen som validerer ett felt
    const validateField = (field: 'username' | 'email' | 'password', value: string) => {
        const result =
            field === 'username' ? validateUsername(value) :
            field === 'email' ? validateEmail(value) :
            validatePassword(value);

        //Oppdaterer errors-state med ny feilmelding (eller en tom string)
        setErrors(prev => ({
            ...prev,
            [field]: result.error || ''
        }));
        return result.isValid;
    };

    //Kjøres når brukeren skriver i et felt
    const handleChange = (field: 'username' | 'email' | 'password', value: string) => {
        //Oppdaterer verdien
        if (field === 'username') setUsername(value);
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);

        //Valider kun hvis feltet er rørt
        if (touched[field]) {
            validateField(field, value);
        }
    };

    //Kjøres når brukeren forlater et felt (onBlur)
    const handleBlur = (field: 'username' | 'email' | 'password') => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
        //Valider feltet når det blir rørt
        const value = field === 'username' ? username : field === 'email' ? email : password;
        validateField(field, value);
    };

    //Sjekker om hele skjemaet er gyldig
    const isFormValid = () => {

        const usernameValid = validateField('username', username);
        const emailValid = validateField('email', email);
        const passwordValid = validateField('password', password);

        return usernameValid && emailValid && passwordValid;
    }

    //Kjøres når brukeren prøver å sende inn skjemaet
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({ username: true, email: true, password: true });

        if (!isFormValid()) {
            return;
        }

        //TODO: Send data til backend for registrering,
        //Firebasekallet skal komme her senere
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