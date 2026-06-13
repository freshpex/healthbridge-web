import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { healthbridgeApi } from "../../api/healthbridge-api";
import { Button } from "../../components/ui/button";
import { Logo } from "../../components/ui/logo";
import { useSessionStore } from "../../store/session-store";
import type { Role } from "../../types/domain";
import { apiErrorText } from "../../utils/format";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  role: z.enum(["patient", "hospital_admin", "laboratory"]),
  hospitalId: z.string().optional(),
  hospitalName: z.string().optional(),
  hospitalCity: z.string().optional(),
  hospitalState: z.string().optional(),
  hospitalAddress: z.string().optional(),
  contactEmail: z.string().optional(),
  labName: z.string().optional(),
  certificationNumber: z.string().optional(),
  department: z.string().optional()
  ,
  hospitalIds: z.array(z.string()).optional()
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "patient@healthbridge.test", password: "Password123!" } });
  const mutation = useMutation({
    mutationFn: (values: LoginValues) => healthbridgeApi.login(values.email, values.password),
    onSuccess: (session) => {
      setSession(session);
      navigate("/app", { replace: true });
    }
  });
  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to your HealthBridge workspace.">
      <form className="auth-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <input {...form.register("email")} type="email" placeholder="Email" />
        <input {...form.register("password")} type="password" placeholder="Password" />
        {mutation.error ? <p className="error">{apiErrorText(mutation.error)}</p> : null}
        <Button disabled={mutation.isPending}>{mutation.isPending ? "Signing in..." : "Sign In"}</Button>
        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>
      </form>
    </AuthFrame>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);
  const form = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: "patient" } });
  const role = useWatch({ control: form.control, name: "role" });
  const hospitals = useQuery({ queryKey: ["public-hospitals"], queryFn: healthbridgeApi.hospitals });
  const mutation = useMutation({
    mutationFn: (values: RegisterValues) => healthbridgeApi.signup({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role as Role,
      hospitalIds: values.role === "patient" ? values.hospitalIds ?? [] : undefined,
      hospitalId: values.hospitalId,
      labName: values.labName,
      certificationNumber: values.certificationNumber,
      department: values.department,
      hospital: values.role === "hospital_admin" ? {
        name: values.hospitalName,
        city: values.hospitalCity,
        state: values.hospitalState,
        address: values.hospitalAddress,
        contactEmail: values.contactEmail,
        specialties: ["Primary care"]
      } : undefined
    }),
    onSuccess: (session) => {
      setSession(session);
      navigate("/app", { replace: true });
    }
  });
  return (
    <AuthFrame title="Create your HealthBridge account" subtitle="Patient, hospital admin, and laboratory registration connect directly to the backend.">
      <form className="auth-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <input {...form.register("name")} placeholder="Full name" />
        <input {...form.register("email")} type="email" placeholder="Email" />
        <input {...form.register("password")} type="password" placeholder="Password" />
        <select {...form.register("role")}>
          <option value="patient">Patient</option>
          <option value="hospital_admin">Hospital admin</option>
          <option value="laboratory">Laboratory</option>
        </select>
        {role === "hospital_admin" ? (
          <>
            <input {...form.register("hospitalName")} placeholder="Hospital name" />
            <input {...form.register("hospitalAddress")} placeholder="Hospital address" />
            <input {...form.register("hospitalCity")} placeholder="City" />
            <input {...form.register("hospitalState")} placeholder="State" />
            <input {...form.register("contactEmail")} type="email" placeholder="Hospital contact email" />
          </>
        ) : null}
        {role === "patient" ? (
          <fieldset className="field-group">
            <legend>Connect hospitals</legend>
            {hospitals.data?.length ? hospitals.data.filter((hospital) => hospital.status === "approved").map((hospital) => (
              <label className="check-row" key={hospital._id ?? hospital.id}>
                <input type="checkbox" value={hospital._id ?? hospital.id} {...form.register("hospitalIds")} />
                {hospital.name} • {hospital.city}
              </label>
            )) : <p className="muted">No approved hospitals are available yet.</p>}
          </fieldset>
        ) : null}
        {role === "laboratory" ? (
          <>
            <input {...form.register("hospitalId")} placeholder="Linked hospital code, optional for standalone labs" />
            <input {...form.register("labName")} placeholder="Laboratory name" />
            <input {...form.register("certificationNumber")} placeholder="Certification number" />
            <input {...form.register("department")} placeholder="Department" />
          </>
        ) : null}
        {mutation.error ? <p className="error">{apiErrorText(mutation.error)}</p> : null}
        <Button disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create Account"}</Button>
        <Link to="/login">Already have an account?</Link>
      </form>
    </AuthFrame>
  );
}

export function ForgotPasswordPage() {
  return <StaticAuthState title="Forgot password" body="Password reset email delivery is not exposed by the current backend yet. Contact your administrator or use Change Password from Profile while signed in." />;
}

export function ResetPasswordPage() {
  return <StaticAuthState title="Reset password" body="Use the signed-in Change Password workflow. A token-based reset endpoint is not present in the backend contract yet." />;
}

export function VerifyEmailPage() {
  return <StaticAuthState title="Verify email" body="Email verification is ready in the route structure; the current backend signs users in immediately after registration." />;
}

export function ResendVerificationPage() {
  return <StaticAuthState title="Resend verification" body="Verification email sending is not currently exposed by the backend API." />;
}

function StaticAuthState({ title, body }: { title: string; body: string }) {
  return (
    <AuthFrame title={title} subtitle={body}>
      <div className="state-panel">
        <MailCheck />
        <Link to="/login"><Button>Back to Sign In</Button></Link>
      </div>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Logo />
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
