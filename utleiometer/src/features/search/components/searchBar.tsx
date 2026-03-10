"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/ui/primitives/input";
import { Button } from "@/ui/primitives/button";

type Props = {
    actionPath?: string;
    initialQuery?: string;
    placeHolder?: string;
    submitLabel?: string;
};

export function SearchBar({
    actionPath = "/properties",
    initialQuery = "",
    placeHolder,
    submitLabel = "Search",
}: Props) {
    const router = useRouter();
    const [search, setSearch] = useState(initialQuery);

    return (
        <form
            className="mt-10 flex w-full max-w-3xl items-center gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                const q = search.trim()
                router.push(q ? `${actionPath}?q=${encodeURIComponent(q)}` : actionPath);
            }}
        >
            <Input
                id="search-bar"
                placeholder={placeHolder}
                className="h-12 flex-1 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" className="h-12 px-5 text-sm">
                {submitLabel}
            </Button>
        </form>
    )
}