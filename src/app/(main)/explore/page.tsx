import { CheckCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default async function RoutePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Connexion réussie !
            </h1>
            <p className="text-gray-600">
              Vous êtes maintenant connecté à votre compte.
            </p>
          </div>
          <div className="w-full h-1 bg-green-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-500">Page en cours de dev</p>
        </CardContent>
      </Card>
    </div>
  );
}
