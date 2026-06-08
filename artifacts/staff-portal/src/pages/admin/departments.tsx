import AppLayout from "@/components/layout/AppLayout";
import {
  useListDepartments,
  useCreateDepartment,
  getListDepartmentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminDepartmentsPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: depts, isLoading } = useListDepartments({
    query: { queryKey: getListDepartmentsQueryKey() },
  });
  const createDept = useCreateDepartment();

  const handleCreate = () => {
    if (!name.trim()) return;
    createDept.mutate(
      { data: { name: name.trim(), parentDepartmentId: parentId ? Number(parentId) : undefined } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
          toast({ title: "Department created" });
          setOpen(false);
          setName("");
          setParentId("");
        },
        onError: () => toast({ title: "Failed to create department", variant: "destructive" }),
      }
    );
  };

  return (
    <AppLayout title="Departments">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Department Structure</h2>
          <Button size="sm" className="gap-2" onClick={() => setOpen(true)} data-testid="button-create-department">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>

        <div className="bg-card border border-border rounded-sm divide-y divide-border" data-testid="departments-list">
          {isLoading ? (
            <div className="px-5 py-8 text-sm text-muted-foreground text-center">Loading...</div>
          ) : depts?.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No departments created yet</p>
            </div>
          ) : (
            depts?.map((dept) => {
              const parent = dept.parentDepartmentId
                ? depts.find((d) => d.id === dept.parentDepartmentId)
                : null;
              return (
                <div key={dept.id} className="px-5 py-4 flex items-center gap-4" data-testid={`department-${dept.id}`}>
                  <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{dept.name}</p>
                    {parent && (
                      <p className="text-xs text-muted-foreground mt-0.5">Under {parent.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span data-testid={`dept-member-count-${dept.id}`}>{(dept as any).memberCount ?? 0} members</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Finance & Treasury"
                data-testid="input-department-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Department (optional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger data-testid="select-parent-department">
                  <SelectValue placeholder="Top-level department" />
                </SelectTrigger>
                <SelectContent>
                  {depts?.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createDept.isPending || !name.trim()} data-testid="button-confirm-create-department">
              {createDept.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
