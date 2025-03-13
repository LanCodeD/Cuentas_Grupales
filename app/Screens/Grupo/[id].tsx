import { ScrollView,View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { agregarGasto } from "@/firebase/service/gastos";
import { obtenerUIDPorNombre } from "@/firebase/authFirebase";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

const GrupoScreen = () => {
  const { id } = useLocalSearchParams();
  const grupoID = id as string;
  const router = useRouter();

  const [grupoNombre, setGrupoNombre] = useState<string | null>(null);
  const [loadingGrupo, setLoadingGrupo] = useState(true);

  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [pagadoPor, setPagadoPor] = useState("");
  const [divididoEntre, setDivididoEntre] = useState("");

  useEffect(() => {
    const obtenerNombreGrupo = async () => {
      try {
        const grupoRef = doc(db, "grupos", grupoID);
        const grupoSnap = await getDoc(grupoRef);

        if (grupoSnap.exists()) {
          setGrupoNombre(grupoSnap.data().nombre);
        } else {
          setGrupoNombre("Grupo no encontrado");
        }
      } catch (error) {
        console.error("Error al obtener el nombre del grupo:", error);
        setGrupoNombre("Error al cargar");
      } finally {
        setLoadingGrupo(false);
      }
    };

    obtenerNombreGrupo();
  }, [grupoID]);

  const handleAgregarGasto = async () => {
    if (!descripcion || !monto || !pagadoPor || !divididoEntre) {
      console.warn("⚠️ Todos los campos son obligatorios");
      return;
    }

    const uidPagadoPor = await obtenerUIDPorNombre(pagadoPor);
    const nombresDivididos = divididoEntre.split(",").map((nombre) => nombre.trim());
    const uidDivididos = await Promise.all(nombresDivididos.map(obtenerUIDPorNombre));

    if (!uidPagadoPor || uidDivididos.includes(null)) {
      console.warn("⚠️ Error al obtener los UID de los usuarios");
      return;
    }

    await agregarGasto(grupoID, descripcion, parseFloat(monto), uidPagadoPor, uidDivididos);

    console.log("✅ Gasto agregado con éxito");

    setDescripcion("");
    setMonto("");
    setPagadoPor("");
    setDivididoEntre("");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {loadingGrupo ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <Text style={styles.titulo}> Grupo: ¡{grupoNombre}!</Text>
        )}
      </View>

      {/* Formulario para añadir gasto */}
      <Text style={styles.subtitulo}> Agregar Gasto</Text>
      <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} />
      <TextInput style={styles.input} placeholder="Monto" value={monto} onChangeText={setMonto} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Pagado por (Juan)" value={pagadoPor} onChangeText={setPagadoPor} />
      <TextInput style={styles.input} placeholder="Dividido entre (Juan, Angel, etc)" value={divididoEntre} onChangeText={setDivididoEntre} />

      <Pressable style={styles.boton} onPress={handleAgregarGasto}>
        <Text style={styles.botonTexto}>Añadir Gasto</Text>
      </Pressable>

      {/* Botones de navegación */}
      <Text style={styles.subtitulo}> Opciones del grupo</Text>

      <Pressable style={styles.botonSecundario} onPress={() => router.push(`/Screens/Funcion/Deudas/${grupoID}`)}>
        <Text style={styles.botonTextoSecundario}>Ver Deudas</Text>
      </Pressable>

      <Pressable style={styles.botonSecundario} onPress={() => router.push(`/Screens/Funcion/Historial/${grupoID}`)}>
        <Text style={styles.botonTextoSecundario}>Ver Historial</Text>
      </Pressable>
    </ScrollView>
  );
};

export default GrupoScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    flexGrow: 1, // Para que ScrollView expanda su contenido
  },
  header: {
    backgroundColor: "#28A745",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
  },
  boton: {
    backgroundColor: "#28A745",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botonSecundario: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  botonTextoSecundario: {
    color: "#007bff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
