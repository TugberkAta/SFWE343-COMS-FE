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
import login from "@/services/auth/login";

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginPage() {
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
  });

  const handleSubmit = form.handleSubmit(async ({ email, password }) => {
    login({ email, password });
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center p-8">
              <CardTitle className="text-xl">Sign In</CardTitle>
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
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="********"
                              type="password"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </div>

                  <div className="text-center mt-4">
                    <p>Don't have an account? <Link to="/sign-up" className="text-primary hover:underline">Sign up</Link></p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
