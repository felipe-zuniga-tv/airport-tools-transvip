import LoginFormServer from "@/components/auth/login-server"
import { TransvipLogo } from "@/components/transvip/transvip-logo";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-desert text-white items-center flex bg-center bg-cover backdrop-brightness-75 px-2">
      <div className="mx-auto flex flex-col items-center justify-center text-lg md:text-lg h-full bg-gray-900/70 p-2 md:p-6 py-8 text-black rounded-xl">
        <TransvipLogo colored={false} size={40} />
        <section className="flex flex-col items-center justify-center p-4 sm:px-8">
          <LoginFormServer />
        </section>
      </div>
    </div>
  );
}