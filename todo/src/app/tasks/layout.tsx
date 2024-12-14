export default function TodoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-slate-100">
      <div className="bg-slate-100">{children}</div>
    </div>
  );
}
