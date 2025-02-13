"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OtpModal from "@/components/OTPModal";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email(),
    fullName:
      formType === "sign-up" ? z.string().min(2).max(50) : z.string().optional(),
    mobile:
      formType === "sign-up"
        ? z.string().min(10).max(15, "Invalid mobile number").regex(/^[0-9]+$/)
        : z.string().optional(),
    password:
      formType === "sign-up"
        ? z.string().min(6, "Password must be at least 6 characters long")
        : z.string().optional(),
    telegramUsername:
      formType === "sign-up"
        ? z.string().min(3, "Invalid Telegram username").max(32)
        : z.string().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      password: "",
      telegramUsername: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (type === "sign-up") {

        if(
          !values.fullName ||
          !values.email ||
          !values.mobile ||
          !values.password ||
          !values.telegramUsername
        ){
          throw new Error("Please fill all fields");
        }

        const user = await createAccount({
          fullName: values.fullName,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
          telegramUsername: values.telegramUsername,
        });

        setAccountId(user.accountId);
      } else {
        const user = await signInUser({ email: values.email });
        setAccountId(user.accountId);
      }
    } catch (error) {
      setErrorMessage("Failed to create account. Please try again.");
      console.log(error);
      
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
            <>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telegramUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Telegram username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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

          <div className="body-2 flex justify-center">
            <p>{type === "sign-in" ? "Don't have an account?" : "Already have an account?"}</p>
            <Link href={type === "sign-in" ? "/sign-up" : "/sign-in"} className="ml-1 font-medium text-brand">
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
