"use client";
import React, { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/useLogin";
import toast from "react-hot-toast";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const LoginForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { login, verifyOtp, isLoading, error } = useLogin();

    const [showOtp, setShowOtp] = useState(false);
    const [savedEmail, setSavedEmail] = useState("");
    const [otp, setOtp] = useState("");

    const handleSubmit = async () => {
        const res = await login(form.getValues().email, form.getValues().password);
        if (res?.success) {
            setSavedEmail(form.getValues().email);
            setShowOtp(true);
        }
    };

    const handleVerify = async () => {
        const emailToVerify = savedEmail || form.getValues().email;
        await verifyOtp(emailToVerify, otp);
    };

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(async () => {
                        if (!showOtp) await handleSubmit();
                    })}
                    className="flex flex-col w-full max-w-sm items-center space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Enter Email"
                                            {...field}
                                            disabled={showOtp}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                    {!showOtp ? (
                        <>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter Password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <div className="w-[13rem] pt-4">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    Request OTP
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <FormItem>
                                <FormLabel>OTP sent to</FormLabel>
                                <div className="w-full text-sm text-muted-foreground">{savedEmail}</div>
                            </FormItem>
                            <FormItem>
                                <FormLabel>Enter OTP</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Enter 4-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </FormControl>
                            </FormItem>
                            <div className="w-[13rem] pt-4 flex gap-2">
                                <Button onClick={handleVerify} className="w-full" disabled={isLoading}>
                                    Verify OTP
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowOtp(false)}
                                    className="w-24"
                                >
                                    Back
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </Form>
        </>
    );
};

export default LoginForm;
