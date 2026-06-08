import AppLayout from "@/components/layout/AppLayout";
import { useCreateUser, useListDepartments, getListUsersQueryKey, getListDepartmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  email: z.string().email("Valid email required"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.string().min(1, "Role is required"),
  departmentId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const ROLES = [
  { value: "chairman", label: "Chairman" },
  { value: "ict_admin", label: "ICT Admin" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "compliance_admin", label: "Compliance Admin" },
  { value: "auditor", label: "Auditor" },
  { value: "department_head", label: "Department Head" },
  { value: "manager", label: "Manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "staff", label: "Staff" },
];

export default function AdminUsersNewPage() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const createUser = useCreateUser();
  const { data: depts } = useListDepartments({ query: { queryKey: getListDepartmentsQueryKey() } });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { staffId: "", email: "", fullName: "", role: "", departmentId: "" },
  });

  const onSubmit = (values: FormValues) => {
    createUser.mutate(
      {
        data: {
          staffId: values.staffId,
          email: values.email,
          fullName: values.fullName,
          role: values.role as any,
          departmentId: values.departmentId ? Number(values.departmentId) : undefined,
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
          toast({ title: "Staff account created and pending approval" });
          setLocation("/admin/users");
        },
        onError: () => toast({ title: "Failed to create account", variant: "destructive" }),
      }
    );
  };

  return (
    <AppLayout title="Add Staff Member">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/users">
            <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-to-users">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Link>
          <h2 className="text-lg font-semibold text-foreground">Add New Staff Member</h2>
        </div>

        <div className="bg-card border border-border rounded-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-create-user">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff ID</FormLabel>
                      <FormControl>
                        <Input placeholder="MTC-001" {...field} data-testid="input-staff-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="staff@mtc-groups.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Adeyemi" {...field} data-testid="input-full-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {depts?.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createUser.isPending}
                  data-testid="button-submit-create-user"
                >
                  {createUser.isPending ? "Creating..." : "Create Staff Account"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
