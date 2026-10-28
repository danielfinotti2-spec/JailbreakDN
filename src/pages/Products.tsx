import Shop from "@/components/Shop";

export default function Products({ path }: { path: string }) {
  return (
    <main>
      <Shop path={path} />
    </main>
  );
}
