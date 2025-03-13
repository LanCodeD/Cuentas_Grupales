import { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, Alert, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/firebase/authContext";
import { useRouter } from "expo-router";
import { getUserData, obtenerGruposDelUsuario } from "@/firebase/authFirebase";
import { crearGrupo, unirseAGrupo } from "@/firebase/service/firestore";

export default function Principal() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [codigoGrupo, setCodigoGrupo] = useState("");
  const [grupos, setGrupos] = useState<{ id: string; nombre: string; codigoInvitacion:string }[]>([]);

  const handlePress = (id: string) => {
    router.push(`/Screens/Grupo/${id}`as any);
  };


  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userData = await getUserData(user.uid);
        if (userData) {
          setNombre(userData.nombre);
        }
      }
    };

    const fetchGrupos = async () => {
      if (user) {
        const gruposUsuario = await obtenerGruposDelUsuario(user.uid);
        setGrupos(gruposUsuario);
      }
    };

    fetchUserData();
    fetchGrupos();
  }, [user]);

  const handleCrearGrupo = async () => {
    if (!nombreGrupo.trim()) {
      Alert.alert("Error", "Ingresa un nombre para el grupo.");
      return;
    }

    try {
      await crearGrupo(nombreGrupo, user.uid);
      Alert.alert("¡Éxito!", `Grupo "${nombreGrupo}" creado.`);
      setNombreGrupo("");
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el grupo.");
    }
  };

  const handleUnirseAGrupo = async () => {
    if (!codigoGrupo.trim()) {
      Alert.alert("Error", "Ingresa un código de invitación.");
      return;
    }

    try {
      await unirseAGrupo(user.uid, codigoGrupo);
      Alert.alert("¡Éxito!", `Te has unido al grupo con código: ${codigoGrupo}`);
      setCodigoGrupo("");
    } catch (error) {
      Alert.alert("Error", "Código inválido o problema al unirse.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}> Bienvenido, {nombre || "Usuario"}!</Text>

      {/* Crear Grupo */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}> Crear un Grupo</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del grupo"
          value={nombreGrupo}
          onChangeText={setNombreGrupo}
        />
        <TouchableOpacity style={styles.button} onPress={handleCrearGrupo}>
          <Text style={styles.buttonText}>Crear Grupo</Text>
        </TouchableOpacity>
      </View>

      {/* Unirse a Grupo */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}> Unirse a un Grupo</Text>
        <TextInput
          style={styles.input}
          placeholder="Código de invitación"
          value={codigoGrupo}
          onChangeText={setCodigoGrupo}
        />
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleUnirseAGrupo}>
          <Text style={styles.buttonText}>Unirse a Grupo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Grupos */}
      <Text style={styles.sectionTitle}> Tus Grupos</Text>
      <FlatList
        data={grupos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() => handlePress(item.id)}
          >
            <Text style={styles.groupName}>{item.nombre}</Text>
            <Text style={styles.groupCode}>Código Para Invitar: {item.codigoInvitacion}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Cerrar Sesión */}
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => { logout(); router.replace("/Screens/Ingresar"); }}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    flexGrow: 1, // Para que ScrollView expanda su contenido
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007BFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#28A745",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  groupCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  groupCode: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#DC3545",
    marginTop: 20,
  },
});