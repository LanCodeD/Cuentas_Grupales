import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity,StyleSheet,ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/firebase/authContext"; // Importamos el contexto
import { loginUser } from "@/firebase/authFirebase"; // Importa la función de login

export default function Ingresar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { user } = useAuth(); // Obtenemos el usuario autenticado
  console.log("Email ingresado: ",email)
  console.log("password ingresado: ",password)

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      Alert.alert("¡Éxito!", "Has iniciado sesión correctamente");
      router.replace("/Screens/Principal"); // Redirige a la pantalla principal
    } catch (error :any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Título */}
        <Text style={styles.title}> Iniciar Sesión</Text>

        {/* Campos de entrada */}
        <TextInput 
          style={styles.input} 
          placeholder="Correo Electrónico" 
          keyboardType="email-address" 
          autoCapitalize="none"
          onChangeText={setEmail} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          secureTextEntry 
          onChangeText={setPassword} 
        />

        {/* Botón de inicio de sesión */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

        {/* Mensaje de registro */}
        <Text style={styles.registerText}>
          ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {

    backgroundColor: "#F8F9FA",
    padding: 20,
    flexGrow: 1, // Para que ScrollView expanda su contenido
  },
  card: {
    width: "85%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#FFF",
  },
  button: {
    width: "100%",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerText: {
    marginTop: 15,
    fontSize: 14,
    color: "#555",
  },
  registerLink: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});
