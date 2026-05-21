export default function AdminGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {children}
    </div>
  );
}
