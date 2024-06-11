"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuthContext } from "@/hooks/useAuthContext";

export function Navbar() {
    const { accessToken } = useAuthContext();

    if (!accessToken) {
        return <></>;
    }

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <div>
                    <NavigationMenuItem>
                        <Link href="/docs" className="text-3xl font-bold">
                            {/* <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            > */}
                            Yantram
                            {/* </NavigationMenuLink> */}
                        </Link>
                    </NavigationMenuItem>
                </div>
            </NavigationMenuList>
            <NavigationMenuList>
                <div className="flex space-x-4">
                    <NavigationMenuItem>
                        <Link href={"/"} legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Dashboard
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href={"/users"} legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Users
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href={"/products"} legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Products
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/orders" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Orders
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/coupons" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Coupons
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                </div>
            </NavigationMenuList>
            <NavigationMenuList>
                <div className="pr-12">
                    <NavigationMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <FontAwesomeIcon icon={faUser} size={"xl"} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Billing</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Team</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    Subscription
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </NavigationMenuItem>
                </div>
            </NavigationMenuList>
        </NavigationMenu>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">
                        {title}
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";
