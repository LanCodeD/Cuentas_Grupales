import { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/firebase/authContext";
import { registerUser } from "@/firebase/authFirebase";
import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function Registrar() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 🔹 Evita múltiples clics
  const router = useRouter();
  const { user } = useAuth();

  const handleRegister = async () => {
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      console.log("Error", "Todos los campos son obligatorios");
      return;
    }
  
    setLoading(true);
  
    try {
      // 🔍 Verificar si el nombre ya existe en Firestore
      const q = query(collection(db, "usuarios"), where("nombre", "==", nombre));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        Alert.alert("Error", "El nombre ya está en uso. Elige otro.");
        console.log("Error", "El nombre ya está en uso.");
        setLoading(false);
        return;
      }
  
      // 📝 Intentar registrar al usuario en Firebase Auth
      await registerUser(nombre, email, password);
      console.log("¡Éxito!", "Te has registrado correctamente");
      Alert.alert("¡Éxito!", "Te has registrado correctamente");
      router.replace("/Screens/Ingresar");
    } catch (error: any) {
      Alert.alert("Error", error.message);
      console.log("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
//contentContainerStyle
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Título */}
        <Text style={styles.title}> Crear Cuenta</Text>

        {/* Inputs */}
        <TextInput 
          style={styles.input} 
          placeholder="Nombre Completo" 
          value={nombre} 
          onChangeText={setNombre} 
          autoCapitalize="words" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Correo Electrónico" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />

        {/* Botón de Registro */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleRegister} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Registrando..." : "Registrarse"}</Text>
        </TouchableOpacity>

        {/* Mensaje de Confirmación */}
        {user && <Text style={styles.successText}>✅ Registro exitoso</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
/*     flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#F8F9FA", */
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
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  successText: {
    marginTop: 15,
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
  },
});
