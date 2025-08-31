// app/page.tsx
import { redirect } from "next/navigation";

export default function HomeRedirect() {
  redirect("/7for7/"); // sends visitors to the hub
}
