import * as yup from "yup";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(1, "Password is required").required("Password is required")
});

type FormValues = yup.InferType<typeof schema>;

export function useSignin() {
  const { errors, handleSubmit, defineField } = useForm<FormValues>({
    validationSchema: schema
  });
  const [email] = defineField("email");
  const [password] = defineField("password");

  const { login } = useAuth();
  const router = useRouter();

  const isPending = ref(false);

  const processLogin = async (values: FormValues) => {
    isPending.value = true;
    try {
      const result = await login(values.email, values.password);

      if ("requires_2fa" in result) {
        router.push(`/auth/2fa?user_id=${result.user_id}`);
        return { requires_2fa: true };
      }

      await router.push("/");

      if (!result.user.is_2fa_enabled) {
        const { open } = use2FASetup();
        setTimeout(() => {
          open();
        }, 2000);
      }

      return { requires_2fa: false };
    } finally {
      isPending.value = false;
    }
  };

  const onSubmit = handleSubmit((v) => {
    const loginPromise = processLogin(v);
    toast.promise(loginPromise, {
      loading: "Signing you in...",
      success: (result: { requires_2fa: boolean }) => {
        if (result.requires_2fa) return "";
        return "Welcome back!";
      },
      error: (err: any) => {
        const status = err?.statusCode ?? err?.status;
        if (status === 401) return "Invalid email or password";
        return err?.data?.message || err?.statusMessage || "Something went wrong";
      }
    });
  });

  return { onSubmit, email, password, errors, isPending };
}
