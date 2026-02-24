"use client";

import Link from "next/link";
import { Button } from "@/ui/primitives/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function RegisterButton() {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
        return null;
    }
    if (currentUser) {
        return (
            <div className="mt-10 text-center">
                <p className="text-muted-foreground mb-3">
                    Finner du ikke boligen du ønsker å vurdere? 
                </p>
                <Link href="/properties/new">
                    <Button variant="outline" size="lg" className="text-base">
                        Registrer ny bolig her
                    </Button>
                </Link>
            </div>
        )
    }
}