"use client";

import Link from "next/link";
import { Button } from "@/ui/primitives/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

type Props = {
    registerMessage: string
    registerButtonText: string,
}

export function RegisterButton({registerMessage, registerButtonText}: Props) {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
        return null;
    }
    if (currentUser) {
        return (
            <div className="mt-10 text-center">
                <p className="text-muted-foreground mb-3">
                    {registerMessage}
                </p>
                <Link href="/properties/new">
                    <Button variant="outline" size="lg" className="text-base">
                        {registerButtonText}
                    </Button>
                </Link>
            </div>
        )
    }
}