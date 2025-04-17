import LoginFormServer from "@/components/auth/login-server"
import { TransvipLogo } from "@/components/transvip/transvip-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-0 bg-desert bg-cover bg-top">
			<Card className="w-full max-w-lg">
				<CardHeader className="flex flex-col space-y-0 gap-1 items-center">
					<CardTitle className="w-full flex flex-row items-center justify-start gap-2">
						<TransvipLogo size={24} />
						<span className="text-xl font-bold">Operaciones Aeropuerto</span>
					</CardTitle>
					<CardDescription className="text-start text-sm w-full">
						Ingresa tus credenciales para continuar
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginFormServer />
				</CardContent>
			</Card>
		</div>
  );
}