"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from "@/ui/primitives/button";
import { useState } from "react";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/primitives/popover";

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);

    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const languageLabel = locale == "no" ? "Norsk" : "Français";

    function changeLanguage(targetLocale: "no" | "fr") {
        router.replace(pathname, {locale: targetLocale});
        setIsOpen(false);
    }
    

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Bytt språk. Nåværende språk: ${languageLabel}`}
                >
                    <Image src="/globe.svg" alt="" width={18} height={18} />
                    <span className="sr-only">Language menu</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-2">
                <div className="flex flex-col gap-1">
                    <Button
                        type="button"
                        variant={locale === "no" ? "default" : "outline"}
                        onClick={() => changeLanguage("no")}
                    >
                        Norsk
                    </Button>
                    <Button
                        type="button"
                        variant={locale === "fr" ? "default" : "outline"}
                        onClick={() => changeLanguage("fr")}
                    >
                        Français
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}