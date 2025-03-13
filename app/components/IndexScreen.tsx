import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { auth } from "../../firebase/config"; // Asegúrate de importar bien `config.ts`
import { onAuthStateChanged, User } from "firebase/auth";

export default function IndexScreen() {
  // ⬇️ Aquí le decimos a TypeScript que `user` puede ser `null` o `User`
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // ⬇️ Observador que detecta cambios en la autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // No da error porque `user` ahora puede ser `null` o `User`
    });

    return unsubscribe; // Limpia el listener cuando se desmonta el componente
  }, []);

  return (
    <View style={{ pointerEvents: "none" }}>
      {/* ⬇️ Verificamos si `user` existe antes de acceder a `user.email` */}
      <Text>{user ? `Bienvenido, ${user.email}` : "No hay usuario autenticadoooo col"}</Text>
    </View>
  );
}
