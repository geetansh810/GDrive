"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";

import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OtpModal from "@/components/OTPModal";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => z.object({
    email: z.string().email(),
    fullName: formType === "sign-up" ? z.string().min(2).max(50) : z.string().optional(),
});

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [accountId, setAccountId] = useState(null);

    const formSchema = authFormSchema(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { fullName: "", email: "" },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const user = type === "sign-up"
                ? await createAccount({ fullName: values.fullName || "", email: values.email })
                : await signInUser({ email: values.email });

            if (user?.accountId) {
                setAccountId(user.accountId);
            } else {
                router.push("/connect-telegram"); // Redirect users who have not connected to Telegram
            }
        } catch {
            setErrorMessage("Failed to authenticate. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
                    <h1 className="form-title">{type === "sign-in" ? "Sign In" : "Sign Up"}</h1>
                    {type === "sign-up" && (
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form-label">Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="shad-form-label">Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isLoading} className="form-submit-button">
                        {type === "sign-in" ? "Sign In" : "Sign Up"}
                        {isLoading && <Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="ml-2 animate-spin" />}
                    </Button>

                    {errorMessage && <p className="error-message">*{errorMessage}</p>}

                    <div className="flex justify-center">
                        <p>{type === "sign-in" ? "Don't have an account?" : "Already have an account?"}</p>
                        <Link href={type === "sign-in" ? "/sign-up" : "/sign-in"} className="ml-1 text-brand">
                            {type === "sign-in" ? "Sign Up" : "Sign In"}
                        </Link>
                    </div>
                </form>
            </Form>

            {accountId && <OtpModal email={form.getValues("email")} accountId={accountId} />}
        </>
    );
};

export default AuthForm;