import { loadPageData } from "@/lib/public-data";
import { Auction } from "@/components/Auction";

// Die Seite zeigt Gebotsstände — sie darf nie aus dem Cache kommen.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const data = await loadPageData();
  return <Auction data={data} />;
}
