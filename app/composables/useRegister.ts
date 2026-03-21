import { toast } from "vue-sonner";
import { useForm } from "vee-validate";
import * as yup from "yup";

const schema = yup.object({
  username: yup
    .string()
    .min(3, "At least 3 characters")
    .max(20, "At most 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only")
    .required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(8, "At least 8 characters").required("Password is required")
});

type FormValues = yup.InferType<typeof schema>;

export function useRegister() {
  const { register, checkUsername: checkUsernameAvailability } = useAuth();
  const router = useRouter();
  const { errors, handleSubmit, defineField } = useForm<FormValues>({
    validationSchema: schema
  });

  const [username] = defineField("username");
  const [email] = defineField("email");
  const [password] = defineField("password");

  const isPending = ref(false);
  const usernameAvailable = ref<boolean | null>(null);
  const checking = ref(false);
  let usernameDebounce: NodeJS.Timeout | null = null;

  const runUsernameCheck = async (value: string) => {
    if (!value || value.length < 3) {
      usernameAvailable.value = null;
      checking.value = false;
      return;
    }
    checking.value = true;
    try {
      usernameAvailable.value = await checkUsernameAvailability(value);
    } catch {
      usernameAvailable.value = null;
    } finally {
      checking.value = false;
    }
  };

  watch(username, (val) => {
    usernameAvailable.value = null;
    checking.value = false;
    if (usernameDebounce) clearTimeout(usernameDebounce);
    usernameDebounce = setTimeout(() => runUsernameCheck(val), 400);
  });

  const processRegister = async (values: FormValues) => {
    isPending.value = true;
    try {
      await register(values.username, values.email, values.password);
      router.push("/auth/login");
    } finally {
      isPending.value = false;
    }
  };

  const onSubmit = handleSubmit((v) => {
    const registerPromise = processRegister(v);
    toast.promise(registerPromise, {
      loading: "Creating your account...",
      success: "Account created! Please sign in.",
      error: (err: any) => {
        const status = err?.statusCode ?? err?.status;
        if (status === 409) return "Username or email is already taken";
        return err?.data?.message || err?.statusMessage || "Something went wrong";
      }
    });
  });

  return { onSubmit, errors, isPending, username, email, password, usernameAvailable, checking };
}
