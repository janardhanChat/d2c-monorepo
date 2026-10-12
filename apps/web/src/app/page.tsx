import { redirect } from "next/navigation";

// TODO: send signed-in users to their last org/brand, everyone else to /login.
export default function Home() {
  redirect("/demo/demo-brand");
}
