import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "react-router-dom";
import emailSignup from "@/services/auth/email-auth";

const emailSignupFormSchema = z.object({
  email: z.string().email(),
});

export default function EmailSignupPage() {
  const form = useForm<z.infer<typeof emailSignupFormSchema>>({
    resolver: zodResolver(emailSignupFormSchema),
  });

  const handleSubmit = form.handleSubmit(async ({ email }) => {
    console.log(email);
    await emailSignup({ email });
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center p-8">
              <CardTitle className="text-xl">Sign Up</CardTitle>
            </CardHeader>
            <CardContent className="px-8">
              <Form {...form}>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="m@example.com"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Sign Up
                    </Button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <p>
                    Already have an account?{" "}
                    <Link
                      to="/sign-in"
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
