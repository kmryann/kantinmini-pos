import { CartDrawer } from "@/components/CartDrawer";
import { CustomerHeader } from "@/components/CustomerHeader";
import { CustomerProvider } from "@/components/CustomerProvider";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <div className="customer-body min-h-screen">
        <CustomerHeader />
        {children}
        <CartDrawer />
      </div>
    </CustomerProvider>
  );
}
