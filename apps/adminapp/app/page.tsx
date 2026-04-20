import { Button } from '@workspace/ui/components/button';

export default function AdminDashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <Button variant="default" size="lg">
          Manage Your Blog
        </Button>
      </div>
    </main>
  );
}
