import { Stack } from "expo-router";
import { AuthProvider } from "../firebase/authContext";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Inicio" }} />
        <Stack.Screen name="Screens/Ingresar" options={{ title: "Iniciar Sesión" }}/>
        <Stack.Screen name="Screens/Registrar" options={{ title: "Registrarse" }}/>
        <Stack.Screen name="Screens/Principal" options={{ title: "Inicio" }}/>
        <Stack.Screen name="Screens/Grupo/[id]" options={{ title: "Registrar Gasto" }}/>
        <Stack.Screen name="Screens/Funcion/Deudas/[grupoID]" options={{ title: "Deudas" }}/>
        <Stack.Screen name="Screens/Funcion/Historial/[grupoID]" options={{ title: "Historial" }}/>
      </Stack>
    </AuthProvider>
  );
}
