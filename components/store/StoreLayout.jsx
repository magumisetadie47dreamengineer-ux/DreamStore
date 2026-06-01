import CartDrawer from "./CartDrawer";
import CartToast from "./CartToast";
import Footer from "./Footer";
import Header from "./Header";

export default function StoreLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <CartToast />
    </>
  );
}
